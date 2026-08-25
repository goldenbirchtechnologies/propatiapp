import { GenericTablePage, GenericFormPage, GenericMessagePage, GenericNotificationsPage, GenericProfilePage } from "../../components/GenericPage";
import { PageHeader, StatCard, StatusBadge, Progress } from "../../components/ui";
import { mockUnits, mockMaintenanceTickets, mockTransactions, mockInvoices, mockTenants } from "../../data/mock";
import { Building2, DollarSign, BarChart3, Users } from "lucide-react";

export function EMPortfolio() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Portfolio" breadcrumb={["Dashboard", "Portfolio"]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Buildings" value="3" icon={Building2} />
        <StatCard label="Total Units" value="48" icon={Building2} />
        <StatCard label="Occupancy Rate" value="92%" trend="up" trendValue="+2%" icon={Users} />
        <StatCard label="Portfolio Value" value="₦4.2B" trend="up" icon={DollarSign} />
      </div>
      <div className="space-y-3">
        {[
          { name: "Tower A — Ikoyi", address: "14 Bourdillon Road", units: 20, occupied: 19, revenue: "₦24M/yr", color: "#10b981" },
          { name: "Block B — Victoria Island", address: "7 Adetokunbo Ademola", units: 16, occupied: 14, revenue: "₦18M/yr", color: "#3b82f6" },
          { name: "Estate C — Lekki", address: "55 Admiralty Way, Lekki", units: 12, occupied: 11, revenue: "₦12M/yr", color: "#8b5cf6" },
        ].map((b) => (
          <div key={b.name} className="glass-card p-5 hover:border-white/15 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-white font-semibold">{b.name}</div>
                <div className="text-zinc-500 text-sm">{b.address}</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-semibold">{b.revenue}</div>
                <div className="text-zinc-600 text-xs">{b.occupied}/{b.units} units occupied</div>
              </div>
            </div>
            <Progress value={(b.occupied / b.units) * 100} color={b.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EMUnits() {
  return (
    <GenericTablePage
      title="Units"
      description="All units across your portfolio"
      breadcrumb={["Dashboard", "Units"]}
      addLabel="Add Unit"
      addPath="#"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "name", label: "Unit", render: (r) => <span className="text-white font-medium">{String(r.name)}</span> },
        { key: "type", label: "Type" },
        { key: "floor", label: "Floor" },
        { key: "tenant", label: "Tenant", render: (r) => <span>{String(r.tenant ?? "—")}</span> },
        { key: "rent", label: "Rent", render: (r) => <span className="text-emerald-400">{String(r.rent)}</span> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockUnits as unknown as Record<string, unknown>[]}
    />
  );
}

export function EMFinancials() {
  const data = [4.2, 4.8, 5.1, 4.6, 5.3, 5.7, 5.2, 6.0, 5.8, 6.4, 6.1, 6.8];
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Financials" breadcrumb={["Dashboard", "Financials"]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Collections (Aug)" value="₦6.8M" trend="up" trendValue="+12%" icon={DollarSign} />
        <StatCard label="Outstanding" value="₦280K" icon={DollarSign} />
        <StatCard label="Expenses" value="₦540K" icon={DollarSign} />
        <StatCard label="Net (Aug)" value="₦5.98M" trend="up" icon={BarChart3} />
      </div>
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Monthly Collections</h3>
        <div className="flex items-end gap-1.5 h-32">
          {data.map((v, i) => {
            const max = Math.max(...data);
            const pct = (v / max) * 100;
            return (
              <div key={i} className="flex-1">
                <div className="w-full rounded-sm" style={{ height: `${pct}%`, background: i === data.length - 1 ? "#10b981" : "rgba(255,255,255,0.06)", minHeight: 4 }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-zinc-700">
          {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  );
}

export function EMTenants() {
  return (
    <GenericTablePage
      title="Tenants"
      breadcrumb={["Dashboard", "Tenants"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "name", label: "Tenant", render: (r) => <span className="text-white font-medium">{String(r.name)}</span> },
        { key: "unit", label: "Unit" },
        { key: "rent", label: "Rent", render: (r) => <span className="text-emerald-400">{String(r.rent)}</span> },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockTenants as unknown as Record<string, unknown>[]}
    />
  );
}

export function EMMaintenance() {
  return (
    <GenericTablePage
      title="Maintenance"
      breadcrumb={["Dashboard", "Maintenance"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "title", label: "Issue", render: (r) => <span className="text-white">{String(r.title)}</span> },
        { key: "unit", label: "Unit" },
        { key: "priority", label: "Priority", render: (r) => <span className={`text-xs font-medium ${r.priority === "Critical" ? "text-red-400" : r.priority === "High" ? "text-amber-400" : "text-zinc-400"}`}>{String(r.priority)}</span> },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockMaintenanceTickets as unknown as Record<string, unknown>[]}
    />
  );
}

export const EMMaintenanceDetail = () => (
  <div className="p-6">
    <PageHeader title="Maintenance Detail" breadcrumb={["Dashboard", "Maintenance", "Detail"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Ticket details, communication, and resolution history.</p></div>
  </div>
);

export const EMCollections = () => (
  <GenericTablePage
    title="Collections"
    breadcrumb={["Dashboard", "Collections"]}
    columns={[
      { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
      { key: "from", label: "From" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockTransactions as unknown as Record<string, unknown>[]}
  />
);

export const EMDisbursements = EMCollections;
export const EMLedger = EMCollections;

export function EMTeam() {
  const data = [
    { id: "TM-001", name: "Fatima Hassan", role: "Property Manager", units: "Tower A", status: "Active", joined: "Jan 2025" },
    { id: "TM-002", name: "Emmanuel Eze", role: "Maintenance Coordinator", units: "Block B", status: "Active", joined: "Mar 2025" },
    { id: "TM-003", name: "Grace Okonkwo", role: "Collections Officer", units: "All", status: "Active", joined: "Feb 2025" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Team"
      breadcrumb={["Dashboard", "Team"]}
      addLabel="Invite Team Member"
      addPath="#"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "name", label: "Name", render: (r) => <span className="text-white font-medium">{String(r.name)}</span> },
        { key: "role", label: "Role" },
        { key: "units", label: "Assigned Units" },
        { key: "joined", label: "Joined" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

export const EMReports = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Reports" breadcrumb={["Dashboard", "Reports"]} />
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {["Collection Report", "Occupancy Report", "Maintenance Report", "Financial Summary", "Tenant Turnover", "Revenue Signature"].map((r) => (
        <div key={r} className="glass-card p-5 hover:border-white/20 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 size={14} className="text-emerald-400" />
            </div>
            <span className="text-white font-medium text-sm">{r}</span>
          </div>
          <button className="text-xs text-emerald-400 hover:text-emerald-300">Download PDF →</button>
        </div>
      ))}
    </div>
  </div>
);

export const EMRevenueSignature = EMReports;

export const EMAgreements = () => (
  <GenericTablePage
    title="Agreements"
    breadcrumb={["Dashboard", "Agreements"]}
    columns={[
      { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
      { key: "issued", label: "Date" },
      { key: "due", label: "Expiry" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockInvoices as unknown as Record<string, unknown>[]}
  />
);

export const EMInvoices = EMAgreements;
export const EMReceipts = EMAgreements;
export const EMStatements = EMAgreements;

export const EMBilling = () => (
  <div className="p-6 max-w-xl space-y-5">
    <PageHeader title="Billing & Subscription" breadcrumb={["Dashboard", "Billing"]} />
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-white font-bold text-lg">Pro Estate Manager Plan</div>
          <div className="text-zinc-500 text-sm">₦150,000 / month · Billed monthly</div>
        </div>
        <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">Active</span>
      </div>
      <div className="space-y-2 text-sm text-zinc-400">
        {["Up to 100 units", "Unlimited team members", "Advanced analytics", "Priority support", "API access"].map((f) => (
          <div key={f} className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            {f}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const EMSubscription = EMBilling;

export const EMAnalytics = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Analytics" breadcrumb={["Dashboard", "Analytics"]} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Avg Occupancy" value="92%" trend="up" trendValue="+4%" icon={BarChart3} />
      <StatCard label="Avg Collection Rate" value="96%" trend="up" icon={BarChart3} />
      <StatCard label="Maintenance Resolve Time" value="2.3 days" icon={BarChart3} />
      <StatCard label="Tenant Retention Rate" value="87%" trend="up" icon={BarChart3} />
    </div>
    <div className="glass-card p-5">
      <p className="text-zinc-500 text-sm text-center py-8">Detailed analytics charts would render here.</p>
    </div>
  </div>
);

export const EMMessages = () => <GenericMessagePage title="Messages" />;
export const EMProfile = () => <GenericProfilePage name="Aisha Mohammed" role="Estate Manager" email="aisha@propati.ng" />;

export const EMPortfolioAnalytics = EMAnalytics;
export const EMPortfolioUnitDetail = () => (
  <div className="p-6">
    <PageHeader title="Portfolio Unit Detail" breadcrumb={["Dashboard", "Portfolio", "Unit"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Unit financial performance, tenant history, and maintenance record.</p></div>
  </div>
);
export const EMUnitDetail = EMPortfolioUnitDetail;
export const EMScenario = () => (
  <div className="p-6">
    <PageHeader title="Scenario Analysis" breadcrumb={["Dashboard", "Financials", "Scenario"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Financial scenario modelling and projections.</p></div>
  </div>
);
export const EMScenarioBuilder = () => (
  <GenericFormPage
    title="Scenario Builder"
    breadcrumb={["Dashboard", "Financials", "Scenario Builder"]}
    fields={[
      { label: "Scenario Name", type: "text", required: true, span: 2 },
      { label: "Occupancy Rate (%)", type: "number" },
      { label: "Rent Increase (%)", type: "number" },
      { label: "Expense Growth (%)", type: "number" },
      { label: "Projection Period", type: "select", options: ["12 months", "24 months", "36 months", "60 months"] },
    ]}
    submitLabel="Run Scenario"
  />
);

export const EMTurnover = () => (
  <div className="p-6">
    <PageHeader title="Tenant Turnover" breadcrumb={["Dashboard", "Turnover"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Move-out tracking and unit readiness management.</p></div>
  </div>
);
export const EMMoveIn = () => (
  <div className="p-6">
    <PageHeader title="Move-In Management" breadcrumb={["Dashboard", "Move-In"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Move-in checklist and tenant onboarding.</p></div>
  </div>
);
export const EMLeaseReview = () => (
  <div className="p-6">
    <PageHeader title="Lease Review" breadcrumb={["Dashboard", "Lease Review"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Leases nearing expiry and renewal tracking.</p></div>
  </div>
);
export const EMLeaseNegotiation = () => (
  <div className="p-6">
    <PageHeader title="Lease Negotiation" breadcrumb={["Dashboard", "Lease Negotiation"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Active lease negotiations and counter-offer management.</p></div>
  </div>
);
export const EMCommercialLeases = EMAgreements;
export const EMBulkImport = () => (
  <GenericFormPage
    title="Bulk Import Units"
    breadcrumb={["Dashboard", "Bulk Import"]}
    fields={[
      { label: "Import Format", type: "select", options: ["CSV", "Excel (.xlsx)"], required: true, span: 2 },
      { label: "File Upload", type: "text", placeholder: "Drop file or click to upload", span: 2 },
    ]}
    submitLabel="Import Units"
  />
);
export const EMServiceCharges = EMCollections;
export const EMUtilities = EMCollections;
export const EMInvitePropertyManager = () => (
  <GenericFormPage
    title="Invite Property Manager"
    breadcrumb={["Dashboard", "Invite Property Manager"]}
    fields={[
      { label: "Full Name", type: "text", required: true },
      { label: "Email Address", type: "email", required: true },
      { label: "Assigned Buildings", type: "select", options: ["Tower A", "Block B", "Estate C", "All"] },
      { label: "Role Level", type: "select", options: ["Property Manager", "Assistant Manager", "Coordinator"] },
    ]}
    submitLabel="Send Invitation"
  />
);
