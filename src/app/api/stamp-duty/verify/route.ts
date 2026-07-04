import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { verifyStampDutyPayment, embedStampCertificate } from '@/lib/stamp-duty';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { rrr, agreementId } = body as { rrr: string; agreementId: string };

    if (!rrr || !agreementId) {
      return NextResponse.json({ error: 'rrr and agreementId are required' }, { status: 400 });
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      select: {
        id: true,
        landlordId: true,
        tenantId: true,
        stampDuty: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    const isParticipant =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      user.role === 'admin';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (!agreement.stampDuty) {
      return NextResponse.json(
        { error: 'No stamp duty record found. Initiate payment first.' },
        { status: 400 }
      );
    }

    if (agreement.stampDuty.remitaRrr !== rrr) {
      return NextResponse.json({ error: 'RRR does not match agreement' }, { status: 400 });
    }

    if (
      agreement.stampDuty.status === 'paid' ||
      agreement.stampDuty.status === 'issued'
    ) {
      return NextResponse.json({
        success: true,
        data: {
          paid: true,
          certificateNumber: agreement.stampDuty.certificateNumber,
          certificateUrl: agreement.stampDuty.certificateUrl,
        },
      });
    }

    const result = await verifyStampDutyPayment(rrr);

    if (!result.paid) {
      return NextResponse.json({
        success: true,
        data: { paid: false },
      });
    }

    const paidAt = new Date();

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
    if (result.certificateNumber && result.certificateUrl) {
      try {
        stampedPdfUrl = await embedStampCertificate({
          agreementId,
          certificateNumber: result.certificateNumber,
          certificateUrl: result.certificateUrl,
          paidAt,
        });

        await prisma.stampDuty.update({
          where: { agreementId },
          data: {
            status: 'issued',
            certificateUrl: result.certificateUrl,
            issuedAt: new Date(),
          },
        });
      } catch (embedError) {
        console.error('[StampDuty] Embed error:', embedError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paid: true,
        transactionId: result.transactionId,
        certificateNumber: result.certificateNumber,
        certificateUrl: result.certificateUrl,
        stampedPdfUrl,
      },
    });
  } catch (error) {
    console.error('[StampDuty] Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
