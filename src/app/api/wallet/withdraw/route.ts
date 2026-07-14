import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { debitWallet } from '@/lib/wallet-service';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  try {
    const body = await request.json();
    const amountNaira = Number(body.amount);
    if (!amountNaira || amountNaira < 500) return NextResponse.json({ error: 'Minimum withdrawal is ₦500' }, { status: 400 });
    const result = await debitWallet(user.id, amountNaira, 'withdrawal', 'Wallet withdrawal');
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Withdrawal failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
