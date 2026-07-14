import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireAgent } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (authResult.user.role !== 'agent' && authResult.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dealId = params.id;
  const deal = await prisma.transaction.findUnique({ where: { id: dealId } });
  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  if (!deal.buyerConfirmedAt || !deal.sellerConfirmedAt) return NextResponse.json({ error: 'Buyer and seller must both confirm before closing', code: 'CONFIRMATION_REQUIRED' }, { status: 400 });

  const updated = await prisma.transaction.update({
    where: { id: dealId },
    data: {
      status: 'commission_held',
      agentCommissionStatus: 'held',
      paidAt: new Date(),
      commissionHoldReason: 'Awaiting close verification / dispute window',
    },
    include: { listing: true },
  });

  return NextResponse.json({ success: true, deal: updated });
}
