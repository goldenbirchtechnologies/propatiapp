import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireAgent } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.user.role !== 'agent' && authResult.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { user } = authResult;
  const dealId = params.id;

  const deal = await prisma.transaction.findUnique({ where: { id: dealId } });
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  if (deal.agentCommissionStatus !== 'held') return NextResponse.json({ error: 'Commission is not in held status' }, { status: 400 });
  if (!deal.agentId || deal.agentId !== user.id) return NextResponse.json({ error: 'Not authorized for this deal' }, { status: 403 });

  const account = await prisma.userPaystackAccount.findUnique({ where: { userId: user.id } });
  if (!account?.recipientCode) return NextResponse.json({ error: 'No payout account linked. Add bank details first.' }, { status: 400 });

  const commissionNaira = Number(deal.agentCommission || 0) / 100;
  const transfer = await paystack.createTransfer({
    source: 'balance',
    amount: Number(deal.agentCommission || 0),
    recipient: account.recipientCode,
    reference: `AGT_COMM_${deal.id}`,
    reason: `Agent commission release for ${deal.reference || 'sale'}`,
  });

  if (!transfer.status) return NextResponse.json({ error: transfer.message || 'Transfer failed' }, { status: 400 });

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  const opening = wallet ? Number(wallet.balance) : 0;
  const closing = opening + commissionNaira;

  await prisma.$transaction(async (tx) => {
    if (wallet) await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet?.id ?? '',
        userId: user.id,
        type: 'deposit',
        status: 'success',
        amount: commissionNaira,
        currency: 'NGN',
        openingBalance: opening,
        closingBalance: closing,
        description: `Commission release for deal ${dealId}`,
        providerRef: transfer.data.transfer_code,
        meta: { dealId, commissionStatus: 'released', flow: 'sale_commission_release' },
      },
    });
    await tx.transaction.update({
      where: { id: dealId },
      data: { agentCommissionStatus: 'released', agentCommissionReleasedAt: new Date() },
    });
  });

  return NextResponse.json({ success: true, transfer: transfer.data });
}
