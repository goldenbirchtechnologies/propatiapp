import { Link } from "react-router";
import { List, Users, DollarSign, TrendingUp, ArrowRight, Plus, Calendar } from "lucide-react";
import { StatCard, StatusBadge, PageHeader, Progress, MiniSparkline } from "../../components/ui";
import { mockDeals } from "../../data/mock";

const commissionData = [180, 220, 195, 310, 285, 340, 290, 380, 420, 365, 490, 520];

const pipelineStages = [
  { stage: "Viewing Scheduled", count: 4, color: "#3b82f6" },
  { stage: "Offer Made", count: 2, color: "#8b5cf6" },
  { stage: "Negotiation", count: 3, color: "#f59e0b" },
  { stage: "Due Diligence", count: 1, color: "#10b981" },
  { stage: "Closed", count: 8, color: "#10b981" },
];

export default function AgentHome() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Agent Dashboard"
        description="Good morning, Yetunde. You have 3 deals in active negotiation."
        actions={
          <Link
            to="/dashboard/agent/listings"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={14} /> New Listing
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Listings" value="23" trend="up" trendValue="+5" icon={List} />
        <StatCard label="Deals This Month" value="4" sub="2 pending close" trend="up" trendValue="+1" icon={TrendingUp} />
        <StatCard label="Commission Earned" value="₦2.1M" sub="August 2026" trend="up" trendValue="+18%" icon={DollarSign} />
        <StatCard label="Clients" value="47" trend="up" trendValue="+6 this month" icon={Users} />
      </div>

      {/* Commission chart + schedule */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Commission Trend</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Monthly earnings in ₦K · Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <TrendingUp size={12} />
              +18% MoM
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {commissionData.map((v, i) => {
              const max = Math.max(...commissionData);
              const pct = (v / max) * 100;
              const isLast = i === commissionData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-sm"
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

        {/* Today's schedule */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Today's Schedule</h3>
            <Link to="/dashboard/agent/schedule" className="text-xs text-emerald-400 flex items-center gap-1">
              Full calendar <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { time: "10:00am", title: "Property Viewing", client: "Mr. Adamu Bello", type: "Viewing" },
              { time: "1:00pm", title: "Client Meeting", client: "Zenith Corp", type: "Meeting" },
              { time: "3:30pm", title: "Inspection Report", client: "VI Office Space", type: "Inspection" },
            ].map((event, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-xs text-zinc-600 w-14 flex-shrink-0 pt-0.5">{event.time}</div>
                <div className="flex-1 p-2.5 rounded-lg bg-zinc-950/80 border-l-2 border-emerald-500">
                  <div className="text-white text-xs font-medium">{event.title}</div>
                  <div className="text-zinc-600 text-xs">{event.client}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-sm">Deal Pipeline</h3>
          <Link to="/dashboard/agent/pipeline" className="text-xs text-emerald-400 flex items-center gap-1">
            Full pipeline <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {pipelineStages.map((s) => (
            <div key={s.stage} className="text-center">
              <div className="text-xl font-black text-white mb-1">{s.count}</div>
              <div className="text-[10px] text-zinc-600 leading-tight">{s.stage}</div>
              <div className="mt-2 h-1 rounded-full" style={{ background: s.color + "40" }}>
                <div className="h-full rounded-full" style={{ background: s.color, width: `${(s.count / 8) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {mockDeals.slice(0, 3).map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.025] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{d.property}</div>
                <div className="text-zinc-600 text-xs">{d.client}</div>
              </div>
              <div className="text-zinc-300 text-sm font-medium">{d.value}</div>
              <StatusBadge status={d.stage} />
              <div className="text-xs text-zinc-600 w-12 text-right">{d.probability}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
