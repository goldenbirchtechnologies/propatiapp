import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const tx = await prisma.transaction.findUnique({
    where: { id: id },
    include: {
      listing: { select: { id: true, title: true, images: { where: { isCover: true }, take: 1 } } },
      payer: { select: { id: true, fullName: true, avatarUrl: true } },
      payee: { select: { id: true, fullName: true, avatarUrl: true } },
      agent: { select: { id: true, fullName: true } },
    },
  });
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  if (tx.payerId !== authResult.user.id && tx.payeeId !== authResult.user.id) return NextResponse.json({ error: 'Not a party to this transaction' }, { status: 403 });
  return NextResponse.json({ success: true, data: tx });
}
