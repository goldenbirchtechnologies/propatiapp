import { BedDouble, Bath, Square, MapPin, CheckCircle, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { typeColors, formatPrice } from "../data/mock";

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "destructive" | "info" | "gold" | "rent" | "lease" | "sale" | "shortlet" | "roomshare" | "obsidian" | "diamond" | "silver";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "bg-zinc-800 text-zinc-400 border-zinc-700",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  destructive: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  gold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  rent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  lease: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  sale: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shortlet: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  roomshare: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  obsidian: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  diamond: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  silver: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20",
};

export function Badge({
  variant = "default",
  children,
  className = "",
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded-md ${badgeStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    Active: "success",
    Verified: "success",
    Approved: "success",
    Completed: "success",
    Paid: "success",
    Resolved: "success",
    Closed: "success",
    Overdue: "destructive",
    Rejected: "destructive",
    Failed: "destructive",
    Suspended: "destructive",
    Pending: "warning",
    "Pending Review": "warning",
    "Under Review": "warning",
    "In Review": "info",
    "In Progress": "info",
    Processing: "info",
    Notice: "warning",
    Maintenance: "warning",
    Occupied: "success",
    Vacant: "default",
    "Additional Info Needed": "warning",
    Hot: "destructive",
    New: "info",
    Featured: "gold",
    Premium: "obsidian",
    "Offer Made": "info",
    Negotiation: "warning",
    "Viewing Scheduled": "default",
    "Due Diligence": "info",
  };
  return <Badge variant={map[status] ?? "default"}>{status}</Badge>;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-zinc-800 flex-shrink-0`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-semibold">
          {initials}
        </div>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  trend,
  trendValue,
  icon: Icon,
  accentColor = "#10b981",
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  accentColor?: string;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-zinc-400";

  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}15` }}>
            <Icon size={15} className={`text-[${accentColor}]`} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {(sub || trendValue) && (
        <div className="flex items-center gap-2">
          {trendValue && trend && (
            <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon size={12} />
              {trendValue}
            </span>
          )}
          {sub && <span className="text-xs text-zinc-600">{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ─── PropertyCard ─────────────────────────────────────────────────────────────
export function PropertyCard({ listing }: { listing: typeof import("../data/mock").listings[0] }) {
  const typeColor = typeColors[listing.type] || "#10b981";
  return (
    <div className="glass-card overflow-hidden group hover:border-white/20 transition-all cursor-pointer">
      <div className="relative h-48 bg-zinc-900 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="px-2 py-0.5 text-xs font-semibold rounded text-white capitalize"
            style={{ background: typeColor }}
          >
            {listing.type}
          </span>
          {listing.badge && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-black/70 text-white backdrop-blur-sm">
              {listing.badge}
            </span>
          )}
        </div>
        {listing.verified && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
              <CheckCircle size={10} />
              Verified
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <div className="text-white font-bold text-lg leading-none">
            {formatPrice(listing.price, listing.type)}
          </div>
          <div className="text-white/70 text-xs">{listing.priceUnit}</div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-zinc-500 text-xs mb-3">
          <MapPin size={10} />
          <span className="line-clamp-1">{listing.address}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400 text-xs">
          {listing.beds > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={12} />
              {listing.beds} bd
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath size={12} />
            {listing.baths} ba
          </span>
          <span className="flex items-center gap-1">
            <Square size={12} />
            {listing.sqft.toLocaleString()} sqft
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────
export type Column<T = Record<string, unknown>> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data found",
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs text-zinc-500 uppercase tracking-wider font-medium bg-zinc-950"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-600">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-zinc-300">
                    {col.render ? col.render(row) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: string[];
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 mb-1">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumb.length - 1 ? "text-zinc-400" : ""}>{crumb}</span>
              </span>
            ))}
          </div>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-zinc-500 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/[0.08] flex items-center justify-center mb-4">
          <Icon size={20} className="text-zinc-700" />
        </div>
      )}
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-600 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-emerald-500 text-white hover:bg-emerald-600",
  secondary: "bg-[#121215] text-white border border-zinc-800 hover:bg-zinc-900",
  outline: "bg-transparent border border-zinc-800 text-white hover:bg-[#121215]",
  ghost: "bg-transparent text-zinc-400 hover:bg-[#121215] hover:text-white",
  destructive: "bg-red-500 text-white hover:bg-red-600",
};

export function Btn({
  variant = "primary",
  size = "md",
  children,
  onClick,
  className = "",
  type = "button",
}: {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  const sizes = {
    sm: "h-8 px-3 text-xs rounded-md",
    md: "h-9 px-4 text-sm rounded-lg",
    lg: "h-11 px-6 text-base rounded-lg",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${sizes[size]} ${btnStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────
export function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={12} className="fill-emerald-500 text-emerald-500" />
      ))}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
      {children}
    </span>
  );
}

// ─── MiniSparkline ────────────────────────────────────────────────────────────
export function MiniSparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export function Progress({ value, color = "#10b981" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden w-full">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

// ─── SearchInput ──────────────────────────────────────────────────────────────
export function SearchInput({
  placeholder = "Search…",
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="dark-input w-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
      />
    </div>
  );
}
