import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import AgentDealDetailClient from './AgentDealDetailClient';

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const deal = await prisma.transaction.findUnique({
    where: { id: params.id },
    include: { listing: { select: { id: true, title: true, area: true } }, payer: { select: { fullName: true, email: true } } },
  });
  if (!deal) redirect('/dashboard/agent/deals');
  return <AgentDealDetailClient deal={{ ...deal, property: deal.listing?.title || 'Unknown', client: deal.payer?.fullName || 'Unknown', agent: '', value: Number(deal.amount) / 100, type: deal.type === 'sale' ? 'buy' : deal.type, createdAt: deal.createdAt.toISOString(), lastContact: deal.updatedAt.toISOString(), documents: [], timeline: [] }} />;
}
