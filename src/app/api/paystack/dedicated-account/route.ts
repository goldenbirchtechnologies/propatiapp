import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  try {
    const account = await prisma.userPaystackAccount.findUnique({ where: { userId: user.id } });
    const customerCode = account?.customerCode;
    if (!customerCode) return NextResponse.json({ error: 'Missing Paystack customer' }, { status: 400 });

    const result = await paystack.createDedicatedAccount(customerCode);
    if (!result.status) return NextResponse.json({ error: result.message || 'Failed to create dedicated account' }, { status: 400 });

    const saved = await prisma.userPaystackAccount.update({
      where: { userId: user.id },
      data: { status: result.data.active ? 'active' : 'pending', bankName: result.data.bank.name, accountNumber: result.data.account_number, accountName: result.data.account_name, dedicatedAccountId: String(result.data.id), currency: result.data.currency },
    });
    return NextResponse.json({ success: true, data: saved });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
