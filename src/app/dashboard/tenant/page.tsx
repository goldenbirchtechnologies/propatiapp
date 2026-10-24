import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import TenantDashboardClient from './TenantDashboardClient';

export default async function TenantDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'tenant') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'Tenant';

  let savedCount = 0;
  let activeAgreementCount = 0;
  let openMaintenanceCount = 0;
  let recentAgreements: any[] = [];
  let recentTransactions: any[] = [];
  let activeAgreement: any = null;
  let tickets: any[] = [];

  try {
    const [sCount, aAgreementCount, oMaintenanceCount, rAgreements, rTransactions, actAgreement, tix] = await Promise.all([
      prisma.savedListing.count({ where: { userId: user.id } }),
      prisma.agreement.count({
        where: {
          tenantId: user.id,
          status: { in: ['tenant_signed', 'fully_signed'] },
        },
      }),
      prisma.maintenanceTicket.count({
        where: {
          tenantId: user.id,
          status: { in: ['open', 'in_progress'] },
        },
      }),
      prisma.agreement.findMany({
        where: { tenantId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { listing: { select: { title: true, address: true } } },
      }),
      prisma.transaction.findMany({
        where: { payerId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, type: true, status: true, amount: true, createdAt: true },
      }),
      prisma.agreement.findFirst({
        where: {
          tenantId: user.id,
          status: { in: ['tenant_signed', 'fully_signed'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { title: true, address: true, price: true, pricePeriod: true, images: { take: 1, select: { url: true } } } },
        },
      }),
      prisma.maintenanceTicket.findMany({
        where: { tenantId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, priority: true, category: true, createdAt: true },
      }),
    ]);

    savedCount = sCount;
    activeAgreementCount = aAgreementCount;
    openMaintenanceCount = oMaintenanceCount;
    recentAgreements = rAgreements.map((a: any) => ({
      id: a.id,
      status: a.status,
      createdAt: a.createdAt?.toISOString() ?? null,
      listing: a.listing ? {
        title: a.listing.title,
        address: a.listing.address,
      } : null,
    }));
    recentTransactions = rTransactions.map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amount: Number(tx.amount || 0),
      createdAt: tx.createdAt?.toISOString() ?? null,
    }));
    activeAgreement = actAgreement ? {
      id: actAgreement.id,
      status: actAgreement.status,
      startDate: (actAgreement as any).startDate?.toISOString() ?? null,
      endDate: (actAgreement as any).endDate?.toISOString() ?? null,
      landlordId: (actAgreement as any).landlordId ?? null,
      listing: actAgreement.listing ? {
        title: actAgreement.listing.title,
        address: actAgreement.listing.address,
        price: Number(actAgreement.listing.price || 0),
        pricePeriod: actAgreement.listing.pricePeriod,
        images: actAgreement.listing.images || [],
      } : null,
    } : null;
    tickets = tix.map((t: any) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      createdAt: t.createdAt?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error('Error loading Tenant dashboard data:', error);
  }

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantDashboardClient
          displayName={displayName}
          savedCount={savedCount}
          activeAgreementCount={activeAgreementCount}
          openMaintenanceCount={openMaintenanceCount}
          recentAgreements={recentAgreements}
          recentTransactions={recentTransactions}
          activeAgreement={activeAgreement}
          tickets={tickets}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}