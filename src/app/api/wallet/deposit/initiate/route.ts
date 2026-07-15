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
    if (!amountNaira || amountNaira < 100) return NextResponse.json({ error: 'Minimum deposit is ₦100' }, { status: 400 });
    const userRecord = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, fullName: true } });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const paystackAccount = await prisma.userPaystackAccount.findUnique({ where: { userId: user.id } });
    const nameParts = String(userRecord.fullName || 'User').split(' ');
    const customerCode = paystackAccount?.customerCode;
    const metadata: Record<string, unknown> = { walletDeposit: true, userId: user.id };
    const customerEmail = userRecord.email;
    if (customerCode) metadata.customerCode = customerCode;

    const reference = `WAL_DEP_${Date.now()}_${Buffer.from(user.id).toString('hex').slice(0,8)}`;
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, amount: Math.round(amountNaira * 100), reference, metadata, channels: ['card', 'bank', 'ussd', 'bank_transfer'] }),
    });
    const result = await response.json();
    if (!result.status) return NextResponse.json({ error: result.message || 'Failed to initialize deposit' }, { status: 400 });

    await prisma.walletTransaction.create({
      data: { walletId: user.id, userId: user.id, reference, type: 'deposit', status: 'pending', amount: amountNaira, openingBalance: 0, closingBalance: 0, meta: { provider: 'paystack', customerCode } },
    });

    return NextResponse.json({ success: true, authorizationUrl: result.data.authorization_url, reference });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
