import { GenericTablePage, GenericFormPage, GenericMessagePage, GenericNotificationsPage, GenericProfilePage } from "../../components/GenericPage";
import { PageHeader, StatusBadge, StatCard } from "../../components/ui";
import { mockInvoices, mockApplications, mockMaintenanceTickets, mockTransactions } from "../../data/mock";
import { CreditCard, Wrench } from "lucide-react";

const paymentData = [
  { id: "PAY-001", description: "Rent — August 2026", amount: "₦200,000", method: "Bank Transfer", date: "Aug 1, 2026", status: "Paid" },
  { id: "PAY-002", description: "Rent — July 2026", amount: "₦200,000", method: "Card", date: "Jul 1, 2026", status: "Paid" },
  { id: "PAY-003", description: "Rent — June 2026", amount: "₦200,000", method: "Bank Transfer", date: "Jun 2, 2026", status: "Paid" },
  { id: "PAY-004", description: "Deposit", amount: "₦400,000", method: "Bank Transfer", date: "Dec 15, 2025", status: "Paid" },
] as Record<string, unknown>[];

const agreementData = [
  { id: "AGR-001", type: "Tenancy Agreement", property: "Flat 3A, 14 Bourdillon Road", start: "Jan 1, 2026", end: "Dec 31, 2026", status: "Active" },
] as Record<string, unknown>[];

export function TenantPayments() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Payments" description="Your rent payment history and upcoming payments." breadcrumb={["Dashboard", "Payments"]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Next Due" value="₦200K" sub="Sep 1, 2026" icon={CreditCard} />
        <StatCard label="Total Paid (2026)" value="₦1.6M" trend="up" icon={CreditCard} />
        <StatCard label="Outstanding" value="₦0" icon={CreditCard} />
        <StatCard label="Late Fees" value="₦0" icon={CreditCard} />
      </div>
      <GenericTablePage
        title=""
        breadcrumb={[]}
        columns={[
          { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
          { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
          { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
          { key: "method", label: "Method" },
          { key: "date", label: "Date" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
        ]}
        data={paymentData}
      />
    </div>
  );
}

export function TenantMaintenance() {
  return (
    <GenericTablePage
      title="Maintenance Requests"
      description="Submit and track maintenance issues"
      breadcrumb={["Dashboard", "Maintenance"]}
      addLabel="New Request"
      addPath="/dashboard/tenant/maintenance/new"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "title", label: "Issue", render: (r) => <span className="text-white">{String(r.title)}</span> },
        { key: "priority", label: "Priority", render: (r) => (
          <span className={`text-xs font-medium ${r.priority === "Critical" ? "text-red-400" : r.priority === "High" ? "text-amber-400" : "text-zinc-400"}`}>{String(r.priority)}</span>
        )},
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockMaintenanceTickets as unknown as Record<string, unknown>[]}
    />
  );
}

export const TenantNewMaintenance = () => (
  <GenericFormPage
    title="New Maintenance Request"
    breadcrumb={["Dashboard", "Maintenance", "New"]}
    fields={[
      { label: "Issue Title", type: "text", placeholder: "Brief description of the issue", required: true, span: 2 },
      { label: "Category", type: "select", options: ["Plumbing", "Electrical", "HVAC", "Structural", "Security", "Other"], required: true },
      { label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"], required: true },
      { label: "Description", type: "textarea", placeholder: "Detailed description of the problem…", required: true, span: 2 },
    ]}
    submitLabel="Submit Request"
  />
);

export function TenantApplications() {
  return (
    <GenericTablePage
      title="My Applications"
      breadcrumb={["Dashboard", "Applications"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "property", label: "Property", render: (r) => <span className="text-white">{String(r.property)}</span> },
        { key: "date", label: "Applied" },
        { key: "score", label: "Score" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockApplications as unknown as Record<string, unknown>[]}
    />
  );
}

export function TenantAgreements() {
  return (
    <GenericTablePage
      title="Agreements"
      breadcrumb={["Dashboard", "Agreements"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
        { key: "property", label: "Property" },
        { key: "start", label: "Start" },
        { key: "end", label: "End" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={agreementData}
    />
  );
}

export const TenantMessages = () => <GenericMessagePage title="Messages" />;
export const TenantNotifications = () => <GenericNotificationsPage />;
export const TenantProfile = () => <GenericProfilePage name="Chidi Okafor" role="Tenant" email="chidi@propati.ng" />;

export const TenantSaved = () => (
  <div className="p-6">
    <PageHeader title="Saved Properties" breadcrumb={["Dashboard", "Saved"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Your saved listings from the marketplace.</p>
    </div>
  </div>
);

export const TenantInvoices = () => (
  <GenericTablePage
    title="Invoices"
    breadcrumb={["Dashboard", "Invoices"]}
    columns={[
      { key: "id", label: "Invoice #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
      { key: "due", label: "Due" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockInvoices as unknown as Record<string, unknown>[]}
  />
);

export const TenantReceipts = () => (
  <GenericTablePage
    title="Receipts"
    breadcrumb={["Dashboard", "Receipts"]}
    columns={[
      { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
      { key: "issued", label: "Issued" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockInvoices as unknown as Record<string, unknown>[]}
  />
);

export const TenantScreening = () => (
  <div className="p-6">
    <PageHeader title="Tenant Screening Profile" breadcrumb={["Dashboard", "Screening"]} />
    <div className="grid grid-cols-3 gap-4 mt-4">
      {[
        { label: "Credit Score", value: "742", sub: "Excellent", color: "#10b981" },
        { label: "Screening Score", value: "91/100", sub: "Top 10% of applicants", color: "#10b981" },
        { label: "Status", value: "Verified", sub: "All checks passed", color: "#10b981" },
      ].map((item) => (
        <div key={item.label} className="glass-card p-5 text-center">
          <div className="text-xs text-zinc-500 mb-2">{item.label}</div>
          <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
          <div className="text-xs text-zinc-600 mt-1">{item.sub}</div>
        </div>
      ))}
    </div>
  </div>
);

export const TenantSearch = () => (
  <div className="p-6">
    <PageHeader title="Search Properties" breadcrumb={["Dashboard", "Search"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Property search embedded in dashboard context.</p>
    </div>
  </div>
);

export const TenantSupport = () => <GenericMessagePage title="Support" />;

export const TenantPaymentsOverdue = () => (
  <GenericTablePage
    title="Overdue Payments"
    breadcrumb={["Dashboard", "Payments", "Overdue"]}
    columns={[
      { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className="text-red-400 font-semibold">{String(r.amount)}</span> },
      { key: "due", label: "Due" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockInvoices.filter((i) => i.status === "Overdue") as unknown as Record<string, unknown>[]}
    emptyMessage="No overdue payments. You're all caught up!"
  />
);

export const TenantAutoPay = () => (
  <GenericFormPage
    title="Auto-Pay Settings"
    breadcrumb={["Dashboard", "Payments", "Auto-Pay"]}
    fields={[
      { label: "Enable Auto-Pay", type: "select", options: ["Enabled", "Disabled"], span: 2 },
      { label: "Payment Method", type: "select", options: ["Bank Transfer", "Saved Card", "Wallet"], required: true },
      { label: "Payment Date", type: "select", options: ["1st of month", "5th of month", "10th of month"], required: true },
      { label: "Max Amount (₦)", type: "number", placeholder: "e.g. 250000" },
    ]}
    submitLabel="Save Auto-Pay Settings"
  />
);

export const TenantPaymentMethodNew = () => (
  <GenericFormPage
    title="Add Payment Method"
    breadcrumb={["Dashboard", "Payments", "Add Method"]}
    fields={[
      { label: "Method Type", type: "select", options: ["Bank Account", "Debit Card", "Credit Card"], required: true, span: 2 },
      { label: "Account / Card Number", type: "text", placeholder: "••••  ••••  ••••  ••••", required: true, span: 2 },
      { label: "Account Name", type: "text", placeholder: "Name as it appears on card", required: true },
      { label: "Bank", type: "select", options: ["GTBank", "First Bank", "Zenith Bank", "Access Bank", "UBA", "Sterling Bank"] },
    ]}
    submitLabel="Add Method"
  />
);

export const TenantPaymentStatements = () => (
  <GenericTablePage
    title="Payment Statements"
    breadcrumb={["Dashboard", "Payments", "Statements"]}
    columns={[
      { key: "id", label: "Statement #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "type", label: "Period", render: (r) => <span className="text-white">{String(r.type)}</span> },
      { key: "amount", label: "Total", render: (r) => <span className="text-emerald-400">{String(r.amount)}</span> },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockTransactions as unknown as Record<string, unknown>[]}
  />
);

export const TenantMaintenanceDetail = () => (
  <div className="p-6">
    <PageHeader title="Maintenance Ticket" breadcrumb={["Dashboard", "Maintenance", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Ticket detail with status updates and communication history.</p>
    </div>
  </div>
);

export const TenantEmergencyMaintenance = () => (
  <div className="p-6 max-w-xl">
    <PageHeader title="Emergency Maintenance" breadcrumb={["Dashboard", "Maintenance", "Emergency"]} />
    <div className="glass-card p-8 border border-red-500/30 mt-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
        <Wrench size={24} className="text-red-400" />
      </div>
      <h2 className="text-white font-bold text-lg mb-2">Emergency Request</h2>
      <p className="text-zinc-500 text-sm mb-6">For life-threatening emergencies, call 112. For urgent property emergencies, use this form.</p>
      <GenericFormPage
        title=""
        fields={[
          { label: "Emergency Type", type: "select", options: ["Flooding", "Gas Leak", "Electrical Fire", "Security Breach", "Structural Damage", "Other"], required: true, span: 2 },
          { label: "Description", type: "textarea", placeholder: "Describe the emergency…", required: true, span: 2 },
        ]}
        submitLabel="Report Emergency"
      />
    </div>
  </div>
);

export const TenantMaintenanceProtocol = () => (
  <div className="p-6 max-w-2xl">
    <PageHeader title="Maintenance Protocol" breadcrumb={["Dashboard", "Maintenance", "Protocol"]} />
    <div className="space-y-4 mt-4">
      {["Submit a request via the Maintenance page", "A ticket is created and assigned to your landlord", "Landlord assigns a technician within 24 hours", "You receive status updates via notifications", "You confirm completion and close the ticket"].map((step, i) => (
        <div key={i} className="flex gap-4 glass-card p-4">
          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
          <p className="text-zinc-300 text-sm pt-0.5">{step}</p>
        </div>
      ))}
    </div>
  </div>
);

export const TenantAgreementDetail = () => (
  <div className="p-6">
    <PageHeader title="Agreement Detail" breadcrumb={["Dashboard", "Agreements", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Full agreement document with download and signing options.</p>
    </div>
  </div>
);

export const TenantAgreementSign = () => (
  <div className="p-6 max-w-xl">
    <PageHeader title="Sign Agreement" breadcrumb={["Dashboard", "Agreements", "Sign"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-400 text-sm mb-6">Review and digitally sign your tenancy agreement.</p>
      <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 mb-4 text-center">
        <p className="text-zinc-600 text-sm">Your signature</p>
        <div className="h-16" />
      </div>
      <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg text-sm transition-colors">
        Sign Agreement
      </button>
    </div>
  </div>
);

export const TenantPaymentSuccess = () => (
  <div className="p-6 max-w-md mx-auto text-center">
    <div className="glass-card p-10 mt-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <h2 className="text-white font-bold text-xl mb-2">Payment Successful!</h2>
      <p className="text-zinc-500 text-sm mb-6">Your rent payment of ₦200,000 for August 2026 has been confirmed.</p>
      <button className="w-full py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg">
        Download Receipt
      </button>
    </div>
  </div>
);
