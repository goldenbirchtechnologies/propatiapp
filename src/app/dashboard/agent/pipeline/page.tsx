import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentPipelineClient from './AgentPipelineClient';

export default async function AgentPipelinePage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const STAGE_COLORS: unknown = {};

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
        owner: { select: { fullName: true } },
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
        listing: { select: { title: true, address: true } },
        tenant: { select: { fullName: true } },
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
        listing: { select: { title: true, address: true } },
        tenant: { select: { fullName: true } },
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
        listing: { select: { title: true, address: true } },
        tenant: { select: { fullName: true } },
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
        listing: { select: { title: true, address: true } },
        tenant: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const toNumber = (val: unknown) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Number(val) || 0;
    return 0;
  };

  const formatValue = (val: unknown) => toNumber(val).toLocaleString('en-NG');

  const formatDate = (date: Date) =>
    new Date(date).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const stages = [
    {
      id: 'enquiries',
      title: 'Enquiries',
      color: STAGE_COLORS.enquiries,
      deals: enquiries.map((l) => ({
        id: l.id,
        title: l.title,
        property: l.address,
        value: toNumber(l.price),
        client: l.owner.fullName,
        lastContact: formatDate(l.createdAt),
        type: 'buy' as const,
      })),
    },
    {
      id: 'viewings',
      title: 'Viewings',
      color: STAGE_COLORS.viewings,
      deals: viewings.map((v) => ({
        id: v.id,
        title: `Inspection - ${v.listing.title}`,
        property: v.listing.address,
        value: 0,
        client: v.tenant.fullName,
        lastContact: formatDate(v.scheduledAt),
        type: 'buy' as const,
      })),
    },
    {
      id: 'offers',
      title: 'Offers',
      color: STAGE_COLORS.offers,
      deals: offers.map((a) => ({
        id: a.id,
        title: `${a.type} - ${a.listing.title}`,
        property: a.listing.address,
        value: 0,
        client: a.tenant.fullName,
        lastContact: formatDate(a.createdAt),
        type: 'buy' as const,
      })),
    },
    {
      id: 'agreements',
      title: 'Agreements',
      color: STAGE_COLORS.agreements,
      deals: agreements.map((a) => ({
        id: a.id,
        title: `${a.type} - ${a.listing.title}`,
        property: a.listing.address,
        value: 0,
        client: a.tenant.fullName,
        lastContact: formatDate(a.createdAt),
        type: 'buy' as const,
      })),
    },
    {
      id: 'closed',
      title: 'Closed',
      color: STAGE_COLORS.closed,
      deals: closed.map((a) => ({
        id: a.id,
        title: `${a.type} - ${a.listing.title}`,
        property: a.listing.address,
        value: 0,
        client: a.tenant.fullName,
        lastContact: formatDate(a.createdAt),
        type: 'buy' as const,
      })),
    },
  ];

  const totalValue = stages.reduce((sum, s) => sum + s.deals.reduce((s2, d) => s2 + d.value, 0), 0);

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
        }}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
