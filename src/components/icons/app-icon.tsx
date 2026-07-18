"use client";

import React from "react";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Search,
  Home,
  Building2,
  Users2,
  FileText,
  Settings2,
  Bell,
  ShieldCheck,
  BarChart3,
  Truck,
  Package,
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Key,
  Award,
  Bed,
  Bath,
  Square,
  Car,
  CheckCircle2,
  CircleCheckBig,
  ScrollText,
  AlertTriangle,
  Gavel,
  Globe,
  Share2,
  User,
  Download,
  Eye,
  Camera,
  Menu,
  Info,
  LayoutDashboard,
  ClipboardList,
  Flag,
  MessageSquare,
  ShoppingCart,
  Check,
  Wallet,
  TrendingUp,
  Box,
  SlidersHorizontal,
  List,
  LayoutGrid,
} from "lucide-react";

type MaterialLikeIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, MaterialLikeIcon> = {
  // Navigation / UI
  arrow_forward: ArrowRight,
  arrow_back: ArrowLeft,
  arrow_back_ios: ArrowLeft,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  search: Search,
  menu: Menu,
  close: () => null,

  // Dashboard / Layout
  dashboard: LayoutDashboard,
  home: Home,
  building: Building2,
  domain: Building2,
  people: Users2,
  group: Users2,
  assignees: Users2,
  description: FileText,
  receipt_long: ScrollText,
  payments: Wallet,
  payments_outlined: Wallet,
  sell: TrendingUp,
  settings: Settings2,
  tune: Settings2,
  notifications: Bell,
  notifications_outlined: Bell,
  verified_user: CheckCircle2,
  verified: CircleCheckBig,
  security: ShieldCheck,
  security_outlined: ShieldCheck,
  shield: ShieldCheck,
  show_chart: BarChart3,
  bar_chart: BarChart3,
  send: Mail,
  local_shipping: Truck,
  inventory: Box,
  local_atm: Wallet,
  credit_card: CreditCard,
  help: HelpCircle,
  help_outline: HelpCircle,
  mail: Mail,
  email: Mail,
  phone: Phone,
  call: Phone,
  location_on: MapPin,
  pin_drop: MapPin,
  map: MapPin,
  key: Key,
  grade: Award,
  star: Award,
  star_outline: () => null,

  // Property
  bed: Bed,
  bathtub: Bath,
  square_foot: Square,
  meeting_room: Building2,
  local_parking: Car,

  // Misc / Status
  article: ScrollText,
  check_circle: CheckCircle2,
  check_circle_outline: CircleCheckBig,
  info: Info,
  warning: AlertTriangle,
  warning_amber: AlertTriangle,
  gavel: Gavel,
  balance: Gavel,
  policy: FileText,
  report_problem: AlertTriangle,
  error: AlertTriangle,
  explore: Globe,
  language: Globe,
  public: Globe,
  share: Share2,
  download: Download,
  visibility: Eye,
  camera_alt: Camera,
  filter_list: SlidersHorizontal,
  shopping_cart: ShoppingCart,
  add_shopping_cart: ShoppingCart,
  done: Check,
  done_outline: () => null,
  check_box: Check,
  chat: MessageSquare,
  chat_bubble_outline: MessageSquare,
  contact_support: HelpCircle,
  format_list_bulleted: List,
  grid_view: LayoutGrid,
  list: List,

  // Misc dynamic / labels treated as pseudo-icons (fall back to HelpCircle)
  "Residential": () => null,
  "Commercial": () => null,
  "Total to Pay": () => null,
  "Receive funds": () => null,
  "Service fee (5%)": () => null,
  Total: () => null,
};

type AppIconProps = {
  name: string;
  className?: string;
  size?: number;
};

export default function AppIcon({
  name,
  className = "lucide",
  size = 24,
}: AppIconProps) {
  const Comp = ICON_MAP[name];

  if (Comp) {
    // null means intentionally show nothing
    if (Comp === (() => null) || name === "close" || name === "star_outline") {
      return <span className={className} aria-hidden="true" style={{ display: "inline-flex" }} />;
    }
    return (
      <Comp
        className={className}
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        strokeWidth={2}
      />
    );
  }

  // Generic fallback: HelpCircle for unknown names (preserves label-as-icon pattern
  // in DashboardShell/Admin for labels like "Dashboard", "Settings", etc.)
  return (
    <HelpCircle
      className={className}
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      strokeWidth={2}
    />
  );
}
