'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getNavigationForRole, type NavItem } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function RoleLayout({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const [hydrating, setHydrating] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const expectedRole = (role || 'tenant').toLowerCase();
  const mappedRole = expectedRole === 'estate-manager' ? 'estate_manager' : expectedRole;
  const userRole = typeof user?.publicMetadata?.role === 'string' ? user.publicMetadata.role : '';
  const allowed = !!user && mappedRole === userRole;
  const navigation = getNavigationForRole(allowed ? userRole : mappedRole);

  useEffect(() => {
    if (!isLoaded) return;
    setHydrating(false);
  }, [isLoaded]);

  if (!isLoaded || hydrating) {
    return (
      <DashboardShell navigation={navigation} userRole={mappedRole} shellLoading>
        {children}
      </DashboardShell>
    );
  }

  if (!user || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center">
          <Lock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">Restricted Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your role doesn&apos;t allow access to this dashboard area.
          </p>
          <Button className="mt-6" onClick={() => router.push('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell
      navigation={navigation}
      userRole={mappedRole}
      userName={(user.fullName as string | undefined) || (user.firstName as string) || 'User'}
      userAvatar={user.imageUrl}
    >
      {children}
    </DashboardShell>
  );
}
