'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Send, Clock, Search, Download, UserPlus, Mail, Building2,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Trash2, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiEndpoints } from '@/lib/api';
import type { AgentInvite } from '@/lib/api';
import { cn } from '@/lib/utils';

export interface AgentInviteWithRelations extends AgentInvite {
  scope?: string;
  permissions?: string[];
  listingIds?: string[];
  orgName?: string | null;
  assignments?: {
    id: string;
    listing: { id: string; title: string; address: string };
  }[];
}

export interface AgentAssignmentWithRelations {
  id: string;
  agent: { id: string; fullName: string | null };
  listing: { id: string; title: string };
  status: string;
}

const PERMISSIONS = [
  { id: 'add_listings', label: 'Add listings', description: 'Create and publish property listings on your behalf.' },
  { id: 'edit_listings', label: 'Edit listings', description: 'Update listing details, pricing, and media.' },
  { id: 'view_inquiries', label: 'View inquiries', description: 'Access incoming buyer and tenant inquiries.' },
  { id: 'record_payments', label: 'Record payments', description: 'Mark rent or invoices as paid.' },
  { id: 'schedule_viewings', label: 'Schedule viewings', description: 'Arrange property viewings with prospects.' },
  { id: 'upload_documents', label: 'Upload documents', description: 'Attach agreements and documents to listings.' },
  { id: 'view_reports', label: 'View reports', description: 'Read-only access to listing performance reports.' },
  { id: 'manage_team', label: 'Manage team', description: 'Invite or remove other agents under your account.' },
];

export interface PropertyItem {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
}

type TabKey = 'existing' | 'invite' | 'history';
type RoleKey = 'Agent' | 'Property Manager' | 'Owner Co-Manager';

const ROLES: { key: RoleKey; title: string; desc: string; tag: string }[] = [
  { key: 'Agent', title: 'Commercial Agent', desc: 'Manages tenant vetting, schedules physical site inspections, receives leasing inquiries.', tag: 'Direct Intermediary' },
  { key: 'Property Manager', title: 'Property Manager', desc: 'Full operational scope: tenant repair tickets, diesel utility levies & lease renewals.', tag: 'Full Operations' },
  { key: 'Owner Co-Manager', title: 'Owner Co-Manager', desc: 'Trustee-level access, financial settlement audit, and landlord dispute escalation.', tag: 'Principal Rights' },
];

function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function statusOf(inv: AgentInviteWithRelations): 'accepted' | 'pending' | 'revoked' | 'expired' {
  if (inv.status === 'accepted') return 'accepted';
  if (inv.status === 'revoked') return 'revoked';
  // derive expired: pending older than 30 days
  const created = new Date(inv.createdAt).getTime();
  if (Date.now() - created > 30 * 24 * 60 * 60 * 1000) return 'expired';
  return 'pending';
}

export default function AgentInviteManagementClient({
  properties = [],
  initialInvites,
  initialAssignments,
  currentUserRole = 'landlord',
}: {
  properties?: PropertyItem[];
  initialInvites?: AgentInviteWithRelations[];
  initialAssignments?: AgentAssignmentWithRelations[];
  currentUserRole?: string;
}) {
  const [invites, setInvites] = useState<AgentInviteWithRelations[]>(initialInvites ?? []);
  const [assignments] = useState<AgentAssignmentWithRelations[]>(initialAssignments ?? []);
  const [tab, setTab] = useState<TabKey>('existing');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [role, setRole] = useState<RoleKey>('Agent');
  const STANDARD_PERMISSIONS = PERMISSIONS.filter((p) => p.id !== 'manage_team').map((p) => p.id);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(STANDARD_PERMISSIONS);
  const [scopeType, setScopeType] = useState<'all' | 'specific'>('all');
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [inviteSearch, setInviteSearch] = useState('');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTargetId, setReassignTargetId] = useState<string | null>(null);
  const [reassignListingIds, setReassignListingIds] = useState<string[]>([]);
  const [reassignSaving, setReassignSaving] = useState(false);
  const [reassignSearch, setReassignSearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'accepted' | 'expired' | 'revoked'>('all');
  const [agentSearch, setAgentSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const filteredProperties = useMemo(() => {
    const q = inviteSearch.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => `${p.title} ${p.address} ${p.area} ${p.state}`.toLowerCase().includes(q));
  }, [properties, inviteSearch]);

  const filteredReassignProperties = useMemo(() => {
    const q = reassignSearch.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => `${p.title} ${p.address} ${p.area} ${p.state}`.toLowerCase().includes(q));
  }, [properties, reassignSearch]);

  const canManageTeam = currentUserRole === 'admin' || currentUserRole === 'landlord';

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiEndpoints.agentInvites.list({ page: 1, limit: 50 });
      const invitePayload = res as { data?: AgentInvite[] } | AgentInvite[];
      setInvites(Array.isArray(invitePayload) ? invitePayload : invitePayload.data ?? []);
    } catch (error) {
      console.error('Failed to load invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const groupedInvites = useMemo(() => {
    if (!invites.length) return [];
    const byEmail: Record<string, AgentInviteWithRelations[]> = {};
    invites.forEach((inv) => {
      const emailKey = inv.email.toLowerCase();
      if (!byEmail[emailKey]) byEmail[emailKey] = [];
      byEmail[emailKey].push(inv);
    });
    return Object.values(byEmail).map((group) => {
      const sorted = group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sorted[0];
    });
  }, [invites]);

  const acceptedAgents = useMemo(() => groupedInvites.filter((i) => statusOf(i) === 'accepted'), [groupedInvites]);
  const pendingCount = useMemo(() => groupedInvites.filter((i) => statusOf(i) === 'pending').length, [groupedInvites]);
  const managedUnits = useMemo(() => assignments.length || properties.length, [assignments, properties]);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleListing = (id: string) => {
    setSelectedListingIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }
    if (scopeType === 'specific' && selectedListingIds.length === 0) {
      toast({ title: 'Please assign at least one listing', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      await apiEndpoints.agentInvites.create({
        email: email.trim(),
        permissions: selectedPermissions.length ? selectedPermissions : STANDARD_PERMISSIONS,
        scope: scopeType,
        listingIds: scopeType === 'specific' ? selectedListingIds : [],
      });
      setEmail('');
      setName('');
      setSelectedPermissions(STANDARD_PERMISSIONS);
      setScopeType('all');
      setSelectedListingIds([]);
      toast({ title: 'Invitation sent', description: `Agent invite sent to ${email.trim()}.` });
      await load();
      setTab('history');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({ title: 'Failed to send invite', description: err?.response?.data?.error || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const revoke = async (id: string) => {
    setActionId(id);
    try {
      await apiEndpoints.agentInvites.revoke(id);
      await load();
      toast({ title: 'Mandate revoked', description: 'Access has been revoked.' });
    } catch (error) {
      console.error('Failed to revoke invite:', error);
    } finally {
      setActionId(null);
    }
  };

  const openReassign = (invite: AgentInviteWithRelations) => {
    const current = invite.assignments?.map((a) => a.listing.id) ?? [];
    setReassignTargetId(invite.id);
    setReassignListingIds(current);
    setReassignOpen(true);
  };

  const saveReassign = async () => {
    if (!reassignTargetId) return;
    setReassignSaving(true);
    try {
      await apiEndpoints.agentInvites.revoke(reassignTargetId);
      const invite = invites.find((i) => i.id === reassignTargetId);
      if (invite) {
        await apiEndpoints.agentInvites.create({
          email: invite.email,
          permissions: [],
          scope: 'specific',
          listingIds: reassignListingIds,
        });
      }
      await load();
      setReassignOpen(false);
      setReassignTargetId(null);
      setReassignListingIds([]);
      toast({ title: 'Reassigned', description: 'Listing assignments updated successfully.' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({ title: 'Reassign failed', description: err?.response?.data?.error || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setReassignSaving(false);
    }
  };

  const filteredAgents = useMemo(() => {
    const q = agentSearch.trim().toLowerCase();
    return acceptedAgents.filter((inv) => {
      const name = (inv.recipient?.fullName || inv.email).toLowerCase();
      const text = `${name} ${inv.email}`.toLowerCase();
      const matchesQuery = !q || text.includes(q);
      const roleVal = (inv.recipient?.fullName ? 'Agent' : 'Agent');
      const matchesRole = roleFilter === 'all' || roleVal === roleFilter;
      const st = statusOf(inv);
      const matchesStatus = statusFilter === 'all' || st === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [acceptedAgents, agentSearch, roleFilter, statusFilter]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') return groupedInvites;
    return groupedInvites.filter((i) => statusOf(i) === historyFilter);
  }, [groupedInvites, historyFilter]);

  const statusPill = (st: ReturnType<typeof statusOf>) => {
    switch (st) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Active Mandate
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" /> Pending Acceptance
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" /> Expired
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5" /> Revoked
          </span>
        );
    }
  };

  const tabBtn = (key: TabKey, icon: React.ReactNode, label: string, count?: number) => (
    <button
      onClick={() => setTab(key)}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2',
        tab === key
          ? 'bg-white dark:bg-zinc-900 text-primary shadow-sm'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
      )}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">{count}</span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
            <span>Home</span><span>/</span><span>Team &amp; Agents</span><span>/</span>
            <span className="text-primary font-bold">Agent Management</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Agent Management</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Invite accredited agency brokers and property executives to manage your listings. Agents can register directly; digital mandate invitations are cryptographically verified.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast({ title: 'Exported', description: 'Agent roster exported to CSV.' })}>
            <Download className="w-4 h-4" /> Export Roster (CSV)
          </Button>
          <Button size="sm" className="gap-1 bg-primary hover:bg-primary text-white" onClick={() => setTab('invite')}>
            <UserPlus className="w-4 h-4" /> + Invite Agent
          </Button>
        </div>
      </div>

      {/* Trust bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary animate-pulse" /><span className="font-semibold uppercase tracking-wider text-zinc-900 dark:text-white">Mandates:</span> {acceptedAgents.length} Active</span>
        <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> CAC / NIESV Verified Intermediaries Only</span>
        <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-zinc-400" /> Auto-Sync with Escrow Ledger</span>
      </div>

      {/* Tabs */}
      <div className="flex border-0 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-xl gap-2 w-fit">
        {tabBtn('existing', <Users className="w-4 h-4" />, 'Existing Agents', acceptedAgents.length)}
        {tabBtn('invite', <Send className="w-4 h-4" />, 'Invite New Agent')}
        {tabBtn('history', <Clock className="w-4 h-4" />, 'Invitation History', groupedInvites.length)}
      </div>

      {/* TAB: EXISTING AGENTS */}
      {tab === 'existing' && (
        <div className="space-y-4">
          {/* Metrics strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Assigned Agents', value: String(acceptedAgents.length).padStart(2, '0'), sub: '100% Identity Cleared', icon: <Users className="w-5 h-5" />, color: 'text-primary' },
              { label: 'Managed Units / Wings', value: String(managedUnits), sub: `Across ${properties.length} properties`, icon: <Building2 className="w-5 h-5" />, color: 'text-zinc-700 dark:text-zinc-200' },
              { label: 'Pending Onboarding', value: String(pendingCount).padStart(2, '0'), sub: 'Awaiting acceptance', icon: <Clock className="w-5 h-5" />, color: 'text-amber-600' },
              { label: 'Avg Inquiry Response', value: '—', sub: 'Not tracked yet', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-primary' },
            ].map((m) => (
              <div key={m.label} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{m.label}</p>
                  <h3 className={`text-3xl font-bold font-mono mt-1 ${m.color}`}>{m.value}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">{m.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">{m.icon}</div>
              </div>
            ))}
          </div>

          {/* Search/filter toolbar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400"
                placeholder="Search agents by legal name, email, or managed property..."
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 rounded-lg outline-none" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Role: All Classifications</option>
                <option value="Agent">Role: Commercial Agent</option>
                <option value="Property Manager">Role: Property Manager</option>
              </select>
              <select className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2 rounded-lg outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Status: All Records</option>
                <option value="accepted">Active Mandate</option>
                <option value="revoked">Restricted Access</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {loading ? (
              <p className="p-6 text-sm text-zinc-500">Loading agents...</p>
            ) : filteredAgents.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Users className="w-10 h-10 opacity-40" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No agents invited yet</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                  You haven't assigned external brokers or property managers. Send an official institutional invitation to delegate inspections and rent tracking.
                </p>
                <Button onClick={() => setTab('invite')} className="bg-primary hover:bg-primary text-white gap-2">
                  <UserPlus className="w-4 h-4" /> Invite your first agent
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-5">Agent &amp; Credentials</th>
                      <th className="py-3 px-4">Contact Channel</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Allocated Properties</th>
                      <th className="py-3 px-4">Activity Sync</th>
                      <th className="py-3 px-4">Mandate Status</th>
                      <th className="py-3 px-5 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredAgents.map((inv) => {
                      const recipientName = inv.recipient?.fullName || inv.email;
                      const assigned = inv.assignments?.map((a) => a.listing.title) ?? [];
                      return (
                        <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                                {initials(recipientName)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">{recipientName}</span>
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{inv.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-mono text-zinc-900 dark:text-white">{inv.email}</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">—</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold uppercase">Agent</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative group cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">{assigned.length || (inv.scope === 'all' ? 'All' : '—')} {assigned.length === 1 ? 'Property' : 'Properties'}</span>
                              <Info className="w-3.5 h-3.5 text-zinc-400" />
                              {assigned.length > 0 && (
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex flex-col w-64 p-3 bg-zinc-900 dark:bg-zinc-950 text-white rounded-lg shadow-xl z-20 pointer-events-none">
                                  <span className="text-[10px] uppercase text-[#4edea3] mb-1 font-bold">Assigned Listings:</span>
                                  {assigned.map((t, i) => (
                                    <span key={i} className="text-xs">• {t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{new Date(inv.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3 px-4">{statusPill(statusOf(inv))}</td>
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="text-xs" onClick={() => openReassign(inv)}>Manage Listings</Button>
                              <Button size="sm" variant="ghost" className="text-xs text-red-600 hover:text-red-700 gap-1" onClick={() => revoke(inv.id)} disabled={actionId === inv.id}>
                                <Trash2 className="w-3.5 h-3.5" /> Revoke
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: INVITE NEW AGENT */}
      {tab === 'invite' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Issue Institutional Mandate Invite</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Authorized intermediaries receive an onboarding link with automatic listing tenancy delegation.
              </p>
            </div>
            <form onSubmit={sendInvite} className="space-y-5">
              {/* Role selection */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-2 block">
                  Agent Classification Role <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ROLES.map((r) => (
                    <label
                      key={r.key}
                      onClick={() => setRole(r.key)}
                      className={cn(
                        'relative p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border',
                        role === r.key
                          ? 'bg-primary/10 border-primary/40'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{r.title}</span>
                          <CheckCircle2 className={cn('w-4 h-4', role === r.key ? 'text-primary' : 'text-zinc-400 opacity-30')} />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{r.desc}</p>
                      </div>
                      <span className={cn('text-[10px] font-bold mt-2 uppercase', role === r.key ? 'text-primary' : 'text-zinc-400')}>{r.tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invite-name" className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1 block">
                    Agent Full Legal Name
                  </Label>
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 rounded-lg">
                    <Users className="w-4 h-4 text-zinc-400 mr-2" />
                    <input id="invite-name" className="bg-transparent border-none outline-none w-full text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400" placeholder="e.g. Arc. Babajide Balogun" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="invite-email" className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1 block">
                    Official Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 rounded-lg">
                    <Mail className="w-4 h-4 text-zinc-400 mr-2" />
                    <input id="invite-email" type="email" required className="bg-transparent border-none outline-none w-full text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400" placeholder="agent@agencypartners.ng" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-2 block">Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERMISSIONS.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.id);
                    const isManageTeam = permission.id === 'manage_team';
                    return (
                      <label key={permission.id} className={cn('flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer select-none', isSelected ? 'border-primary/30 bg-primary/5' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600', (isManageTeam && !canManageTeam) && 'opacity-50 cursor-not-allowed')}>
                        <Checkbox checked={isSelected} onCheckedChange={() => togglePermission(permission.id)} disabled={isManageTeam && !canManageTeam} className="mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">{permission.label}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{permission.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Scope */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-2 block">Property Scope</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={cn('flex items-start gap-3 rounded-xl border p-3 cursor-pointer', scopeType === 'all' ? 'border-primary/30 bg-primary/5' : 'border-zinc-200 dark:border-zinc-700')}>
                    <input type="radio" name="scope" checked={scopeType === 'all'} onChange={() => setScopeType('all')} className="mt-1 accent-primary" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">All Current &amp; Future Properties</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Agent automatically gets access to all present and future properties.</p>
                    </div>
                  </label>
                  <label className={cn('flex items-start gap-3 rounded-xl border p-3 cursor-pointer', scopeType === 'specific' ? 'border-primary/30 bg-primary/5' : 'border-zinc-200 dark:border-zinc-700')}>
                    <input type="radio" name="scope" checked={scopeType === 'specific'} onChange={() => setScopeType('specific')} className="mt-1 accent-primary" />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">Specific Properties Only</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Restrict agent access strictly to selected properties.</p>
                    </div>
                  </label>
                </div>

                {scopeType === 'specific' && (
                  <div className="pt-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Select Properties ({selectedListingIds.length} selected)</p>
                      {properties.length > 4 && (
                        <Input placeholder="Search properties..." value={inviteSearch} onChange={(e) => setInviteSearch(e.target.value)} className="h-8 w-40 text-xs" />
                      )}
                    </div>
                    {properties.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed text-center space-y-2">
                        <p className="text-sm text-zinc-500">No properties added yet.</p>
                        <Button asChild variant="outline" size="sm"><Link href="/dashboard/landlord/properties/new">+ Add property</Link></Button>
                      </div>
                    ) : filteredProperties.length === 0 ? (
                      <p className="text-sm text-zinc-500 text-center py-4">No matching properties.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                        {filteredProperties.map((prop) => {
                          const isSelected = selectedListingIds.includes(prop.id);
                          return (
                            <label key={prop.id} className={cn('flex items-start gap-3 rounded-lg border p-3 cursor-pointer', isSelected ? 'border-primary/30 bg-primary/5' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300')}>
                              <Checkbox checked={isSelected} onCheckedChange={() => toggleListing(prop.id)} className="mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{prop.title}</p>
                                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{[prop.address, prop.area, prop.state].filter(Boolean).join(', ')}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Commission & duration (visual) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1 block">Commission Allocation Preset</Label>
                  <select className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2.5 rounded-lg outline-none">
                    <option>Standard 10% Commercial Agency Retainer</option>
                    <option>7.5% Corporate Leasing Mandate</option>
                    <option>5% Co-Agency Sharing Mandate</option>
                    <option>Fixed Retainer / Institutional Agreement</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1 block">Mandate Expiry Window</Label>
                  <select className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-2.5 rounded-lg outline-none">
                    <option>7 Days Validation Window</option>
                    <option>14 Days Validation Window</option>
                    <option>30 Days Standard Offer</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1 block">Formal Letter of Instruction / Message</Label>
                <textarea rows={3} className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg text-sm text-zinc-900 dark:text-white outline-none resize-none" defaultValue="You have been invited to manage listings on PropatiBox. Complete registration to unlock tenant leads." />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Invites dispatched via encrypted SMTP &amp; SMS token.
                </span>
                <Button type="submit" disabled={sending} className="bg-primary hover:bg-primary text-white gap-2">
                  <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Mandate Invite'}
                </Button>
              </div>
            </form>
          </div>

          {/* Right bento */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Lagos State LASRETR Compliance</h4>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Under Lagos State Real Estate Regulatory Authority regulations, external realtors must submit valid CAC registrations or NIESV practice seals before tenancy funds are remitted.
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">Invitation Preview Card</h4>
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center text-xs font-bold">SE</div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">PropatiBox Mandate</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Lekki Commercial Hub</p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-1">
                  <p className="text-[10px] uppercase text-zinc-400 font-semibold">Authorized Units</p>
                  <p className="text-xs font-mono text-zinc-900 dark:text-white font-medium">
                    {selectedListingIds.length === 0 ? 'All listings' : selectedListingIds.length === 1 ? properties.find((p) => p.id === selectedListingIds[0])?.title : `${properties.find((p) => p.id === selectedListingIds[0])?.title} + ${selectedListingIds.length - 1} more`}
                  </p>
                  <span className="inline-flex items-center gap-1 text-primary text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Instant Escrow Allocation</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Agent Self-Registration</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Did your agent already create a PropatiBox profile? Provide their registered email and portfolio listings attach instantaneously.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: HISTORY */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'pending', 'accepted', 'expired', 'revoked'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-semibold transition-all',
                    historyFilter === f
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? groupedInvites.length : groupedInvites.filter((i) => statusOf(i) === f).length})
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <Filter className="w-3.5 h-3.5" /> Sorted by: Most Recent
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {loading ? (
              <p className="p-6 text-sm text-zinc-500">Loading history...</p>
            ) : filteredHistory.length === 0 ? (
              <p className="p-6 text-sm text-zinc-500">No invitations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-5">Invited Intermediary</th>
                      <th className="py-3 px-4">Mandate Scope</th>
                      <th className="py-3 px-4">Target Listing(s)</th>
                      <th className="py-3 px-4">Invite Status</th>
                      <th className="py-3 px-4">Issuance &amp; Expiry</th>
                      <th className="py-3 px-5 text-right">Lifecycle Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredHistory.map((inv) => {
                      const st = statusOf(inv);
                      const assigned = inv.assignments?.map((a) => a.listing.title) ?? [];
                      const target = inv.scope === 'all' ? 'All Listings (Portfolio-wide)' : (assigned.length ? assigned.join(', ') : '—');
                      return (
                        <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors" data-status={st}>
                          <td className="py-3 px-5">
                            <div className="flex flex-col">
                              <span className={cn('text-sm font-semibold text-zinc-900 dark:text-white', st === 'revoked' && 'line-through text-zinc-400')}>{inv.email}</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">{inv.recipient?.fullName || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold uppercase">{inv.recipient?.fullName ? 'Agent' : 'Agent'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-zinc-900 dark:text-white font-medium">{target}</span>
                          </td>
                          <td className="py-3 px-4">{statusPill(st)}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-mono text-zinc-900 dark:text-white">{new Date(inv.createdAt).toLocaleDateString()}</span>
                              {st === 'pending' && <span className="text-[10px] text-amber-600">Pending acceptance</span>}
                              {st === 'revoked' && <span className="text-[10px] text-red-600">Revoked by trustee</span>}
                            </div>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {st === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast({ title: 'Resent', description: `Invite re-dispatched to ${inv.email}.` })}>
                                    <RefreshCw className="w-3.5 h-3.5" /> Resend
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-xs text-red-600" onClick={() => revoke(inv.id)} disabled={actionId === inv.id}>
                                    Revoke
                                  </Button>
                                </>
                              )}
                              {st === 'expired' && (
                                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => toast({ title: 'Re-issued', description: `Invite re-issued to ${inv.email}.` })}>
                                  <RefreshCw className="w-3.5 h-3.5" /> Re-issue
                                </Button>
                              )}
                              {st === 'accepted' && (
                                <span className="text-[10px] font-semibold uppercase text-zinc-400">Active in Roster</span>
                              )}
                              {st === 'revoked' && (
                                <span className="text-xs font-mono text-zinc-400">No actions</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reassign dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">Reassign Listings</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Search properties..." value={reassignSearch} onChange={(e) => setReassignSearch(e.target.value)} />
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {filteredReassignProperties.map((prop) => {
                const isSelected = reassignListingIds.includes(prop.id);
                return (
                  <label key={prop.id} className={cn('flex items-start gap-3 rounded-lg border p-3 cursor-pointer', isSelected ? 'border-primary/30 bg-primary/5' : 'border-zinc-200 dark:border-zinc-700')}>
                    <Checkbox checked={isSelected} onCheckedChange={() => setReassignListingIds((prev) => (prev.includes(prop.id) ? prev.filter((x) => x !== prop.id) : [...prev, prop.id]))} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{prop.title}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{[prop.address, prop.area, prop.state].filter(Boolean).join(', ')}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setReassignOpen(false)}>Cancel</Button>
            <Button onClick={saveReassign} disabled={reassignSaving} className="bg-primary hover:bg-primary text-white">
              {reassignSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
