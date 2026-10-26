import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import {
  verifyStampDutyPayment,
  embedStampCertificate,
  hashAgreementDocument,
  hashCertificate,
  buildLinkageHash,
} from '@/lib/stamp-duty';

/**
 * POST /api/stamp-duty/verify  { rrr, agreementId }
 *
 * Confirms the Remita payment, then issues the certificate and records the
 * integrity chain that makes the stamped instrument provable:
 *
 *   agreementPdfHash — the executed instrument
 *   certificateHash  — the certificate as issued
 *   linkageHash      — both, bound to the RRR and the duty paid
 *
 * The endorsement is embedded into the agreement document before the record
 * moves to `issued`.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { rrr, agreementId } = body as { rrr?: string; agreementId?: string };

    if (!rrr || !agreementId) {
      return NextResponse.json({ error: 'rrr and agreementId are required' }, { status: 400 });
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      select: { id: true, landlordId: true, tenantId: true, stampDuty: true },
    });

    if (!agreement) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });

    const isParticipant =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      user.role === 'admin';
    if (!isParticipant) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    const duty = agreement.stampDuty;
    if (!duty) {
      return NextResponse.json(
        { error: 'No stamp duty record found. Initiate payment first.' },
        { status: 400 }
      );
    }

    if (duty.remitaRrr !== rrr) {
      return NextResponse.json({ error: 'RRR does not match agreement' }, { status: 400 });
    }

    // Already settled — return the recorded certificate and chain as-is.
    if (duty.status === 'paid' || duty.status === 'issued') {
      return NextResponse.json({
        success: true,
        data: {
          paid: true,
          certificateNumber: duty.certificateNumber,
          certificateUrl: duty.certificateUrl,
          authority: duty.authority,
          instrument: duty.instrument,
          basis: duty.basis,
          taxableAmount: duty.taxableAmount ? Number(duty.taxableAmount) : null,
          payerType: duty.payerType,
          payerName: duty.payerName,
          payerRcNumber: duty.payerRcNumber,
          agreementPdfHash: duty.agreementPdfHash,
          certificateHash: duty.certificateHash,
          linkageHash: duty.linkageHash,
          issuedAt: duty.issuedAt?.toISOString() ?? null,
        },
      });
    }

    const result = await verifyStampDutyPayment(rrr);

    if (!result.paid) {
      return NextResponse.json({ success: true, data: { paid: false } });
    }

    const paidAt = new Date();
    const amount = Number(duty.amount);

    await prisma.stampDuty.update({
      where: { agreementId },
      data: {
        status: 'paid',
        transactionId: result.transactionId ?? null,
        certificateNumber: result.certificateNumber ?? null,
        certificateUrl: result.certificateUrl ?? null,
        paidAt,
      },
    });

    let stampedPdfUrl: string | null = null;
    let linkageHash: string | null = null;
    let agreementPdfHash: string | null = null;
    let certificateHash: string | null = null;

    if (result.certificateNumber && result.certificateUrl) {
      try {
        stampedPdfUrl = await embedStampCertificate({
          agreementId,
          certificateNumber: result.certificateNumber,
          certificateUrl: result.certificateUrl,
          paidAt,
        });
      } catch (embedError) {
        console.error('[StampDuty] Embed error:', embedError);
      }

      try {
        [agreementPdfHash, certificateHash] = await Promise.all([
          hashAgreementDocument(agreementId),
          hashCertificate({
            certificateUrl: result.certificateUrl,
            certificateNumber: result.certificateNumber,
          }),
        ]);

        linkageHash = buildLinkageHash({
          agreementPdfHash,
          certificateHash,
          rrr,
          amount,
        });
      } catch (hashError) {
        console.error('[StampDuty] Integrity chain error:', hashError);
      }

      await prisma.stampDuty.update({
        where: { agreementId },
        data: {
          status: 'issued',
          certificateUrl: result.certificateUrl,
          issuedAt: new Date(),
          agreementPdfHash,
          certificateHash,
          linkageHash,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        paid: true,
        transactionId: result.transactionId,
        certificateNumber: result.certificateNumber,
        certificateUrl: result.certificateUrl,
        stampedPdfUrl,
        authority: duty.authority,
        instrument: duty.instrument,
        basis: duty.basis,
        taxableAmount: duty.taxableAmount ? Number(duty.taxableAmount) : null,
        payerType: duty.payerType,
        payerName: duty.payerName,
        payerRcNumber: duty.payerRcNumber,
        agreementPdfHash,
        certificateHash,
        linkageHash,
        issuedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[StampDuty] Verify error:', error);

    if (error instanceof Error && error.message.startsWith('Remita is not configured')) {
      return NextResponse.json(
        { error: 'STAMP_DUTY_UNAVAILABLE', message: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : undefined },
      { status: 500 }
    );
  }
}
