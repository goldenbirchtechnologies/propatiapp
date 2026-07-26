import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LegalAgreementsClient from './LegalAgreementsClient';

export default async function AdminLegalAgreementsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const agreements = await prisma.agreement.findMany({
    where: {
      OR: [
        { riskTier: 'review_required' },
        { governingStatute: { not: null } },
        { jurisdictionState: { not: null } },
      ],
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          area: true,
          state: true,
          price: true,
          propertyType: true,
          images: { where: { isCover: true }, take: 1 },
        },
      },
      landlord: { select: { id: true, fullName: true, email: true, phone: true } },
      tenant: { select: { id: true, fullName: true, email: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const mapped = agreements.map((a) => ({
    id: a.id,
    type: a.type,
    status: a.status,
    lockStatus: a.lockStatus as unknown,
    riskTier: a.riskTier,
    governingStatute: a.governingStatute,
    jurisdictionState: a.jurisdictionState,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <LegalAgreementsClient agreements={mapped as unknown[]} />
    </DashboardShell>
  );
}
