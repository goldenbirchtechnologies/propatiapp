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
    const accountNumber = String(body.accountNumber || '');
    const bankCode = String(body.bankCode || '');
    if (!accountNumber || !bankCode) return NextResponse.json({ error: 'Missing bank details' }, { status: 400 });
    const result = await paystack.resolveAccountNumber(accountNumber, bankCode);
    if (!result.status) return NextResponse.json({ error: result.message || 'Invalid account' }, { status: 400 });
    const recipient = await paystack.createTransferRecipient({
      name: result.data.account_name,
      account_number: accountNumber,
      bank_code: bankCode,
      type: 'nuban',
      currency: 'NGN',
    });
    if (!recipient.status) return NextResponse.json({ error: recipient.message || 'Failed to create recipient' }, { status: 400 });
    await prisma.userPaystackAccount.update({
      where: { userId: user.id },
      data: { accountNumber, bankName: result.data.bank_name, accountName: result.data.account_name, recipientCode: recipient.data.recipient_code },
    });
    return NextResponse.json({ success: true, recipient: recipient.data, account: result.data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
