import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { initiateStampDutyPayment, getStampDutyRule } from '@/lib/stamp-duty';
import { loadStampDutyContext } from '@/lib/stamp-duty-assessment';

/**
 * POST /api/stamp-duty/initiate  { agreementId, payer?: 'tenant' | 'landlord' }
 *
 * Generates a Remita RRR for the duty assessed on the agreement, routed to the
 * authority that collects it for the agreement's jurisdiction. The assessment
 * (instrument, basis, rate, taxable amount, authority, payer identity) is
 * persisted alongside the RRR so the certificate can later be tied back to it.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { agreementId, payer: payerSide } = body as {
      agreementId?: string;
      payer?: 'tenant' | 'landlord';
    };

    if (!agreementId) {
      return NextResponse.json({ error: 'agreementId is required' }, { status: 400 });
    }

    const ctx = await loadStampDutyContext(agreementId);
    if (!ctx) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });

    const isParticipant =
      ctx.agreement.landlordId === user.id ||
      ctx.agreement.tenantId === user.id ||
      user.role === 'admin';
    if (!isParticipant) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    if (ctx.agreement.status !== 'fully_signed') {
      return NextResponse.json(
        { error: 'Agreement must be fully signed before stamp duty can be remitted' },
        { status: 400 }
      );
    }

    if (ctx.alreadyStamped) {
      return NextResponse.json(
        { error: 'Stamp duty has already been settled for this agreement', status: ctx.existingStatus },
        { status: 409 }
      );
    }

    if (ctx.assessment.amount === 0) {
      const rule = getStampDutyRule(ctx.assessment.instrument);
      return NextResponse.json(
        {
          error: 'NO_DUTY_PAYABLE',
          message: `No duty is payable: the taxable amount (₦${ctx.assessment.taxableAmount.toLocaleString()}) is at or below the ₦${rule.threshold.toLocaleString()} threshold.`,
          data: { taxableAmount: ctx.assessment.taxableAmount, threshold: rule.threshold },
        },
        { status: 400 }
      );
    }

    // Either party may settle the duty; default to the assessed payer.
    const side = payerSide === 'landlord' ? 'landlord' : 'tenant';
    const payer = ctx.payers[side];

    const result = await initiateStampDutyPayment({
      agreementId,
      amount: ctx.assessment.amount,
      payerName: payer.name,
      payerEmail: payer.email,
      payerPhone: payer.phone,
      propertyAddress: ctx.propertyAddress,
      tenantName: ctx.agreement.tenant.fullName,
      landlordName: ctx.agreement.landlord.fullName,
      annualRent: ctx.assessment.annualRent,
      serviceTypeId: ctx.authority.serviceTypeId,
      authority: ctx.authority.authority,
      instrument: ctx.assessment.instrument,
      payerType: payer.type,
      payerRcNumber: payer.rcNumber,
      taxableAmount: ctx.assessment.taxableAmount,
      leaseTermMonths: ctx.assessment.leaseTermMonths,
    });

    const record = {
      amount: ctx.assessment.amount,
      remitaRrr: result.rrr,
      status: 'pending' as const,
      instrument: ctx.assessment.instrument,
      basis: ctx.assessment.basis,
      taxableAmount: ctx.assessment.taxableAmount,
      rate: ctx.assessment.rate,
      leaseTermMonths: ctx.assessment.leaseTermMonths,
      authority: ctx.authority.authority,
      authorityState: ctx.agreement.jurisdictionState,
      payerType: payer.type,
      payerName: payer.name,
      payerRcNumber: payer.rcNumber,
    };

    await prisma.stampDuty.upsert({
      where: { agreementId },
      create: { agreementId, ...record },
      update: record,
    });

    return NextResponse.json({
      success: true,
      data: {
        rrr: result.rrr,
        paymentUrl: result.paymentUrl,
        amount: result.amount,
        mock: result.mock,
        authority: ctx.authority.authority,
        authorityLabel: ctx.authority.label,
        instrument: ctx.assessment.instrument,
        basis: ctx.assessment.basis,
        taxableAmount: ctx.assessment.taxableAmount,
        payerType: payer.type,
        payerName: payer.name,
        payerRcNumber: payer.rcNumber,
      },
    });
  } catch (error) {
    console.error('[StampDuty] Initiate error:', error);

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
