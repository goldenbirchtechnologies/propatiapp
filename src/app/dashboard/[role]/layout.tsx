import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import { ReactNode } from 'react';
import { UserRole } from '@prisma/client';

// Map URL slug → canonical Prisma role
const SLUG_TO_ROLE: Record<string, UserRole> = {
  landlord: 'landlord',
  tenant: 'tenant',
  agent: 'agent',
  admin: 'admin',
  'estate-manager': 'estate_manager',
};

export default async function RoleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ role: string }>;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect('/login');
  }

  const { role: roleSlug } = await params;
  const canonicalRole = SLUG_TO_ROLE[roleSlug.toLowerCase()] ?? (roleSlug as UserRole);

  // Enforce that the URL role matches the authenticated user's actual role from Prisma
  if (user.role !== canonicalRole) {
    redirect(getRoleRedirectPath(user.role));
  }

  const navigation = getNavigationForRole(canonicalRole);
  const displayName = user.fullName || 'User';

  return (
    <DashboardShell
      navigation={navigation}
      userRole={canonicalRole}
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      {children}
    </DashboardShell>
  );
}
