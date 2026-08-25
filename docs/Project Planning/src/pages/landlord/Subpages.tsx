import { Link } from "react-router";
import { Plus, ArrowRight, BarChart3 } from "lucide-react";
import { GenericTablePage, GenericFormPage, GenericMessagePage, GenericNotificationsPage, GenericProfilePage, GenericVerificationPage } from "../../components/GenericPage";
import { PageHeader, StatCard, StatusBadge, DataTable, Badge, Btn } from "../../components/ui";
import {
  mockTenants, mockApplications, mockMaintenanceTickets, mockInvoices,
  mockTransactions, listings as mockListings,
} from "../../data/mock";

// ─── Properties ───────────────────────────────────────────────────────────────
export function LandlordProperties() {
  const data = [
    { id: "P-001", name: "14 Bourdillon Road", type: "Residential", units: 6, status: "Active", revenue: "₦12.4M" },
    { id: "P-002", name: "7 Adetokunbo Ademola", type: "Commercial", units: 1, status: "Active", revenue: "₦8.0M" },
    { id: "P-003", name: "22 Banana Island", type: "Residential", units: 4, status: "Under Review", revenue: "₦18.0M" },
    { id: "P-004", name: "5 Ozumba Mbadiwe", type: "Short-Let", units: 2, status: "Active", revenue: "₦6.2M" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Properties"
      description="All properties in your portfolio"
      breadcrumb={["Dashboard", "Properties"]}
      addLabel="Add Property"
      addPath="/dashboard/landlord/properties/new"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "name", label: "Property", render: (r) => <span className="text-white">{String(r.name)}</span> },
        { key: "type", label: "Type" },
        { key: "units", label: "Units" },
        { key: "revenue", label: "Annual Revenue", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.revenue)}</span> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

// ─── Listings ─────────────────────────────────────────────────────────────────
export function LandlordListings() {
  const data = mockListings.map((l) => ({
    id: `L-${l.id}`, title: l.title, type: l.type, price: `₦${(l.price / 1000000).toFixed(1)}M`, verified: l.verified ? "Yes" : "No", status: l.verified ? "Active" : "Pending",
  })) as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Listings"
      description="All your active property listings"
      breadcrumb={["Dashboard", "Listings"]}
      addLabel="New Listing"
      addPath="/dashboard/landlord/listing/new"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "title", label: "Listing", render: (r) => <span className="text-white">{String(r.title)}</span> },
        { key: "type", label: "Type", render: (r) => <Badge variant={String(r.type) as "rent" | "sale"}>{String(r.type)}</Badge> },
        { key: "price", label: "Price", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.price)}</span> },
        { key: "verified", label: "Verified" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

// ─── Tenants ──────────────────────────────────────────────────────────────────
export function LandlordTenants() {
  return (
    <GenericTablePage
      title="Tenants"
      description="All current and past tenants"
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

// ─── Applications ─────────────────────────────────────────────────────────────
export function LandlordApplications() {
  return (
    <GenericTablePage
      title="Applications"
      description="Tenant applications awaiting review"
      breadcrumb={["Dashboard", "Applications"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "applicant", label: "Applicant", render: (r) => <span className="text-white">{String(r.applicant)}</span> },
        { key: "property", label: "Property" },
        { key: "date", label: "Date" },
        { key: "score", label: "Score", render: (r) => (
          <span className={`font-bold ${Number(r.score) >= 80 ? "text-emerald-400" : Number(r.score) >= 60 ? "text-amber-400" : "text-red-400"}`}>
            {String(r.score)}
          </span>
        )},
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockApplications as unknown as Record<string, unknown>[]}
    />
  );
}

// ─── Financials ───────────────────────────────────────────────────────────────
export function LandlordFinancials() {
  const revenueData = [3.2, 4.1, 3.8, 4.5, 4.9, 5.1, 4.7, 5.4, 5.2, 5.9, 5.5, 6.1];
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Financials"
        description="Your revenue, payments, and financial reports"
        breadcrumb={["Dashboard", "Financials"]}
        actions={
          <div className="flex gap-2">
            <Link to="/dashboard/landlord/financials/reports" className="px-4 py-2 text-sm border border-zinc-800 text-zinc-300 rounded-lg hover:text-white transition-colors">
              Reports
            </Link>
            <Link to="/dashboard/landlord/financials/invoices" className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              View Invoices
            </Link>
          </div>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue (YTD)" value="₦58.3M" trend="up" trendValue="+22%" icon={BarChart3} />
        <StatCard label="Outstanding" value="₦3.6M" trend="down" trendValue="-8%" icon={BarChart3} />
        <StatCard label="This Month" value="₦6.1M" trend="up" trendValue="+12%" icon={BarChart3} />
        <StatCard label="Expenses (YTD)" value="₦4.2M" trend="flat" icon={BarChart3} />
      </div>
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Monthly Revenue</h3>
        <div className="flex items-end gap-1.5 h-40">
          {revenueData.map((v, i) => {
            const max = Math.max(...revenueData);
            const pct = (v / max) * 100;
            const isLast = i === revenueData.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className={`text-[9px] ${isLast ? "text-emerald-400" : "text-zinc-700"}`}>₦{v}M</span>
                <div
                  className="w-full rounded-t-sm"
                  style={{ height: `${pct}%`, background: isLast ? "#10b981" : "rgba(255,255,255,0.07)", minHeight: 4 }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-zinc-700">
          {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Recent Transactions</h3>
        <DataTable
          columns={[
            { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
            { key: "type", label: "Type" },
            { key: "amount", label: "Amount", render: (r) => <span className="text-white font-semibold">{String(r.amount)}</span> },
            { key: "from", label: "From" },
            { key: "date", label: "Date" },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
          ]}
          data={mockTransactions as unknown as Record<string, unknown>[]}
        />
      </div>
    </div>
  );
}

// ─── Maintenance ──────────────────────────────────────────────────────────────
export function LandlordMaintenance() {
  return (
    <GenericTablePage
      title="Maintenance"
      description="Track and manage property maintenance requests"
      breadcrumb={["Dashboard", "Maintenance"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "title", label: "Issue", render: (r) => <span className="text-white">{String(r.title)}</span> },
        { key: "unit", label: "Unit" },
        { key: "tenant", label: "Tenant" },
        { key: "priority", label: "Priority", render: (r) => (
          <span className={`text-xs font-medium ${
            r.priority === "Critical" ? "text-red-400" : r.priority === "High" ? "text-amber-400" : "text-zinc-400"
          }`}>{String(r.priority)}</span>
        )},
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockMaintenanceTickets as unknown as Record<string, unknown>[]}
    />
  );
}

// ─── Generic landlord pages ───────────────────────────────────────────────────
export const LandlordMessages = () => <GenericMessagePage title="Messages" />;
export const LandlordNotifications = () => <GenericNotificationsPage />;
export const LandlordProfile = () => <GenericProfilePage name="Emeka Nwosu" role="Landlord" email="emeka@propati.ng" />;
export const LandlordVerification = () => <GenericVerificationPage />;

export function LandlordInvoices() {
  return (
    <GenericTablePage
      title="Invoices"
      description="All tenant invoices"
      breadcrumb={["Dashboard", "Invoices"]}
      addLabel="Create Invoice"
      addPath="#"
      columns={[
        { key: "id", label: "Invoice #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
        { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
        { key: "issued", label: "Issued" },
        { key: "due", label: "Due" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockInvoices as unknown as Record<string, unknown>[]}
    />
  );
}

const receiptData = [
  { id: "RCP-001", description: "Rent Payment — Aug 2026 — Flat 3A", amount: "₦200,000", date: "Aug 1, 2026", from: "Chidi Okafor", status: "Issued" },
  { id: "RCP-002", description: "Rent Payment — Jul 2026 — Flat 3A", amount: "₦200,000", date: "Jul 1, 2026", from: "Chidi Okafor", status: "Issued" },
  { id: "RCP-003", description: "Shortlet Booking — Aug 10-15", amount: "₦425,000", date: "Aug 10, 2026", from: "Bola Adekunle", status: "Issued" },
] as Record<string, unknown>[];

export function LandlordReceipts() {
  return (
    <GenericTablePage
      title="Receipts"
      description="Payment receipts issued to tenants"
      breadcrumb={["Dashboard", "Receipts"]}
      columns={[
        { key: "id", label: "Receipt #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
        { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
        { key: "from", label: "From" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={receiptData}
    />
  );
}

const statementData = [
  { id: "STM-001", period: "August 2026", totalIn: "₦6.1M", totalOut: "₦420K", net: "₦5.68M", status: "Available" },
  { id: "STM-002", period: "July 2026", totalIn: "₦5.5M", totalOut: "₦390K", net: "₦5.11M", status: "Available" },
  { id: "STM-003", period: "June 2026", totalIn: "₦5.9M", totalOut: "₦450K", net: "₦5.45M", status: "Available" },
] as Record<string, unknown>[];

export function LandlordStatements() {
  return (
    <GenericTablePage
      title="Statements"
      description="Monthly financial statements"
      breadcrumb={["Dashboard", "Statements"]}
      columns={[
        { key: "id", label: "Statement #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "period", label: "Period", render: (r) => <span className="text-white">{String(r.period)}</span> },
        { key: "totalIn", label: "Total In", render: (r) => <span className="text-emerald-400">{String(r.totalIn)}</span> },
        { key: "totalOut", label: "Total Out", render: (r) => <span className="text-red-400">{String(r.totalOut)}</span> },
        { key: "net", label: "Net", render: (r) => <span className="text-white font-bold">{String(r.net)}</span> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={statementData}
    />
  );
}

export function LandlordLeases() {
  const data = [
    { id: "LS-001", tenant: "Chidi Okafor", unit: "Flat 3A", start: "Jan 1, 2026", end: "Dec 31, 2026", rent: "₦2.4M/yr", status: "Active" },
    { id: "LS-002", tenant: "Ngozi Eze", unit: "Flat 1B", start: "Jan 1, 2026", end: "Dec 31, 2026", rent: "₦1.8M/yr", status: "Overdue" },
    { id: "LS-003", tenant: "Tunde Bakare", unit: "Penthouse", start: "Apr 1, 2026", end: "Mar 31, 2027", rent: "₦7.2M/yr", status: "Active" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Leases"
      breadcrumb={["Dashboard", "Leases"]}
      columns={[
        { key: "id", label: "Lease #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "tenant", label: "Tenant", render: (r) => <span className="text-white">{String(r.tenant)}</span> },
        { key: "unit", label: "Unit" },
        { key: "start", label: "Start" },
        { key: "end", label: "End" },
        { key: "rent", label: "Rent", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.rent)}</span> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

export function LandlordAgreements() {
  const data = [
    { id: "AGR-001", type: "Tenancy Agreement", party: "Chidi Okafor", property: "Flat 3A", signed: "Jan 1, 2026", status: "Active" },
    { id: "AGR-002", type: "Tenancy Agreement", party: "Ngozi Eze", property: "Flat 1B", signed: "Jan 1, 2026", status: "Active" },
    { id: "AGR-003", type: "Agent Agreement", party: "Yetunde Afolabi", property: "—", signed: "Mar 15, 2026", status: "Active" },
  ] as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Agreements"
      breadcrumb={["Dashboard", "Agreements"]}
      addLabel="New Agreement"
      addPath="/dashboard/landlord/agreements/new"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
        { key: "party", label: "Party" },
        { key: "property", label: "Property" },
        { key: "signed", label: "Signed" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data}
    />
  );
}

export const LandlordPortfolio = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Portfolio" description="Overview of all your properties and performance." breadcrumb={["Dashboard", "Portfolio"]} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Total Properties" value="12" icon={BarChart3} />
      <StatCard label="Total Units" value="34" icon={BarChart3} />
      <StatCard label="Annual Revenue" value="₦58.3M" trend="up" trendValue="+22%" icon={BarChart3} />
      <StatCard label="Net Yield" value="7.2%" trend="up" icon={BarChart3} />
    </div>
    <div className="glass-card p-5">
      <p className="text-zinc-500 text-sm text-center py-8">Portfolio analytics chart would render here.</p>
    </div>
  </div>
);

export const LandlordRent = () => (
  <GenericTablePage
    title="Rent Collection"
    breadcrumb={["Dashboard", "Rent"]}
    columns={[
      { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "name", label: "Tenant", render: (r) => <span className="text-white">{String(r.name)}</span> },
      { key: "unit", label: "Unit" },
      { key: "rent", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.rent)}</span> },
      { key: "dueDate", label: "Due Date" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockTenants as unknown as Record<string, unknown>[]}
  />
);

export const LandlordScreening = () => (
  <GenericTablePage
    title="Tenant Screening"
    breadcrumb={["Dashboard", "Screening"]}
    columns={[
      { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "applicant", label: "Applicant", render: (r) => <span className="text-white">{String(r.applicant)}</span> },
      { key: "property", label: "Property" },
      { key: "date", label: "Date" },
      { key: "score", label: "Score" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockApplications as unknown as Record<string, unknown>[]}
  />
);

export const LandlordAgents = () => (
  <GenericTablePage
    title="Agents"
    description="Agents assigned to your properties"
    breadcrumb={["Dashboard", "Agents"]}
    columns={[
      { key: "name", label: "Agent", render: (r) => <span className="text-white">{String(r.name)}</span> },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      { key: "joined", label: "Joined" },
      { key: "listings", label: "Listings" },
    ]}
    data={[
      { name: "Yetunde Afolabi", email: "yetunde@propati.ng", role: "Agent", status: "Verified", joined: "Feb 2025", listings: 23 },
    ] as unknown as Record<string, unknown>[]}
  />
);

export const LandlordVacancies = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Vacancies" description="Units currently available for rent." breadcrumb={["Dashboard", "Vacancies"]} />
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { unit: "Flat 1B", type: "1 Bedroom", floor: 1, asking: "₦2.0M/yr", vacant_since: "Aug 1, 2026" },
        { unit: "Studio A", type: "Studio", floor: 4, asking: "₦1.2M/yr", vacant_since: "Jul 15, 2026" },
      ].map((v) => (
        <div key={v.unit} className="glass-card p-5">
          <div className="text-white font-bold">{v.unit}</div>
          <div className="text-zinc-500 text-sm">{v.type} · Floor {v.floor}</div>
          <div className="text-emerald-400 font-semibold mt-2">{v.asking}</div>
          <div className="text-zinc-700 text-xs mt-1">Vacant since {v.vacant_since}</div>
          <div className="mt-3">
            <Link to="/dashboard/landlord/listing/new" className="text-xs text-emerald-400 hover:text-emerald-300">
              Create listing →
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LandlordShortLet = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Short-Let Management" description="Manage short-let bookings and availability." breadcrumb={["Dashboard", "Short-Let"]} />
    <div className="glass-card p-5">
      <p className="text-zinc-500 text-sm text-center py-8">Short-let calendar and booking management would render here.</p>
    </div>
  </div>
);

export const LandlordRevenueForecast = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Revenue Forecast" description="12-month revenue projection for your portfolio." breadcrumb={["Dashboard", "Revenue Forecast"]} />
    <div className="glass-card p-5">
      <p className="text-zinc-500 text-sm text-center py-8">Revenue forecast chart and scenario builder would render here.</p>
    </div>
  </div>
);

export const LandlordAddListing = () => (
  <GenericFormPage
    title="Add New Listing"
    description="Create a new property listing"
    breadcrumb={["Dashboard", "Listings", "New"]}
    fields={[
      { label: "Property Title", type: "text", placeholder: "e.g. Luxury 3BR Apartment, Ikoyi", required: true, span: 2 },
      { label: "Listing Type", type: "select", options: ["Rent", "Sale", "Lease", "Short-Let", "Room Share"], required: true },
      { label: "Price", type: "number", placeholder: "e.g. 2500000", required: true },
      { label: "Bedrooms", type: "select", options: ["Studio", "1", "2", "3", "4", "5+"] },
      { label: "Bathrooms", type: "select", options: ["1", "2", "3", "4", "5+"] },
      { label: "Size (sq ft)", type: "number", placeholder: "e.g. 1200" },
      { label: "Address", type: "text", placeholder: "Full address", required: true, span: 2 },
      { label: "Description", type: "textarea", placeholder: "Describe the property…", span: 2 },
    ]}
    submitLabel="Publish Listing"
  />
);

export const LandlordNewAgreement = () => (
  <GenericFormPage
    title="New Agreement"
    breadcrumb={["Dashboard", "Agreements", "New"]}
    fields={[
      { label: "Agreement Type", type: "select", options: ["Tenancy Agreement", "Agent Agreement", "Service Agreement"], required: true, span: 2 },
      { label: "Party Name", type: "text", placeholder: "Full legal name", required: true },
      { label: "Party Email", type: "email", placeholder: "party@email.com", required: true },
      { label: "Property / Unit", type: "text", placeholder: "e.g. Flat 3A, 14 Bourdillon Road" },
      { label: "Start Date", type: "date", required: true },
      { label: "End Date", type: "date", required: true },
      { label: "Monthly Rent (₦)", type: "number", placeholder: "e.g. 200000" },
      { label: "Notes", type: "textarea", placeholder: "Additional terms or conditions…", span: 2 },
    ]}
    submitLabel="Generate Agreement"
  />
);

export function LandlordFinancialReports() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Financial Reports" breadcrumb={["Dashboard", "Financials", "Reports"]} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Income Statement", "Expense Report", "Net Yield Report", "Tax Summary", "Occupancy Report", "Portfolio Performance"].map((r) => (
          <div key={r} className="glass-card p-5 hover:border-white/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 size={15} className="text-emerald-400" />
              </div>
              <span className="text-white font-medium text-sm">{r}</span>
            </div>
            <p className="text-zinc-600 text-xs">August 2026 · PDF / Excel</p>
            <button className="mt-3 text-xs text-emerald-400 hover:text-emerald-300">Download →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandlordFinancialInvoices() {
  return <LandlordInvoices />;
}

export function LandlordFinancialOverdue() {
  const data = mockInvoices.filter((i) => i.status === "Overdue") as unknown as Record<string, unknown>[];
  return (
    <GenericTablePage
      title="Overdue Payments"
      description="Payments past their due date"
      breadcrumb={["Dashboard", "Financials", "Overdue"]}
      columns={[
        { key: "id", label: "Invoice #", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "description", label: "Description", render: (r) => <span className="text-white">{String(r.description)}</span> },
        { key: "amount", label: "Amount", render: (r) => <span className="text-red-400 font-semibold">{String(r.amount)}</span> },
        { key: "due", label: "Due Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={data.length ? data : mockInvoices as unknown as Record<string, unknown>[]}
    />
  );
}

export const LandlordFinancialWithdrawals = () => (
  <GenericTablePage
    title="Withdrawals"
    breadcrumb={["Dashboard", "Financials", "Withdrawals"]}
    columns={[
      { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
      { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
      { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
      { key: "date", label: "Date" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={mockTransactions as unknown as Record<string, unknown>[]}
  />
);

export const LandlordFinancialForecasting = LandlordRevenueForecast;
export const LandlordCommercialLeases = LandlordLeases;

export const LandlordPropertyDetail = () => (
  <div className="p-6">
    <PageHeader title="Property Detail" breadcrumb={["Dashboard", "Properties", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Property detail view with units, images, and financials.</p>
    </div>
  </div>
);

export const LandlordListingDetail = () => (
  <div className="p-6">
    <PageHeader title="Listing Detail" breadcrumb={["Dashboard", "Listings", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Listing detail with gallery, contact card, and inquiries.</p>
    </div>
  </div>
);

export const LandlordTenantDetail = () => (
  <div className="p-6">
    <PageHeader title="Tenant Detail" breadcrumb={["Dashboard", "Tenants", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Tenant profile, lease history, and payment record.</p>
    </div>
  </div>
);

export const LandlordApplicationDetail = () => (
  <div className="p-6">
    <PageHeader title="Application Detail" breadcrumb={["Dashboard", "Applications", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Applicant profile, screening score, and approval actions.</p>
    </div>
  </div>
);

export const LandlordAgreementDetail = () => (
  <div className="p-6">
    <PageHeader title="Agreement" breadcrumb={["Dashboard", "Agreements", "View"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Agreement document viewer with signing and download options.</p>
    </div>
  </div>
);

export const LandlordTurnover = () => (
  <div className="p-6">
    <PageHeader title="Turnover" breadcrumb={["Dashboard", "Turnover"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Tenant turnover statistics and move-out management.</p>
    </div>
  </div>
);

export function SharedPayments() {
  return (
    <GenericTablePage
      title="Payments"
      breadcrumb={["Dashboard", "Payments"]}
      addLabel="New Payment"
      addPath="#"
      columns={[
        { key: "id", label: "Ref", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "type", label: "Type", render: (r) => <span className="text-white">{String(r.type)}</span> },
        { key: "amount", label: "Amount", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.amount)}</span> },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={mockTransactions as unknown as Record<string, unknown>[]}
    />
  );
}

export const SharedNewPayment = () => (
  <GenericFormPage
    title="New Payment"
    breadcrumb={["Dashboard", "Payments", "New"]}
    fields={[
      { label: "Payment Type", type: "select", options: ["Rent", "Deposit", "Maintenance Fee", "Agent Commission"], required: true },
      { label: "Amount (₦)", type: "number", placeholder: "0.00", required: true },
      { label: "Recipient", type: "text", placeholder: "Name or account number", required: true },
      { label: "Reference", type: "text", placeholder: "Optional reference" },
      { label: "Notes", type: "textarea", span: 2, placeholder: "Optional notes…" },
    ]}
    submitLabel="Process Payment"
  />
);

export const SharedPaymentDetail = () => (
  <div className="p-6">
    <PageHeader title="Payment Detail" breadcrumb={["Dashboard", "Payments", "Detail"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Payment details, status, and receipt download.</p>
    </div>
  </div>
);

export const SharedPaymentReceipt = () => (
  <div className="p-6 max-w-md mx-auto">
    <PageHeader title="Payment Receipt" breadcrumb={["Dashboard", "Payments", "Receipt"]} />
    <div className="glass-card p-8 text-center mt-4">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <div className="text-white font-black text-3xl mb-1">₦200,000</div>
      <div className="text-zinc-500 text-sm mb-4">Payment Confirmed</div>
      <div className="text-zinc-600 text-xs font-mono">TXN-{Math.floor(Math.random() * 99999 + 10000)}</div>
      <Btn variant="secondary" className="mt-6">Download PDF</Btn>
    </div>
  </div>
);
