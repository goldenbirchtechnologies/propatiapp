import React from 'react';
import {
  Home, Building2, DollarSign, Plus, Phone, FileText, MessageSquare,
  ShieldCheck, User, Search, Wrench, Receipt, BarChart2, ChartNoAxesCombined,
  Eye, Users, Star, Flag, Gavel, Cog, Shield,
  CalendarDays, Clock,
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
  { label: 'Rent Collection', href: '/dashboard/landlord/rent', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Add Listing', href: '/dashboard/landlord/listing/new', icon: <Plus className="h-5 w-5" /> },
  { label: 'Short-let Calendar', href: '/dashboard/landlord/short-let', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Screening Calls', href: '/dashboard/landlord/screening', icon: <Phone className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/landlord/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/landlord/messages', icon: <MessageSquare className="h-5 w-5" /> },
  { label: 'Verify Property', href: '/dashboard/landlord/verify', icon: <Shield className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/landlord/profile', icon: <User className="h-5 w-5" /> },
];

export const TENANT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/tenant', icon: <Home className="h-5 w-5" /> },
  { label: 'Find Property', href: '/dashboard/tenant/search', icon: <Search className="h-5 w-5" /> },
  { label: 'Rent & Payments', href: '/dashboard/tenant/payments', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'My Agreements', href: '/dashboard/tenant/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/tenant/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Screening Calls', href: '/dashboard/tenant/screening', icon: <Phone className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/tenant/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Receipts', href: '/dashboard/tenant/receipts', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/tenant/messages', icon: <MessageSquare className="h-5 w-5" /> },
];

export const AGENT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/agent', icon: <Home className="h-5 w-5" /> },
  { label: 'Deal Pipeline', href: '/dashboard/agent/pipeline', icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Managed Listings', href: '/dashboard/agent/listings', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Inspections', href: '/dashboard/agent/inspections', icon: <Eye className="h-5 w-5" /> },
  { label: 'Commissions', href: '/dashboard/agent/commissions', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'My Clients', href: '/dashboard/agent/clients', icon: <Users className="h-5 w-5" /> },
  { label: 'Reputation', href: '/dashboard/agent/reputation', icon: <Star className="h-5 w-5" /> },
  { label: 'My Profile', href: '/dashboard/agent/profile', icon: <User className="h-5 w-5" /> },
  { label: 'Messages', href: '/dashboard/agent/messages', icon: <MessageSquare className="h-5 w-5" /> },
];

export const ADMIN_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
  { label: 'Verifications', href: '/admin/verifications', icon: <Shield className="h-5 w-5" /> },
  { label: 'Flagged Listings', href: '/admin/flagged-listings', icon: <Flag className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Revenue', href: '/admin/revenue', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText className="h-5 w-5" /> },
];

export const ESTATE_MANAGER_NAVIGATION: NavItem[] = [
  { label: 'Home', href: '/dashboard/estate-manager', icon: <Home className="h-5 w-5" /> },
  { label: 'Portfolio', href: '/dashboard/estate-manager/portfolio', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Rent Ledger', href: '/dashboard/estate-manager/ledger', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Maintenance', href: '/dashboard/estate-manager/maintenance', icon: <Wrench className="h-5 w-5" /> },
  { label: 'Bulk Import', href: '/dashboard/estate-manager/bulk-import', icon: <Plus className="h-5 w-5" /> },
  { label: 'Agreements', href: '/dashboard/estate-manager/agreements', icon: <FileText className="h-5 w-5" /> },
  { label: 'Team', href: '/dashboard/estate-manager/team', icon: <Users className="h-5 w-5" /> },
  { label: 'Billing', href: '/dashboard/estate-manager/billing', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Reports', href: '/dashboard/estate-manager/reports', icon: <BarChart2 className="h-5 w-5" /> },
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
    case 'admin':
      return ADMIN_NAVIGATION;
    case 'estate_manager':
      return ESTATE_MANAGER_NAVIGATION;
    default:
      return TENANT_NAVIGATION; // Default fallback
  }
}
