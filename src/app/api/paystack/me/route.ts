import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const account = await prisma.userPaystackAccount.findUnique({ where: { userId: authResult.user.id } });
  return NextResponse.json({ success: true, data: account });
}
