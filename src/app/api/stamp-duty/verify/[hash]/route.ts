import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/stamp-duty/verify/{linkageHash}
 *
 * Public attestation. Given the integrity hash printed on a stamped instrument,
 * confirms that the certificate exists, who collected the duty, what it was
 * assessed on, and when it was paid — without disclosing the parties or the
 * property. This is what lets a court, opposing counsel or a registry check an
 * instrument's stamp without an account.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  const { hash } = await params;

  if (!hash || hash.length < 32) {
    return NextResponse.json({ error: 'A valid integrity hash is required' }, { status: 400 });
  }

  const duty = await prisma.stampDuty.findFirst({
    where: { linkageHash: hash },
    select: {
      status: true,
      instrument: true,
      basis: true,
      rate: true,
      taxableAmount: true,
      amount: true,
      leaseTermMonths: true,
      authority: true,
      authorityState: true,
      certificateNumber: true,
      certificateUrl: true,
      remitaRrr: true,
      paidAt: true,
      issuedAt: true,
      agreementPdfHash: true,
      certificateHash: true,
      linkageHash: true,
      payerType: true,
    },
  });

  if (!duty) {
    return NextResponse.json(
      { valid: false, error: 'No stamped instrument matches this integrity hash' },
      { status: 404 }
    );
  }

  // A hash only attests once the certificate has actually issued.
  const attested = duty.status === 'issued' && !!duty.certificateNumber;

  return NextResponse.json({
    valid: attested,
    status: duty.status,
    attestation: attested
      ? {
          certificateNumber: duty.certificateNumber,
          certificateUrl: duty.certificateUrl,
          instrument: duty.instrument,
          basis: duty.basis,
          rate: duty.rate ? Number(duty.rate) : null,
          taxableAmount: duty.taxableAmount ? Number(duty.taxableAmount) : null,
          dutyPaid: Number(duty.amount),
          leaseTermMonths: duty.leaseTermMonths,
          collectingAuthority: duty.authority,
          authorityState: duty.authorityState,
          payerCategory: duty.payerType,
          remitaRrr: duty.remitaRrr,
          paidAt: duty.paidAt?.toISOString() ?? null,
          issuedAt: duty.issuedAt?.toISOString() ?? null,
          agreementPdfHash: duty.agreementPdfHash,
          certificateHash: duty.certificateHash,
          linkageHash: duty.linkageHash,
          stampedUnder: 'Stamp Duties Act, CAP S8, LFN 2004',
        }
      : null,
  });
}
