import { useState } from "react";
import { Link } from "react-router";
import { Plus, Download, Filter } from "lucide-react";
import { PageHeader, DataTable, StatusBadge, SearchInput, Btn, EmptyState } from "./ui";
import type { Column } from "./ui";

// ─── GenericTablePage ─────────────────────────────────────────────────────────
export function GenericTablePage<T extends Record<string, unknown>>({
  title,
  description,
  breadcrumb,
  columns,
  data,
  addLabel,
  addPath,
  emptyMessage = "No records found",
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  columns: Column<T>[];
  data: T[];
  addLabel?: string;
  addPath?: string;
  emptyMessage?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = data.filter((row) =>
    Object.values(row).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title={title}
        description={description}
        breadcrumb={breadcrumb}
        actions={
          <div className="flex items-center gap-2">
            {addLabel && addPath && (
              <Link
                to={addPath}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus size={14} />
                {addLabel}
              </Link>
            )}
            <button className="p-2 text-zinc-500 border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-600 transition-colors">
              <Download size={14} />
            </button>
          </div>
        }
      />
      <div className="flex items-center gap-3">
        <div className="max-w-xs w-full">
          <SearchInput
            placeholder={`Search ${title.toLowerCase()}…`}
            value={search}
            onChange={setSearch}
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-600 transition-colors">
          <Filter size={12} />
          Filter
        </button>
        <span className="text-xs text-zinc-600 ml-auto">
          {filtered.length} {filtered.length === 1 ? "result" : "results"}
        </span>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No records found" description={emptyMessage} />
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </div>
  );
}

// ─── GenericFormPage ──────────────────────────────────────────────────────────
export interface FormField {
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "textarea" | "date";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  span?: 1 | 2;
}

export function GenericFormPage({
  title,
  description,
  breadcrumb,
  fields,
  submitLabel = "Save Changes",
  onSubmit,
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: () => void;
}) {
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title={title} description={description} breadcrumb={breadcrumb} />
      <div className="glass-card p-6">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field, i) => (
            <div key={i} className={field.span === 2 ? "col-span-2" : ""}>
              <label className="block text-xs text-zinc-400 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              {field.type === "select" ? (
                <select className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none appearance-none">
                  <option value="">Select {field.label.toLowerCase()}…</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={3}
                  className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/[0.07]">
          <Btn variant="outline" size="md">Cancel</Btn>
          <Btn variant="primary" size="md" onClick={onSubmit}>{submitLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── GenericMessagePage ───────────────────────────────────────────────────────
const CONVERSATIONS = [
  { id: 1, name: "Emeka Nwosu", role: "Landlord", last: "I've reviewed the lease agreement and everything looks good.", time: "2m ago", unread: 2 },
  { id: 2, name: "Yetunde Afolabi", role: "Agent", last: "The viewing is confirmed for Thursday 3pm.", time: "1h ago", unread: 0 },
  { id: 3, name: "PROPATI Support", role: "Support", last: "Your verification has been approved!", time: "3h ago", unread: 1 },
  { id: 4, name: "Chidi Okafor", role: "Tenant", last: "Can we reschedule the inspection?", time: "Yesterday", unread: 0 },
  { id: 5, name: "Ngozi Eze", role: "Tenant", last: "The maintenance has been resolved, thank you.", time: "2 days ago", unread: 0 },
];

const MESSAGES = [
  { id: 1, from: "them", text: "Hi, I wanted to confirm the viewing for the 3BR apartment on Friday.", time: "10:30am" },
  { id: 2, from: "me", text: "Yes, confirmed! 2pm on Friday works perfectly. Please bring a valid ID and proof of income.", time: "10:35am" },
  { id: 3, from: "them", text: "Perfect. Will do. Also, are utilities included in the rent?", time: "10:37am" },
  { id: 4, from: "me", text: "Water is included. Electricity is metered separately. Generator is shared cost.", time: "10:42am" },
  { id: 5, from: "them", text: "Understood. Looking forward to it!", time: "10:43am" },
];

export function GenericMessagePage({ title = "Messages" }: { title?: string }) {
  const [selected, setSelected] = useState(CONVERSATIONS[0]);
  const [msg, setMsg] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-white/[0.07]">
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-white/[0.07] overflow-y-auto">
          <div className="p-3">
            <SearchInput placeholder="Search conversations…" />
          </div>
          {CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className={`w-full text-left px-4 py-3.5 hover:bg-white/[0.04] transition-colors ${
                selected.id === conv.id ? "bg-emerald-500/5 border-l-2 border-emerald-500" : "border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {conv.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{conv.name}</span>
                    <span className="text-[10px] text-zinc-600">{conv.time}</span>
                  </div>
                  <div className="text-xs text-zinc-600 truncate mt-0.5">{conv.last}</div>
                </div>
                {conv.unread > 0 && (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs font-semibold">
              {selected.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="text-white font-medium text-sm">{selected.name}</div>
              <div className="text-zinc-600 text-xs">{selected.role}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {MESSAGES.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    m.from === "me"
                      ? "bg-emerald-500 text-white rounded-br-sm"
                      : "bg-zinc-900 border border-white/[0.08] text-zinc-200 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                  <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-emerald-200" : "text-zinc-600"}`}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/[0.07]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="flex-1 dark-input px-4 py-2.5 text-sm focus:outline-none"
                onKeyDown={(e) => { if (e.key === "Enter") setMsg(""); }}
              />
              <button
                onClick={() => setMsg("")}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GenericNotificationsPage ─────────────────────────────────────────────────
const NOTIFICATIONS = [
  { type: "success", title: "Verification Approved", body: "Your property at 14 Bourdillon Road has been verified.", time: "2 minutes ago" },
  { type: "warning", title: "Rent Due in 8 Days", body: "Your next rent payment of ₦200,000 is due September 1, 2026.", time: "1 hour ago" },
  { type: "info", title: "New Application Received", body: "Sola Adewale applied for your 3BR listing at Victoria Island.", time: "3 hours ago" },
  { type: "success", title: "Payment Confirmed", body: "Rent payment of ₦2,400,000 from Chidi Okafor received.", time: "Yesterday" },
  { type: "info", title: "Maintenance Update", body: "AC repair ticket MNT-201 has been assigned to a technician.", time: "2 days ago" },
  { type: "info", title: "New Message", body: "Yetunde Afolabi sent you a message about the lease agreement.", time: "2 days ago" },
];

export function GenericNotificationsPage() {
  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Notifications" description="Stay up to date with your properties and tenants." />
      <div className="space-y-2">
        {NOTIFICATIONS.map((n, i) => (
          <div
            key={i}
            className={`flex gap-4 p-4 rounded-xl border transition-colors ${
              i < 2 ? "bg-zinc-950 border-white/[0.10]" : "bg-zinc-950/40 border-white/[0.05]"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                n.type === "success" ? "bg-emerald-400" : n.type === "warning" ? "bg-amber-400" : "bg-blue-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium">{n.title}</div>
              <div className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{n.body}</div>
            </div>
            <div className="text-zinc-700 text-xs flex-shrink-0">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GenericProfilePage ───────────────────────────────────────────────────────
export function GenericProfilePage({ name, role, email }: { name: string; role: string; email: string }) {
  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <PageHeader title="Profile" description="Manage your account details and preferences." />
      <div className="glass-card p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/[0.07]">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 text-zinc-400 text-xl font-bold flex items-center justify-center">
            {name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="text-white font-bold text-lg">{name}</div>
            <div className="text-zinc-500 text-sm">{role}</div>
            <div className="text-zinc-600 text-xs mt-0.5">{email}</div>
          </div>
          <div className="ml-auto">
            <Btn variant="secondary" size="sm">Change Photo</Btn>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {["First Name", "Last Name", "Email Address", "Phone Number", "State", "City"].map((label) => (
            <div key={label}>
              <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
              <input
                type="text"
                defaultValue={
                  label === "Email Address" ? email :
                  label === "First Name" ? name.split(" ")[0] :
                  label === "Last Name" ? name.split(" ").slice(1).join(" ") :
                  ""
                }
                className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5 pt-4 border-t border-white/[0.07]">
          <Btn variant="primary">Save Changes</Btn>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-white font-semibold text-sm mb-4">Change Password</h3>
        <div className="space-y-3">
          {["Current Password", "New Password", "Confirm New Password"].map((label) => (
            <div key={label}>
              <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
              <input type="password" placeholder="••••••••" className="dark-input w-full px-3 py-2.5 text-sm focus:outline-none" />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Btn variant="primary">Update Password</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── GenericVerificationPage ──────────────────────────────────────────────────
export function GenericVerificationPage() {
  const steps = [
    { step: 1, label: "Documents", status: "completed", path: "/dashboard/verification/step1/documents" },
    { step: 2, label: "Identity", status: "current", path: "/dashboard/verification/step2/identity" },
    { step: 3, label: "Video", status: "pending", path: "/dashboard/verification/step3/video" },
    { step: 4, label: "Inspection", status: "pending", path: "/dashboard/verification/step4/inspection" },
  ];

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <PageHeader
        title="Property Verification"
        description="Complete all 4 steps to get your PROPATI Verified badge."
      />

      {/* Stepper */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    s.status === "completed"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : s.status === "current"
                      ? "bg-zinc-950 border-emerald-500 text-emerald-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-600"
                  }`}
                >
                  {s.status === "completed" ? "✓" : s.step}
                </div>
                <div className={`text-[10px] mt-1 ${s.status === "current" ? "text-emerald-400" : "text-zinc-600"}`}>
                  {s.label}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < 1 ? "bg-emerald-500" : "bg-zinc-800"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-white font-bold text-lg mb-2">Step 2: Identity Verification</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Provide a government-issued ID (NIN, Driver's License, or International Passport) to verify your identity.
          </p>
          <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 hover:border-zinc-600 transition-colors cursor-pointer mb-4">
            <div className="text-zinc-600 text-3xl mb-2">📎</div>
            <div className="text-zinc-400 text-sm">Drop your ID document here or click to upload</div>
            <div className="text-zinc-700 text-xs mt-1">PNG, JPG, PDF up to 10MB</div>
          </div>
          <Link
            to="/dashboard/verification/step3/video"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Continue to Step 3
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Wallet page ──────────────────────────────────────────────────────────────
export function WalletPage() {
  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <PageHeader title="Wallet" description="Manage your PROPATI wallet balance and transactions." />
      <div className="glass-card p-8 text-center">
        <p className="text-zinc-500 text-sm mb-1">Available Balance</p>
        <p className="text-5xl font-black text-white mb-1">₦347,500</p>
        <p className="text-xs text-zinc-600 mb-6">Updated just now</p>
        <div className="flex gap-3 justify-center">
          <Btn variant="primary" size="lg">Add Funds</Btn>
          <Btn variant="secondary" size="lg">Withdraw</Btn>
        </div>
      </div>
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Recent Wallet Activity</h3>
        <div className="space-y-2">
          {[
            { label: "Rent Received — Flat 3A", amount: "+₦200,000", date: "Aug 1", type: "credit" },
            { label: "Platform Fee", amount: "-₦2,500", date: "Aug 1", type: "debit" },
            { label: "Agent Commission — DL-003", amount: "-₦150,000", date: "Jul 31", type: "debit" },
            { label: "Rent Received — Flat 2C", amount: "+₦175,000", date: "Jul 28", type: "credit" },
          ].map((item, i) => (
            <div key={i} className="flex items-center py-2.5 border-b border-white/[0.05] last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 text-sm ${
                item.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}>
                {item.type === "credit" ? "↓" : "↑"}
              </div>
              <div className="flex-1">
                <div className="text-white text-sm">{item.label}</div>
                <div className="text-zinc-600 text-xs">{item.date}</div>
              </div>
              <div className={`font-semibold text-sm ${item.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
                {item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
