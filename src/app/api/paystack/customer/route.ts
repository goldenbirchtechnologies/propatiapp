import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  try {
    const userRecord = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, fullName: true, phone: true } });
    if (!userRecord) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const nameParts = String(userRecord.fullName || '').split(' ');
    const existing = await prisma.userPaystackAccount.findUnique({ where: { userId: user.id } });
    const customerEmail = existing?.email ?? userRecord.email;
    const customerPayload = { email: customerEmail, first_name: nameParts[0] || undefined, last_name: nameParts.slice(1).join(' ') || undefined, phone: userRecord.phone || undefined, metadata: { userId: user.id } };

    let customer;
    if (existing?.customerCode) {
      customer = await paystack.getCustomer(existing.customerCode);
      if (!customer.status) {
        customer = await paystack.createCustomer(customerPayload);
      }
    } else {
      customer = await paystack.createCustomer(customerPayload);
    }

    if (!customer.status) return NextResponse.json({ error: customer.message || 'Failed to create Paystack customer' }, { status: 400 });

    const customerCode = customer.data.customer_code;
    const accountPayload = await paystack.createDedicatedAccount(customerCode);

    const saved = await prisma.userPaystackAccount.upsert({
      where: { userId: user.id },
      update: { customerCode: customerCode, email: customerEmail, firstName: customerPayload.first_name, lastName: customerPayload.last_name, phone: customerPayload.phone, status: accountPayload.status ? 'active' : 'pending', bankName: accountPayload.data?.bank?.name ?? existing?.bankName, accountNumber: accountPayload.data?.account_number ?? existing?.accountNumber, accountName: accountPayload.data?.account_name ?? existing?.accountName, dedicatedAccountId: accountPayload.data?.id ? String(accountPayload.data.id) : existing?.dedicatedAccountId, collectBelow: accountPayload.data?.collectBelow ? Number(accountPayload.data.collectBelow) : undefined },
      create: { userId: user.id, email: customerEmail, firstName: customerPayload.first_name, lastName: customerPayload.last_name, phone: customerPayload.phone, customerCode, status: accountPayload.status ? 'active' : 'pending', bankName: accountPayload.data?.bank?.name, accountNumber: accountPayload.data?.account_number, accountName: accountPayload.data?.account_name, dedicatedAccountId: accountPayload.data?.id ? String(accountPayload.data.id) : null, currency: 'NGN' },
    });

    return NextResponse.json({ success: true, data: saved });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
