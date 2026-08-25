import { GenericTablePage, GenericFormPage, GenericMessagePage, GenericNotificationsPage, GenericProfilePage } from "../../components/GenericPage";
import { PageHeader, StatCard, StatusBadge } from "../../components/ui";
import { mockDeals, mockTransactions, mockApplications, listings as mockListings } from "../../data/mock";
import { DollarSign, TrendingUp, Star } from "lucide-react";

const listingData = mockListings.map((l) => ({
  id: `L-${l.id}`, title: l.title, type: l.type,
  price: `₦${(l.price / 1_000_000).toFixed(1)}M`, status: l.verified ? "Active" : "Pending", views: Math.floor(Math.random() * 300 + 50),
})) as Record<string, unknown>[];

const clientData = [
  { id: "CLT-001", name: "Mr. Adamu Bello", type: "Buyer", interest: "3BR Apartment", budget: "₦5M", status: "Active", added: "Aug 1, 2026" },
  { id: "CLT-002", name: "Mrs. Folake Obi", type: "Buyer", interest: "4BR House Lekki", budget: "₦950M", status: "Active", added: "Jul 22, 2026" },
  { id: "CLT-003", name: "Zenith Corp", type: "Lessee", interest: "Commercial VI", budget: "₦25M/yr", status: "Active", added: "Jul 15, 2026" },
  { id: "CLT-004", name: "Miss Titi Alabi", type: "Tenant", interest: "2BR Flat Gbagada", budget: "₦2M/yr", status: "Active", added: "Aug 10, 2026" },
] as Record<string, unknown>[];

export function AgentListings() {
  return (
    <GenericTablePage
      title="My Listings"
      breadcrumb={["Dashboard", "Listings"]}
      addLabel="Add Listing"
      addPath="#"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "title", label: "Property", render: (r) => <span className="text-white">{String(r.title)}</span> },
        { key: "type", label: "Type" },
        { key: "price", label: "Price", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.price)}</span> },
        { key: "views", label: "Views" },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={listingData}
    />
  );
}

export function AgentClients() {
  return (
    <GenericTablePage
      title="Clients"
      breadcrumb={["Dashboard", "Clients"]}
      addLabel="Add Client"
      addPath="#"
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "name", label: "Client", render: (r) => <span className="text-white font-medium">{String(r.name)}</span> },
        { key: "type", label: "Type" },
        { key: "interest", label: "Looking For" },
        { key: "budget", label: "Budget", render: (r) => <span className="text-emerald-400">{String(r.budget)}</span> },
        { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
      ]}
      data={clientData}
    />
  );
}

export function AgentPipeline() {
  const stages = ["Viewing Scheduled", "Offer Made", "Negotiation", "Due Diligence", "Closed"];
  const byStage = stages.map((stage) => ({
    stage,
    deals: mockDeals.filter((d) => d.stage === stage),
  }));

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Deal Pipeline" breadcrumb={["Dashboard", "Pipeline"]} />
      <div className="grid grid-cols-5 gap-3 overflow-x-auto">
        {byStage.map((col) => (
          <div key={col.stage} className="min-w-[160px]">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 px-1">
              {col.stage} ({col.deals.length})
            </div>
            <div className="space-y-2">
              {col.deals.map((deal) => (
                <div key={deal.id} className="glass-card p-3">
                  <div className="text-white text-xs font-medium leading-tight">{deal.property}</div>
                  <div className="text-zinc-600 text-[10px] mt-0.5">{deal.client}</div>
                  <div className="text-emerald-400 text-xs font-semibold mt-1">{deal.value}</div>
                </div>
              ))}
              {col.deals.length === 0 && (
                <div className="border border-dashed border-zinc-800 rounded-xl p-3 text-center text-zinc-700 text-xs">
                  No deals
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentDeals() {
  return (
    <GenericTablePage
      title="Deals"
      breadcrumb={["Dashboard", "Deals"]}
      columns={[
        { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
        { key: "property", label: "Property", render: (r) => <span className="text-white">{String(r.property)}</span> },
        { key: "client", label: "Client" },
        { key: "value", label: "Value", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.value)}</span> },
        { key: "probability", label: "Prob.", render: (r) => <span>{String(r.probability)}%</span> },
        { key: "stage", label: "Stage", render: (r) => <StatusBadge status={String(r.stage)} /> },
      ]}
      data={mockDeals as unknown as Record<string, unknown>[]}
    />
  );
}

export function AgentCommissions() {
  const commData = [
    { id: "COM-001", property: "3BR Apartment, Ikoyi", client: "Chidi Okafor", sale: "₦4.5M", rate: "5%", commission: "₦225,000", date: "Aug 1, 2026", status: "Paid" },
    { id: "COM-002", property: "Commercial Office, VI", client: "Zenith Corp", sale: "₦24M/yr", rate: "7.5%", commission: "₦1.8M", date: "Jul 31, 2026", status: "Pending" },
    { id: "COM-003", property: "2BR Flat, Gbagada", client: "Titi Alabi", sale: "₦1.8M", rate: "5%", commission: "₦90,000", date: "Jul 15, 2026", status: "Paid" },
  ] as Record<string, unknown>[];

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Commissions" breadcrumb={["Dashboard", "Commissions"]} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Earned (Aug)" value="₦2.1M" trend="up" trendValue="+18%" icon={DollarSign} />
        <StatCard label="Pending" value="₦1.8M" icon={TrendingUp} />
        <StatCard label="YTD Total" value="₦12.4M" trend="up" trendValue="+34%" icon={DollarSign} />
      </div>
      <GenericTablePage
        title=""
        breadcrumb={[]}
        columns={[
          { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs text-zinc-500">{String(r.id)}</span> },
          { key: "property", label: "Property", render: (r) => <span className="text-white">{String(r.property)}</span> },
          { key: "client", label: "Client" },
          { key: "commission", label: "Commission", render: (r) => <span className="text-emerald-400 font-semibold">{String(r.commission)}</span> },
          { key: "date", label: "Date" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
        ]}
        data={commData}
      />
    </div>
  );
}

export const AgentMessages = () => <GenericMessagePage title="Messages" />;
export const AgentNotifications = () => <GenericNotificationsPage />;
export const AgentProfile = () => <GenericProfilePage name="Yetunde Afolabi" role="Agent" email="yetunde@propati.ng" />;

export const AgentVerifications = () => (
  <GenericTablePage
    title="Verifications"
    breadcrumb={["Dashboard", "Verifications"]}
    columns={[
      { key: "id", label: "ID" },
      { key: "property", label: "Property" },
      { key: "owner", label: "Owner" },
      { key: "type", label: "Type" },
      { key: "submitted", label: "Submitted" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={[
      { id: "VRF-201", property: "3BR Flat, Ikoyi", owner: "Emeka Nwosu", type: "Property Docs", submitted: "Aug 20, 2026", status: "Approved" },
      { id: "VRF-202", property: "Studio, VI", owner: "Bola Ade", type: "Identity", submitted: "Aug 19, 2026", status: "Pending Review" },
    ] as unknown as Record<string, unknown>[]}
  />
);

export const AgentInspections = () => (
  <GenericTablePage
    title="Inspections"
    breadcrumb={["Dashboard", "Inspections"]}
    addLabel="Schedule Inspection"
    addPath="/dashboard/agent/inspections/new"
    columns={[
      { key: "id", label: "ID" },
      { key: "property", label: "Property" },
      { key: "client", label: "Client" },
      { key: "date", label: "Scheduled" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={[
      { id: "INS-001", property: "3BR Apt, Ikoyi", client: "Mr. Adamu Bello", date: "Aug 25, 2026 2pm", status: "Pending" },
      { id: "INS-002", property: "Commercial VI", client: "Zenith Corp", date: "Aug 26, 2026 11am", status: "Pending" },
      { id: "INS-003", property: "2BR Flat, Gbagada", client: "Titi Alabi", date: "Aug 20, 2026 3pm", status: "Completed" },
    ] as unknown as Record<string, unknown>[]}
  />
);

export const AgentNewInspection = () => (
  <GenericFormPage
    title="Schedule Inspection"
    breadcrumb={["Dashboard", "Inspections", "New"]}
    fields={[
      { label: "Property", type: "select", options: ["3BR Apt, Ikoyi", "Studio, VI", "Commercial, VI"], required: true, span: 2 },
      { label: "Client Name", type: "text", placeholder: "Client full name", required: true },
      { label: "Client Phone", type: "tel", placeholder: "+234 800 000 0000", required: true },
      { label: "Inspection Date", type: "date", required: true },
      { label: "Time", type: "select", options: ["9:00am", "10:00am", "11:00am", "12:00pm", "2:00pm", "3:00pm", "4:00pm"] },
      { label: "Notes", type: "textarea", span: 2 },
    ]}
    submitLabel="Schedule Inspection"
  />
);

export const AgentInspectionReport = () => (
  <div className="p-6 max-w-2xl">
    <PageHeader title="Inspection Report" breadcrumb={["Dashboard", "Inspections", "Report"]} />
    <div className="glass-card p-6 mt-4">
      <p className="text-zinc-500 text-sm">Detailed inspection report with photos and findings.</p>
    </div>
  </div>
);

export const AgentMarket = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Market Intelligence" breadcrumb={["Dashboard", "Market"]} />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Avg Rent — Ikoyi 3BR", value: "₦3.8M/yr", trend: "+12%" },
        { label: "Avg Price — VI 2BR", value: "₦145M", trend: "+8%" },
        { label: "Vacancy Rate — Lekki", value: "4.2%", trend: "-0.8%" },
        { label: "Days on Market", value: "18 days", trend: "-3 days" },
      ].map((item) => (
        <div key={item.label} className="glass-card p-5">
          <div className="text-xs text-zinc-500 mb-2">{item.label}</div>
          <div className="text-white font-bold text-xl">{item.value}</div>
          <div className="text-emerald-400 text-xs mt-1">{item.trend}</div>
        </div>
      ))}
    </div>
  </div>
);

export const AgentSchedule = () => (
  <div className="p-6 space-y-5">
    <PageHeader title="Schedule" breadcrumb={["Dashboard", "Schedule"]} />
    <div className="glass-card p-5">
      <p className="text-zinc-500 text-sm text-center py-8">Calendar view with appointments, inspections, and viewings.</p>
    </div>
  </div>
);

export const AgentReputation = () => (
  <div className="p-6 space-y-5 max-w-2xl">
    <PageHeader title="Reputation & Reviews" breadcrumb={["Dashboard", "Reputation"]} />
    <div className="grid grid-cols-3 gap-4">
      <StatCard label="Overall Rating" value="4.9 / 5" icon={Star} />
      <StatCard label="Total Reviews" value="128" icon={Star} />
      <StatCard label="Response Rate" value="97%" icon={Star} />
    </div>
    <div className="glass-card p-5 space-y-4">
      {[
        { author: "Chidi Okafor", rating: 5, review: "Yetunde was incredibly professional and found us a perfect apartment in 3 days.", date: "Aug 15, 2026" },
        { author: "Folake Obi", rating: 5, review: "Best agent I've worked with. Very knowledgeable about the Lagos market.", date: "Jul 28, 2026" },
      ].map((r, i) => (
        <div key={i} className="border-b border-white/[0.06] pb-4 last:border-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold flex items-center justify-center">
              {r.author.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{r.author}</div>
              <div className="text-zinc-600 text-xs">{r.date}</div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} size={11} className="fill-emerald-500 text-emerald-500" />
              ))}
            </div>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">{r.review}</p>
        </div>
      ))}
    </div>
  </div>
);

export const AgentPayments = () => (
  <GenericTablePage
    title="Payments"
    breadcrumb={["Dashboard", "Payments"]}
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

export const AgentWithdrawals = AgentPayments;
export const AgentInvoices = AgentPayments;
export const AgentReceipts = AgentPayments;
export const AgentStatements = AgentPayments;
export const AgentCommissionLedger = AgentCommissions;
export const AgentEarningsShortLet = AgentCommissions;
export const AgentInvites = () => (
  <GenericTablePage
    title="Invites"
    breadcrumb={["Dashboard", "Invites"]}
    addLabel="Send Invite"
    addPath="#"
    columns={[
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "date", label: "Sent" },
      { key: "status", label: "Status", render: (r) => <StatusBadge status={String(r.status)} /> },
    ]}
    data={[
      { email: "kola@example.com", role: "Client", date: "Aug 20, 2026", status: "Pending" },
      { email: "bade@example.com", role: "Client", date: "Aug 18, 2026", status: "Accepted" },
    ] as unknown as Record<string, unknown>[]}
  />
);

export const AgentLicenseVerification = () => (
  <div className="p-6 max-w-xl">
    <PageHeader title="License Verification" breadcrumb={["Dashboard", "Verifications", "License"]} />
    <div className="glass-card p-6 mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "License Number", value: "NIESV-LGS-2024-8821" },
          { label: "Issuing Body", value: "NIESV Lagos Chapter" },
          { label: "Issue Date", value: "Jan 15, 2024" },
          { label: "Expiry Date", value: "Jan 14, 2027" },
          { label: "Status", value: "Active & Valid" },
          { label: "License Type", value: "Full Estate Agent" },
        ].map((item) => (
          <div key={item.label}>
            <div className="text-xs text-zinc-600 mb-1">{item.label}</div>
            <div className="text-white text-sm font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const AgentSell = AgentListings;
export const AgentBuy = AgentClients;
export const AgentClientDetail = () => (
  <div className="p-6">
    <PageHeader title="Client Detail" breadcrumb={["Dashboard", "Clients", "Detail"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Client profile, requirements, viewing history, and interactions.</p></div>
  </div>
);
export const AgentListingDetail = () => (
  <div className="p-6">
    <PageHeader title="Listing Detail" breadcrumb={["Dashboard", "Listings", "Detail"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Listing performance, inquiries, and views analytics.</p></div>
  </div>
);
export const AgentDealDetail = () => (
  <div className="p-6">
    <PageHeader title="Deal Detail" breadcrumb={["Dashboard", "Deals", "Detail"]} />
    <div className="glass-card p-6 mt-4"><p className="text-zinc-500 text-sm">Deal timeline, documents, and negotiation history.</p></div>
  </div>
);
export const AgentNewAgreement = () => (
  <GenericFormPage
    title="New Agreement"
    breadcrumb={["Dashboard", "Agreements", "New"]}
    fields={[
      { label: "Agreement Type", type: "select", options: ["Agency Agreement", "Buyer's Agent", "Listing Agreement", "Commission Agreement"], required: true, span: 2 },
      { label: "Client", type: "text", required: true },
      { label: "Property", type: "text", required: true },
      { label: "Commission Rate (%)", type: "number" },
      { label: "Start Date", type: "date" },
      { label: "End Date", type: "date" },
    ]}
    submitLabel="Generate Agreement"
  />
);
