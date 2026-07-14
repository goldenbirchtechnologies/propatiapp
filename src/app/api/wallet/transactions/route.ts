import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);
  const types = searchParams.get('types');
  const direction = searchParams.get('direction');

  const wallet = await prisma.wallet.findUnique({ where: { userId: authResult.user.id } });
  if (!wallet) return NextResponse.json({ success: true, items: [], total: 0, page, limit });
  const where: Record<string, unknown> = { walletId: wallet.id };
  const allowed = ['deposit','withdrawal','transfer','refund','adjustment','escrow_credit'];
  if (types) {
    const requested = types.split(',').map((v) => v.trim()).filter((v) => allowed.includes(v));
    if (requested.length) where.type = { in: requested };
  }
  if (direction === 'credit') {
    where.type = { in: ['deposit','escrow_credit','transfer','refund','adjustment'] };
  } else if (direction === 'debit') {
    where.type = { in: ['withdrawal','transfer'] };
  }

  const [items, total] = await prisma.$transaction([
    prisma.walletTransaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.walletTransaction.count({ where }),
  ]);

  return NextResponse.json({ success: true, items, total, page, limit });
}
