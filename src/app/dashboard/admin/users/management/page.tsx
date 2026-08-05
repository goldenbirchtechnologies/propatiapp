import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import AppIcon from '@/components/icons/app-icon';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export default async function AdminUsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

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

function UsersManagementClient({
  users,
  totalUsers,
  activeUsers,
  verifiedUsers,
  flaggedUsers,
  currentPage,
  totalPages,
  roleFilter,
  statusFilter,
}: {
  users: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    isActive: boolean;
    isBanned: boolean;
    phoneVerified: boolean;
    idVerified: boolean;
    createdAt: Date;
    lastLogin: Date | null;
  }[];
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  flaggedUsers: number;
  currentPage: number;
  totalPages: number;
  roleFilter: string;
  statusFilter: string;
}) {
  'use client';

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    return `/dashboard/admin/users/management${qs ? `?${qs}` : ''}`;
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const VerificationBadge = ({ user }: { user: (typeof users)[0] }) => {
    if (user.idVerified)
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-on-tertiary-container/10 text-on-tertiary-container font-label-sm text-label-sm border border-on-tertiary-container/20">
          <AppIcon name="verified" className="lucide" size={16} />
          Lvl 5
        </span>
      );
    if (user.phoneVerified)
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm border border-secondary/20">
          <AppIcon name="stars" className="lucide" size={16} />
          Lvl 2
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-outline-variant/30 text-muted-foreground font-label-sm text-label-sm border border-outline-variant">
        Lvl 1
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-lg">
        {[
          { label: 'Total Users', value: totalUsers.toLocaleString(), icon: 'group' },
          { label: 'Active Today', value: activeUsers.toLocaleString(), icon: 'bolt' },
          { label: 'Verified Users', value: verifiedUsers.toLocaleString(), icon: 'verified_user' },
          { label: 'Flagged Accounts', value: flaggedUsers.toLocaleString(), icon: 'report', isError: flaggedUsers > 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-primary-container/5 text-primary shrink-0">
              <AppIcon name={card.icon} className="lucide" size={28} />
            </div>
            <div>
              <p
                className={`text-label-sm ${card.isError ? 'text-error' : 'text-muted-foreground'}`}
              >
                {card.label}
              </p>
              <h2
                className={`text-headline-md font-bold ${card.isError ? 'text-error' : 'text-primary'}`}
              >
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden flex flex-col">
        <div className="p-lg border-b border-outline-variant bg-surface-container-lowest flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute inset-y-0 left-0 pl-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name or email…"
                className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary/10 outline-none"
              />
            </div>
            <select className="border border-outline-variant rounded-lg px-4 py-2 text-body-sm bg-surface focus:ring-2 focus:ring-primary/10 outline-none">
              <option value="">All Roles</option>
              {['tenant', 'landlord', 'agent', 'admin', 'estate_manager'].map((r) => (
                <option key={r} value={r} selected={roleFilter === r}>
                  {r.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
            <select
              className="border border-outline-variant rounded-lg px-4 py-2 text-body-sm bg-surface focus:ring-2 focus:ring-primary/10 outline-none"
              defaultValue={statusFilter}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Showing{' '}
            <span className="font-bold">
              {(currentPage - 1) * PAGE_SIZE + 1} –{' '}
              {Math.min(currentPage * PAGE_SIZE, totalUsers)}
            </span>{' '}
            of <span className="font-bold">{totalUsers.toLocaleString()}</span>
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {users.length === 0 ? (
            <p className="p-lg text-sm text-muted-foreground text-center">No users match the current filters.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-muted-foreground border-b border-outline-variant sticky top-0">
                  {['User', 'Role', 'Status', 'Verification', 'Joined Date'].map((h) => (
                    <th
                      key={h}
                      className="px-lg py-md font-label-md text-label-sm uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low transition-all duration-200">
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed-dim flex items-center justify-center text-primary-container font-bold text-sm">
                          {initials(u.fullName)}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{u.fullName}</p>
                          <p className="text-body-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-4">
                      <span className="px-3 py-1 bg-surface-container-high rounded-full text-label-sm text-muted-foreground font-medium capitalize">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-lg py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.isBanned
                              ? 'bg-error'
                              : u.isActive
                                ? 'bg-on-tertiary-container'
                                : 'bg-outline-variant'
                          }`}
                        />
                        <span
                          className={`font-label-sm ${u.isBanned ? 'text-error' : u.isActive ? 'text-on-tertiary-container' : 'text-muted-foreground'}`}
                        >
                          {u.isBanned ? 'Suspended' : u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-4">
                      <VerificationBadge user={u} />
                    </td>
                    <td className="px-lg py-4 text-muted-foreground text-body-sm">
                      {u.createdAt.toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-lg py-3 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
          <p className="text-body-sm text-muted-foreground">
            Showing{' '}
            <span className="font-bold">
              {(currentPage - 1) * PAGE_SIZE + 1} –{' '}
              {Math.min(currentPage * PAGE_SIZE, totalUsers)}
            </span>{' '}
            of <span className="font-bold">{totalUsers.toLocaleString()}</span> users
          </p>
          <div className="flex items-center gap-1">
            <a
              href={buildHref(currentPage - 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant transition-colors ${
                currentPage <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-surface-container-high text-primary'
              }`}
            >
              <ChevronLeft className="!w-5 !h-5" />
            </a>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <a
                  key={pageNum}
                  href={buildHref(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md text-label-md transition-colors ${
                    pageNum === currentPage
                      ? 'bg-primary text-on-primary shadow-sm font-bold'
                      : 'border border-outline-variant text-muted-foreground hover:bg-surface-container-high'
                  }`}
                >
                  {pageNum}
                </a>
              );
            })}
            <a
              href={buildHref(currentPage + 1)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant transition-colors ${
                currentPage >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-surface-container-high text-primary'
              }`}
            >
              <ChevronRight className="!w-5 !h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
