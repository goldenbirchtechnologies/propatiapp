import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { initiatePaymentSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { paystack, PaystackApiError } from '@/lib/paystack';
import { getAppUrl } from '@/lib/urls';
import { computeFees } from '@/lib/fees';
import { TransactionType } from '@prisma/client';
import { notificationService } from '@/lib/notification-service';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = initiatePaymentSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: {
        id: true,
        ownerId: true,
        agentId: true,
        title: true,
        price: true,
        listingType: true,
        status: true,
      },
    });

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'active') return NextResponse.json({ error: 'Listing is not available for payment' }, { status: 400 });

    let agreement: {
      id: string;
      status: string;
      tenantId: string;
      landlordId: string;
      agentId: string | null;
      rentAmount: unknown;
      listingId: string;
    } | null = null;
    if (validated.agreementId) {
      agreement = await prisma.agreement.findUnique({
        where: { id: validated.agreementId },
        select: {
          id: true,
          status: true,
          tenantId: true,
          landlordId: true,
          agentId: true,
          rentAmount: true,
          listingId: true,
        },
      });
      if (!agreement) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
      if (agreement.tenantId !== user.id) return NextResponse.json({ error: 'FORBIDDEN: Not the tenant on this agreement' }, { status: 403 });
      if (agreement.listingId !== listing.id) return NextResponse.json({ error: 'Agreement does not belong to this listing' }, { status: 400 });
      if (!['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed', 'fully_signed'].includes(agreement.status)) {
        return NextResponse.json({ error: 'Agreement not ready for payment' }, { status: 400 });
      }
    }

    const amountKobo = Math.round(validated.amount * 100);
    const hasAgent = !!listing.agentId;
    const fees = computeFees(validated.type as keyof typeof TransactionType, amountKobo, hasAgent);

    // Collection routing
    const isManaged = validated.collectionType === 'managed';
    let managerId: string | null = null;
    let platformRecipientId: string | null = null;
    if (isManaged) {
      managerId = validated.managedById || null;
      if (!managerId) return NextResponse.json({ error: 'managedById is required for managed collection' }, { status: 400 });
      const manager = await prisma.user.findUnique({ where: { id: managerId }, select: { id: true, role: true } });
      if (!manager || manager.role !== 'estate_manager') return NextResponse.json({ error: 'Invalid manager' }, { status: 400 });
      platformRecipientId = managerId;
    }

    const landlordId = listing.ownerId;
    const agentId = hasAgent ? listing.agentId : null;

    const timestamp = Date.now();
    const randomStr = randomBytes(4).toString('hex');
    const reference = `PROPATI_${validated.type}_${timestamp}_${randomStr}`.toUpperCase();

    // The callback page lives under the role segment — the un-segmented
    // /dashboard/payments/callback path has no route and 404s after checkout.
    const roleSlug = user.role === 'estate_manager' ? 'estate-manager' : user.role;
    const callbackUrl = `${getAppUrl()}/dashboard/${roleSlug}/payments/callback?reference=${reference}`;
    const paystackResponse = await paystack.initializePayment({
      email: validated.email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        listingId: listing.id,
        userId: user.id,
        type: validated.type,
        collectionType: validated.collectionType,
        managedById: managerId,
        custom_fields: [
          { display_name: 'Property', variable_name: 'property_title', value: listing.title },
          { display_name: 'Transaction Type', variable_name: 'transaction_type', value: validated.type },
          { display_name: 'Collection', variable_name: 'collection_type', value: validated.collectionType },
        ],
        ...validated.metadata,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    });

    if (!paystackResponse?.data?.authorization_url) {
      return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 502 });
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          reference,
          listingId: listing.id,
          payerId: user.id,
          payeeId: landlordId,
          agentId: agentId,
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
          agent: { select: { id: true, fullName: true, email: true } },
        },
      });

      let agreementId = validated.agreementId;
    if (!agreementId) {
      const candidate = await prisma.agreement.findFirst({
        where: { listingId: listing.id, tenantId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true },
      });
      if (candidate && ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed', 'fully_signed'].includes(candidate.status)) {
        agreementId = candidate.id;
      }
    }

    if (agreementId) {
      const linkedAgreement = await prisma.agreement.findUnique({
        where: { id: agreementId },
        select: { id: true, listingId: true },
      });
      if (!linkedAgreement || linkedAgreement.listingId !== listing.id) {
        return NextResponse.json({ error: 'Invalid agreement for this listing' }, { status: 400 });
      }

      await prisma.agreement.update({
        where: { id: agreementId },
        data: { transactions: { connect: { id: newTransaction.id } } },
      });
    }

      return newTransaction;
    });

    // The callback can bail out with a response (invalid agreement) instead of a
    // transaction, so pass that through rather than treating it as one.
    if (transactionResult instanceof NextResponse) return transactionResult;
    const transaction = transactionResult;

    const payeeName = transaction.payee?.fullName || 'Landlord';
    const managerNote = isManaged ? ` Funds will be held under manager (${managerId}) until disbursed.` : '';
    const agentNote = agentId && fees.agentCommission ? ` Agent commission: ₦${(fees.agentCommission / 100).toLocaleString()} pending payout.` : '';
    notificationService.notifyUsersForEvent({
      userIds: [transaction.payeeId, ...(agentId ? [agentId] : [])].filter(Boolean),
      type: 'payment',
      title: 'Payment Initiated',
      message: `A payment of ₦${(amountKobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })} has been initiated for ${listing.title}.${managerNote}${agentNote}`,
      actionUrl: `/dashboard/transactions?reference=${reference}`,
      metadata: { transactionId: transaction.id, reference, listingId: listing.id, collectionType: validated.collectionType },
      channels: ['inapp'],
    }).catch(() => undefined);

    console.log(`Payment initiated: ${reference} for user ${user.id} - collection=${validated.collectionType}`);

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
      transaction: {
        id: transaction.id,
        reference: paystackResponse.data.reference,
        amount: amountKobo,
        amountFormatted: (amountKobo / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }),
        type: validated.type,
        status: 'pending',
        listing: transaction.listing,
        collectionType: validated.collectionType,
        managerId,
        fees,
      },
    });
  } catch (error) {
    console.error('Payment initiation error:', error);

    // A missing or invalid Paystack key is an operator problem, not a user
    // error — surface it as unavailable rather than a generic 400.
    if (error instanceof Error && error.message.startsWith('Paystack is not configured')) {
      return NextResponse.json(
        { error: 'PAYMENTS_UNAVAILABLE', message: error.message },
        { status: 503 }
      );
    }

    // Paystack itself rejected the call (bad key, disabled business, invalid
    // amount): that is a provider problem, so report it as a gateway failure
    // with the provider's own words instead of a generic 400.
    if (error instanceof PaystackApiError) {
      return NextResponse.json(
        {
          error: 'PAYSTACK_ERROR',
          message: error.paystackMessage || error.message,
          providerStatus: error.status ?? null,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Payment initiation failed', message: error instanceof Error ? error.message : undefined },
      { status: 400 }
    );
  }
}
