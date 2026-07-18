import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import AdminFlagsClient from './AdminFlagsClient';

export default async function AdminFlagsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  let flags = [];
  try {
    flags = await prisma.listingFlag.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        listing: { select: { title: true } },
        flaggedByUser: { select: { fullName: true, email: true } },
      },
    });
  } catch (error) {
    console.error('AdminFlagsPage fetch failed', error);
  }

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <AdminFlagsClient flags={flags} />
    </DashboardShell>
  );
}
