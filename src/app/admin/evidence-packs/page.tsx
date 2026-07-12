import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import EvidencePacksClient from './EvidencePacksClient';

export const dynamic = 'force-dynamic';

export default async function AdminEvidencePacksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
    realtor: '/dashboard/realtor',
  };
  if (!user) redirect("/login");
  if (user.role !== 'admin') redirect(rolePaths[user!.role] ?? '/dashboard/tenant');

  // Load all open / in_progress disputes for the create dropdown
  const openDisputes = await prisma.dispute.findMany({
    where: {
      status: { in: ['open', 'investigating', 'mediated'] },
    },
    include: {
      listing: {
        select: { id: true, title: true, address: true },
      },
      raisedByUser: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Load evidence packs with dispute + dispute.listing populated
  const evidencePacks = await prisma.evidencePack.findMany({
    include: {
      dispute: {
        select: {
          id: true,
          type: true,
          status: true,
          description: true,
          createdAt: true,
          listing: {
            select: { id: true, title: true },
          },
          raisedByUser: {
            select: { id: true, fullName: true, email: true },
          },
          lawFirmCase: {
            select: {
              id: true,
              status: true,
              firm: { select: { id: true, name: true } },
            },
          },
        },
      },
      lawFirm: {
        select: { id: true, name: true, cacNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <EvidencePacksClient
        evidencePacks={evidencePacks}
        openDisputes={openDisputes}
      />
    </DashboardShell>
  );
}
