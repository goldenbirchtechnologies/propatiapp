import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireAdmin } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const dealId = params.id;
  const deal = await prisma.transaction.findUnique({ where: { id: dealId } });
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  if (!deal.agentId) return NextResponse.json({ error: 'No agent on this deal' }, { status: 400 });

  const account = await prisma.userPaystackAccount.findUnique({ where: { userId: deal.agentId } });
  if (!account?.recipientCode) return NextResponse.json({ error: 'Agent has no payout account' }, { status: 400 });

  const commissionNaira = Number(deal.agentCommission || 0) / 100;
  const transfer = await paystack.createTransfer({
    source: 'balance',
    amount: Number(deal.agentCommission || 0),
    recipient: account.recipientCode,
    reference: `AGT_COMM_ADMIN_${deal.id}`,
    reason: `Admin commission release for ${deal.reference || 'sale'}`,
  });
  if (!transfer.status) return NextResponse.json({ error: transfer.message || 'Transfer failed' }, { status: 400 });

  const wallet = await prisma.wallet.findUnique({ where: { userId: deal.agentId } });
  const opening = wallet ? Number(wallet.balance) : 0;
  const closing = opening + commissionNaira;

  await prisma.$transaction(async (tx) => {
    if (wallet) await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
    await tx.walletTransaction.create({
      data: { walletId: wallet?.id ?? '', userId: deal.agentId, type: 'deposit', status: 'success', amount: commissionNaira, currency: 'NGN', openingBalance: opening, closingBalance: closing, description: `Admin commission release for deal ${dealId}`, providerRef: transfer.data.transfer_code, meta: { dealId, flow: 'admin_sale_commission_release' } },
    });
    await tx.transaction.update({ where: { id: dealId }, data: { agentCommissionStatus: 'released', agentCommissionReleasedAt: new Date() } });
  });

  return NextResponse.json({ success: true, transfer: transfer.data });
}
