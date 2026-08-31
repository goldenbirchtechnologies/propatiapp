import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentListingDetailClient from './AgentListingDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, status: true },
  });

  if (!listing) {
    return { title: 'Listing Not Found | PROPTI' };
  }

  return {
    title: `${listing.title} | Listing Details`,
    description: `Manage ${listing.title} — ${listing.status}`,
  };
}

export default async function AgentListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      agent: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      images: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, isCover: true, sortOrder: true },
      },
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
      },
      assignments: {
        where: { agentId: user.id, status: 'active' },
        select: { id: true, permissions: true, scope: true, status: true },
      },
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, status: true, createdAt: true, applicant: { select: { fullName: true, email: true } } },
      },
      agreements: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, createdAt: true },
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
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, amount: true, dueDate: true, createdAt: true },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, type: true, name: true, url: true, createdAt: true },
      },
    },
  });

  if (!listing) {
    redirect('/dashboard/agent/listings');
  }

  const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

  const permissions = listing.assignments.flatMap((a) => (Array.isArray(a.permissions) ? (a.permissions as string[]) : []));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
      hideGlobalSearch
    >
      <ErrorBoundary>
        <AgentListingDetailClient
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
            images: listing.images.map((img) => ({
              id: img.id,
              url: img.url,
              isCover: img.isCover,
              sortOrder: img.sortOrder,
            })),
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
            assignments: listing.assignments.map((a) => ({
              id: a.id,
              permissions: Array.isArray(a.permissions) ? (a.permissions as string[]) : [],
              scope: a.scope,
              status: a.status,
            })),
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
                // keep default
              }
              return {
                id: c.id,
                subject,
                lastMessage: c.lastMessage,
                lastMessageAt: c.lastMessageAt?.toISOString() || null,
              };
            }),
            invoices: listing.invoices.map((inv) => ({
              id: inv.id,
              status: inv.status,
              amount: toNumber(inv.amount),
              dueDate: inv.dueDate?.toISOString() || null,
              createdAt: inv.createdAt.toISOString(),
            })),
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
