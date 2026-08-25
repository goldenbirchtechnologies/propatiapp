import { Link } from "react-router";
import { Building2, Users, DollarSign, Wrench, ArrowRight, Plus, TrendingUp } from "lucide-react";
import { StatCard, StatusBadge, PageHeader, Progress } from "../../components/ui";
import { mockUnits, mockMaintenanceTickets } from "../../data/mock";

const collectionRate = [78, 82, 85, 80, 88, 91, 86, 93, 89, 94, 92, 96];

export default function EMHome() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Estate Manager Dashboard"
        description="Good morning, Aisha. Your portfolio is at 92% occupancy."
        actions={
          <Link to="/dashboard/estate-manager/units" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={14} /> Add Unit
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Units" value="48" sub="3 buildings" icon={Building2} />
        <StatCard label="Occupied" value="44" sub="92% occupancy" trend="up" trendValue="+2%" icon={Users} />
        <StatCard label="Collection Rate" value="96%" trend="up" trendValue="+4%" icon={DollarSign} />
        <StatCard label="Open Maintenance" value="7" sub="2 critical" icon={Wrench} />
      </div>

      {/* Collection chart + buildings */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Collection Rate</h3>
              <p className="text-zinc-500 text-xs">Monthly rent collection rate</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <TrendingUp size={12} /> 96% this month
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {collectionRate.map((v, i) => {
              const isLast = i === collectionRate.length - 1;
              return (
                <div key={i} className="flex-1">
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: `${v}%`,
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

        {/* Building occupancy */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Building Occupancy</h3>
          <div className="space-y-4">
            {[
              { name: "Tower A — Ikoyi", units: 20, occupied: 19, color: "#10b981" },
              { name: "Block B — VI", units: 16, occupied: 14, color: "#3b82f6" },
              { name: "Estate C — Lekki", units: 12, occupied: 11, color: "#8b5cf6" },
            ].map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">{b.name}</span>
                  <span className="text-white">{b.occupied}/{b.units}</span>
                </div>
                <Progress value={(b.occupied / b.units) * 100} color={b.color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Units + Maintenance */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Unit Status</h3>
            <Link to="/dashboard/estate-manager/units" className="text-xs text-emerald-400 flex items-center gap-1">
              All units <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockUnits.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium">{u.name}</div>
                  <div className="text-zinc-600 text-xs">{u.type} · Floor {u.floor}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-zinc-300 text-xs">{u.rent}</div>
                  <div className="mt-0.5"><StatusBadge status={u.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Maintenance Tickets</h3>
            <Link to="/dashboard/estate-manager/maintenance" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockMaintenanceTickets.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  t.priority === "Critical" ? "bg-red-400" : t.priority === "High" ? "bg-amber-400" : "bg-zinc-600"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{t.title}</div>
                  <div className="text-zinc-600 text-xs">{t.unit}</div>
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
