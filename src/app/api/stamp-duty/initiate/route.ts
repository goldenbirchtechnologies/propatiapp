import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { calculateStampDuty, initiateStampDutyPayment } from '@/lib/stamp-duty';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { agreementId } = body as { agreementId: string };

    if (!agreementId) {
      return NextResponse.json({ error: 'agreementId is required' }, { status: 400 });
    }

    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        listing: { select: { address: true, area: true, state: true } },
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

    if (agreement.status !== 'fully_signed') {
      return NextResponse.json(
        { error: 'Agreement must be fully signed before initiating stamp duty' },
        { status: 400 }
      );
    }

    if (
      agreement.stampDuty?.status === 'paid' ||
      agreement.stampDuty?.status === 'certificate_issued'
    ) {
      return NextResponse.json(
        { error: 'Stamp duty has already been paid for this agreement' },
        { status: 400 }
      );
    }

    const annualRent = Number(agreement.rentAmount ?? 0);
    const amount = calculateStampDuty(annualRent);

    if (amount === 0) {
      return NextResponse.json(
        { error: 'Stamp duty is not applicable for this agreement (rent below ₦10,000)' },
        { status: 400 }
      );
    }

    const payer =
      user.id === agreement.tenantId ? agreement.tenant : agreement.landlord;

    const propertyAddress = [
      agreement.listing.address,
      agreement.listing.area,
      agreement.listing.state,
    ]
      .filter(Boolean)
      .join(', ');

    const result = await initiateStampDutyPayment({
      agreementId,
      amount,
      payerName: payer.fullName,
      payerEmail: payer.email,
      payerPhone: payer.phone ?? '',
      propertyAddress,
      tenantName: agreement.tenant.fullName,
      landlordName: agreement.landlord.fullName,
      annualRent,
    });

    await prisma.stampDuty.upsert({
      where: { agreementId },
      create: {
        agreementId,
        amount,
        remitaRrr: result.rrr,
        status: 'pending',
      },
      update: {
        amount,
        remitaRrr: result.rrr,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        rrr: result.rrr,
        paymentUrl: result.paymentUrl,
        amount: result.amount,
      },
    });
  } catch (error) {
    console.error('[StampDuty] Initiate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
