import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UnitDetailClient from './UnitDetailClient';

export const metadata = {
  title: 'Unit Details | PROPTI',
  description: 'View unit details, pricing, status, and lease information.',
};

export default async function LandlordUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const { id, unitId } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, ownerId: user.id },
    select: {
      id: true,
      title: true,
      address: true,
      area: true,
      state: true,
      status: true,
      images: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
      documents: { orderBy: { updatedAt: 'desc' }, take: 12, include: { uploadedBy: { select: { fullName: true } } } },
      agreements: {
        orderBy: { updatedAt: 'desc' },
        take: 12,
        select: { id: true, tenantId: true, type: true, status: true, startDate: true, endDate: true, rentAmount: true, rentPeriod: true, pdfUrl: true, updatedAt: true, tenant: { select: { id: true, fullName: true, email: true, phone: true } } },
      },
      transactions: { orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, type: true, status: true, amount: true, paidAt: true, createdAt: true, description: true } },
      maintenanceTickets: { orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, title: true, description: true, category: true, priority: true, status: true, createdAt: true, updatedAt: true, resolvedAt: true } },
      units: {
        select: {
          id: true,
          unitNumber: true,
          type: true,
          unitCategory: true,
          rentalArrangement: true,
          listingMethod: true,
          occupancyModel: true,
          occupancyState: true,
          categoryAttributes: true,
          parentUnitId: true,
          listingType: true,
          pricePeriod: true,
          rent: true,
          cautionDeposit: true,
          serviceCharge: true,
          status: true,
          occupancy: true,
          isListed: true,
          bedrooms: true,
          bathrooms: true,
          sizeSqm: true,
          leaseStartDate: true,
          leaseEndDate: true,
          currentTenantId: true,
          currentTenant: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
  });

  if (!listing) redirect('/dashboard/landlord/properties');

  const unit = listing.units.find((u) => u.id === unitId);
  if (!unit) redirect(`/dashboard/landlord/properties/${id}`);

  const selectedUnit = unit;
  const activeAgreement = listing.agreements.find((agreement) => agreement.tenantId === selectedUnit.currentTenantId) ?? null;

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <UnitDetailClient
          listing={{
            id: listing.id,
            title: listing.title,
            address: listing.address,
            area: listing.area,
            state: listing.state,
            status: listing.status as string,
            images: listing.images.map((image) => ({ id: image.id, url: image.url, isCover: image.isCover })),
            documents: listing.documents.map((document) => ({ id: document.id, name: document.name, type: document.type, mimeType: document.mimeType, sizeBytes: document.sizeBytes ? Number(document.sizeBytes) : null, createdAt: document.createdAt.toISOString(), uploadedBy: document.uploadedBy.fullName })),
            agreements: listing.agreements.map((agreement) => ({ ...agreement, rentAmount: agreement.rentAmount ? Number(agreement.rentAmount) : null, startDate: agreement.startDate?.toISOString() ?? null, endDate: agreement.endDate?.toISOString() ?? null, updatedAt: agreement.updatedAt.toISOString() })),
            transactions: listing.transactions.map((transaction) => ({ ...transaction, amount: Number(transaction.amount) / 100, paidAt: transaction.paidAt?.toISOString() ?? null, createdAt: transaction.createdAt.toISOString() })),
            maintenanceTickets: listing.maintenanceTickets.map((ticket) => ({ ...ticket, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt.toISOString(), resolvedAt: ticket.resolvedAt?.toISOString() ?? null })),
          }}
          unit={{ ...unit, unitCategory: unit.unitCategory, rentalArrangement: unit.rentalArrangement, listingMethod: unit.listingMethod, occupancyModel: unit.occupancyModel, occupancyState: unit.occupancyState, categoryAttributes: unit.categoryAttributes, parentUnitId: unit.parentUnitId, createdAt: unit.createdAt.toISOString(), rent: Number(unit.rent), cautionDeposit: unit.cautionDeposit ? Number(unit.cautionDeposit) : null, serviceCharge: unit.serviceCharge ? Number(unit.serviceCharge) : null, sizeSqm: unit.sizeSqm ? Number(unit.sizeSqm) : null, leaseStartDate: unit.leaseStartDate?.toISOString() ?? null, leaseEndDate: unit.leaseEndDate?.toISOString() ?? null }}
          activeAgreement={activeAgreement ? { id: activeAgreement.id, status: activeAgreement.status as string, type: activeAgreement.type as string, startDate: activeAgreement.startDate?.toISOString() ?? null, endDate: activeAgreement.endDate?.toISOString() ?? null, rentAmount: activeAgreement.rentAmount ? Number(activeAgreement.rentAmount) : null, rentPeriod: activeAgreement.rentPeriod, pdfUrl: activeAgreement.pdfUrl, tenant: activeAgreement.tenant } : null}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
