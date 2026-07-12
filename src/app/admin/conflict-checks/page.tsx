import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import ConflictChecksClient from './ConflictChecksClient';

export const dynamic = 'force-dynamic';

export default async function AdminConflictChecksPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const checks = await prisma.conflictCheck.findMany({
    include: {
      case: {
        select: { id: true, status: true },
      },
      lawFirm: {
        select: { id: true, name: true, cacNumber: true },
      },
      lawyerProfile: {
        select: { id: true, fullName: true, callToBarNumber: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const mapped = checks.map((c) => ({
    id: c.id,
    status: c.status,
    adversePartyType: c.adversePartyType,
    adversePartyName: c.adversePartyName,
    conflictRationale: c.conflictRationale,
    createdAt: c.createdAt.toISOString(),
    case: c.case,
    lawFirm: c.lawFirm,
    lawyerProfile: c.lawyerProfile,
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ConflictChecksClient conflictChecks={mapped} />
    </DashboardShell>
  );
}
