import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { releaseEscrowSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

/**
 * POST /api/payments/release-escrow/[id]
 * Releases funds from escrow to landlord/agent via Paystack transfer
 *
 * Authorization: Admin or automated release system
 * Body: { recipientBankCode, recipientAccountNumber, recipientName, amount?, reason }
 * Returns: { success, transfer }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin', 'landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = releaseEscrowSchema.parse(body);

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, ownerId: true, agentId: true } },
        payer: { select: { id: true, fullName: true, email: true } },
        payee: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Authorization check
    const canRelease =
      user.role === 'admin' ||
      (user.role === 'landlord' && transaction.payeeId === user.id);

    if (!canRelease) {
      return NextResponse.json({ error: 'FORBIDDEN: Not authorized to release this escrow' }, { status: 403 });
    }

    // Check transaction is in escrow
    if (transaction.status !== 'in_escrow') {
      return NextResponse.json({ error: `Cannot release escrow in ${transaction.status} status` }, { status: 400 });
    }

    // Check if related agreement is fully signed (if applicable)
    if (transaction.listingId) {
      const agreements = await prisma.agreement.findMany({
        where: {
          listingId: transaction.listingId,
          OR: [
            { tenantId: transaction.payerId },
            { landlordId: transaction.payeeId },
          ],
        },
        select: { id: true, status: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      if (agreements.length > 0 && agreements[0].status !== 'fully_signed' && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Agreement must be fully signed before escrow release' },
          { status: 400 }
        );
      }
    }

    // Resolve account name with Paystack
    let accountName: string;
    try {
      const resolveResponse = await paystack.resolveAccountNumber(
        validated.recipientAccountNumber,
        validated.recipientBankCode
      );

      if (!resolveResponse.status || !resolveResponse.data.account_name) {
        return NextResponse.json(
          { error: 'Could not verify bank account details' },
          { status: 400 }
        );
      }

      accountName = resolveResponse.data.account_name;

      // Verify the name matches (fuzzy match for case/space differences)
      const normalizedInput = validated.recipientName.toLowerCase().replace(/\s+/g, '');
      const normalizedAccount = accountName.toLowerCase().replace(/\s+/g, '');

      if (!normalizedInput.includes(normalizedAccount) && !normalizedAccount.includes(normalizedInput)) {
        return NextResponse.json(
          {
            error: 'Account name mismatch',
            details: `Provided: ${validated.recipientName}, Bank: ${accountName}`,
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Account resolution error:', error);
      return NextResponse.json(
        { error: 'Failed to verify bank account', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 400 }
      );
    }

    // Create transfer recipient on Paystack
    let recipientCode: string;
    try {
      const recipientResponse = await paystack.createTransferRecipient({
        type: 'nuban',
        name: accountName,
        account_number: validated.recipientAccountNumber,
        bank_code: validated.recipientBankCode,
        currency: 'NGN',
      });

      if (!recipientResponse.status || !recipientResponse.data.recipient_code) {
        return NextResponse.json(
          { error: 'Failed to create transfer recipient' },
          { status: 500 }
        );
      }

      recipientCode = recipientResponse.data.recipient_code;
    } catch (error) {
      console.error('Recipient creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create transfer recipient', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Calculate transfer amounts
    const payeeAmount = validated.amount
      ? Math.round(validated.amount * 100)
      : Number(transaction.payeeAmount);

    const agentCommission = Number(transaction.agentCommission);
    const transferReference = `ESCROW_RELEASE_${transaction.id}_${Date.now()}`;

    // Initiate transfer to payee (landlord)
    let transferResult: Record<string, unknown> | null = null;
    try {
      const transferResponse = await paystack.createTransfer({
        source: 'balance',
        amount: payeeAmount,
        recipient: recipientCode,
        reason: validated.reason || `Escrow release for ${transaction.listing?.title || 'property'}`,
        reference: transferReference,
      });

      if (!transferResponse.status) {
        throw new Error(transferResponse.message || 'Transfer initiation failed');
      }

      transferResult = transferResponse.data;
    } catch (error) {
      console.error('Transfer initiation error:', error);
      return NextResponse.json(
        { error: 'Failed to initiate transfer', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Update transaction status
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: 'released',
        paystackData: {
          ...transaction.paystackData as object,
          transfer_reference: transferReference,
          transfer_code: transferResult.transfer_code,
          recipient_code: recipientCode,
          released_at: new Date().toISOString(),
          released_by: user.id,
        },
        updatedAt: new Date(),
      },
    });

    // Create notifications
    await prisma.notification.create({
      data: {
        userId: transaction.payeeId,
        type: 'payment',
        title: 'Funds Released',
        body: `₦${(payeeAmount / 100).toLocaleString()} has been transferred to your account (${validated.recipientAccountNumber}).`,
        data: {
          transactionId: transaction.id,
          transferReference,
          accountNumber: validated.recipientAccountNumber,
        },
      },
    });

    await prisma.notification.create({
      data: {
        userId: transaction.payerId,
        type: 'payment',
        title: 'Escrow Released',
        body: `Your payment of ₦${(Number(transaction.amount) / 100).toLocaleString()} for ${transaction.listing?.title || 'property'} has been released to the landlord.`,
        data: { transactionId: transaction.id },
      },
    });

    // Handle agent commission if applicable
    if (transaction.agentId && agentCommission > 0) {
      // Create separate notification for agent
      await prisma.notification.create({
        data: {
          userId: transaction.agentId,
          type: 'payment',
          title: 'Commission Available',
          body: `Your commission of ₦${(agentCommission / 100).toLocaleString()} for ${transaction.listing?.title || 'property'} is now available for withdrawal.`,
          data: { transactionId: transaction.id, commission: agentCommission },
        },
      });

      // Auto-payout commission for non-sale transactions when agent has a saved recipient
      const isSale = String(transaction.type).toLowerCase() === 'sale';
      if (!isSale) {
        const acct = await prisma.userPaystackAccount.findUnique({
          where: { userId: transaction.agentId },
          select: { recipientCode: true },
        });
        if (acct?.recipientCode) {
          try {
            await paystack.createTransfer({
              source: 'balance',
              amount: Number(transaction.agentCommission || 0),
              recipient: acct.recipientCode,
              reference: `AGT_COMM_${transaction.id}_${Date.now()}`,
              reason: `Agent commission payout for ${transaction.listing?.title || 'property'}`,
            });
          } catch (error) {
            console.error('Agent commission auto-payout failed:', error);
          }
        }
      }
    }

    console.log(`Escrow released: Transaction ${id} - ₦${(payeeAmount / 100).toLocaleString()} to ${accountName}`);

    return NextResponse.json({
      success: true,
      transfer: {
        transferCode: transferResult.transfer_code,
        reference: transferReference,
        amount: payeeAmount,
        amountFormatted: (payeeAmount / 100).toLocaleString('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 0,
        }),
        recipient: accountName,
        accountNumber: validated.recipientAccountNumber,
        status: transferResult.status,
      },
      transaction: updated,
    });
  } catch (error) {
    console.error('Escrow release error:', error);
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
