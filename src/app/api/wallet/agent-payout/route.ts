import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  try {
    const body = await request.json();
    const amountNaira = Number(body.amount);
    const description = String(body.description || 'Agent commission payout');
    if (!amountNaira || amountNaira <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    const opening = Number(wallet.balance);
    if (opening < amountNaira) return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

    const txn = await prisma.$transaction(async (tx) => {
      const closing = opening - amountNaira;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
      const record = await tx.walletTransaction.create({
        data: { walletId: wallet.id, userId: user.id, type: 'withdrawal', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: opening, closingBalance: closing, description, meta: { flow: 'agent_commission_payout' } },
      });
      return record;
    });

    return NextResponse.json({ success: true, transaction: txn });
  } catch {
    return NextResponse.json({ error: 'Payout failed' }, { status: 400 });
  }
}
