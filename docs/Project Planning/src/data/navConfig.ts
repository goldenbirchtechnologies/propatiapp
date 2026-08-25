import {
  LayoutDashboard, Building2, Home, List, Users, FileText, DollarSign,
  Wrench, MessageSquare, Bell, User, Shield, BarChart3, Search,
  Handshake, Receipt, CreditCard, BriefcaseIcon, TrendingUp, Calendar,
  Star, Package, ArrowUpDown, ClipboardList, BookOpen, Eye,
  Settings, Flag, AlertTriangle, Scale, Globe, Archive,
  PieChart, Building, Landmark, Layers, BookMarked, UserCheck,
  Wallet, ScrollText, Banknote, PhoneCall, Users2, MapPin, Activity,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export type RoleConfig = {
  label: string;
  accentColor: string;
  sections: NavSection[];
};

export const navConfig: Record<string, RoleConfig> = {
  landlord: {
    label: "Landlord",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Dashboard", path: "/dashboard/landlord", icon: LayoutDashboard },
          { label: "Portfolio", path: "/dashboard/landlord/portfolio", icon: Building2 },
        ],
      },
      {
        title: "Properties",
        items: [
          { label: "Properties", path: "/dashboard/landlord/properties", icon: Home },
          { label: "Listings", path: "/dashboard/landlord/listings", icon: List },
          { label: "Vacancies", path: "/dashboard/landlord/vacancies", icon: MapPin },
          { label: "Short-Let", path: "/dashboard/landlord/short-let", icon: Calendar },
        ],
      },
      {
        title: "Tenants",
        items: [
          { label: "Tenants", path: "/dashboard/landlord/tenants", icon: Users },
          { label: "Applications", path: "/dashboard/landlord/applications", icon: ClipboardList },
          { label: "Screening", path: "/dashboard/landlord/screening", icon: UserCheck },
          { label: "Agreements", path: "/dashboard/landlord/agreements", icon: FileText },
        ],
      },
      {
        title: "Finance",
        items: [
          { label: "Financials", path: "/dashboard/landlord/financials", icon: BarChart3 },
          { label: "Rent", path: "/dashboard/landlord/rent", icon: DollarSign },
          { label: "Invoices", path: "/dashboard/landlord/invoices", icon: Receipt },
          { label: "Receipts", path: "/dashboard/landlord/receipts", icon: BookMarked },
          { label: "Statements", path: "/dashboard/landlord/statements", icon: ScrollText },
        ],
      },
      {
        title: "Operations",
        items: [
          { label: "Maintenance", path: "/dashboard/landlord/maintenance", icon: Wrench },
          { label: "Agents", path: "/dashboard/landlord/agents", icon: BriefcaseIcon },
          { label: "Messages", path: "/dashboard/landlord/messages", icon: MessageSquare, badge: 3 },
          { label: "Notifications", path: "/dashboard/landlord/notifications", icon: Bell, badge: 5 },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Profile", path: "/dashboard/landlord/profile", icon: User },
          { label: "Verification", path: "/dashboard/landlord/verification", icon: Shield },
        ],
      },
    ],
  },

  tenant: {
    label: "Tenant",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Dashboard", path: "/dashboard/tenant", icon: LayoutDashboard },
        ],
      },
      {
        title: "Payments",
        items: [
          { label: "Payments", path: "/dashboard/tenant/payments", icon: CreditCard },
          { label: "Invoices", path: "/dashboard/tenant/invoices", icon: Receipt },
          { label: "Receipts", path: "/dashboard/tenant/receipts", icon: BookMarked },
        ],
      },
      {
        title: "Renting",
        items: [
          { label: "My Applications", path: "/dashboard/tenant/applications", icon: ClipboardList },
          { label: "Agreements", path: "/dashboard/tenant/agreements", icon: FileText },
          { label: "Maintenance", path: "/dashboard/tenant/maintenance", icon: Wrench, badge: 1 },
          { label: "Saved", path: "/dashboard/tenant/saved", icon: BookMarked },
          { label: "Search", path: "/dashboard/tenant/search", icon: Search },
        ],
      },
      {
        title: "Support",
        items: [
          { label: "Messages", path: "/dashboard/tenant/messages", icon: MessageSquare, badge: 2 },
          { label: "Notifications", path: "/dashboard/tenant/notifications", icon: Bell },
          { label: "Support", path: "/dashboard/tenant/support", icon: PhoneCall },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Profile", path: "/dashboard/tenant/profile", icon: User },
          { label: "Screening", path: "/dashboard/tenant/screening", icon: Shield },
        ],
      },
    ],
  },

  agent: {
    label: "Agent",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Dashboard", path: "/dashboard/agent", icon: LayoutDashboard },
          { label: "Schedule", path: "/dashboard/agent/schedule", icon: Calendar },
        ],
      },
      {
        title: "Sales",
        items: [
          { label: "Listings", path: "/dashboard/agent/listings", icon: List },
          { label: "Pipeline", path: "/dashboard/agent/pipeline", icon: TrendingUp },
          { label: "Deals", path: "/dashboard/agent/deals", icon: Handshake },
          { label: "Sell", path: "/dashboard/agent/sell", icon: Building2 },
          { label: "Buy", path: "/dashboard/agent/buy", icon: Home },
          { label: "Market", path: "/dashboard/agent/market", icon: BarChart3 },
        ],
      },
      {
        title: "Clients",
        items: [
          { label: "Clients", path: "/dashboard/agent/clients", icon: Users },
          { label: "Invites", path: "/dashboard/agent/invites", icon: Users2 },
        ],
      },
      {
        title: "Finance",
        items: [
          { label: "Commissions", path: "/dashboard/agent/commissions", icon: DollarSign },
          { label: "Payments", path: "/dashboard/agent/payments", icon: CreditCard },
          { label: "Invoices", path: "/dashboard/agent/invoices", icon: Receipt },
          { label: "Receipts", path: "/dashboard/agent/receipts", icon: BookMarked },
          { label: "Withdrawals", path: "/dashboard/agent/withdrawals", icon: Banknote },
        ],
      },
      {
        title: "Operations",
        items: [
          { label: "Inspections", path: "/dashboard/agent/inspections", icon: Eye },
          { label: "Verifications", path: "/dashboard/agent/verifications", icon: Shield },
          { label: "Messages", path: "/dashboard/agent/messages", icon: MessageSquare, badge: 4 },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Reputation", path: "/dashboard/agent/reputation", icon: Star },
          { label: "Profile", path: "/dashboard/agent/profile", icon: User },
        ],
      },
    ],
  },

  admin: {
    label: "Admin",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Dashboard", path: "/dashboard/admin", icon: LayoutDashboard },
          { label: "Overview", path: "/dashboard/admin/overview", icon: Activity },
        ],
      },
      {
        title: "Users",
        items: [
          { label: "All Users", path: "/dashboard/admin/users", icon: Users },
          { label: "Management", path: "/dashboard/admin/users/management", icon: UserCheck },
        ],
      },
      {
        title: "Content",
        items: [
          { label: "Properties", path: "/dashboard/admin/properties", icon: Building2 },
          { label: "Verifications", path: "/dashboard/admin/verifications", icon: Shield },
          { label: "Queue", path: "/dashboard/admin/verification", icon: ClipboardList, badge: 12 },
          { label: "Flags", path: "/dashboard/admin/flags", icon: Flag, badge: 3 },
        ],
      },
      {
        title: "Finance",
        items: [
          { label: "Transactions", path: "/dashboard/admin/transactions", icon: ArrowUpDown },
          { label: "Revenue", path: "/dashboard/admin/revenue", icon: TrendingUp },
          { label: "Payments", path: "/dashboard/admin/payments", icon: CreditCard },
          { label: "Escrow", path: "/dashboard/admin/transactions/escrow", icon: Landmark },
          { label: "Reports", path: "/dashboard/admin/reports", icon: BarChart3 },
        ],
      },
      {
        title: "Legal",
        items: [
          { label: "Disputes", path: "/dashboard/admin/disputes", icon: Scale, badge: 2 },
          { label: "Agreements", path: "/dashboard/admin/agreements", icon: FileText },
        ],
      },
      {
        title: "System",
        items: [
          { label: "Audit Logs", path: "/dashboard/admin/audit/logs", icon: Archive },
          { label: "Settings", path: "/dashboard/admin/settings", icon: Settings },
          { label: "Profile", path: "/dashboard/admin/profile", icon: User },
        ],
      },
    ],
  },

  "estate-manager": {
    label: "Estate Manager",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Dashboard", path: "/dashboard/estate-manager", icon: LayoutDashboard },
          { label: "Analytics", path: "/dashboard/estate-manager/analytics", icon: PieChart },
        ],
      },
      {
        title: "Portfolio",
        items: [
          { label: "Portfolio", path: "/dashboard/estate-manager/portfolio", icon: Building2 },
          { label: "Units", path: "/dashboard/estate-manager/units", icon: Layers },
          { label: "Tenants", path: "/dashboard/estate-manager/tenants", icon: Users },
          { label: "Team", path: "/dashboard/estate-manager/team", icon: Users2 },
        ],
      },
      {
        title: "Finance",
        items: [
          { label: "Financials", path: "/dashboard/estate-manager/financials", icon: BarChart3 },
          { label: "Collections", path: "/dashboard/estate-manager/collections", icon: DollarSign },
          { label: "Disbursements", path: "/dashboard/estate-manager/disbursements", icon: Banknote },
          { label: "Ledger", path: "/dashboard/estate-manager/ledger", icon: BookOpen },
          { label: "Invoices", path: "/dashboard/estate-manager/invoices", icon: Receipt },
          { label: "Receipts", path: "/dashboard/estate-manager/receipts", icon: BookMarked },
        ],
      },
      {
        title: "Operations",
        items: [
          { label: "Maintenance", path: "/dashboard/estate-manager/maintenance", icon: Wrench, badge: 4 },
          { label: "Agreements", path: "/dashboard/estate-manager/agreements", icon: FileText },
          { label: "Reports", path: "/dashboard/estate-manager/reports", icon: ScrollText },
          { label: "Messages", path: "/dashboard/estate-manager/messages", icon: MessageSquare },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Billing", path: "/dashboard/estate-manager/billing", icon: CreditCard },
          { label: "Profile", path: "/dashboard/estate-manager/profile", icon: User },
        ],
      },
    ],
  },

  accountant: {
    label: "Accountant",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Dashboard", path: "/dashboard/accountant", icon: LayoutDashboard },
        ],
      },
      {
        title: "Finance",
        items: [
          { label: "Payments", path: "/dashboard/accountant/payments", icon: CreditCard },
          { label: "Reports", path: "/dashboard/accountant/reports", icon: BarChart3 },
          { label: "Receipts", path: "/dashboard/accountant/receipts", icon: BookMarked },
          { label: "Statements", path: "/dashboard/accountant/statements", icon: ScrollText },
          { label: "Withdrawals", path: "/dashboard/accountant/withdrawals", icon: Banknote },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Messages", path: "/dashboard/accountant/messages", icon: MessageSquare },
          { label: "Profile", path: "/dashboard/accountant/profile", icon: User },
        ],
      },
    ],
  },

  verification: {
    label: "Verification",
    accentColor: "#10b981",
    sections: [
      {
        items: [
          { label: "Overview", path: "/dashboard/verification", icon: Shield },
          { label: "Guide", path: "/dashboard/verification/guide", icon: BookOpen },
          { label: "Checklist", path: "/dashboard/verification/checklist", icon: ClipboardList },
        ],
      },
      {
        title: "Steps",
        items: [
          { label: "Step 1 — Documents", path: "/dashboard/verification/step1/documents", icon: FileText },
          { label: "Step 2 — Identity", path: "/dashboard/verification/step2/identity", icon: UserCheck },
          { label: "Step 3 — Video", path: "/dashboard/verification/step3/video", icon: Eye },
          { label: "Step 4 — Inspection", path: "/dashboard/verification/step4/inspection", icon: MapPin },
        ],
      },
    ],
  },
};
