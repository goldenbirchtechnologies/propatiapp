import React from 'react';
import {
  Home, Building2, DollarSign, Plus, Phone, FileText, MessageSquare,
  ShieldCheck, User, Search, Wrench, Receipt, BarChart2, ChartNoAxesCombined,
  Eye, Users, Star, Flag, Gavel, Cog, Shield, Scale, Briefcase,
  ClipboardList, CalendarDays, Zap, TrendingUp, Bell, Mail, Sliders,
  Landmark, CircleDollarSign, ChevronRight, BadgePercent, Wallet2, Clock, UserPlus, Store
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
  {
    title: 'Properties & Portfolio',
    items: [
      { label: 'Dashboard', href: '/dashboard/landlord', icon: <Home className="h-5 w-5" /> },
      { label: 'My Properties', href: '/dashboard/landlord/properties', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Marketplace', href: '/dashboard/landlord/listing/new', icon: <Store className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Leasing & Tenants',
    items: [
      { label: 'Applications', href: '/dashboard/landlord/applications', icon: <ClipboardList className="h-5 w-5" /> },
      { label: 'Tenants', href: '/dashboard/landlord/tenants', icon: <Users className="h-5 w-5" /> },
      {
        label: 'Leases & Agreements',
        href: '/dashboard/landlord/leases',
        icon: <FileText className="h-5 w-5" />,
        children: [
          { label: 'Residential Leases', href: '/dashboard/landlord/leases', icon: <FileText className="h-5 w-5" /> },
          { label: 'Commercial Leases', href: '/dashboard/landlord/commercial/leases', icon: <Landmark className="h-5 w-5" /> },
          { label: 'Agreements', href: '/dashboard/landlord/agreements', icon: <FileText className="h-5 w-5" /> },
        ],
      },
      { label: 'Messages', href: '/dashboard/landlord/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Agent Invites', href: '/dashboard/landlord/agents', icon: <UserPlus className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Maintenance & Turnover',
        href: '/dashboard/landlord/maintenance',
        icon: <Wrench className="h-5 w-5" />,
        children: [
          { label: 'Turnover', href: '/dashboard/landlord/turnover', icon: <Wrench className="h-5 w-5" /> },
        ],
      },
      { label: 'Short-let Calendar', href: '/dashboard/landlord/short-let', icon: <CalendarDays className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Finances & Analytics',
    items: [
      {
        label: 'Financials',
        href: '/dashboard/landlord/financials',
        icon: <DollarSign className="h-5 w-5" />,
        children: [
          { label: 'Withdrawals', href: '/dashboard/landlord/financials/withdrawals', icon: <CircleDollarSign className="h-5 w-5" /> },
          { label: 'Statements', href: '/dashboard/landlord/statements', icon: <FileText className="h-5 w-5" /> },
        ],
      },
      {
        label: 'Analytics',
        href: '/dashboard/landlord/financials/forecasting',
        icon: <TrendingUp className="h-5 w-5" />,
        children: [
          { label: 'Forecasting', href: '/dashboard/landlord/financials/forecasting', icon: <TrendingUp className="h-5 w-5" /> },
          { label: 'Scenario Builder', href: '/dashboard/landlord/financials/scenario-builder', icon: <Sliders className="h-5 w-5" /> },
          { label: 'Revenue Forecast', href: '/dashboard/landlord/revenue-forecast', icon: <TrendingUp className="h-5 w-5" /> },
        ],
      },
    ],
  },
];

export const TENANT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/tenant', icon: <Home className="h-5 w-5" /> },
  { label: 'Rent & Payments', href: '/dashboard/tenant/payments', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'My Agreements', href: '/dashboard/tenant/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Applications', href: '/dashboard/tenant/applications', icon: <Briefcase className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/tenant/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/tenant/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/tenant/profile', icon: <User className="h-5 w-5" /> },
];

export const AGENT_NAVIGATION: Array<NavItem | NavSection> = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard/agent', icon: <Home className="h-5 w-5" /> },
      { label: 'Managed Properties', href: '/dashboard/agent/properties', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Calendar', href: '/dashboard/agent/schedule', icon: <CalendarDays className="h-5 w-5" /> },
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
          { label: 'All Deals', href: '/dashboard/agent/pipeline', icon: <BarChart2 className="h-5 w-5" /> },
        ],
      },
      { label: 'Listings', href: '/dashboard/agent/listings', icon: <Building2 className="h-5 w-5" /> },
      { label: 'Clients', href: '/dashboard/agent/clients', icon: <Users className="h-5 w-5" /> },
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
          { label: 'Statements', href: '/dashboard/agent/statements', icon: <FileText className="h-5 w-5" /> },
        ],
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
  { label: 'Portfolio', href: '/dashboard/estate-manager/portfolio', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Units', href: '/dashboard/estate-manager/units', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/estate-manager/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Team', href: '/dashboard/estate-manager/team', icon: <Users className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/estate-manager/agreements', icon: <FileText className="h-5 w-5" /> },
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


