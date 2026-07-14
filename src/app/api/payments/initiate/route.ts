import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { initiatePaymentSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { computeFees } from '@/lib/fees';
import { TransactionType, TransactionStatus } from '@prisma/client';
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
        },
      });
      if (!agreement) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
      if (agreement.tenantId !== user.id) return NextResponse.json({ error: 'FORBIDDEN: Not the tenant on this agreement' }, { status: 403 });
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

    const transaction = await prisma.$transaction(async (tx) => {
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

      if (validated.agreementId) {
        await tx.agreement.update({
          where: { id: validated.agreementId },
          data: { transactions: { connect: { id: newTransaction.id } } },
        });
      }

      // Credit Paystack-side/dedicated customer wallets conceptually using metadata and our internal ledger.
      // For managed collection, we do NOT credit landlord/agent wallets yet; we credit the manager platform wallet.
      const creditTargets: Array<{ userId: string; amountNaira: number; type: 'deposit'; description: string; meta?: Record<string, unknown> }> = [];
      if (isManaged && managerId) {
        creditTargets.push({
          userId: managerId,
          amountNaira: Number(fees.payeeAmount) / 100,
          type: 'escrow_credit',
          description: `Managed collection for ${listing.title}`,
          meta: { reference, listingId: listing.id, payerId: user.id, flow: 'managed_collection' },
        });
      }

      // Agent commission should always be shown as pending payout for agent/landlord/admin visibility.
      // We keep it escrowed; payout will be done by agent or admin.

      for (const target of creditTargets) {
        const wallet = await tx.wallet.findUnique({ where: { userId: target.userId } });
        if (wallet) {
          const opening = Number(wallet.balance);
          const closing = opening + target.amountNaira;
          await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
          await tx.walletTransaction.create({
            data: {
              walletId: wallet.id,
              userId: target.userId,
              type: target.type,
              status: 'success',
              amount: target.amountNaira,
              currency: 'NGN',
              openingBalance: opening,
              closingBalance: closing,
              reference,
              description: target.description,
              meta: target.meta,
            },
          });
        }
      }

      return newTransaction;
    });

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
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 400 });
  }
}
