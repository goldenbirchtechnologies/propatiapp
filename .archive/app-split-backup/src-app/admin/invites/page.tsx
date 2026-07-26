import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import InvitesClient from './InvitesClient';

export default async function AdminInvitesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

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

  // Fetch all org members (invites — pending and active)
  const members = await prisma.orgMember.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: {
      org: {
        select: {
          id: true,
          name: true,
          planTier: true,
        },
      },
    },
  });

  const mapped = members.map((m) => ({
    id: m.id,
    orgId: m.orgId,
    orgName: m.org?.name ?? 'Unknown Org',
    orgPlanTier: m.org?.planTier ?? 'starter',
    email: m.email,
    role: m.role,
    status: m.status,
    inviteToken: m.inviteToken,
    invitedBy: m.invitedBy,
    joinedAt: m.joinedAt ? m.joinedAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <InvitesClient initialMembers={mapped} />
    </DashboardShell>
  );
}
