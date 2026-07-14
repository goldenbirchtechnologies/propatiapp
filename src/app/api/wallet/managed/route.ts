import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireEstateManager } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (!['estate_manager','admin'].includes(authResult.user.role || '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { user } = authResult;
  const { searchParams } = new URL(request.url);
  const status = String(searchParams.get('status') || 'in_escrow');

  const transactions = await prisma.transaction.findMany({
    where: { paystackData: { path: ['managedById'], equals: user.id }, status },
    include: { listing: { select: { id: true, title: true, area: true } }, payer: { select: { fullName: true, email: true } }, payee: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, items: transactions });
}
