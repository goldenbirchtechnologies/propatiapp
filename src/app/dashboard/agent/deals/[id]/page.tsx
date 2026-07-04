import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentDealDetailClient from './AgentDealDetailClient';

export default async function AgentDealDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const deal = await getDealById(params.id);

  if (!deal) redirect('/dashboard/agent/pipeline');

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AgentDealDetailClient deal={deal} />
    </DashboardShell>
  );
}

type Deal = {
  id: string;
  title: string;
  property: string;
  value: number;
  client: string;
  agent: string;
  status: string;
  type: 'buy' | 'sell';
  createdAt: string;
  lastContact: string;
  documents: { id: string; name: string; type: string; size: string; uploadedAt: string }[];
  timeline: { id: string; event: string; date: string; detail: string }[];
};

async function getDealById(id: string): Promise<Deal | null> {
  // Simulated useSWR-like fetcher by id.
  // Replace with actual prisma call:
  // return prisma.agreement.findUnique({ where: { id }, include: { ... } });
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!id.startsWith('deal-')) return null;

  const stageIndex = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
  const stages = ['enquiries', 'viewings', 'offers', 'agreements', 'closed'];
  const stage = stages[stageIndex];

  return {
    id,
    title: `${id.replace('deal-', 'Deal ')} - Ogudu GRA Apartment`,
    property: '12 Ogudu GRA, Lagos',
    value: 28_500_000,
    client: 'Amaka Nwosu',
    agent: 'Agent',
    status: stage,
    type: 'buy',
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString(),
    documents: [
      { id: `${id}-doc-1`, name: 'Agreement Draft', type: 'pdf', size: '245 KB', uploadedAt: new Date().toISOString() },
      { id: `${id}-doc-2`, name: 'ID Verification', type: 'pdf', size: '1.2 MB', uploadedAt: new Date().toISOString() },
      { id: `${id}-doc-3`, name: 'Property Photos', type: 'image', size: '4.5 MB', uploadedAt: new Date().toISOString() },
    ],
    timeline: [
      { id: `${id}-t1`, event: 'Deal created', date: new Date().toISOString(), detail: 'Initial enquiry logged' },
      { id: `${id}-t2`, event: 'Viewing scheduled', date: new Date(Date.now() - 86400000).toISOString(), detail: 'Inspection booked for property' },
      { id: `${id}-t3`, event: 'Offer submitted', date: new Date(Date.now() - 172800000).toISOString(), detail: 'Client made an offer of ₦28,500,000' },
    ],
  };
}
