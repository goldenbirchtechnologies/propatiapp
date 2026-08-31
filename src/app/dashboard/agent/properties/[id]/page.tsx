import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import AgentPropertyDetailClient from './AgentPropertyDetailClient';

export const metadata = {
  title: 'Property Details | PROPTI',
  description: 'View property details, units, and related activity.',
};

export default async function AgentPropertyDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'agent') {
    redirect(getRoleRedirectPath(user.role));
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      agent: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      images: { where: { isCover: true }, take: 1, select: { id: true, url: true } },
      units: {
        select: {
          id: true,
          unitNumber: true,
          buildingName: true,
          type: true,
          listingType: true,
          rent: true,
          pricePeriod: true,
          status: true,
          occupancy: true,
          isListed: true,
          currentTenant: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { unitNumber: 'asc' },
      },
      assignments: {
        where: { agentId: user.id, status: 'active' },
        select: { id: true, permissions: true, scope: true },
      },
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, createdAt: true, applicant: { select: { fullName: true, email: true } } },
      },
      agreements: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, createdAt: true, partyA: { select: { fullName: true } }, partyB: { select: { fullName: true } } },
      },
      bookings: {
        orderBy: { checkIn: 'desc' },
        take: 5,
        select: { id: true, status: true, checkIn: true, checkOut: true, totalPrice: true, tenant: { select: { fullName: true } } },
      },
      maintenanceTickets: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, priority: true, title: true, createdAt: true },
      },
      conversations: {
        orderBy: { lastMessageAt: 'desc' },
        take: 5,
        select: { id: true, subject: true, lastMessage: true, lastMessageAt: true, participants: true },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, type: true, name: true, url: true, createdAt: true },
      },
    },
  });

  if (!listing) {
    redirect('/dashboard/agent/properties');
  }

  const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

  const totalUnits = listing.units.length;
  const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;
  const occupiedUnits = listing.units.filter((u) => u.occupancy === 'OCCUPIED').length;
  const listedUnits = listing.units.filter((u) => u.isListed).length;

  const permissions = listing.assignments.flatMap((a) => (a.permissions as string[]) || []);

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole="agent"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
      hideGlobalSearch
    >
      <ErrorBoundary>
        <AgentPropertyDetailClient
          listing={{
            id: listing.id,
            title: listing.title,
            address: listing.address,
            area: listing.area,
            state: listing.state,
            city: listing.city,
            postalCode: listing.postalCode,
            listingType: listing.listingType,
            propertyType: listing.propertyType,
            price: toNumber(listing.price),
            pricePeriod: listing.pricePeriod,
            cautionDeposit: toNumber(listing.cautionDeposit),
            serviceCharge: toNumber(listing.serviceCharge),
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            toilets: listing.toilets,
            sizeSqm: toNumber(listing.sizeSqm),
            floorLevel: listing.floorLevel,
            furnished: listing.furnished,
            parkingSpaces: listing.parkingSpaces,
            amenities: listing.amenities,
            availableFrom: listing.availableFrom?.toISOString() || null,
            minimumStay: listing.minimumStay,
            status: listing.status,
            allowShortlet: listing.allowShortlet,
            guestsCount: listing.guestsCount,
            bedsCount: listing.bedsCount,
            privacyType: listing.privacyType,
            propertyStructure: listing.propertyStructure,
            bookingModel: listing.bookingModel,
            weekendPricing: toNumber(listing.weekendPricing),
            discounts: listing.discounts,
            highlights: listing.highlights,
            houseRules: listing.houseRules,
            safetyDisclosures: listing.safetyDisclosures,
            kycCompliance: listing.kycCompliance,
            verificationTier: listing.verificationTier,
            viewsCount: listing.viewsCount,
            createdAt: listing.createdAt.toISOString(),
            description: listing.description,
            owner: listing.owner
              ? {
                  id: listing.owner.id,
                  fullName: listing.owner.fullName,
                  email: listing.owner.email,
                  phone: listing.owner.phone,
                  avatarUrl: listing.owner.avatarUrl,
                }
              : null,
            agent: listing.agent
              ? {
                  id: listing.agent.id,
                  fullName: listing.agent.fullName,
                  email: listing.agent.email,
                  phone: listing.agent.phone,
                  avatarUrl: listing.agent.avatarUrl,
                }
              : null,
            coverImage: listing.images?.[0]?.url || null,
            units: listing.units.map((u) => ({
              id: u.id,
              unitNumber: u.unitNumber,
              buildingName: u.buildingName,
              type: u.type,
              listingType: u.listingType,
              rent: toNumber(u.rent),
              pricePeriod: u.pricePeriod,
              status: u.status,
              occupancy: u.occupancy,
              isListed: u.isListed,
              currentTenant: u.currentTenant,
            })),
            permissions,
            totalUnits,
            vacantUnits,
            occupiedUnits,
            listedUnits,
            applications: listing.applications.map((a) => ({
              id: a.id,
              status: a.status,
              createdAt: a.createdAt.toISOString(),
              applicant: a.applicant,
            })),
            agreements: listing.agreements.map((a) => ({
              id: a.id,
              status: a.status,
              createdAt: a.createdAt.toISOString(),
              partyA: a.partyA,
              partyB: a.partyB,
            })),
            bookings: listing.bookings.map((b) => ({
              id: b.id,
              status: b.status,
              checkIn: b.checkIn.toISOString(),
              checkOut: b.checkOut.toISOString(),
              totalPrice: toNumber(b.totalPrice),
              tenant: b.tenant,
            })),
            maintenanceTickets: listing.maintenanceTickets.map((t) => ({
              id: t.id,
              status: t.status,
              priority: t.priority,
              title: t.title,
              createdAt: t.createdAt.toISOString(),
            })),
            conversations: listing.conversations.map((c) => {
              let subject = c.subject || 'Conversation';
              try {
                const participants = Array.isArray((c as any).participants)
                  ? ((c as any).participants as Array<{ name?: string }>)
                  : [];
                const names = participants.map((p) => p.name).filter(Boolean);
                if (names.length > 0 && !c.subject) subject = names.join(', ');
              } catch {
                // keep default subject
              }
              return {
                id: c.id,
                subject,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt?.toISOString() || null,
              };
            }),
            documents: listing.documents.map((d) => ({
              id: d.id,
              type: d.type,
              name: d.name,
              url: d.url,
              createdAt: d.createdAt.toISOString(),
            })),
          }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
