import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  try {
    const body = await request.json();
    const amountNaira = Number(body.amount);
    if (!amountNaira || amountNaira < 500) return NextResponse.json({ error: 'Minimum withdrawal is ₦500' }, { status: 400 });

    const [wallet, account] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: user.id } }),
      prisma.userPaystackAccount.findUnique({ where: { userId: user.id } }),
    ]);
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    const opening = Number(wallet.balance);
    if (opening < amountNaira) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

    if (account?.recipientCode) {
      const transferAmountKobo = Math.round(amountNaira * 100);
      const transfer = await paystack.createTransfer({
        source: 'balance',
        amount: transferAmountKobo,
        recipient: account.recipientCode,
        reference: `WAL_PAY_${Date.now()}_${Buffer.from(user.id).toString('hex').slice(0,8)}`,
        reason: 'Wallet withdrawal',
      });
      if (!transfer.status) return NextResponse.json({ error: transfer.message || 'Transfer failed' }, { status: 400 });
      const closing = opening - amountNaira;
      await prisma.$transaction(async (tx) => {
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
        await tx.walletTransaction.create({
          data: { walletId: wallet.id, userId: user.id, type: 'withdrawal', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: opening, closingBalance: closing, description: 'Wallet withdrawal via Paystack', providerRef: transfer.data.transfer_code, meta: { flow: 'paystack_withdrawal', recipientCode: account.recipientCode, transferCode: transfer.data.transfer_code } },
        });
      });
      await reconcilePaystackBalance(user.id);
      return NextResponse.json({ success: true, transfer: transfer.data });
    }

    const closing = opening - amountNaira;
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
      await tx.walletTransaction.create({
        data: { walletId: wallet.id, userId: user.id, type: 'withdrawal', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: opening, closingBalance: closing, description: 'Wallet withdrawal' },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Withdrawal failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
