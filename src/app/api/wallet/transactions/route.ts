import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getUserWalletTransactions } from '@/lib/wallet-service';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);
  const data = await getUserWalletTransactions(authResult.user.id, page, limit);
  return NextResponse.json({ success: true, ...data });
}
