import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { initiatePaymentSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { computeFees } from '@/lib/fees';
import { TransactionType } from '@prisma/client';

/**
 * POST /api/payments/initiate
 * Initiates a payment transaction with Paystack
 *
 * Body: { listingId?, agreementId?, amount, type, email, metadata? }
 * Returns: { success, authorizationUrl, reference, transaction }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = initiatePaymentSchema.parse(body);

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: {
        id: true,
        ownerId: true,
        agentId: true,
        title: true,
        price: true,
        listingType: true,
        status: true
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not available for payment' }, { status: 400 });
    }

    // Verify agreement if provided
    let agreement = null;
    if (validated.agreementId) {
      agreement = await prisma.agreement.findUnique({
        where: { id: validated.agreementId },
        select: {
          id: true,
          status: true,
          tenantId: true,
          landlordId: true,
          agentId: true,
          rentAmount: true
        },
      });

      if (!agreement) {
        return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
      }

      if (agreement.tenantId !== user.id) {
        return NextResponse.json({ error: 'FORBIDDEN: Not the tenant on this agreement' }, { status: 403 });
      }

      if (!['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed', 'fully_signed'].includes(agreement.status)) {
        return NextResponse.json({ error: 'Agreement not ready for payment' }, { status: 400 });
      }
    }

    // Compute fees
    const amountKobo = Math.round(validated.amount * 100); // Convert to kobo
    const hasAgent = !!listing.agentId;
    const fees = computeFees(validated.type as keyof typeof TransactionType, amountKobo, hasAgent);

    // Determine payee (landlord) and agent
    const payeeId = listing.ownerId;
    const agentId = listing.agentId;

    // Generate unique reference
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const reference = `PROPATI_${validated.type}_${timestamp}_${randomStr}`.toUpperCase();

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        reference,
        listingId: listing.id,
        payerId: user.id,
        payeeId,
        agentId: hasAgent ? agentId : null,
        type: validated.type as TransactionType,
        status: 'pending',
        amount: BigInt(amountKobo),
        platformFee: BigInt(fees.platformFee),
        agentCommission: BigInt(fees.agentCommission),
        payeeAmount: BigInt(fees.payeeAmount),
        description: validated.metadata?.description || `Payment for ${listing.title}`,
        paystackData: validated.metadata,
      },
      include: {
        listing: { select: { id: true, title: true, area: true } },
        payer: { select: { id: true, fullName: true, email: true } },
        payee: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Link agreement to transaction if provided
    if (validated.agreementId) {
      await prisma.agreement.update({
        where: { id: validated.agreementId },
        data: {
          transactions: {
            connect: { id: transaction.id },
          },
        },
      });
    }

    // Initialize Paystack transaction
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/callback?reference=${reference}`;
    const paystackResponse = await paystack.initializeTransaction({
      email: validated.email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        transactionId: transaction.id,
        listingId: listing.id,
        userId: user.id,
        type: validated.type,
        custom_fields: [
          {
            display_name: 'Property',
            variable_name: 'property_title',
            value: listing.title,
          },
          {
            display_name: 'Transaction Type',
            variable_name: 'transaction_type',
            value: validated.type,
          },
        ],
        ...validated.metadata,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    });

    // Log initiation
    console.log(`Payment initiated: ${reference} for user ${user.id} - ₦${(amountKobo / 100).toLocaleString()}`);

    return NextResponse.json(
      {
        success: true,
        authorizationUrl: paystackResponse.data.authorization_url,
        accessCode: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
        transaction: {
          id: transaction.id,
          reference: paystackResponse.data.reference,
          amount: amountKobo,
          amountFormatted: (amountKobo / 100).toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
          }),
          type: validated.type,
          status: 'pending',
          listing: transaction.listing,
          fees: {
            platformFee: fees.platformFee,
            platformFeeFormatted: (fees.platformFee / 100).toLocaleString('en-NG', {
              style: 'currency',
              currency: 'NGN',
              minimumFractionDigits: 0,
            }),
            agentCommission: fees.agentCommission,
            agentCommissionFormatted: (fees.agentCommission / 100).toLocaleString('en-NG', {
              style: 'currency',
              currency: 'NGN',
              minimumFractionDigits: 0,
            }),
            payeeAmount: fees.payeeAmount,
            payeeAmountFormatted: (fees.payeeAmount / 100).toLocaleString('en-NG', {
              style: 'currency',
              currency: 'NGN',
              minimumFractionDigits: 0,
            }),
          },
          createdAt: transaction.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payments initiate error:', error);
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
      }
      if (error.message.includes('FORBIDDEN')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes('Paystack')) {
        return NextResponse.json({ error: 'Payment provider error', details: error.message }, { status: 502 });
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
