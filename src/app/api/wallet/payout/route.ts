import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireEstateManager } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (!['estate_manager', 'admin', 'agent'].includes(authResult.user.role || '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { user } = authResult;

  try {
    const body = await request.json();
    const amountKobo = Math.round(Number(body.amount) * 100);
    const recipientCode = String(body.recipientCode || '');
    const reason = String(body.reason || 'Payout');
    const targetUserId = String(body.targetUserId || '');

    if (!amountKobo || amountKobo < 250000) return NextResponse.json({ error: 'Minimum payout is ₦2,500' }, { status: 400 });
    if (!recipientCode) return NextResponse.json({ error: 'recipientCode is required' }, { status: 400 });

    const senderWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!senderWallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 400 });
    const senderBalance = Number(senderWallet.balance);
    if (senderBalance * 100 < amountKobo) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

    const transfer = await paystack.createTransfer({
      source: 'balance',
      amount: amountKobo,
      recipient: recipientCode,
      reference: `WAL_PAY_${Date.now()}_${Buffer.from(user.id).toString('hex').slice(0,8)}`,
      reason,
    });

    if (!transfer.status) return NextResponse.json({ error: transfer.message || 'Transfer failed' }, { status: 400 });

    const amountNaira = amountKobo / 100;
    await prisma.$transaction(async (tx) => {
      const opening = senderBalance;
      const closing = opening - amountNaira;
      await tx.wallet.update({ where: { id: senderWallet.id }, data: { balance: closing } });
      await tx.walletTransaction.create({
        data: { walletId: senderWallet.id, userId: user.id, type: 'withdrawal', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: opening, closingBalance: closing, description: `Payout to ${recipientCode}`, providerRef: transfer.data.transfer_code, meta: { flow: 'paystack_payout', recipientCode, targetUserId, transferCode: transfer.data.transfer_code } },
      });
      if (targetUserId) {
        const targetWallet = await tx.wallet.findUnique({ where: { userId: targetUserId } });
        if (targetWallet) {
          const tOpening = Number(targetWallet.balance);
          const tClosing = tOpening + amountNaira;
          await tx.wallet.update({ where: { id: targetWallet.id }, data: { balance: tClosing } });
          await tx.walletTransaction.create({
            data: { walletId: targetWallet.id, userId: targetUserId, type: 'deposit', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: tOpening, closingBalance: tClosing, description: `Payout from ${user.id}`, providerRef: transfer.data.transfer_code, meta: { fromUserId: user.id, flow: 'paystack_payout' } },
          });
        }
      }
    });

    return NextResponse.json({ success: true, transfer: transfer.data });
  } catch {
    return NextResponse.json({ error: 'Payout failed' }, { status: 400 });
  }
}
