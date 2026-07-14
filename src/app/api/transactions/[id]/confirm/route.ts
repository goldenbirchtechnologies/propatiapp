import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const txn = await prisma.transaction.findUnique({ where: { id: params.id } });
  if (!txn) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  if (txn.payerId !== user.id && txn.payeeId !== user.id) return NextResponse.json({ error: 'Not a party to this transaction' }, { status: 403 });

  const isBuyer = txn.payerId === user.id;
  const update: Record<string, unknown> = {};
  if (isBuyer) { update.buyerConfirmedAt = new Date(); }
  else { update.sellerConfirmedAt = new Date(); }

  const nowConfirmed = isBuyer ? !!txn.sellerConfirmedAt : !!txn.buyerConfirmedAt;
  update.confirmationStatus = nowConfirmed ? 'fully_confirmed' : 'partially_confirmed';

  const updated = await prisma.transaction.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ success: true, confirmationStatus: updated.confirmationStatus });
}
