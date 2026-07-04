'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getNavigationForRole, type NavItem } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default async function EstateManagerLayout({ children }: { children: React.ReactNode }) {
  // This is now a client-capable wrapper. Route-level auth guard should be provided
  // by the role layout or page-level auth. We intentionally keep this minimal so it
  // can still compose with sibling role guards without double redirects.

  return <>{children}</>;
}
