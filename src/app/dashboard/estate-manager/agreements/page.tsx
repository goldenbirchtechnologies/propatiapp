import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EstateManagerAgreementsClient from './EstateManagerAgreementsClient';

export default async function EstateManagerAgreementsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
  };
  if (!user) redirect("/login");
  if (user.role !== 'estate_manager') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

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
