'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Fingerprint,
  Gauge,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Scale,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react';
import {
  OpsBadge,
  OpsBreadcrumb,
  OpsButton,
  OpsCard,
  OpsCardHeader,
  OpsEmptyState,
  OpsField,
  OpsInput,
  OpsLabel,
  OpsPage,
  OpsSelect,
  OpsStatCard,
  OpsTextarea,
  formatCompactNaira,
  formatDate,
  formatNaira,
  formatRelative,
  formatTime,
  initialsOf,
  type OpsTone,
} from '../_ops-ui';

/* ------------------------------------------------------------------ */
/* Data shapes                                                         */
/* ------------------------------------------------------------------ */

export type ApplicationRow = {
  id: string;
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  stage: string | null;
  message: string | null;
  landlordNotes: string | null;
  rejectionReason: string | null;
  screeningStatus: Record<string, unknown> | null;
  guarantorData: Record<string, unknown> | null;
  applicantDocuments: { name?: string; url?: string; type?: string; uploadedAt?: string }[];
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    price: string;
    pricePeriod: string | null;
    listingType: string;
  } | null;
  tenant: { id: string; fullName: string; email: string; phone: string | null; avatarUrl: string | null };
  landlord: { id: string; fullName: string; email: string } | null;
};

export type ApplicationConversation = {
  id: string;
  subject: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  listingId: string | null;
  participantName: string;
  participantRole: string;
  participantAvatar: string | null;
};

export type ApplicationMessage = {
  id: string;
  content: string;
  createdAt: string;
  isMine: boolean;
  senderName: string;
  attachmentUrl: string | null;
  attachmentType: string | null;
};

export type ApplicationPropertyOption = {
  id: string;
  title: string;
  address: string;
  price: string;
};

/* ------------------------------------------------------------------ */
/* Mappings                                                            */
/* ------------------------------------------------------------------ */

const STATUS_META: Record<ApplicationRow['status'], { label: string; tone: OpsTone }> = {
  pending: { label: 'Pending Review', tone: 'warning' },
  under_review: { label: 'Under Vetting / KYC', tone: 'info' },
  accepted: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  withdrawn: { label: 'Withdrawn', tone: 'neutral' },
};

const STAGE_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  screening: 'Under Screening',
  guarantor_pending: 'Guarantor Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const TEMPLATES = [
  'Request Guarantor Documents',
  'Inspection Schedule',
  'Formal Tenancy Approval Notice',
  'Deed of Tenancy Dispatch',
];

export default function AgentApplicationsClient({
  initialApplications,
  conversations,
  messagesByConversation,
  properties,
}: {
  initialApplications: ApplicationRow[];
  conversations: ApplicationConversation[];
  messagesByConversation: Record<string, ApplicationMessage[]>;
  properties: ApplicationPropertyOption[];
}) {
  const [view, setView] = useState<'vetting' | 'comms'>('vetting');
  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [propertyId, setPropertyId] = useState('all');
  const [listingType, setListingType] = useState('all');
  const [sort, setSort] = useState('newest');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(
    initialApplications.length > 0 ? initialApplications[0].id : null
  );
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [showInvite, setShowInvite] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [decisionKind, setDecisionKind] = useState<'approve' | 'reject'>('approve');
  const [decisionNote, setDecisionNote] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionDone, setDecisionDone] = useState<string | null>(null);

  const counts = useMemo(() => {
    const by = (pred: (a: ApplicationRow) => boolean) => initialApplications.filter(pred).length;
    return {
      total: initialApplications.length,
      pending: by((a) => a.status === 'pending'),
      vetting: by((a) => a.status === 'under_review'),
      approved: by((a) => a.status === 'accepted'),
      rejected: by((a) => a.status === 'rejected'),
      actionRequired: by(
        (a) => a.status === 'pending' || a.status === 'under_review'
      ),
    };
  }, [initialApplications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = initialApplications.filter((a) => {
      if (statusTab !== 'all' && a.status !== statusTab) return false;
      if (propertyId !== 'all' && a.listing?.id !== propertyId) return false;
      if (listingType !== 'all' && a.listing?.listingType !== listingType) return false;
      if (!q) return true;
      return [
        a.tenant.fullName,
        a.tenant.email,
        a.listing?.title ?? '',
        a.listing?.address ?? '',
        a.id,
        STAGE_LABEL[a.stage ?? ''] ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    const sorted = [...rows];
    if (sort === 'rent-high') {
      sorted.sort((x, y) => Number(y.listing?.price ?? 0) - Number(x.listing?.price ?? 0));
    } else if (sort === 'oldest') {
      sorted.sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
    } else {
      sorted.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    }
    return sorted;
  }, [initialApplications, query, statusTab, propertyId, listingType, sort]);

  const selectedApp = initialApplications.find((a) => a.id === selectedAppId) ?? null;
  const selectedConv = conversations.find((c) => c.id === selectedConvId) ?? null;
  const selectedMessages = selectedConv ? messagesByConversation[selectedConv.id] ?? [] : [];

  const approve = async () => {
    if (!selectedApp) return;
    setDecisionSubmitting(true);
    setDecisionError(null);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decisionKind === 'approve' ? 'accepted' : 'rejected',
          landlordNotes: decisionNote || undefined,
          rejectionReason: decisionKind === 'reject' ? decisionNote : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Failed to record decision');
      }
      setDecisionDone(
        decisionKind === 'approve'
          ? 'Application approved — the file is now ready for deed generation.'
          : 'Application rejected and the counterparty notified.'
      );
    } catch (err) {
      setDecisionError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const statusTabs = [
    { key: 'all', label: 'All Applications', count: counts.total },
    { key: 'pending', label: 'Pending Review', count: counts.pending },
    { key: 'under_review', label: 'Under Vetting / KYC', count: counts.vetting },
    { key: 'accepted', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  return (
    <OpsPage>
      {/* Sub-header */}
      <OpsCard className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <OpsBreadcrumb
          items={[
            { label: 'Agent Portal' },
            { label: 'Operations' },
            { label: 'Applications & Communications Desk' },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <OpsBadge tone="success" icon={<ShieldCheck className="h-3 w-3" />}>
            Vetted Protocols
          </OpsBadge>
          <OpsBadge tone="neutral" icon={<Lock className="h-3 w-3" />}>
            Encrypted Counterparty Messaging
          </OpsBadge>
        </div>
      </OpsCard>

      {/* KPI bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <OpsStatCard
          label="Active Pipeline Intake"
          value={counts.total}
          tone="neutral"
          icon={<Users className="h-4 w-4" />}
          sub={`${counts.actionRequired} awaiting action`}
          badge={{ label: 'Total Files', tone: 'neutral' }}
        />
        <OpsStatCard
          label="Communications Pulse"
          value={conversations.length}
          tone="primary"
          icon={<MessageSquare className="h-4 w-4" />}
          sub={`${conversations.reduce((s, c) => s + c.unreadCount, 0)} unread across threads`}
          badge={{ label: 'Open Threads', tone: 'primary' }}
        />
        <OpsStatCard
          label="Approved (Awaiting Lease)"
          value={counts.approved}
          tone="success"
          icon={<BadgeCheck className="h-4 w-4" />}
          sub={`${counts.total ? Math.round((counts.approved / counts.total) * 100) : 0}% approval rate`}
          badge={{ label: 'Rent Roll Pipeline', tone: 'success' }}
        />
        <OpsStatCard
          label="Escalated Legal / Audit"
          value={counts.rejected}
          tone="danger"
          icon={<AlertTriangle className="h-4 w-4" />}
          sub="AML or credit-bureau screening failures"
          badge={{ label: 'Action Needed', tone: 'danger' }}
        />
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 w-fit">
        <button
          type="button"
          onClick={() => setView('vetting')}
          className={
            view === 'vetting'
              ? 'px-4 py-2 rounded-md text-[13px] font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm transition-colors inline-flex items-center gap-2'
              : 'px-4 py-2 rounded-md text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors inline-flex items-center gap-2'
          }
        >
          <Scale className="h-4 w-4" />
          Vetting Desk
        </button>
        <button
          type="button"
          onClick={() => setView('comms')}
          className={
            view === 'comms'
              ? 'px-4 py-2 rounded-md text-[13px] font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm transition-colors inline-flex items-center gap-2'
              : 'px-4 py-2 rounded-md text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors inline-flex items-center gap-2'
          }
        >
          <MessageSquare className="h-4 w-4" />
          Candidate Communications
        </button>
      </div>

      {view === 'vetting' ? (
        <>
          {/* Filters */}
          <OpsCard className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <OpsInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search applicant, email, property, or application ID..."
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="min-w-[200px]">
                  <OpsSelect
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    aria-label="Filter by property"
                  >
                    <option value="all">All Properties ({properties.length} Mandates)</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </OpsSelect>
                </div>
                <div className="min-w-[160px]">
                  <OpsSelect
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    aria-label="Filter by listing type"
                  >
                    <option value="all">All Types</option>
                    <option value="rent">Residential Lease</option>
                    <option value="lease">Commercial Tenancy</option>
                    <option value="sale">Sale</option>
                    <option value="shortlet">Short-Let</option>
                  </OpsSelect>
                </div>
                <div className="min-w-[150px]">
                  <OpsSelect
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort applications"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rent-high">Rent: Highest</option>
                  </OpsSelect>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  className={
                    statusTab === tab.key
                      ? 'px-4 py-1.5 rounded-full text-[13px] font-semibold bg-emerald-600 text-white shadow-sm whitespace-nowrap'
                      : 'px-4 py-1.5 rounded-full text-[13px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap transition-colors'
                  }
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </OpsCard>

          {/* Split: table + drawer */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            <OpsCard className="xl:col-span-8 overflow-hidden">
              <OpsCardHeader
                eyebrow="Master Dossier Register"
                title="Applicant Submissions"
                icon={<Users className="h-4 w-4" />}
                action={
                  <OpsButton variant="secondary" className="px-2.5 py-1.5 text-[11px]">
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </OpsButton>
                }
              />
              {filtered.length === 0 ? (
                <OpsEmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No applications in this view"
                  description={
                    initialApplications.length === 0
                      ? 'No tenancy applications have been submitted against your managed mandates yet.'
                      : 'Adjust the status, property or search filters to widen the review queue.'
                  }
                  action={
                    <OpsButton variant="primary" onClick={() => setShowInvite(true)}>
                      <Plus className="h-4 w-4" />
                      Invite Applicant
                    </OpsButton>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Applicant &amp; Credentials</th>
                        <th className="py-3 px-4 font-semibold">Mandate &amp; Unit</th>
                        <th className="py-3 px-4 font-semibold">Financial &amp; Affordability</th>
                        <th className="py-3 px-4 font-semibold">Verification Check</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Desk Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.08]">
                      {filtered.map((a) => {
                        const sm = STATUS_META[a.status];
                        const isSelected = a.id === selectedAppId;
                        return (
                          <tr
                            key={a.id}
                            onClick={() => setSelectedAppId(a.id)}
                            className={
                              isSelected
                                ? 'bg-emerald-50/70 dark:bg-emerald-500/10 cursor-pointer transition-colors'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors'
                            }
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <span className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-semibold text-sm shrink-0">
                                  {initialsOf(a.tenant.fullName)}
                                </span>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-zinc-900 dark:text-white truncate flex items-center gap-1.5">
                                    {a.tenant.fullName}
                                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  </span>
                                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                    {a.tenant.email}
                                  </span>
                                  <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                                    {a.tenant.phone ?? '—'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-zinc-900 dark:text-white">
                                  {a.listing?.title ?? '—'}
                                </span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  {a.listing?.area ?? '—'}
                                </span>
                                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                  {a.listing?.address ?? '—'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                                  {formatNaira(a.listing?.price ?? null, { decimals: false })}
                                  {a.listing?.pricePeriod ? ` / ${a.listing.pricePeriod}` : ''}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {STAGE_LABEL[a.stage ?? ''] ?? 'Submitted'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-1">
                                <OpsBadge tone={screeningTone(a)}>
                                  {screeningLabel(a)}
                                </OpsBadge>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {a.applicantDocuments.length} documents
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <OpsBadge tone={sm.tone}>{sm.label}</OpsBadge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <OpsButton
                                variant="primary"
                                className="px-2.5 py-1 text-[11px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppId(a.id);
                                }}
                              >
                                Review
                                <ChevronRight className="h-3 w-3" />
                              </OpsButton>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </OpsCard>

            {/* Dossier drawer */}
            <div className="xl:col-span-4">
              {selectedApp ? (
                <ApplicationDossier
                  application={selectedApp}
                  onDecide={(kind) => {
                    setDecisionKind(kind);
                    setDecisionDone(null);
                    setDecisionError(null);
                    setDecisionNote('');
                    setShowDecision(true);
                  }}
                />
              ) : (
                <OpsCard>
                  <OpsEmptyState
                    icon={<FileText className="h-6 w-6" />}
                    title="No dossier selected"
                    description="Select an applicant to open their vetting dossier, documents and decision controls."
                  />
                </OpsCard>
              )}
            </div>
          </div>

          {/* Compliance footer */}
          <OpsCard className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Statutory Housing &amp; Compliance Accord
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  Operations strictly governed by the Lagos State Tenancy Law (2011), the Nigeria Data
                  Protection Regulation (NDPR 2023) and the Anti-Money Laundering Act (2022).
                </p>
              </div>
            </div>
          </OpsCard>
        </>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* Conversation list */}
          <OpsCard className="xl:col-span-4 overflow-hidden">
            <OpsCardHeader
              eyebrow="Candidate Communications"
              title="Application Inquiries"
              icon={<MessageSquare className="h-4 w-4" />}
              action={
                <OpsBadge tone="neutral">{conversations.length} threads</OpsBadge>
              }
            />
            <div className="p-4 space-y-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <OpsInput placeholder="Search counterparties..." className="pl-9" />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <OpsBadge tone="primary">All ({conversations.length})</OpsBadge>
                <OpsBadge tone="neutral">
                  Unread ({conversations.reduce((s, c) => s + c.unreadCount, 0)})
                </OpsBadge>
              </div>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-white/[0.08] max-h-[640px] overflow-y-auto">
              {conversations.length === 0 ? (
                <OpsEmptyState
                  icon={<MessageSquare className="h-6 w-6" />}
                  title="No conversations yet"
                  description="Candidate threads appear here once an applicant or counterparty messages you about a mandate."
                />
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full text-left p-4 transition-colors relative ${
                      c.id === selectedConvId
                        ? 'bg-emerald-50/70 dark:bg-emerald-500/10'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {c.id === selectedConvId ? (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                    ) : null}
                    <div className="flex items-start gap-3">
                      <span className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 shrink-0 overflow-hidden">
                        {c.participantAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.participantAvatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsOf(c.participantName)
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-medium text-zinc-900 dark:text-white truncate">
                            {c.participantName}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0">
                            {c.lastMessageAt ? formatRelative(c.lastMessageAt) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                            {c.participantRole}
                          </span>
                          {c.unreadCount > 0 ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-[11px] font-semibold shrink-0">
                              {c.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-snug">
                          {c.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </OpsCard>

          {/* Thread */}
          <OpsCard className="xl:col-span-8 overflow-hidden flex flex-col">
            {selectedConv ? (
              <>
                <OpsCardHeader
                  eyebrow="Secure Counterparty Thread"
                  title={selectedConv.participantName}
                  icon={<MessageSquare className="h-4 w-4" />}
                  action={
                    <div className="flex items-center gap-2">
                      {selectedConv.participantAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedConv.participantAvatar}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : null}
                      <OpsBadge tone="neutral">{selectedConv.participantRole}</OpsBadge>
                    </div>
                  }
                />
                <div className="p-5 space-y-4 flex-1">
                  <div className="mx-auto max-w-xl bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        Conveyancing Record Notice:
                      </span>{' '}
                      This conversation is permanently archived under Lagos State Tenancy Law 2011 compliance
                      guidelines.
                    </p>
                  </div>

                  {selectedMessages.length === 0 ? (
                    <OpsEmptyState
                      icon={<MessageSquare className="h-6 w-6" />}
                      title="No messages in this thread"
                      description="Send the first message below to open the conveyancing record."
                    />
                  ) : (
                    selectedMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col items-end space-y-1 max-w-xl ml-auto ${
                          m.isMine ? '' : 'items-start mr-auto'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {m.isMine ? (
                            <>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {formatTime(m.createdAt)}
                              </span>
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {m.senderName}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                {m.senderName}
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {formatTime(m.createdAt)}
                              </span>
                            </>
                          )}
                        </div>
                        <div
                          className={
                            m.isMine
                              ? 'bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-xs shadow-sm text-sm leading-relaxed'
                              : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 p-4 rounded-2xl rounded-tl-xs shadow-sm text-sm leading-relaxed'
                          }
                        >
                          {m.content}
                        </div>
                        {m.attachmentUrl ? (
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-700 dark:text-zinc-300"
                          >
                            <FileText className="h-4 w-4 text-red-500" />
                            {m.attachmentType ?? 'attachment'}
                            <ArrowRight className="h-3 w-3" />
                          </a>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-zinc-200 dark:border-white/[0.08] space-y-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      Templates:
                    </span>
                    {TEMPLATES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] font-medium whitespace-nowrap transition-colors"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-2.5 focus-within:bg-zinc-100 dark:focus-within:bg-zinc-800 transition-colors">
                    <OpsTextarea
                      rows={3}
                      placeholder={`Type message or insert institutional legal template...`}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <Mail className="h-3.5 w-3.5" />
                        E2EE counterparty thread
                      </div>
                      <OpsButton variant="primary">
                        <Send className="h-4 w-4" />
                        Send
                      </OpsButton>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <OpsEmptyState
                icon={<MessageSquare className="h-6 w-6" />}
                title="Select a thread"
                description="Choose a counterparty conversation to review the audit trail and reply."
              />
            )}
          </OpsCard>
        </div>
      )}

      {showInvite ? <InviteApplicantModal properties={properties} onClose={() => setShowInvite(false)} /> : null}

      {showDecision && selectedApp ? (
        <DecisionModal
          application={selectedApp}
          kind={decisionKind}
          note={decisionNote}
          setNote={setDecisionNote}
          submitting={decisionSubmitting}
          error={decisionError}
          done={decisionDone}
          onSubmit={approve}
          onClose={() => {
            setShowDecision(false);
            setDecisionDone(null);
          }}
        />
      ) : null}
    </OpsPage>
  );
}

/* ------------------------------------------------------------------ */
/* Dossier drawer                                                      */
/* ------------------------------------------------------------------ */

function ApplicationDossier({
  application,
  onDecide,
}: {
  application: ApplicationRow;
  onDecide: (kind: 'approve' | 'reject') => void;
}) {
  const screening = application.screeningStatus ?? {};
  const guarantor = application.guarantorData ?? {};
  const documents = application.applicantDocuments ?? [];

  const score = pickNumber(screening, ['creditScore', 'crcScore', 'score']);
  const identityCleared = pickBoolean(screening, ['nin', 'bvn', 'identityVerified', 'ninVerified']);
  const incomeVerified = pickBoolean(screening, ['incomeVerified', 'affordability', 'bankStatementVerified']);

  const checks = [
    {
      label: 'Identity & NIN/BVN Verification',
      value: identityCleared ? 'Verified' : 'Pending',
      done: Boolean(identityCleared),
    },
    {
      label: 'Affordability (Income & Bank Statement)',
      value: incomeVerified ? 'Verified' : 'Pending',
      done: Boolean(incomeVerified),
    },
    {
      label: 'Credit Bureau Registry Check',
      value: score !== null ? String(score) : 'Not available',
      done: score !== null,
    },
    {
      label: 'Guarantor Attestation',
      value: Object.keys(guarantor).length > 0 ? 'Attested' : 'Awaiting',
      done: Object.keys(guarantor).length > 0,
    },
  ];

  return (
    <OpsCard className="overflow-hidden">
      <OpsCardHeader
        eyebrow={`Application ${application.id.slice(-8).toUpperCase()}`}
        title={application.tenant.fullName}
        icon={<Building2 className="h-4 w-4" />}
        action={<OpsBadge tone={STATUS_META[application.status].tone}>{STATUS_META[application.status].label}</OpsBadge>}
      />
      <div className="p-4 space-y-4">
        {/* Offer summary */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <OpsLabel>Mandate</OpsLabel>
              <div className="mt-0.5 font-semibold text-zinc-900 dark:text-white truncate">
                {application.listing?.title ?? '—'}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                {application.listing?.address ?? '—'}
              </div>
            </div>
            <div className="text-right shrink-0">
              <OpsLabel>Proposed Rent</OpsLabel>
              <div className="mt-0.5 text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCompactNaira(application.listing?.price ?? null)}
              </div>
              {application.listing?.pricePeriod ? (
                <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  per {application.listing.pricePeriod}
                </div>
              ) : null}
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.08] grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]">
              <OpsLabel>Direct Mobile</OpsLabel>
              <span className="block mt-0.5 font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                {application.tenant.phone ?? '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08]">
              <OpsLabel>Verified Email</OpsLabel>
              <span className="block mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {application.tenant.email}
              </span>
            </div>
          </div>
        </div>

        {/* Vetting scorecard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Statutory Vetting Scorecard
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400">
              {checks.filter((c) => c.done).length} of {checks.length} satisfied
            </span>
          </div>
          <div className="space-y-2.5">
            {checks.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex justify-between text-[11px] uppercase tracking-wider">
                  <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    {c.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    )}
                    {c.label}
                  </span>
                  <span
                    className={
                      c.done
                        ? 'font-mono font-semibold text-emerald-600 dark:text-emerald-400'
                        : 'font-semibold text-amber-600 dark:text-amber-400'
                    }
                  >
                    {c.value}
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={c.done ? 'bg-emerald-500 h-1.5 rounded-full' : 'bg-amber-500 h-1.5 rounded-full'}
                    style={{ width: c.done ? '100%' : '20%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Attached Dossier Documents
            </span>
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {documents.length} uploaded
            </span>
          </div>
          {documents.length === 0 ? (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg">
              No applicant documents have been uploaded to this file yet.
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <a
                  key={`${doc.name ?? 'doc'}-${i}`}
                  href={doc.url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[13px] text-zinc-900 dark:text-white font-medium truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {doc.name ?? 'Applicant document'}
                      </span>
                      <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                        {doc.type ?? 'Document'}
                        {doc.uploadedAt ? ` · ${formatDate(doc.uploadedAt)}` : ''}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Applicant message */}
        {application.message ? (
          <div className="space-y-1.5">
            <OpsLabel>Applicant Message</OpsLabel>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg leading-relaxed italic">
              “{application.message}”
            </p>
          </div>
        ) : null}

        {/* Decision controls */}
        <div className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <OpsLabel>Agent Decision Action</OpsLabel>
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Lock className="h-3 w-3" />
              Tenant Management Scoped
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <OpsButton variant="primary" onClick={() => onDecide('approve')}>
              <Check className="h-4 w-4" />
              Approve File
            </OpsButton>
            <OpsButton variant="danger" onClick={() => onDecide('reject')}>
              <X className="h-4 w-4" />
              Reject File
            </OpsButton>
          </div>
          <OpsButton variant="secondary" className="w-full">
            <Mail className="h-4 w-4" />
            Request Additional Clarification
          </OpsButton>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <OpsButton variant="secondary" className="px-2.5 py-1.5 text-[11px]">
              <Phone className="h-3.5 w-3.5" />
              Call Applicant
            </OpsButton>
            <OpsButton variant="secondary" className="px-2.5 py-1.5 text-[11px]">
              <CalendarPlus className="h-3.5 w-3.5" />
              Schedule Vetting Call
            </OpsButton>
          </div>
        </div>
      </div>
    </OpsCard>
  );
}

/* ------------------------------------------------------------------ */
/* Modals                                                              */
/* ------------------------------------------------------------------ */

function InviteApplicantModal({
  properties,
  onClose,
}: {
  properties: ApplicationPropertyOption[];
  onClose: () => void;
}) {
  const [listingId, setListingId] = useState(properties[0]?.id ?? '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Invite Prospective Tenant</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Issue a self-service digital application link
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <OpsField label="Target Mandate &amp; Unit">
            <OpsSelect value={listingId} onChange={(e) => setListingId(e.target.value)}>
              <option value="">Select a property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {formatCompactNaira(p.price)}
                </option>
              ))}
            </OpsSelect>
          </OpsField>
          <OpsField label="Tenant Full Legal Name / Corporate Entity">
            <OpsInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Babatunde Sanwo-Olu or Dangote Refineries Ltd"
            />
          </OpsField>
          <div className="grid grid-cols-2 gap-2">
            <OpsField label="Email Address">
              <OpsInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant@domain.com"
              />
            </OpsField>
            <OpsField label="Phone (+234)">
              <OpsInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0803 000 0000"
              />
            </OpsField>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-start gap-2.5">
            <Fingerprint className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-emerald-800 dark:text-emerald-300">
              The applicant receives an automated invitation to verify via NIN/BVN biometric screening and
              upload 6 months of certified bank statements via Open Banking.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <OpsButton variant="secondary" onClick={onClose}>
            Cancel
          </OpsButton>
          <OpsButton variant="primary" disabled={!listingId || !name.trim() || !email.trim()}>
            <Send className="h-4 w-4" />
            Generate &amp; Dispatch Link
          </OpsButton>
        </div>
      </div>
    </div>
  );
}

function DecisionModal({
  application,
  kind,
  note,
  setNote,
  submitting,
  error,
  done,
  onSubmit,
  onClose,
}: {
  application: ApplicationRow;
  kind: 'approve' | 'reject';
  note: string;
  setNote: (v: string) => void;
  submitting: boolean;
  error: string | null;
  done: string | null;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {kind === 'approve' ? 'Approve Application' : 'Reject Application'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {application.tenant.fullName} · {application.listing?.title ?? '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-start gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-sm text-emerald-800 dark:text-emerald-300">{done}</span>
          </div>
        ) : (
          <>
            <OpsField
              label={kind === 'approve' ? 'Approval Note (optional)' : 'Rejection Reason'}
              hint={
                kind === 'approve'
                  ? 'Recorded on the dossier audit ledger.'
                  : 'Shared with the applicant and logged for audit.'
              }
            >
              <OpsTextarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  kind === 'approve'
                    ? 'e.g. Credit and guarantor attestation verified; file ready for deed generation.'
                    : 'e.g. Credit bureau score below affordability threshold.'
                }
              />
            </OpsField>
            {error ? (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-700 dark:text-red-400">{error}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-2 pt-1">
              <OpsButton variant="secondary" onClick={onClose}>
                Cancel
              </OpsButton>
              <OpsButton
                variant={kind === 'approve' ? 'primary' : 'danger'}
                onClick={onSubmit}
                disabled={submitting || (kind === 'reject' && !note.trim())}
              >
                {submitting ? 'Recording…' : kind === 'approve' ? 'Approve File' : 'Reject File'}
              </OpsButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function screeningTone(a: ApplicationRow): OpsTone {
  if (a.status === 'accepted') return 'success';
  if (a.status === 'rejected') return 'danger';
  if (a.status === 'under_review') return 'info';
  return 'warning';
}

function screeningLabel(a: ApplicationRow): string {
  const screening = a.screeningStatus ?? {};
  const score = pickNumber(screening, ['creditScore', 'crcScore', 'score']);
  if (a.status === 'accepted') return 'Cleared';
  if (a.status === 'rejected') return 'Failed Screening';
  if (score !== null) return `Screening ${score}`;
  if (a.status === 'under_review') return 'KYC In Progress';
  return 'Awaiting Documents';
}

function pickNumber(
  source: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const v = source[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() && Number.isFinite(Number(v))) return Number(v);
  }
  return null;
}

function pickBoolean(source: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const v = source[key];
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object' && 'verified' in (v as Record<string, unknown>)) {
      return Boolean((v as Record<string, unknown>).verified);
    }
  }
  return false;
}
