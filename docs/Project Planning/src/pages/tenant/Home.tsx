import { Link } from "react-router";
import { CreditCard, Wrench, Home, Calendar, ArrowRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { StatCard, StatusBadge, PageHeader, Progress } from "../../components/ui";

export default function TenantHome() {
  const daysUntilRent = 8;
  const leaseProgress = 62;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Home"
        description="Welcome back, Chidi. Here's what's happening with your tenancy."
        actions={
          <Link
            to="/listings"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-zinc-300 text-sm rounded-lg hover:text-white hover:border-zinc-600 transition-colors"
          >
            <Home size={14} /> Browse Listings
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Days Until Rent" value={`${daysUntilRent}d`} sub="Sep 1, 2026" icon={Calendar} />
        <StatCard label="Lease Remaining" value="4 months" sub="Expires Dec 2026" icon={Home} />
        <StatCard label="Open Tickets" value="1" sub="Maintenance" trend="flat" icon={Wrench} />
        <StatCard label="Saved Properties" value="6" sub="Browse more" icon={Home} />
      </div>

      {/* Current lease */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Current Lease</h3>
              <p className="text-zinc-500 text-sm mt-0.5">14 Bourdillon Road, Flat 3A, Ikoyi</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              Active
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Monthly Rent", value: "₦200,000" },
              { label: "Lease Start", value: "Jan 1, 2026" },
              { label: "Lease End", value: "Dec 31, 2026" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs text-zinc-600 mb-1">{item.label}</div>
                <div className="text-white text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-500">Lease Progress</span>
              <span className="text-white">{leaseProgress}% complete</span>
            </div>
            <Progress value={leaseProgress} color="#10b981" />
          </div>
        </div>

        {/* Next payment */}
        <div className="glass-card p-5 flex flex-col">
          <h3 className="text-white font-semibold text-sm mb-4">Next Payment</h3>
          <div className="flex-1">
            <div className="text-3xl font-black text-white mb-1">₦200,000</div>
            <div className="text-zinc-500 text-xs mb-1">Due September 1, 2026</div>
            <div className={`flex items-center gap-1.5 text-xs ${daysUntilRent <= 7 ? "text-amber-400" : "text-zinc-500"}`}>
              <Clock size={11} />
              {daysUntilRent} days remaining
            </div>
          </div>
          <Link
            to="/dashboard/tenant/payments"
            className="mt-5 w-full py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-center flex items-center justify-center gap-2"
          >
            <CreditCard size={14} />
            Pay Rent
          </Link>
        </div>
      </div>

      {/* Payment history + maintenance */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Payment History</h3>
            <Link to="/dashboard/tenant/payments" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { month: "August 2026", amount: "₦200,000", date: "Aug 1", status: "Paid" },
              { month: "July 2026", amount: "₦200,000", date: "Jul 1", status: "Paid" },
              { month: "June 2026", amount: "₦200,000", date: "Jun 2", status: "Paid" },
              { month: "May 2026", amount: "₦200,000", date: "May 4", status: "Paid" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm">{p.month}</div>
                  <div className="text-zinc-600 text-xs">Paid on {p.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-200 text-sm font-medium">{p.amount}</div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Maintenance Requests</h3>
            <Link to="/dashboard/tenant/maintenance" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { title: "AC Not Cooling", status: "In Progress", date: "Aug 22", priority: "High" },
              { title: "Leaking Tap — Kitchen", status: "Resolved", date: "Aug 10", priority: "Medium" },
              { title: "Light Bulb — Bedroom", status: "Resolved", date: "Jul 28", priority: "Low" },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  m.priority === "High" ? "bg-amber-400" : m.priority === "Medium" ? "bg-blue-400" : "bg-zinc-600"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{m.title}</div>
                  <div className="text-zinc-600 text-xs">{m.date}</div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
          <Link
            to="/dashboard/tenant/maintenance/new"
            className="mt-3 w-full py-2 text-xs font-medium text-zinc-400 border border-dashed border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-zinc-200 transition-colors text-center block"
          >
            + New maintenance request
          </Link>
        </div>
      </div>
    </div>
  );
}
