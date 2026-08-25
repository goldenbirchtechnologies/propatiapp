import { GenericTablePage, GenericMessagePage, GenericProfilePage } from "../../components/GenericPage";
import { PageHeader, StatCard, StatusBadge } from "../../components/ui";
import { mockTransactions, mockInvoices } from "../../data/mock";
import { DollarSign, BarChart3 } from "lucide-react";

export function AccountantPayments() {
  return (
    <GenericTablePage
      title="Payments"
      breadcrumb={["Dashboard", "Payments"]}
      columns={[
        { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
        { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
        { key: "from", label: "From" },
        { key: "to", label: "To" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockTransactions as unknown as Record<string, unknown>[]}
    />
  );
}

export function AccountantReports() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Financial Reports" breadcrumb={["Dashboard", "Reports"]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (Aug)" value="₦8.4M" trend="up" trendValue="+23%" icon={DollarSign} />
        <StatCard label="Expenses" value="₦1.2M" icon={DollarSign} />
        <StatCard label="Transactions" value="247" icon={BarChart3} />
        <StatCard label="Reconciliation Rate" value="99.2%" trend="up" icon={BarChart3} />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Monthly P&L Statement", "Transaction Reconciliation", "Tax Report (VAT)", "Commission Summary", "Outstanding Invoices", "Escrow Report"].map((r) => (
          <div key={r} className="glass-card p-5 hover:border-white/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 size={14} className="text-emerald-400" />
              </div>
              <span className="text-white font-medium text-sm">{r}</span>
            </div>
            <button className="text-xs text-emerald-400 hover:text-emerald-300">Download →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AccountantReceipts = () => (
  <GenericTablePage
    title="Receipts"
    breadcrumb={["Dashboard", "Receipts"]}
    columns={[
      { key: "id", label: "Receipt #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
      { key: "issued", label: "Issued" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockInvoices as unknown as Record<string, unknown>[]}
  />
);

export const AccountantStatements = () => (
  <GenericTablePage
    title="Statements"
    breadcrumb={["Dashboard", "Statements"]}
    columns={[
      { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "type", label: "Period", render: (r) => <span className="text-white">{String(r.type)}</span> },
      { key: "amount", label: "Total", render: (r) => <span className="text-emerald-400">{String(r.amount)}</span> },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockTransactions as unknown as Record<string, unknown>[]}
  />
);

export const AccountantWithdrawals = AccountantPayments;
export const AccountantMessages = () => <GenericMessagePage title="Messages" />;
export const AccountantProfile = () => <GenericProfilePage name="Temi Osei" role="Accountant" email="temi@propati.ng" />;
