import { NavItem } from '@/components/layout/DashboardShell';
import {
  Home, Building2, DollarSign, Plus, Phone, FileText, MessageSquare,
  ShieldCheck, User, Search, Wrench, Receipt, BarChart2, ChartNoAxesCombined,
  Eye, Users, Star, Flag, Gavel, Cog, Building, Mail, Settings, Shield,
} from 'lucide-react';

export const LANDLORD_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/landlord', icon: <Home className="h-5 w-5" /> },
  { label: 'My Properties', href: '/dashboard/landlord/properties', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Rent Collection', href: '/dashboard/landlord/rent', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Add Listing', href: '/dashboard/landlord/listing/new', icon: <Plus className="h-5 w-5" /> },
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
  { label: 'Overview', href: '/admin', icon: <ChartNoAxesCombined className="h-5 w-5" /> },
  { label: 'Verification Queue', href: '/admin/verification', icon: <Shield className="h-5 w-5" /> },
  { label: 'Listing Flags', href: '/admin/flags', icon: <Flag className="h-5 w-5" /> },
  { label: 'Disputes', href: '/admin/disputes', icon: <Gavel className="h-5 w-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Revenue', href: '/admin/revenue', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Cog className="h-5 w-5" /> },
];

export const ESTATE_MANAGER_NAVIGATION: NavItem[] = [
  { label: 'Home', href: '/estate-manager', icon: <Home className="h-5 w-5" /> },
  { label: 'Screening Calls', href: '/dashboard/tenant/screening', icon: <PhoneIcon /> },
  { label: 'My Profile', href: '/dashboard/tenant/profile', icon: <UserIcon /> },
  { label: 'Receipts', href: '/dashboard/tenant/receipts', icon: <ReceiptIcon /> },
  { label: 'Messages', href: '/dashboard/tenant/messages', icon: <ChatIcon /> },
];

export const AGENT_NAVIGATION: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/agent', icon: <HomeIcon /> },
  { label: 'Deal Pipeline', href: '/dashboard/agent/pipeline', icon: <ChartIcon /> },
  { label: 'Managed Listings', href: '/dashboard/agent/listings', icon: <BuildingIcon /> },
  { label: 'Inspections', href: '/dashboard/agent/inspections', icon: <EyeIcon /> },
  { label: 'Commissions', href: '/dashboard/agent/commissions', icon: <CurrencyIcon /> },
  { label: 'My Clients', href: '/dashboard/agent/clients', icon: <UsersIcon /> },
  { label: 'Reputation', href: '/dashboard/agent/reputation', icon: <StarIcon /> },
  { label: 'My Profile', href: '/dashboard/agent/profile', icon: <UserIcon /> },
  { label: 'Messages', href: '/dashboard/agent/messages', icon: <ChatIcon /> },
];

export const ADMIN_NAVIGATION: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: <ChartIcon /> },
  { label: 'Verification Queue', href: '/admin/verification', icon: <ShieldCheckIcon /> },
  { label: 'Listing Flags', href: '/admin/flags', icon: <FlagIcon /> },
  { label: 'Disputes', href: '/admin/disputes', icon: <GavelIcon /> },
  { label: 'Users', href: '/admin/users', icon: <UsersIcon /> },
  { label: 'Revenue', href: '/admin/revenue', icon: <CurrencyIcon /> },
  { label: 'Settings', href: '/admin/settings', icon: <CogIcon /> },
];

export const ESTATE_MANAGER_NAVIGATION: NavItem[] = [
  { label: 'Home', href: '/estate-manager', icon: <HomeIcon /> },
  { label: 'Portfolio', href: '/estate-manager/portfolio', icon: <BuildingIcon /> },
  { label: 'Rent Ledger', href: '/estate-manager/ledger', icon: <CurrencyIcon /> },
  { label: 'Maintenance', href: '/estate-manager/maintenance', icon: <WrenchIcon /> },
  { label: 'Bulk Import', href: '/estate-manager/bulk-import', icon: <UploadIcon /> },
  { label: 'Agreements', href: '/estate-manager/agreements', icon: <DocumentIcon /> },
  { label: 'Team', href: '/estate-manager/team', icon: <UsersIcon /> },
  { label: 'Billing', href: '/estate-manager/billing', icon: <CreditCardIcon /> },
  { label: 'Reports', href: '/estate-manager/reports', icon: <DocumentChartIcon /> },
];

// SVG Icons
function HomeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

function BuildingIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>;
}

function CurrencyIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}

function PlusIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function PhoneIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}

function DocumentIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}

function ChatIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}

function ShieldCheckIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 12 15 15 9"/></svg>;
}

function UserIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function MagnifyingGlassIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}

function WrenchIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}

function ReceiptIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4v16l6-4 6 4V4Z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
}

function ChartIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}

function EyeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function UsersIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

function StarIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function FlagIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
}

function GavelIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M6 14H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2"/><path d="M18 16H8"/><path d="M19 16v.5a2.5 2.5 0 1 1-5 0V16"/></svg>;
}

function CogIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}

function UploadIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}

function DocumentChartIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}

function CreditCardIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}