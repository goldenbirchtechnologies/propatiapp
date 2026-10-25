'use client'

import React from 'react';
import TenantRailShell from './TenantRailShell';
import type { NavItem, NavSection } from '@/lib/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
  navigation: Array<NavItem | NavSection>;
  userRole?: string;
  userName?: string;
  userAvatar?: string;
  orgName?: string | null;
  shellLoading?: boolean;
  quickAction?: { href: string; label: string; icon?: React.ReactNode };
  hideGlobalSearch?: boolean;
}

export function DashboardShell(props: DashboardShellProps) {
  return <TenantRailShell {...props} />;
}

export default DashboardShell;
