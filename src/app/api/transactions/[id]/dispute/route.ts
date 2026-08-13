import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const txn = await prisma.transaction.findUnique({ where: { id: id } });
  if (!txn) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  if (txn.payerId !== user.id && txn.payeeId !== user.id) return NextResponse.json({ error: 'Not a party to this transaction' }, { status: 403 });

  const updated = await prisma.transaction.update({ where: { id: id }, data: { confirmationStatus: 'disputed', agentCommissionStatus: 'forfeited', commissionHoldReason: 'Disputed by party' } });
  return NextResponse.json({ success: true, confirmationStatus: updated.confirmationStatus });
}
