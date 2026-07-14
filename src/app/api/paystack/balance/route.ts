import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const account = await prisma.userPaystackAccount.findUnique({ where: { userId: authResult.user.id } });
  if (!account?.customerCode) return NextResponse.json({ success: true, data: { customerCode: null, balance: 0, currency: 'NGN' } });
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ success: true, data: { customerCode: account.customerCode, balance: 0, currency: 'NGN' } });
    const res = await fetch('https://api.paystack.co/customer/' + encodeURIComponent(account.customerCode), { headers: { Authorization: 'Bearer ' + secret } });
    const body = await res.json();
    if (!res.ok || !body.status) return NextResponse.json({ success: true, data: { customerCode: account.customerCode, balance: 0, currency: 'NGN' } });
    const balance = body.data?.customer?.balance || 0;
    await prisma.userPaystackAccount.update({ where: { userId: authResult.user.id }, data: { balance } });
    return NextResponse.json({ success: true, data: { customerCode: account.customerCode, balance, currency: 'NGN' } });
  } catch {
    return NextResponse.json({ success: true, data: { customerCode: account.customerCode, balance: 0, currency: 'NGN' } });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ success: false, error: 'Paystack not configured' }, { status: 400 });
    const accounts = await prisma.userPaystackAccount.findMany({ where: { customerCode: { not: null } } });
    let updated = 0;
    for (const acct of accounts) {
      try {
        const res = await fetch('https://api.paystack.co/customer/' + encodeURIComponent(acct.customerCode!), { headers: { Authorization: 'Bearer ' + secret } });
        const body = await res.json();
        if (res.ok && body.status && body.data?.customer) {
          await prisma.userPaystackAccount.update({ where: { id: acct.id }, data: { balance: body.data.customer.balance || 0 } });
          updated++;
        }
      } catch { /* skip */ }
    }
    return NextResponse.json({ success: true, updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Reconcile failed' }, { status: 400 });
  }
}
