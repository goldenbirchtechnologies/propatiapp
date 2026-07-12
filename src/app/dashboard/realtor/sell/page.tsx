import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SellPipelineClient from './SellPipelineClient';

export default async function RealtorSellPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: ({ ownerId: user.id, type: 'sale' } as any),
    select: { id: true, title: true, price: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const initialDeals = listings.map((l) => ({
    id: l.id,
    title: l.title,
    property: l.title,
    value: Number(l.price),
    client: '—',
  }));

  return <SellPipelineClient initialDeals={initialDeals} />;
}
