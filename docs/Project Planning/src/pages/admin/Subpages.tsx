import { GenericTablePage, GenericFormPage, GenericNotificationsPage, GenericProfilePage } from "../../components/GenericPage";
import { PageHeader, StatCard, StatusBadge, Btn } from "../../components/ui";
import { mockUsers, mockVerificationQueue, mockTransactions, mockInvoices } from "../../data/mock";
import { Users, Shield, DollarSign, BarChart3, Settings, Scale } from "lucide-react";

export function AdminUsers() {
  return (
    <GenericTablePage
      title="All Users"
      description="Manage platform users across all roles"
      breadcrumb={["Dashboard", "Users"]}
      addLabel="Invite User"
      addPath="#"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "name", label: "Name", render: (r) => <span className="text-white font-medium">{String(r.name)}</span> },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "listings", label: "Listings" },
        { key: "joined", label: "Joined" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockUsers as unknown as Record<string, unknown>[]}
    />
  );
}

export const AdminUserManagement = AdminUsers;

export function AdminProperties() {
  const data = [
    { id: "P-1001", title: "14 Bourdillon Road", owner: "Emeka Nwosu", type: "Residential", tier: "Obsidian", status: "Verified" },
    { id: "P-1002", title: "7 Adetokunbo Ademola", owner: "Emeka Nwosu", type: "Commercial", tier: "Gold", status: "Verified" },
    { id: "P-1003", title: "22 Banana Island", owner: "Lagos Corp", type: "Residential", tier: "Obsidian", status: "Under Review" },
    { id: "P-1004", title: "Studio, Ozumba Mbadiwe", owner: "Bola Adekunle", type: "Short-Let", tier: "Silver", status: "Pending" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Properties"
      breadcrumb={["Dashboard", "Properties"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "title", label: "Property", render: (r) => <span className="text-white">{String(r.title)}</span> },
        { key: "owner", label: "Owner" },
        { key: "type", label: "Type" },
        { key: "tier", label: "Tier" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

export function AdminVerifications() {
  return (
    <GenericTablePage
      title="Verifications"
      breadcrumb={["Dashboard", "Verifications"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "property", label: "Property", render: (r) => <span className="text-white">{String(r.property)}</span> },
        { key: "owner", label: "Owner" },
        { key: "type", label: "Type" },
        { key: "tier", label: "Tier" },
        { key: "submitted", label: "Submitted" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockVerificationQueue as unknown as Record<string, unknown>[]}
    />
  );
}

export function AdminVerificationQueue() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Verification Queue" description="Properties awaiting verification review" breadcrumb={["Dashboard", "Queue"]} />
      <div className="grid grid-cols-3 gap-4 mb-2">
        <StatCard label="Pending" value="12" icon={Shield} />
        <StatCard label="In Review" value="3" icon={Shield} />
        <StatCard label="Completed Today" value="5" trend="up" icon={Shield} />
      </div>
      <div className="space-y-3">
        {mockVerificationQueue.map((v) => (
          <div key={v.id} className="glass-card p-5 hover:border-white/15 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-zinc-600">{v.id}</span>
                  <StatusBadge status={v.status} />
                </div>
                <div className="text-white font-medium">{v.property}</div>
                <div className="text-zinc-500 text-sm">{v.owner} · {v.type} · {v.submitted}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Btn variant="outline" size="sm">Review</Btn>
                <Btn variant="primary" size="sm">Approve</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AdminQueueDetail = () => (
  <div className="p-6">
    <PageHeader title="Obsidian Penthouse — Verification" breadcrumb={["Dashboard", "Queue", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Full verification detail with uploaded documents, identity verification status, and decision actions.</p>
    </div>
  </div>
);

export function AdminTransactions() {
  return (
    <GenericTablePage
      title="Transactions"
      breadcrumb={["Dashboard", "Transactions"]}
      columns={[
        { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
        { key: "amount", label: "Amount", render: (r) => <span className="text-white font-semibold">{String(r.amount)}</span> },
        { key: "from", label: "From" },
        { key: "to", label: "To" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockTransactions as unknown as Record<string, unknown>[]}
    />
  );
}

export const AdminEscrow = AdminTransactions;
export const AdminWithdrawals = AdminTransactions;
export const AdminPayments = AdminTransactions;

export const AdminRevenue = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Revenue" breadcrumb={["Dashboard", "Revenue"]} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Monthly Revenue" value="₦8.4M" trend="up" trendValue="+23%" icon={DollarSign} />
      <StatCard label="YTD Revenue" value="₦67.2M" trend="up" icon={DollarSign} />
      <StatCard label="Subscription Revenue" value="₦3.1M" icon={DollarSign} />
      <StatCard label="Commission Revenue" value="₦5.3M" icon={DollarSign} />
    </div>
    <div className="glass-card p-5">
      <p className="text-zinc-500 text-sm text-center py-8">Revenue breakdown chart by category and time period.</p>
    </div>
  </div>
);

export function AdminReports() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Reports" breadcrumb={["Dashboard", "Reports"]} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Platform Summary", "User Growth Report", "Revenue Report", "Verification Report", "Dispute Summary", "Fraud Detection"].map((r) => (
          <div key={r} className="glass-card p-5 hover:border-white/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 size={15} className="text-emerald-400" />
              </div>
              <span className="text-white font-medium text-sm">{r}</span>
            </div>
            <p className="text-zinc-600 text-xs">August 2026 · PDF / CSV</p>
            <button className="mt-3 text-xs text-emerald-400 hover:text-emerald-300">Download →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminFlags() {
  const data = [
    { id: "FLG-001", type: "Fake Listing", listing: "3BR Flat, Lekki", reporter: "Amaka Obi", date: "Aug 23, 2026", status: "Pending" },
    { id: "FLG-002", type: "Fraud", listing: "Villa, Abuja", reporter: "Kola Ade", date: "Aug 22, 2026", status: "Under Review" },
    { id: "FLG-003", type: "Spam", listing: "5BR House, VI", reporter: "Tunde B.", date: "Aug 21, 2026", status: "Resolved" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Flags"
      description="User-reported content flags"
      breadcrumb={["Dashboard", "Flags"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-red-400 font-medium">{String(r.type)}</span> },
        { key: "listing", label: "Listing", render: (r) => <span className="text-white">{String(r.listing)}</span> },
        { key: "reporter", label: "Reporter" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

export function AdminDisputes() {
  const data = [
    { id: "DSP-001", type: "Payment Dispute", parties: "Tenant vs Landlord", amount: "₦400,000", opened: "Aug 20, 2026", status: "Pending" },
    { id: "DSP-002", type: "Lease Dispute", parties: "Tenant vs Landlord", amount: "—", opened: "Aug 15, 2026", status: "Under Review" },
    { id: "DSP-003", type: "Fraud Claim", parties: "User vs Platform", amount: "₦2.4M", opened: "Aug 10, 2026", status: "Resolved" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Disputes"
      breadcrumb={["Dashboard", "Disputes"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
        { key: "parties", label: "Parties" },
        { key: "amount", label: "Amount" },
        { key: "opened", label: "Opened" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

export const AdminDisputeDetail = () => (
  <div className="p-6">
    <PageHeader title="Dispute Detail" breadcrumb={["Dashboard", "Disputes", "Detail"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Full dispute timeline, evidence, and resolution tools.</p></div>
  </div>
);

export function AdminSettings() {
  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <PageHeader title="Platform Settings" breadcrumb={["Dashboard", "Settings"]} />
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { title: "Global Settings", desc: "Platform-wide configuration", path: "/dashboard/admin/settings/global" },
          { title: "Countries & Regions", desc: "Manage supported locations", path: "/dashboard/admin/settings/countries" },
          { title: "Verification Rules", desc: "Configure tier requirements", path: "/dashboard/admin/settings/rules" },
          { title: "MFA Settings", desc: "Multi-factor auth config", path: "/dashboard/admin/settings/mfa" },
        ].map((s) => (
          <div key={s.title} className="glass-card p-5 hover:border-white/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Settings size={14} className="text-zinc-400" />
              </div>
              <span className="text-white font-medium text-sm">{s.title}</span>
            </div>
            <p className="text-zinc-600 text-xs">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const settingsPageStub = (title: string, crumb: string) => () => (
  <GenericFormPage
    title={title}
    breadcrumb={["Dashboard", "Settings", crumb]}
    fields={[
      { label: "Setting", type: "text", span: 2 },
      { label: "Value", type: "text" },
      { label: "Environment", type: "select", options: ["Production", "Staging", "Development"] },
    ]}
    submitLabel="Save Settings"
  />
);

export const AdminSettingsGlobal = settingsPageStub("Global Settings", "Global");
export const AdminSettingsDashboard = settingsPageStub("Dashboard Settings", "Dashboard");
export const AdminSettingsCountries = () => (
  <GenericTablePage
    title="Countries & Regions"
    breadcrumb={["Dashboard", "Settings", "Countries"]}
    columns={[
      { key: "country", label: "Country" },
      { key: "code", label: "Code" },
      { key: "currency", label: "Currency" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={[
      { country: "Nigeria", code: "NG", currency: "NGN (₦)", status: "Active" },
      { country: "Ghana", code: "GH", currency: "GHS (₵)", status: "Coming Soon" },
      { country: "Kenya", code: "KE", currency: "KES (KSh)", status: "Coming Soon" },
    ] as unknown as Record<string, unknown>[]}
  />
);
export const AdminSettingsRules = settingsPageStub("Verification Rules", "Rules");
export const AdminSettingsMFA = settingsPageStub("MFA Settings", "MFA");

export function AdminAuditLogs() {
  const data = [
    { id: "AUD-9821", action: "User.Suspend", actor: "Admin User", target: "Kola Adeyemi", ip: "105.112.x.x", date: "Aug 23, 2026 11:42am" },
    { id: "AUD-9820", action: "Listing.Approve", actor: "Admin User", target: "VRF-502", ip: "105.112.x.x", date: "Aug 23, 2026 11:30am" },
    { id: "AUD-9819", action: "Settings.Update", actor: "Admin User", target: "Platform Fee", ip: "105.112.x.x", date: "Aug 22, 2026 3:15pm" },
    { id: "AUD-9818", action: "Dispute.Resolve", actor: "Admin User", target: "DSP-003", ip: "105.112.x.x", date: "Aug 22, 2026 1:00pm" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Audit Logs"
      breadcrumb={["Dashboard", "Audit", "Logs"]}
      columns={[
        { key: "id", label: "Event ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "action", label: "Action", render: (r) => <span className="font-mono text-xs text-emerald-400">{String(r.action)}</span> },
        { key: "actor", label: "Actor" },
        { key: "target", label: "Target" },
        { key: "ip", label: "IP" },
        { key: "date", label: "Timestamp" },
      ]}
      data={data}
    />
  );
}

export const AdminAuditEventDetail = () => (
  <div className="p-6">
    <PageHeader title="Audit Event Detail" breadcrumb={["Dashboard", "Audit", "Event"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Full audit event details with request/response payload.</p></div>
  </div>
);

export const AdminAgreements = () => (
  <GenericTablePage
    title="Agreements"
    breadcrumb={["Dashboard", "Agreements"]}
    columns={[
      { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
      { key: "issued", label: "Date" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockInvoices as unknown as Record<string, unknown>[]}
  />
);

export const AdminInvoices = AdminAgreements;
export const AdminReceipts = AdminAgreements;
export const AdminStatements = AdminAgreements;

export const AdminProfile = () => <GenericProfilePage name="Admin User" role="Platform Administrator" email="admin@propati.ng" />;
export const AdminProfileSecurity = () => (
  <div className="p-6 max-w-xl space-y-5">
    <PageHeader title="Security Settings" breadcrumb={["Dashboard", "Profile", "Security"]} />
    <div className="glass-card p-6 space-y-4">
      {["Two-Factor Authentication", "Login Alerts", "Session Management", "API Keys"].map((item) => (
        <div key={item} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
          <div className="text-white text-sm">{item}</div>
          <Btn variant="outline" size="sm">Manage</Btn>
        </div>
      ))}
    </div>
  </div>
);

export const AdminRolesVerificationOfficer = () => (
  <GenericTablePage
    title="Verification Officers"
    breadcrumb={["Dashboard", "Roles", "Verification Officer"]}
    addLabel="Assign Officer"
    addPath="#"
    columns={[
      { key: "name", label: "Officer" },
      { key: "email", label: "Email" },
      { key: "assigned", label: "Queue Assigned" },
      { key: "completed", label: "Completed Today" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={[
      { name: "Babajide Olaolu", email: "babajide@propati.ng", assigned: 5, completed: 3, status: "Active" },
      { name: "Chisom Nwosu", email: "chisom@propati.ng", assigned: 4, completed: 4, status: "Active" },
    ] as unknown as Record<string, unknown>[]}
  />
);

export const AdminOverview = AdminHome;

function AdminHome() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Platform Overview" breadcrumb={["Dashboard", "Overview"]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value="3,180" trend="up" trendValue="+290" icon={Users} />
        <StatCard label="Active Listings" value="50,847" trend="up" icon={Users} />
        <StatCard label="Revenue (Aug)" value="₦8.4M" trend="up" trendValue="+23%" icon={DollarSign} />
        <StatCard label="Verifications" value="12 pending" icon={Shield} />
      </div>
    </div>
  );
}
