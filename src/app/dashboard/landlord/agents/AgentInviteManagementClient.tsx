'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const STANDARD_PERMISSIONS = PERMISSIONS.filter((p) => p.id !== 'manage_team').map((p) => p.id);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(STANDARD_PERMISSIONS);
  const [scopeType, setScopeType] = useState<'all' | 'specific'>('all');
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignTargetId, setReassignTargetId] = useState<string | null>(null);
  const [reassignListingIds, setReassignListingIds] = useState<string[]>([]);
  const [reassignSaving, setReassignSaving] = useState(false);
  const [reassignSearch, setReassignSearch] = useState('');
  const { toast } = useToast();

  const filteredProperties = useMemo(() => {
    const q = inviteSearch.trim().toLowerCase();
    if (!q) return properties;
    return properties
      .filter((p) => p.title.trim() && p.address.trim())
      .filter((p) => `${p.title} ${p.address} ${p.area} ${p.state}`.toLowerCase().includes(q));
  }, [properties, inviteSearch]);

  const filteredReassignProperties = useMemo(() => {
    const q = reassignSearch.trim().toLowerCase();
    if (!q) return properties;
    return properties
      .filter((p) => p.title.trim() && p.address.trim())
      .filter((p) => `${p.title} ${p.address} ${p.area} ${p.state}`.toLowerCase().includes(q));
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

  // Group invites by email — keep only the latest status per email,
  // with full audit history available for expansion
  const groupedInvites = useMemo(() => {
    if (!invites.length) return [];
    const byEmail: Record<string, AgentInviteWithRelations[]> = {};
    invites.forEach((inv) => {
      const emailKey = inv.email.toLowerCase();
      if (!byEmail[emailKey]) byEmail[emailKey] = [];
      byEmail[emailKey].push(inv);
    });
    // For each email, pick the latest invite as the representative
    return Object.values(byEmail).map((group) => {
      const sorted = group.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return sorted[0];
    });
  }, [invites]);

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleListing = (id: string) => {
    setSelectedListingIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      await apiEndpoints.agentInvites.create({
        email: email.trim(),
        permissions: selectedPermissions,
        scope: scopeType,
        listingIds: scopeType === 'specific' ? selectedListingIds : [],
      });
      setEmail('');
      setSelectedPermissions([]);
      setScopeType('all');
      setSelectedListingIds([]);
      toast({
        title: 'Invitation sent',
        description: `Agent invite sent to ${email.trim()}.`,
      });
      await load();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Failed to send invite',
        description: err?.response?.data?.error || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const revoke = async (id: string) => {
    setActionId(id);
    try {
      await apiEndpoints.agentInvites.revoke(id);
      await load();
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
      toast({
        title: 'Reassign failed',
        description: err?.response?.data?.error || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setReassignSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Agent Management</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Invite agents to manage your listings. Agents can register directly; invites are optional.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="shrink-0 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">
          + Invite Agent
        </Button>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">Invite Agent</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => { await sendInvite(e); setInviteOpen(false); }} className="space-y-6">
        {/* Email Input */}
        <div className="glass-card p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-label-sm uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-xl dark:bg-zinc-800/60 dark:placeholder:text-gray-400"
              required
            />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              If they don't have an account, they'll be prompted to create one when they accept.
            </p>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="glass-card p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-label-sm uppercase tracking-wide text-zinc-900 dark:text-white">Permissions</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Pick what this agent can do. You can change this later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERMISSIONS.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                const isManageTeam = permission.id === 'manage_team';
                const canGrantManageTeam = canManageTeam;
                return (
                  <label
                    key={permission.id}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-zinc-200 dark:border-white/[0.08] bg-emerald-500/5 shadow-none shadow-primary/10'
                        : 'border-zinc-200 dark:border-white/[0.08] hover:border-white/40 hover:bg-zinc-100 dark:hover:bg-zinc-900est',
                      (isManageTeam && !canGrantManageTeam) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePermission(permission.id)}
                      disabled={isManageTeam && !canGrantManageTeam}
                      className={cn(
                        "mt-0.5 dark:border-white/50 dark:bg-transparent",
                        isSelected && "dark:bg-emerald-500"
                      )}
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-zinc-900 dark:text-white">{permission.label}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {permission.description}
                      </p>
                      {isManageTeam && !canGrantManageTeam && (
                        <p className="text-xs text-red-400">
                          Admin-only permission — cannot grant.
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scope */}
        <div className="glass-card p-6 border-0 ring-1 ring-foreground/5 space-y-4">
          <div className="space-y-1">
            <h2 className="font-label-sm uppercase tracking-wide text-zinc-900 dark:text-white">Property Scope</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Choose which properties this agent can manage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* All Properties */}
            <label
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer select-none',
                scopeType === 'all'
                  ? 'border-zinc-200 dark:border-white/[0.08] bg-emerald-500/5 shadow-none shadow-primary/10'
                  : 'border-zinc-200 dark:border-white/[0.08] hover:border-white/40 hover:bg-zinc-100 dark:hover:bg-zinc-900est'
              )}
            >
              <input
                type="radio"
                name="scope"
                checked={scopeType === 'all'}
                onChange={() => setScopeType('all')}
                className="mt-1 accent-primary"
              />
              <div className="space-y-1">
                <p className="font-medium text-sm text-zinc-900 dark:text-white">All Current &amp; Future Properties</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Agent automatically gets access to all your present properties and any properties created in the future.
                </p>
              </div>
            </label>

            {/* Specific Properties */}
            <label
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer select-none',
                scopeType === 'specific'
                  ? 'border-zinc-200 dark:border-white/[0.08] bg-emerald-500/5 shadow-none shadow-primary/10'
                  : 'border-zinc-200 dark:border-white/[0.08] hover:border-white/40 hover:bg-zinc-100 dark:hover:bg-zinc-900est'
              )}
            >
              <input
                type="radio"
                name="scope"
                checked={scopeType === 'specific'}
                onChange={() => setScopeType('specific')}
                className="mt-1 accent-primary"
              />
              <div className="space-y-1">
                <p className="font-medium text-sm text-zinc-900 dark:text-white">Specific Properties Only</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Restrict agent access strictly to selected properties.
                </p>
              </div>
            </label>
          </div>

          {/* Specific Property Selection Grid */}
          {scopeType === 'specific' && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Select Properties ({selectedListingIds.length} selected)</p>
                {properties.length > 4 && (
                  <div className="relative">
                    <Input
                      placeholder="Search properties..."
                      value={inviteSearch}
                      onChange={(e) => setInviteSearch(e.target.value)}
                      className="h-8 w-40 bg-zinc-50 dark:bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08] text-xs"
                    />
                  </div>
                )}
              </div>
              {properties.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed text-center space-y-2 bg-zinc-900/20">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No properties added yet.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/landlord/properties/new">+ Add property</Link>
                  </Button>
                </div>
              ) : filteredProperties.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No matching properties.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredProperties.map((prop) => {
                    const isSelected = selectedListingIds.includes(prop.id);
                    return (
                      <label
                        key={prop.id}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer select-none',
                          isSelected
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-zinc-200 dark:border-white/[0.08] hover:border-white/20'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleListing(prop.id)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white" title={prop.title}>{prop.title}</p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={[prop.address, prop.area, prop.state].filter(Boolean).join(', ')}>
                            {[prop.address, prop.area, prop.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {sending ? 'Sending…' : 'Send invite'}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sent Invites — focused roster */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-heading font-semibold text-zinc-900 dark:text-white">Sent Invites</h4>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{groupedInvites.length} total</span>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading invites...</p>
        ) : groupedInvites.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 dark:border-white/[0.08] bg-zinc-900/50 p-8 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No invites sent yet.</p>
            <Button onClick={() => setInviteOpen(true)} variant="outline" size="sm" className="mt-3 border-zinc-200 dark:border-white/[0.08] text-zinc-300 hover:bg-white dark:bg-zinc-900">
              Invite your first agent
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-white dark:bg-zinc-950/50">
                  <th className="px-4 py-3 font-label-sm text-zinc-500 dark:text-zinc-400 uppercase">Email</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-500 dark:text-zinc-400 uppercase">Recipient</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-500 dark:text-zinc-400 uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-500 dark:text-zinc-400 uppercase">Assigned Listings</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-500 dark:text-zinc-400 uppercase">Sent</th>
                  <th className="px-4 py-3 font-label-sm text-zinc-500 dark:text-zinc-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {groupedInvites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-zinc-950/60">
                    <td className="px-4 py-3 text-sm">{invite.email}</td>
                    <td className="px-4 py-3 text-sm">{invite.recipient?.fullName || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'revoked' ? 'destructive' : 'secondary'}>
                        {invite.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {invite.scope === 'all' ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                          All Properties
                        </span>
                      ) : invite.assignments && invite.assignments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {invite.assignments.map((a) => (
                            <span key={a.id} className="text-xs px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                              {a.listing.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(invite.createdAt).toLocaleDateString('en-NG')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {invite.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revoke(invite.id)}
                          disabled={actionId === invite.id}
                        >
                          {actionId === invite.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      )}
                      {invite.status === 'accepted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReassign(invite)}
                          disabled={actionId === invite.id}
                        >
                          Reassign
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Reassign Dialog */}
      <Dialog open={reassignOpen} onOpenChange={(open) => { setReassignOpen(open); if (!open) setReassignSearch(''); }}>
        <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">Reassign Listings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select which listings this agent should manage.</p>
            {properties.length > 3 && (
              <Input
                placeholder="Search properties..."
                value={reassignSearch}
                onChange={(e) => setReassignSearch(e.target.value)}
                className="bg-white dark:bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]"
              />
            )}
            {properties.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No properties available.</p>
            ) : filteredReassignProperties.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No matching properties.</p>
            ) : (
              <div className="space-y-2">
                {filteredReassignProperties.map((prop) => {
                  const checked = reassignListingIds.includes(prop.id);
                  return (
                    <label
                      key={prop.id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 cursor-pointer select-none transition-all',
                        checked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-200 dark:border-white/[0.08] hover:border-white/20'
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          setReassignListingIds((prev) =>
                            prev.includes(prop.id) ? prev.filter((id) => id !== prop.id) : [...prev, prop.id]
                          );
                        }}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white" title={prop.title}>{prop.title}</p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={[prop.address, prop.area, prop.state].filter(Boolean).join(', ')}>
                          {[prop.address, prop.area, prop.state].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setReassignOpen(false)} disabled={reassignSaving}>
              Cancel
            </Button>
            <Button onClick={saveReassign} disabled={reassignSaving}>
              {reassignSaving ? 'Saving...' : 'Save Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}