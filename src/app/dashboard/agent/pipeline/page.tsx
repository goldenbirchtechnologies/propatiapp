import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentPipelineClient from './AgentPipelineClient';

type Deal = {
  id: string;
  title: string;
  property: string;
  value: number;
  client: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
  assignedAgent: string;
  assignedAgentPhone?: string | null;
  lastContact: string;
  createdAt: Date;
  type: string;
};

type Stage = {
  id: string;
  title: string;
  deals: Deal[];
};

export default async function AgentPipelinePage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const agentId = user.id;

  const [
    enquiries,
    viewings,
    offers,
    agreements,
    closed,
  ] = await Promise.all([
    prisma.listing.findMany({
      where: { agentId, status: 'draft' },
      select: {
        id: true,
        title: true,
        address: true,
        price: true,
        createdAt: true,
        agent: { select: { fullName: true, phone: true, email: true } },
        owner: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.screeningCall.findMany({
      where: { listing: { agentId } },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        createdAt: true,
        listing: { select: { title: true, address: true, price: true } },
        tenant: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 20,
    }),
    prisma.agreement.findMany({
      where: { agentId, status: { in: ['draft', 'pending_landlord', 'pending_tenant'] } },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        listing: { select: { title: true, address: true, price: true } },
        tenant: { select: { fullName: true, phone: true, email: true } },
        agent: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.agreement.findMany({
      where: { agentId, status: { in: ['tenant_signed', 'landlord_signed'] } },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        listing: { select: { title: true, address: true, price: true } },
        tenant: { select: { fullName: true, phone: true, email: true } },
        agent: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.agreement.findMany({
      where: { agentId, status: 'fully_signed' },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        listing: { select: { title: true, address: true, price: true } },
        tenant: { select: { fullName: true, phone: true, email: true } },
        agent: { select: { fullName: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const toNumber = (val: unknown) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Number(val) || 0;
    if (val && typeof val === 'object' && 'toNumber' in val) return (val as any).toNumber();
    return 0;
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const stages = [
    {
      id: 'enquiries',
      title: 'Enquiries',
      deals: enquiries.map((l) => ({
        id: l.id,
        title: l.title,
        property: l.address,
        value: toNumber(l.price),
        client: l.owner.fullName,
        clientPhone: l.owner.phone,
        clientEmail: l.owner.email,
        assignedAgent: l.agent?.fullName || user.fullName,
        assignedAgentPhone: l.agent?.phone || undefined,
        lastContact: formatDate(l.createdAt),
        createdAt: l.createdAt,
        type: 'enquiry',
      })),
    },
    {
      id: 'viewings',
      title: 'Viewings',
      deals: viewings.map((v) => ({
        id: v.id,
        title: `Inspection - ${v.listing.title}`,
        property: v.listing.address,
        value: toNumber(v.listing.price),
        client: v.tenant.fullName,
        clientPhone: v.tenant.phone,
        clientEmail: v.tenant.email,
        assignedAgent: user.fullName,
        assignedAgentPhone: undefined,
        lastContact: formatDate(v.scheduledAt),
        createdAt: v.createdAt,
        type: 'viewing',
      })),
    },
    {
      id: 'offers',
      title: 'Offers',
      deals: offers.map((a) => ({
        id: a.id,
        title: `${a.type} - ${a.listing.title}`,
        property: a.listing.address,
        value: toNumber(a.listing.price),
        client: a.tenant.fullName,
        clientPhone: a.tenant.phone,
        clientEmail: a.tenant.email,
        assignedAgent: a.agent?.fullName || user.fullName,
        assignedAgentPhone: a.agent?.phone || undefined,
        lastContact: formatDate(a.createdAt),
        createdAt: a.createdAt,
        type: 'offer',
      })),
    },
    {
      id: 'agreements',
      title: 'Agreements',
      deals: agreements.map((a) => ({
        id: a.id,
        title: `${a.type} - ${a.listing.title}`,
        property: a.listing.address,
        value: toNumber(a.listing.price),
        client: a.tenant.fullName,
        clientPhone: a.tenant.phone,
        clientEmail: a.tenant.email,
        assignedAgent: a.agent?.fullName || user.fullName,
        assignedAgentPhone: a.agent?.phone || undefined,
        lastContact: formatDate(a.createdAt),
        createdAt: a.createdAt,
        type: 'agreement',
      })),
    },
    {
      id: 'closed',
      title: 'Closed',
      deals: closed.map((a) => ({
        id: a.id,
        title: `${a.type} - ${a.listing.title}`,
        property: a.listing.address,
        value: toNumber(a.listing.price),
        client: a.tenant.fullName,
        clientPhone: a.tenant.phone,
        clientEmail: a.tenant.email,
        assignedAgent: a.agent?.fullName || user.fullName,
        assignedAgentPhone: a.agent?.phone || undefined,
        lastContact: formatDate(a.createdAt),
        createdAt: a.createdAt,
        type: 'closed',
      })),
    },
  ];

  const totalValue = stages.reduce((sum, s) => sum + s.deals.reduce((s2, d) => s2 + d.value, 0), 0);
  const allDeals = stages.flatMap((s) => s.deals);
  const now = Date.now();
  const newDealsThisWeek = allDeals.filter((d) => now - d.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000).length;
  const newDealsLastWeek = allDeals.filter((d) => {
    const diff = now - d.createdAt.getTime();
    return diff >= 7 * 24 * 60 * 60 * 1000 && diff < 14 * 24 * 60 * 60 * 1000;
  }).length;

  let trendLabel: string | null = null;
  let trendPositive = true;
  if (newDealsLastWeek > 0) {
    const pct = Math.round(((newDealsThisWeek - newDealsLastWeek) / newDealsLastWeek) * 100);
    trendLabel = `${pct >= 0 ? '+' : ''}${pct}% deals this week`;
    trendPositive = pct >= 0;
  } else if (newDealsThisWeek > 0) {
    trendLabel = `${newDealsThisWeek} new deal${newDealsThisWeek === 1 ? '' : 's'} this week`;
    trendPositive = true;
  }

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentPipelineClient
          initialData={{
            stages,
            stats: {
              totalValue,
              enquiries: stages.find((s) => s.id === 'enquiries')?.deals.length || 0,
              viewings: stages.find((s) => s.id === 'viewings')?.deals.length || 0,
              offers: stages.find((s) => s.id === 'offers')?.deals.length || 0,
              closed: stages.find((s) => s.id === 'closed')?.deals.length || 0,
            },
            trend: trendLabel,
            trendPositive,
          }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
