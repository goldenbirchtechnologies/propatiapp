import { Link } from "react-router";
import { DollarSign, CreditCard, Receipt, TrendingUp, ArrowRight } from "lucide-react";
import { StatCard, StatusBadge, PageHeader } from "../../components/ui";
import { mockTransactions, mockInvoices } from "../../data/mock";

export default function AccountantHome() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Accountant Dashboard"
        description="Financial overview · August 24, 2026"
        actions={
          <Link to="/dashboard/accountant/reports" className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            Generate Report
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (Aug)" value="₦8.4M" trend="up" trendValue="+23.4%" icon={DollarSign} />
        <StatCard label="Payments Processed" value="247" trend="up" trendValue="+31" icon={CreditCard} />
        <StatCard label="Outstanding Invoices" value="₦3.2M" trend="down" trendValue="-12%" icon={Receipt} />
        <StatCard label="Withdrawals Pending" value="₦1.1M" sub="8 requests" icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
            <Link to="/dashboard/accountant/payments" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm">{t.type}</div>
                  <div className="text-zinc-600 text-xs font-mono">{t.id} · {t.date}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white text-sm font-semibold">{t.amount}</div>
                  <div className="mt-0.5"><StatusBadge status={t.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Outstanding Invoices</h3>
            <Link to="/dashboard/accountant/receipts" className="text-xs text-emerald-400 flex items-center gap-1">
              All <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockInvoices.filter((i) => i.status !== "Paid").map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{inv.description}</div>
                  <div className="text-zinc-600 text-xs font-mono">{inv.id} · Due {inv.due}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white text-xs font-semibold">{inv.amount}</div>
                  <div className="mt-0.5"><StatusBadge status={inv.status} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
