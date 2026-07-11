import React from 'react';
import {
  Home, Building2, DollarSign, Plus, Phone, FileText, MessageSquare,
  ShieldCheck, User, Search, Wrench, Receipt, BarChart2, ChartNoAxesCombined,
  Eye, Users, Star, Flag, Gavel, Cog, Shield, Scale, Briefcase,
  ClipboardList, CalendarDays, Zap, TrendingUp, Bell, Mail, Sliders,
  Landmark, CircleDollarSign, ChevronRight
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export const LANDLORD_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/landlord', icon: <Home className="h-5 w-5" /> },
  { label: 'My Properties', href: '/dashboard/landlord/properties', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Financials', href: '/dashboard/landlord/financials', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Portfolio', href: '/dashboard/landlord/portfolio', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Agent Invites', href: '/dashboard/landlord/agents', icon: <Users className="h-5 w-5" /> },
  { label: 'Forecasting', href: '/dashboard/landlord/financials/forecasting', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Scenario Builder', href: '/dashboard/landlord/financials/scenario-builder', icon: <Sliders className="h-5 w-5" /> },
  { label: 'Rent Collection', href: '/dashboard/landlord/rent', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/landlord/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Notifications', href: '/dashboard/landlord/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Add Listing', href: '/dashboard/landlord/listing/new', icon: <Plus className="h-5 w-5" /> },
  { label: 'Short-let Calendar', href: '/dashboard/landlord/short-let', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Screening Calls', href: '/dashboard/landlord/screening', icon: <Phone className="h-5 w-5" /> },
  { label: 'Leases', href: '/dashboard/landlord/leases', icon: <FileText className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/landlord/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/landlord/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Verify Property', href: '/dashboard/landlord/verify', icon: <Shield className="h-5 w-5" /> },
  { label: 'Turnover', href: '/dashboard/landlord/turnover', icon: <Wrench className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/landlord/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Commercial Leases', href: '/dashboard/landlord/commercial/leases', icon: <Landmark className="h-5 w-5" /> },
  { label: 'Revenue Forecast', href: '/dashboard/landlord/revenue-forecast', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'Withdrawals', href: '/dashboard/landlord/financials/withdrawals', icon: <CircleDollarSign className="h-5 w-5" /> },
  { label: 'Overdue Payments', href: '/dashboard/landlord/financials/overdue', icon: <Receipt className="h-5 w-5" /> },
];

export const TENANT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/tenant', icon: <Home className="h-5 w-5" /> },
  { label: 'Notifications', href: '/dashboard/tenant/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Find Property', href: '/dashboard/tenant/search', icon: <Search className="h-5 w-5" /> },
  { label: 'Rent & Payments', href: '/dashboard/tenant/payments', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'My Agreements', href: '/dashboard/tenant/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/tenant/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Screening Calls', href: '/dashboard/tenant/screening', icon: <Phone className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/tenant/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Receipts', href: '/dashboard/tenant/receipts', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/tenant/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Overdue Payments', href: '/dashboard/tenant/payments/overdue', icon: <Receipt className="h-5 w-5" /> },
];

export const AGENT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/agent', icon: <Home className="h-5 w-5" /> },
  { label: 'Deal Pipeline', href: '/dashboard/agent/pipeline', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Managed Listings', href: '/dashboard/agent/listings', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Inspections', href: '/dashboard/agent/inspections', icon: <Eye className="h-5 w-5" /> },
  { label: 'Commissions', href: '/dashboard/agent/commissions', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'My Clients', href: '/dashboard/agent/clients', icon: <Users className="h-5 w-5" /> },
  { label: 'Invitations', href: '/dashboard/agent/invites', icon: <Mail className="h-5 w-5" /> },
  { label: 'Reputation', href: '/dashboard/agent/reputation', icon: <Star className="h-5 w-5" /> },
  { label: 'Schedule', href: '/dashboard/agent/schedule', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/agent/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/agent/messages', icon: <MessageSquare className="h-5 w-5" /> },
];

export const REALTOR_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/realtor', icon: <Home className="h-5 w-5" /> },
  { label: 'Buy Pipeline', href: '/dashboard/realtor/buy', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Sell Pipeline', href: '/dashboard/realtor/sell', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'My Listings', href: '/dashboard/realtor/listings', icon: <Building2 className="h-5 w-5" /> },
  { label: 'My Clients', href: '/dashboard/realtor/clients', icon: <Users className="h-5 w-5" /> },
  { label: 'Market Intelligence', href: '/dashboard/realtor/market', icon: <TrendingUp className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/realtor/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/realtor/messages', icon: <MessageSquare className="h-5 w-5" /> },
];

export const ADMIN_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
  { label: 'Verifications', href: '/dashboard/admin/verifications', icon: <Shield className="h-5 w-5" /> },
  { label: 'Flagged Listings', href: '/dashboard/admin/flags', icon: <Flag className="h-5 w-5" /> },
  { label: 'Users', href: '/dashboard/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/admin/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Disputes', href: '/dashboard/admin/disputes', icon: <Gavel className="h-5 w-5" /> },
  { label: 'Properties', href: '/dashboard/admin/properties', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/admin/reports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Revenue', href: '/dashboard/admin/revenue', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: <Cog className="h-5 w-5" /> },
  { label: 'MFA Settings', href: '/dashboard/admin/settings/mfa', icon: <ShieldCheck className="h-5 w-5" /> },
  { label: 'Withdrawals', href: '/dashboard/admin/transactions/withdrawals', icon: <CircleDollarSign className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/admin/profile', icon: <User className="h-5 w-5" /> },
];

export const ESTATE_MANAGER_NAVIGATION: NavItem[] = [
  { label: 'Home', href: '/dashboard/estate-manager', icon: <Home className="h-5 w-5" /> },
  { label: 'Portfolio', href: '/dashboard/estate-manager/portfolio', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Units', href: '/dashboard/estate-manager/units', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Service Charges', href: '/dashboard/estate-manager/service-charges', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Utilities', href: '/dashboard/estate-manager/utilities', icon: <Zap className="h-5 w-5" /> },
  { label: 'Rent Ledger', href: '/dashboard/estate-manager/ledger', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/estate-manager/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Bulk Import', href: '/dashboard/estate-manager/bulk-import', icon: <Plus className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/estate-manager/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Team', href: '/dashboard/estate-manager/team', icon: <Users className="h-5 w-5" /> },
  { label: 'Billing', href: '/dashboard/estate-manager/billing', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Analytics', href: '/dashboard/estate-manager/analytics', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/estate-manager/reports', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Turnover', href: '/dashboard/estate-manager/turnover', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Financials', href: '/dashboard/estate-manager/financials', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Commercial Leases', href: '/dashboard/estate-manager/commercial-leases', icon: <Landmark className="h-5 w-5" /> },
  { label: 'Move-in Coordination', href: '/dashboard/estate-manager/move-in', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Lease Negotiation', href: '/dashboard/estate-manager/lease-negotiation', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Lease Review', href: '/dashboard/estate-manager/lease-review', icon: <FileText className="h-5 w-5" /> },
  { label: 'Portfolio Analytics', href: '/dashboard/estate-manager/portfolio/analytics', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Financial Scenario', href: '/dashboard/estate-manager/financials/scenario', icon: <Sliders className="h-5 w-5" /> },
  { label: 'Revenue Signature', href: '/dashboard/estate-manager/reports/revenue-signature', icon: <FileText className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/estate-manager/profile', icon: <User className="h-5 w-5" /> },
];

/**
 * Get navigation items based on user role
 */
export function getNavigationForRole(role: string): NavItem[] {
  switch (role.toLowerCase()) {
    case 'landlord':
      return LANDLORD_NAVIGATION;
    case 'tenant':
      return TENANT_NAVIGATION;
    case 'agent':
      return AGENT_NAVIGATION;
    case 'realtor':
      return REALTOR_NAVIGATION;
    case 'admin':
      return ADMIN_NAVIGATION;
    case 'estate_manager':
      return ESTATE_MANAGER_NAVIGATION;
    default:
      return TENANT_NAVIGATION; // Default fallback
  }
}
