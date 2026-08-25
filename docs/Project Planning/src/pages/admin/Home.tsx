import { Link } from "react-router";
import { Users, Building2, Shield, DollarSign, ArrowRight, AlertTriangle, TrendingUp, Flag } from "lucide-react";
import { StatCard, StatusBadge, PageHeader } from "../../components/ui";
import { mockUsers, mockVerificationQueue, mockTransactions } from "../../data/mock";

const userGrowth = [820, 950, 1100, 1280, 1450, 1620, 1890, 2100, 2350, 2600, 2890, 3180];

export default function AdminHome() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview · August 24, 2026"
        actions={
          <div className="flex gap-2">
            <Link to="/dashboard/admin/reports" className="px-4 py-2 text-sm border border-zinc-800 text-zinc-300 rounded-lg hover:text-white hover:border-zinc-600 transition-colors">
              Export Report
            </Link>
            <Link to="/dashboard/admin/settings" className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              Settings
            </Link>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="3,180" trend="up" trendValue="+290 this month" icon={Users} />
        <StatCard label="Active Listings" value="50,847" trend="up" trendValue="+1.2K" icon={Building2} />
        <StatCard label="Verification Queue" value="12" sub="Pending review" trend="flat" icon={Shield} />
        <StatCard label="Platform Revenue" value="₦8.4M" trend="up" trendValue="+23.4%" icon={DollarSign} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* User growth */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">User Growth</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Monthly active users · Last 12 months</p>
            </div>
            <Link to="/dashboard/admin/users" className="text-xs text-emerald-400 flex items-center gap-1">
              View users <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {userGrowth.map((v, i) => {
              const max = Math.max(...userGrowth);
              const pct = (v / max) * 100;
              const isLast = i === userGrowth.length - 1;
              return (
                <div key={i} className="flex-1">
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

        {/* Alerts */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">System Alerts</h3>
          <div className="space-y-2.5">
            {[
              { severity: "critical", msg: "Failed payment rate 2.3% — above threshold", path: "/dashboard/admin/transactions" },
              { severity: "warning", msg: "3 disputes unresolved > 7 days", path: "/dashboard/admin/disputes" },
              { severity: "warning", msg: "12 verification submissions pending", path: "/dashboard/admin/verification" },
              { severity: "info", msg: "DB backup completed successfully", path: "#" },
              { severity: "info", msg: "API latency normal — p95 < 200ms", path: "#" },
            ].map((a, i) => (
              <Link key={i} to={a.path} className="flex items-start gap-2.5 hover:bg-white/[0.03] p-2 rounded-lg transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  a.severity === "critical" ? "bg-red-400" : a.severity === "warning" ? "bg-amber-400" : "bg-blue-400"
                }`} />
                <span className="text-xs text-zinc-400">{a.msg}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users + verification queue */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Users</h3>
            <Link to="/dashboard/admin/users" className="text-xs text-emerald-400 flex items-center gap-1">
              All users <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockUsers.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm">{u.name}</div>
                  <div className="text-zinc-600 text-xs font-mono">{u.id} · {u.role}</div>
                </div>
                <StatusBadge status={u.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Verification queue */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              Verification Queue
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full">12</span>
            </h3>
            <Link to="/dashboard/admin/verification" className="text-xs text-emerald-400 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockVerificationQueue.map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{v.property}</div>
                  <div className="text-zinc-600 text-xs">{v.owner} · {v.type}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={v.status} />
                  <div className="text-zinc-700 text-[10px] mt-0.5">{v.submitted}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
          <Link to="/dashboard/admin/transactions" className="text-xs text-emerald-400 flex items-center gap-1">
            All transactions <ArrowRight size={11} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Ref", "Type", "Amount", "From", "To", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5 text-xs font-mono text-zinc-500">{t.id}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-300">{t.type}</td>
                  <td className="px-3 py-2.5 text-xs text-white font-semibold">{t.amount}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-400">{t.from}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-400">{t.to}</td>
                  <td className="px-3 py-2.5 text-xs text-zinc-600">{t.date}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
