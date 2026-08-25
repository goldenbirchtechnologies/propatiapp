import { Link } from "react-router";
import { Home, Users, DollarSign, ClipboardList, ArrowRight, Plus, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { StatCard, StatusBadge, MiniSparkline, PageHeader, Progress } from "../../components/ui";
import { mockTenants, mockMaintenanceTickets } from "../../data/mock";

const revenueData = [4.2, 3.8, 4.5, 4.1, 4.8, 5.1, 4.9, 5.4, 5.2, 5.7, 5.5, 5.9];
const occupancyData = [80, 83, 85, 88, 85, 90, 88, 92, 90, 93, 91, 94];

const quickActions = [
  { label: "Add Property", path: "/dashboard/landlord/properties", icon: Home, color: "#10b981" },
  { label: "New Listing", path: "/dashboard/landlord/listing/new", icon: Plus, color: "#3b82f6" },
  { label: "View Tenants", path: "/dashboard/landlord/tenants", icon: Users, color: "#8b5cf6" },
  { label: "Financials", path: "/dashboard/landlord/financials", icon: DollarSign, color: "#f59e0b" },
];

export default function LandlordHome() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Landlord Dashboard"
        description="Good morning, Emeka. Here's an overview of your portfolio."
        actions={
          <Link
            to="/dashboard/landlord/listing/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Listing
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Properties" value="12" sub="2 vacant" trend="up" trendValue="+2 this month" icon={Home} />
        <StatCard label="Active Listings" value="8" sub="across 3 types" trend="up" trendValue="+3" icon={ClipboardList} />
        <StatCard label="Monthly Revenue" value="₦18.4M" trend="up" trendValue="+12.3%" icon={DollarSign} />
        <StatCard label="Occupancy Rate" value="94%" trend="up" trendValue="+4%" icon={TrendingUp} />
      </div>

      {/* Charts + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Revenue Trend</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Last 12 months · Monthly revenue in ₦M</p>
            </div>
            <Link to="/dashboard/landlord/financials" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-1.5 h-32">
            {revenueData.map((v, i) => {
              const max = Math.max(...revenueData);
              const pct = (v / max) * 100;
              const isLast = i === revenueData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${pct}%`,
                      background: isLast ? "#10b981" : "rgba(255,255,255,0.06)",
                      minHeight: 4,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-700">
            {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.path}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15` }}>
                  <a.icon size={15} style={{ color: a.color }} />
                </div>
                <span className="text-sm text-zinc-300 hover:text-white">{a.label}</span>
                <ArrowRight size={12} className="text-zinc-600 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio health */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Portfolio Health</h3>
          <div className="space-y-4">
            {[
              { label: "Occupancy", value: 94, color: "#10b981" },
              { label: "Rent Collected", value: 87, color: "#3b82f6" },
              { label: "Verified Listings", value: 100, color: "#10b981" },
              { label: "Profile Complete", value: 72, color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
                <Progress value={item.value} color={item.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent tenants */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Tenants</h3>
            <Link to="/dashboard/landlord/tenants" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              All tenants <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockTenants.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-zinc-600 text-xs">{t.unit}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-zinc-300 text-xs font-medium">{t.rent}</div>
                  <div className="mt-0.5"><StatusBadge status={t.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + Maintenance */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Alerts */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            Requires Attention
          </h3>
          <div className="space-y-2">
            {[
              { type: "warning", msg: "Flat 1B rent overdue by 24 days — Ngozi Eze", path: "/dashboard/landlord/tenants" },
              { type: "info", msg: "2 new applications need review", path: "/dashboard/landlord/applications" },
              { type: "warning", msg: "Lease for Flat 4D expires in 30 days", path: "/dashboard/landlord/leases" },
              { type: "success", msg: "Verification approved — Flat 2C listed", path: "/dashboard/landlord/listings" },
            ].map((alert, i) => (
              <Link
                key={i}
                to={alert.path}
                className="flex items-start gap-2.5 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.type === "warning" ? "bg-amber-400" : alert.type === "info" ? "bg-blue-400" : "bg-emerald-400"
                }`} />
                <span className="text-sm text-zinc-400 hover:text-zinc-200">{alert.msg}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Maintenance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Open Maintenance</h3>
            <Link to="/dashboard/landlord/maintenance" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockMaintenanceTickets.slice(0, 3).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  t.priority === "Critical" ? "bg-red-400" : t.priority === "High" ? "bg-amber-400" : "bg-zinc-600"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{t.title}</div>
                  <div className="text-zinc-600 text-xs">{t.unit} · {t.tenant}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
