import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getWalletBalance } from '@/lib/wallet-service';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const data = await getWalletBalance(authResult.user.id);
  return NextResponse.json({ success: true, data });
}
