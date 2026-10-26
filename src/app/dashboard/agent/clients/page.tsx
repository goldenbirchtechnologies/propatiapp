import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentClientsClient from './AgentClientsClient';

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  if (v && typeof v === 'object' && 'toNumber' in (v as object)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return 0;
};

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const agentId = user.id;

  // Every agreement this agent is assigned to defines a client relationship.
  const [agreements, conversations, acceptedInvites, assignments] = await Promise.all([
    prisma.agreement.findMany({
      where: { agentId },
      select: {
        id: true,
        type: true,
        status: true,
        tenantId: true,
        landlordId: true,
        rentAmount: true,
        cautionDeposit: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: { id: true, title: true, address: true, price: true, listingType: true },
        },
        tenant: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
        landlord: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
    prisma.conversation.findMany({
      where: { OR: [{ landlordId: agentId }, { tenantId: agentId }] },
      select: { landlordId: true, tenantId: true, updatedAt: true },
      take: 200,
    }),
    prisma.agentInvite.findMany({
      where: { agentId, status: 'accepted' },
      select: { landlordId: true },
    }),
    prisma.agentAssignment.findMany({
      where: { agentId },
      select: { invite: { select: { landlordId: true } } },
    }),
  ]);

  const relatedIds = new Set<string>();
  const addId = (id: string | null | undefined) => {
    if (id && id !== agentId) relatedIds.add(id);
  };

  for (const a of agreements) {
    addId(a.tenantId);
    addId(a.landlordId);
  }
  for (const c of conversations) {
    addId(c.landlordId);
    addId(c.tenantId);
  }
  for (const i of acceptedInvites) addId(i.landlordId);
  for (const a of assignments) addId(a.invite.landlordId);

  const relatedUsers = await prisma.user.findMany({
    where: { id: { in: Array.from(relatedIds) } },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      ninVerified: true,
      bvnEncrypted: true,
      profileBio: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  type Agg = {
    count: number;
    activeCount: number;
    closedCount: number;
    value: number;
    lastContact: string;
    createdAt: string;
    types: Set<string>;
    properties: { id: string; title: string; address: string; price: number }[];
    agreementIds: string[];
  };

  const agg = new Map<string, Agg>();
  const bucket = (id: string): Agg => {
    let e = agg.get(id);
    if (!e) {
      e = {
        count: 0,
        activeCount: 0,
        closedCount: 0,
        value: 0,
        lastContact: new Date(0).toISOString(),
        createdAt: new Date(Date.now() + 1).toISOString(),
        types: new Set<string>(),
        properties: [],
        agreementIds: [],
      };
      agg.set(id, e);
    }
    return e;
  };

  for (const a of agreements) {
    const value =
      a.listing?.listingType === 'sale' ? toNumber(a.listing.price) : toNumber(a.rentAmount);
    const isClosed = a.status === 'fully_signed' || a.status === 'expired' || a.status === 'terminated';
    for (const id of [a.tenantId, a.landlordId]) {
      if (!id || id === agentId) continue;
      const e = bucket(id);
      e.count += 1;
      if (isClosed) e.closedCount += 1;
      else e.activeCount += 1;
      e.value += value;
      e.types.add(a.type);
      e.agreementIds.push(a.id);
      if (a.updatedAt.toISOString() > e.lastContact) e.lastContact = a.updatedAt.toISOString();
      if (a.createdAt.toISOString() < e.createdAt) e.createdAt = a.createdAt.toISOString();
      if (a.listing?.id) {
        e.properties.push({
          id: a.listing.id,
          title: a.listing.title,
          address: a.listing.address,
          price: toNumber(a.listing.price),
        });
      }
    }
  }

  // Conversations give a "last touchpoint" for people with no agreement yet.
  const lastMessageAt = new Map<string, string>();
  for (const c of conversations) {
    const ts = c.updatedAt.toISOString();
    for (const id of [c.landlordId, c.tenantId]) {
      if (!id || id === agentId) continue;
      const prev = lastMessageAt.get(id);
      if (!prev || ts > prev) lastMessageAt.set(id, ts);
    }
  }

  const resolveType = (role: string, data: Agg | undefined): string => {
    const types = data?.types;
    const isSeller = role === 'landlord';
    if (types && types.has('sale')) return isSeller ? 'Seller' : 'Buyer';
    if (types && (types.has('rental') || types.has('short_let') || types.has('share'))) {
      return isSeller ? 'Landlord' : 'Renter';
    }
    return isSeller ? 'Landlord' : 'Renter';
  };

  const initialClients = relatedUsers
    .map((u) => {
      const data = agg.get(u.id);
      const lastTouch = lastMessageAt.get(u.id);
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        role: u.role,
        type: resolveType(u.role, data),
        bio: u.profileBio,
        ninVerified: u.ninVerified,
        bvnVerified: Boolean(u.bvnEncrypted),
        dealsCount: data?.count ?? 0,
        activeDeals: data?.activeCount ?? 0,
        closedDeals: data?.closedCount ?? 0,
        managedValue: data?.value ?? 0,
        lastContact: data?.lastContact ?? lastTouch ?? u.updatedAt.toISOString(),
        clientSince: (data?.createdAt ?? u.createdAt.toISOString()).slice(0, 10),
        properties: (data?.properties ?? []).slice(0, 6),
        agreementIds: (data?.agreementIds ?? []).slice(0, 20),
      };
    })
    .sort((a, b) => b.managedValue - a.managedValue || a.name.localeCompare(b.name));

  const stats = {
    total: initialClients.length,
    corporate: initialClients.filter((c) => c.name.length > 0 && c.role === 'landlord').length,
    private: initialClients.filter((c) => c.role !== 'landlord').length,
    activeDeals: initialClients.reduce((s, c) => s + c.activeDeals, 0),
    managedValue: initialClients.reduce((s, c) => s + c.managedValue, 0),
  };

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentClientsClient initialClients={initialClients} stats={stats} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
