import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UnitDetailClient from './UnitDetailClient';

export default async function LandlordUnitDetailPage({ params }: { params: Promise<{ id: string; unitId: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  const { id, unitId } = await params;
  const property = await prisma.property.findFirst({
    where: { id, ownerId: user.id },
    include: {
      photos: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
    },
  });
  const space = property ? await prisma.space.findFirst({ where: { id: unitId, propertyId: id }, include: { photos: { orderBy: { sortOrder: 'asc' } }, category: true, currentTenant: { select: { id: true, fullName: true, email: true, phone: true } }, listings: { orderBy: { createdAt: 'desc' }, take: 12, include: { documents: { orderBy: { updatedAt: 'desc' }, take: 12, include: { uploadedBy: { select: { fullName: true } } } }, agreements: { orderBy: { updatedAt: 'desc' }, take: 12, select: { id: true, tenantId: true, type: true, status: true, startDate: true, endDate: true, rentAmount: true, rentPeriod: true, pdfUrl: true, updatedAt: true, tenant: { select: { id: true, fullName: true, email: true, phone: true } } } }, transactions: { orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, type: true, status: true, amount: true, paidAt: true, createdAt: true, description: true } }, maintenanceTickets: { orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, title: true, description: true, category: true, priority: true, status: true, createdAt: true, updatedAt: true, resolvedAt: true } } } } } }) : null;
  if (!property || !space) redirect(`/dashboard/landlord/properties/${id}`);

  const primary = space.listings.find((listing) => listing.status === 'active') ?? space.listings[0] ?? null;
  const agreements = space.listings.flatMap((listing) => listing.agreements);
  const documents = space.listings.flatMap((listing) => listing.documents);
  const transactions = space.listings.flatMap((listing) => listing.transactions);
  const maintenanceTickets = space.listings.flatMap((listing) => listing.maintenanceTickets);
  const activeAgreement = agreements.find((agreement) => agreement.tenantId === space.currentTenantId) ?? null;
  const arrangement = primary?.listingType === 'short_let' ? 'shortlet' : primary?.listingType === 'commercial' ? 'commercial_lease' : primary?.listingType === 'share' ? 'room_share' : 'long_term';
  const unit = { id: space.id, unitNumber: space.identifier, type: space.category.spaceType, unitCategory: space.category.spaceType, rentalArrangement: arrangement, listingMethod: primary?.listingType === 'short_let' ? 'booking_calendar' : 'single_unit', occupancyModel: arrangement === 'shortlet' ? 'shortlet' : arrangement === 'room_share' ? 'room_share' : arrangement === 'commercial_lease' ? 'commercial' : 'long_term', occupancyState: space.operationalStatus, categoryAttributes: (space.attributes as Record<string, unknown> | null) ?? null, parentUnitId: null, listingType: primary?.listingType ?? 'rent', pricePeriod: primary?.pricePeriod ?? null, rent: primary ? Number(primary.price) : 0, cautionDeposit: null, serviceCharge: null, status: space.operationalStatus, occupancy: space.operationalStatus === 'occupied' ? 'OCCUPIED' : 'VACANT', isListed: space.listings.some((listing) => listing.status === 'active'), bedrooms: Number((space.attributes as any)?.bedrooms ?? 0), bathrooms: Number((space.attributes as any)?.bathrooms ?? 0), sizeSqm: Number((space.attributes as any)?.sizeSqm ?? 0) || null, leaseStartDate: null, leaseEndDate: null, currentTenantId: space.currentTenantId, currentTenant: space.currentTenant, createdAt: space.createdAt.toISOString() };
  const listing = { id: property.id, title: property.name, address: property.address, area: property.city, state: property.state, status: property.onboardingStatus as string, images: [...space.photos, ...property.photos].map((photo) => ({ id: photo.id, url: photo.url, isCover: photo.isCover })), documents: documents.map((document) => ({ id: document.id, name: document.name, type: document.type, mimeType: document.mimeType, sizeBytes: document.sizeBytes ? Number(document.sizeBytes) : null, createdAt: document.createdAt.toISOString(), uploadedBy: document.uploadedBy.fullName })), agreements: agreements.map((agreement) => ({ ...agreement, rentAmount: agreement.rentAmount ? Number(agreement.rentAmount) : null, startDate: agreement.startDate?.toISOString() ?? null, endDate: agreement.endDate?.toISOString() ?? null, updatedAt: agreement.updatedAt.toISOString() })), transactions: transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) / 100, paidAt: transaction.paidAt?.toISOString() ?? null, createdAt: transaction.createdAt.toISOString() })), maintenanceTickets: maintenanceTickets.map((ticket) => ({ ...ticket, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString(), resolvedAt: ticket.resolvedAt?.toISOString() ?? null })) };

  return <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}><ErrorBoundary><UnitDetailClient listing={listing as any} unit={unit as any} activeAgreement={activeAgreement ? { id: activeAgreement.id, status: activeAgreement.status as string, type: activeAgreement.type as string, startDate: activeAgreement.startDate?.toISOString() ?? null, endDate: activeAgreement.endDate?.toISOString() ?? null, rentAmount: activeAgreement.rentAmount ? Number(activeAgreement.rentAmount) : null, rentPeriod: activeAgreement.rentPeriod, pdfUrl: activeAgreement.pdfUrl, tenant: activeAgreement.tenant } : null} /></ErrorBoundary></DashboardShell>;
}
