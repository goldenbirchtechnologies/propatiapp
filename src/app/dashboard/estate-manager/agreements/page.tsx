import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EstateManagerAgreementsClient from './EstateManagerAgreementsClient';

export default async function EstateManagerAgreementsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user) redirect("/sign-in");
  if (user.role !== 'estate_manager') redirect(getRoleRedirectPath(user.role));

  const agreements = await prisma.agreement.findMany({
    include: {
      listing: { select: { id: true, title: true, area: true, images: { where: { isCover: true }, take: 1 } } },
      tenant: { select: { id: true, fullName: true, email: true } },
      landlord: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <EstateManagerAgreementsClient initialAgreements={agreements as unknown} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
