import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get('accountNumber');
  const bankCode = searchParams.get('bankCode');
  if (!accountNumber || !bankCode) return NextResponse.json({ error: 'Missing account details' }, { status: 400 });
  const { paystack } = await import('@/lib/paystack');
  const result = await paystack.resolveAccountNumber(accountNumber, bankCode);
  return NextResponse.json(result);
}
