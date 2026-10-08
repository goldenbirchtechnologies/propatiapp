import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import AppIcon from '@/components/icons/app-icon';
import UsersManagementClient from './users-management-client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export default async function AdminUsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  // Read search params (Next.js 15 — awaited)
  const sp = await searchParams;
  const page = Math.max(1, parseInt((sp.page as string) || '1', 10) || 1);
  const roleFilter = (sp.role as string) || '';
  const statusFilter = (sp.status as string) || '';

  const where: Record<string, unknown> = {};
  if (roleFilter) where.role = roleFilter;
  if (statusFilter === 'active') where.isActive = true;
  if (statusFilter === 'suspended') where.isBanned = true;
  if (statusFilter === 'inactive') where.isActive = false;

  const [totalUsers, activeUsers, verifiedUsers, flaggedUsers, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { phoneVerified: true } }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isBanned: true,
        phoneVerified: true,
        idVerified: true,
        createdAt: true,
        lastLogin: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <UsersManagementClient
          users={users}
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          verifiedUsers={verifiedUsers}
          flaggedUsers={flaggedUsers}
          currentPage={page}
          totalPages={totalPages}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
