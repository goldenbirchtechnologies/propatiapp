import React from 'react';
import {
  Home, Building2, DollarSign, Plus, FileText, MessageSquare,
  ShieldCheck, User, Search, Wrench, Receipt, BarChart2, ChartNoAxesCombined,
  Eye, Users, Star, Gavel, Cog, Shield, Scale, Briefcase, AlertTriangle,
  ClipboardList, CalendarDays, Zap, TrendingUp, Bell, Mail, Sliders,
  Landmark, CircleDollarSign, Wallet, Store, KeyRound, FileCheck2, BookOpen, BarChart3,
  Heart, LifeBuoy
} from 'lucide-react';

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'destructive';
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const LANDLORD_NAVIGATION: Array<NavItem | NavSection> = [
  // 1. OVERVIEW
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard/landlord', icon: <Home className="h-5 w-5" /> },
    ],
  },
  // 2. PROPERTY MANAGEMENT
  {
    title: 'Property Management',
    items: [
      { label: 'Properties', href: '/dashboard/landlord/properties', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Add Property', href: '/dashboard/landlord/properties/new', icon: <Plus className="h-5 w-5" /> },
      { label: 'All Listings', href: '/dashboard/landlord/properties', icon: <Store className="h-5 w-5" /> },
      { label: 'Create Listing', href: '/dashboard/landlord/listing/new', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'List', href: '/dashboard/landlord/listing/new/wizard', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'Vacancies', href: '/dashboard/landlord/vacancies', icon: <Eye className="h-5 w-5" /> },
      { label: 'Shortlet', href: '/dashboard/landlord/short-let', icon: <CalendarDays className="h-5 w-5" /> },
      { label: 'Portfolio', href: '/dashboard/landlord/portfolio', icon: <BarChart2 className="h-5 w-5" /> },
    ],
  },
  // 3. TENANCY & LEASING
  {
    title: 'Tenancy & Leasing',
    items: [
      { label: 'Applications', href: '/dashboard/landlord/applications', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'Tenants', href: '/dashboard/landlord/tenants', icon: <Users className="h-5 w-5" /> },
      { label: 'Leases', href: '/dashboard/landlord/leases', icon: <FileText className="h-5 w-5" /> },
      { label: 'Rental Agreement', href: '/dashboard/landlord/agreements', icon: <FileText className="h-5 w-5" /> },
      { label: 'Agreement', href: '/dashboard/landlord/agreement', icon: <FileText className="h-5 w-5" /> },
    ],
  },
  // 4. COMMERCIAL MANAGEMENT
  {
    title: 'Commercial Management',
    items: [
      { label: 'Commercial Leases', href: '/dashboard/landlord/commercial/leases', icon: <Landmark className="h-5 w-5" /> },
      { label: 'Lease Negotiation', href: '/dashboard/landlord/commercial/leases/negotiation', icon: <Scale className="h-5 w-5" /> },
      { label: 'Agreement Review', href: '/dashboard/landlord/commercial/agreements/review', icon: <FileCheck2 className="h-5 w-5" /> },
      { label: 'Commercial Move-In', href: '/dashboard/landlord/commercial/move-in', icon: <KeyRound className="h-5 w-5" /> },
    ],
  },
  // 5. PROPERTY OPERATIONS
  {
    title: 'Property Operations',
    items: [
      { label: 'Maintenance', href: '/dashboard/landlord/maintenance', icon: <Wrench className="h-5 w-5" /> },
      { label: 'Turnover', href: '/dashboard/landlord/turnover', icon: <Zap className="h-5 w-5" /> },
      { label: 'Screening Calls', href: '/dashboard/landlord/screening', icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
  // 6. FINANCIAL MANAGEMENT
  {
    title: 'Financial Management',
    items: [
      { label: 'Financial Overview', href: '/dashboard/landlord/financials', icon: <DollarSign className="h-5 w-5" /> },
      { label: 'Withdrawals', href: '/dashboard/landlord/financials/withdrawals', icon: <Wallet className="h-5 w-5" /> },
      { label: 'Invoices', href: '/dashboard/landlord/financials/invoices', icon: <Receipt className="h-5 w-5" /> },
      { label: 'Overdue', href: '/dashboard/landlord/financials/overdue', icon: <AlertTriangle className="h-5 w-5" /> },
      { label: 'Financial Reports', href: '/dashboard/landlord/financials/reports', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'Statements', href: '/dashboard/landlord/statements', icon: <FileText className="h-5 w-5" /> },
      { label: 'Receipts', href: '/dashboard/landlord/receipts', icon: <FileCheck2 className="h-5 w-5" /> },
      { label: 'Rent', href: '/dashboard/landlord/rent', icon: <DollarSign className="h-5 w-5" /> },
      { label: 'Financial Forecasting', href: '/dashboard/landlord/financials/forecasting', icon: <TrendingUp className="h-5 w-5" /> },
    ],
  },
  // 7. ANALYTICS & FORECASTING
  {
    title: 'Analytics & Forecasting',
    items: [
      { label: 'Revenue Forecast', href: '/dashboard/landlord/revenue-forecast', icon: <TrendingUp className="h-5 w-5" /> },
      { label: 'Forecast Report', href: '/dashboard/landlord/revenue-forecast/report', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'Scenario Builder', href: '/dashboard/landlord/financials/scenario-builder', icon: <Sliders className="h-5 w-5" /> },
    ],
  },
  // 8. COMMUNICATION
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/dashboard/landlord/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Notifications', href: '/dashboard/landlord/notifications', icon: <Bell className="h-5 w-5" /> },
    ],
  },
  // 9. PEOPLE & MANAGEMENT
  {
    title: 'People & Management',
    items: [
      { label: 'Agent Management', href: '/dashboard/landlord/agents', icon: <Users className="h-5 w-5" /> },
    ],
  },
  // 10. ACCOUNT & VERIFICATION
  {
    title: 'Account & Verification',
    items: [
      { label: 'Profile', href: '/dashboard/landlord/profile', icon: <User className="h-5 w-5" /> },
      { label: 'Verification', href: '/dashboard/landlord/verification', icon: <ShieldCheck className="h-5 w-5" /> },
      { label: 'Identity Verification', href: '/dashboard/landlord/verify', icon: <FileCheck2 className="h-5 w-5" /> },
      { label: 'Settings', href: '/dashboard/landlord/profile', icon: <Cog className="h-5 w-5" /> },
      { label: 'Onboarding', href: '/dashboard/landlord/onboarding', icon: <BookOpen className="h-5 w-5" /> },
    ],
  },
];

export const TENANT_NAVIGATION: Array<NavItem | NavSection> = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard/tenant', icon: <Home className="h-5 w-5" /> },
    ],
  },
  {
    title: 'My Tenancy',
    items: [
      { label: 'My Agreements', href: '/dashboard/tenant/agreements', icon: <FileText className="h-5 w-5" /> },
      { label: 'Applications', href: '/dashboard/tenant/applications', icon: <Briefcase className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Financial Management',
    items: [
      { label: 'Rent & Payments', href: '/dashboard/tenant/payments', icon: <DollarSign className="h-5 w-5" /> },
      { label: 'Overdue Payments', href: '/dashboard/tenant/payments/overdue', icon: <AlertTriangle className="h-5 w-5" /> },
      { label: 'Auto-Pay', href: '/dashboard/tenant/payments/auto-pay', icon: <Zap className="h-5 w-5" /> },
      { label: 'Statements', href: '/dashboard/tenant/payments/statements', icon: <FileText className="h-5 w-5" /> },
      { label: 'Receipts', href: '/dashboard/tenant/receipts', icon: <Receipt className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Property Services',
    items: [
      { label: 'Maintenance', href: '/dashboard/tenant/maintenance', icon: <Wrench className="h-5 w-5" /> },
      { label: 'Emergency Assistance', href: '/dashboard/tenant/maintenance/emergency', icon: <AlertTriangle className="h-5 w-5" /> },
      { label: 'Maintenance Protocol', href: '/dashboard/tenant/maintenance/protocol', icon: <BookOpen className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Messages', href: '/dashboard/tenant/messages', icon: <MessageSquare className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Account management',
    items: [
      { label: 'My Profile', href: '/dashboard/tenant/profile', icon: <User className="h-5 w-5" /> },
      { label: 'Verification centre', href: '/dashboard/tenant/verification', icon: <ShieldCheck className="h-5 w-5" /> },
      { label: 'Wallet', href: '/dashboard/tenant/wallet', icon: <Wallet className="h-5 w-5" /> },
      { label: 'Payment methods', href: '/dashboard/tenant/payments/methods', icon: <Landmark className="h-5 w-5" /> },
      { label: 'My documents', href: '/dashboard/tenant/documents', icon: <FileCheck2 className="h-5 w-5" /> },
      { label: 'Notifications', href: '/dashboard/tenant/notifications', icon: <Bell className="h-5 w-5" /> },
      { label: 'Settings', href: '/dashboard/tenant/settings', icon: <Cog className="h-5 w-5" /> },
      { label: 'Help & support', href: '/dashboard/tenant/support', icon: <LifeBuoy className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Discover',
    items: [
      { label: 'Saved Properties', href: '/dashboard/tenant/saved', icon: <Heart className="h-5 w-5" /> },
      { label: 'Search', href: '/dashboard/tenant/search', icon: <Search className="h-5 w-5" /> },
      { label: 'Screening', href: '/dashboard/tenant/screening', icon: <ShieldCheck className="h-5 w-5" /> },
    ],
  },
];

export const TENANT_MOBILE_NAV_HREFS = [
  '/dashboard/tenant',
  '/dashboard/tenant/payments',
  '/dashboard/tenant/agreements',
  '/dashboard/tenant/maintenance',
];

export function getActiveNavHref(
  navigation: Array<NavItem | NavSection>,
  pathname: string | null
): string | null {
  if (!pathname) return null;
  let active: string | null = null;

  const consider = (item: NavItem) => {
    const href = item.href;
    if (!href || (pathname !== href && !pathname.startsWith(`${href}/`))) return;
    if (active === null || href.length > active.length) active = href;
    item.children?.forEach(consider);
  };

  navigation.forEach((entry) => {
    if ('items' in entry) entry.items.forEach(consider);
    else consider(entry);
  });

  return active;
}

export const AGENT_NAVIGATION: Array<NavItem | NavSection> = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard/agent', icon: <Home className="h-5 w-5" /> },
      { label: 'Managed Properties', href: '/dashboard/agent/properties', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Calendar', href: '/dashboard/agent/schedule', icon: <CalendarDays className="h-5 w-5" /> },
      {
        label: 'Property Management',
        href: '/dashboard/agent/properties',
        icon: <Building2 className="h-5 w-5" />,
        children: [
          { label: 'Properties Overview', href: '/dashboard/agent/properties', icon: <Building2 className="h-5 w-5" /> },
          { label: 'Rent Collection', href: '/dashboard/agent/collections', icon: <DollarSign className="h-5 w-5" /> },
          { label: 'Payment Records', href: '/dashboard/agent/payments', icon: <Receipt className="h-5 w-5" /> },
          { label: 'Agreements', href: '/dashboard/agent/agreements', icon: <FileText className="h-5 w-5" /> },
        ],
      },
    ],
  },
  {
    title: 'Sales & CRM',
    items: [
      {
        label: 'Pipelines',
        href: '/dashboard/agent/pipeline',
        icon: <BarChart2 className="h-5 w-5" />,
        children: [
          { label: 'Buy', href: '/dashboard/agent/buy', icon: <BarChart2 className="h-5 w-5" /> },
          { label: 'Sell', href: '/dashboard/agent/sell', icon: <BarChart2 className="h-5 w-5" /> },
          { label: 'All Deals', href: '/dashboard/agent/deals', icon: <BarChart2 className="h-5 w-5" /> },
        ],
      },
      { label: 'Listings', href: '/dashboard/agent/listings', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Clients', href: '/dashboard/agent/clients', icon: <Users className="h-5 w-5" /> },
      { label: 'Deals', href: '/dashboard/agent/deals', icon: <Gavel className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Market & Leads',
    items: [
      {
        label: 'Marketplace',
        href: '/dashboard/agent/market',
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        label: 'Finance',
        href: '/dashboard/agent/payments',
        icon: <DollarSign className="h-5 w-5" />,
        children: [
          { label: 'Rent & Payments', href: '/dashboard/agent/payments', icon: <DollarSign className="h-5 w-5" /> },
          { label: 'Commissions', href: '/dashboard/agent/commissions', icon: <Wallet className="h-5 w-5" /> },
          { label: 'Commission Ledger', href: '/dashboard/agent/commission-ledger', icon: <BookOpen className="h-5 w-5" /> },
          { label: 'Withdrawals', href: '/dashboard/agent/withdrawals', icon: <CircleDollarSign className="h-5 w-5" /> },
          { label: 'Invoices', href: '/dashboard/agent/invoices', icon: <Receipt className="h-5 w-5" /> },
          { label: 'Statements', href: '/dashboard/agent/statements', icon: <FileText className="h-5 w-5" /> },
        ],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Messages', href: '/dashboard/agent/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Maintenance', href: '/dashboard/agent/maintenance', icon: <Wrench className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/dashboard/agent/profile', icon: <User className="h-5 w-5" /> },
      { label: 'Onboarding', href: '/dashboard/agent/onboarding', icon: <BookOpen className="h-5 w-5" /> },
      { label: 'Verifications', href: '/dashboard/agent/verifications', icon: <Shield className="h-5 w-5" /> },
      { label: 'Reputation', href: '/dashboard/agent/reputation', icon: <Star className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Invitations',
    items: [
      {
        label: 'Invitations',
        href: '/dashboard/agent/invites',
        icon: <Mail className="h-5 w-5" />,
      },
    ],
  },
];

export const ADMIN_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
  { label: 'Users', href: '/dashboard/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/admin/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Rent & Payments', href: '/dashboard/admin/payments', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Disputes', href: '/dashboard/admin/disputes', icon: <Gavel className="h-5 w-5" /> },
  { label: 'Properties', href: '/dashboard/admin/properties', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/admin/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: <Cog className="h-5 w-5" /> },
  { label: 'MFA Settings', href: '/dashboard/admin/settings/mfa', icon: <ShieldCheck className="h-5 w-5" /> },
  { label: 'Withdrawals', href: '/dashboard/admin/transactions/withdrawals', icon: <CircleDollarSign className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/admin/profile', icon: <User className="h-5 w-5" /> },
];

export const ACCOUNTANT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/accountant', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
  { label: 'Rent & Payments', href: '/dashboard/accountant/payments', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/accountant/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/accountant/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/accountant/profile', icon: <User className="h-5 w-5" /> },
];

export const ESTATE_MANAGER_NAVIGATION: NavItem[] = [
  { label: 'Home', href: '/dashboard/estate-manager', icon: <Home className="h-5 w-5" /> },
  { label: 'Rent & Payments', href: '/dashboard/estate-manager/financials', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Billing', href: '/dashboard/estate-manager/billing', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Receipts', href: '/dashboard/estate-manager/receipts', icon: <FileCheck2 className="h-5 w-5" /> },
  { label: 'Managed Collections', href: '/dashboard/estate-manager/collections', icon: <Wallet className="h-5 w-5" /> },
  { label: 'Utility Allocations', href: '/dashboard/estate-manager/utility-allocations', icon: <Zap className="h-5 w-5" /> },
  { label: 'Ledger', href: '/dashboard/estate-manager/ledger', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/estate-manager/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Disbursements', href: '/dashboard/estate-manager/disbursements', icon: <Landmark className="h-5 w-5" /> },
  { label: 'Utility Allocations', href: '/dashboard/estate-manager/utility-allocations', icon: <Zap className="h-5 w-5" /> },
  { label: 'Ledger', href: '/dashboard/estate-manager/ledger', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Financial Reports', href: '/dashboard/estate-manager/reports', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Portfolio', href: '/dashboard/estate-manager/portfolio', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Listings', href: '/dashboard/estate-manager/listings', icon: <Store className="h-5 w-5" /> },
  { label: 'Applications', href: '/dashboard/estate-manager/applications', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Units', href: '/dashboard/estate-manager/units', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Tenants', href: '/dashboard/estate-manager/tenants', icon: <Users className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/estate-manager/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Move-in Coordination', href: '/dashboard/estate-manager/move-in', icon: <KeyRound className="h-5 w-5" /> },
  { label: 'Team', href: '/dashboard/estate-manager/team', icon: <Users className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/estate-manager/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Commercial Leases', href: '/dashboard/estate-manager/commercial-leases', icon: <Store className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/estate-manager/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Invitations', href: '/dashboard/estate-manager/invite-property-manager', icon: <Mail className="h-5 w-5" /> },
  { label: 'Verification Center', href: '/dashboard/estate-manager/verification', icon: <ShieldCheck className="h-5 w-5" /> },
  { label: 'Onboarding', href: '/dashboard/estate-manager/onboarding', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/estate-manager/profile', icon: <User className="h-5 w-5" /> },
];

/**
 * Get navigation items based on user role
 */
export function getNavigationForRole(role: string): Array<NavItem | NavSection> {
  switch (role.toLowerCase()) {
    case 'landlord':
      return LANDLORD_NAVIGATION;
    case 'tenant':
      return TENANT_NAVIGATION;
    case 'agent':
      return AGENT_NAVIGATION;
    case 'admin':
      return ADMIN_NAVIGATION;
    case 'estate_manager':
      return ESTATE_MANAGER_NAVIGATION;
    case 'accountant':
      return ACCOUNTANT_NAVIGATION;
    default:
      return TENANT_NAVIGATION;
  }
}


