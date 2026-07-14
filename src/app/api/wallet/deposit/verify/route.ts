import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

  const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const result = await verifyResponse.json();
  if (!result.status || result.data?.status !== 'success') return NextResponse.json({ success: false, status: result.data?.status || 'unverified' });

  const data = result.data;
  const userId = data.metadata?.userId;
  if (!userId) return NextResponse.json({ error: 'Missing user metadata' }, { status: 400 });
  const amountNaira = Number(data.amount) / 100;

  const tx = await prisma.$transaction(async (txClient) => {
    const wallet = await txClient.wallet.findUnique({ where: { userId } });
    const opening = wallet ? Number(wallet.balance) : 0;
    const closing = opening + amountNaira;
    const updated = await txClient.wallet.upsert({ where: { userId }, update: { balance: closing }, create: { userId, currency: 'NGN', balance: closing } });
    const txn = await txClient.walletTransaction.upsert({
      where: { reference },
      update: { status: 'success', providerRef: String(data.id), meta: { ...data.metadata, customerCode: data.customer?.customer_code || null } },
      create: { walletId: updated.id, userId, reference, type: 'deposit', status: 'success', amount: amountNaira, openingBalance: opening, closingBalance: closing, providerRef: String(data.id), description: 'Wallet top-up', meta: { ...data.metadata, customerCode: data.customer?.customer_code || null } },
    });
    return txn;
  });

  // Reconcile: ensure Paystack customer balance is live source for future withdrawals
  try {
    const account = await prisma.userPaystackAccount.findUnique({ where: { userId } });
    if (account?.recipientCode && process.env.PAYSTACK_SECRET_KEY) {
      const res = await fetch('https://api.paystack.co/customer/' + encodeURIComponent(account.customerCode), { headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY } });
      const body = await res.json();
      if (res.ok && body.status && body.data?.customer) {
        await prisma.userPaystackAccount.update({ where: { userId }, data: { customerCode: body.data.customer.customer_code, balance: body.data.customer.balance || 0 } });
      }
    }
  } catch { /* non-blocking reconcile */ }

  return NextResponse.json({ success: true, amount: amountNaira, transaction: tx });
}
