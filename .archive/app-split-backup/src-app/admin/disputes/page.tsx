import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import DisputesClient from './DisputesClient';

export default async function DisputesPage() {
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
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  const [open, investigating, mediated, resolved, closed] = await Promise.all([
    prisma.dispute.count({ where: { status: 'open' } }),
    prisma.dispute.count({ where: { status: 'investigating' } }),
    prisma.dispute.count({ where: { status: 'mediated' } }),
    prisma.dispute.count({ where: { status: 'resolved' } }),
    prisma.dispute.count({ where: { status: 'closed' } }),
  ]);

  const stats = { open, investigating, mediated, resolved, closed };
  const navigation = getNavigationForRole(user.role);

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <DisputesClient stats={stats} />
    </DashboardShell>
  );
}
