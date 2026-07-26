'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  RefreshCw,
  Mail,
  UserPlus,
  ShieldOff,
  Copy,
  Trash2,
  AlertCircle,
  Users,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
type MemberRole = 'manager' | 'accountant' | 'maintenance' | 'owner_view';

interface OrgMember {
  id: string;
  orgId: string;
  orgName: string;
  orgPlanTier: string;
  email: string | null;
  role: MemberRole;
  status: 'pending' | 'active' | 'removed';
  inviteToken: string | null;
  invitedBy: string | null;
  joinedAt: string | null;
  createdAt: string;
}

interface InvitesClientProps {
  initialMembers: OrgMember[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status: OrgMember['status']) {
  switch (status) {
    case 'active':
      return <Badge className="tag-green">Active</Badge>;
    case 'pending':
      return <Badge className="tag-amber">Pending</Badge>;
    case 'removed':
      return <Badge className="tag-red">Removed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function roleBadge(role: MemberRole) {
  switch (role) {
    case 'manager':
      return <Badge className="tag-blue">Manager</Badge>;
    case 'accountant':
      return <Badge className="tag-purple">Accountant</Badge>;
    case 'maintenance':
      return <Badge className="tag-amber">Maintenance</Badge>;
    case 'owner_view':
      return <Badge className="tag-gray">Owner View</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
}

function tokenPlaceholder() {
  const chars = 'abcdef0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InvitesClient({ initialMembers }: InvitesClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Data state
  const [members, setMembers] = useState<OrgMember[]>(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // New invite dialog
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<MemberRole>('manager');
  const [newOrgId, setNewOrgId] = useState('');
  const [newNote, setNewNote] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Unique orgs for dropdown
  const orgOptions = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) => map.set(m.orgId, m.orgName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [members]);

  // Filtered records
  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        (m.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.inviteToken ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, searchTerm, statusFilter, roleFilter]);

  // Summary counts
  const counts = useMemo(() => {
    const pending = members.filter((m) => m.status === 'pending').length;
    const active = members.filter((m) => m.status === 'active').length;
    const removed = members.filter((m) => m.status === 'removed').length;
    return { pending, active, removed, total: members.length };
  }, [members]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleSendInvite = async () => {
    if (!newEmail || !newOrgId) {
      toast({
        title: 'Missing fields',
        description: 'Email and organisation are required.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
      return;
    }
    setSendingInvite(true);
    try {
      // Simulate API call — in production call your invite endpoint
      await new Promise((resolve) => setTimeout(resolve, 800));

      const fakeToken = tokenPlaceholder();
      const newMember: OrgMember = {
        id: `mem_${tokenPlaceholder()}${tokenPlaceholder()}`,
        orgId: newOrgId,
        orgName: orgOptions.find((o) => o.id === newOrgId)?.name ?? 'Unknown',
        orgPlanTier: 'starter',
        email: newEmail,
        role: newRole,
        status: 'pending',
        inviteToken: fakeToken,
        invitedBy: 'admin',
        joinedAt: null,
        createdAt: new Date().toISOString(),
      };

      setMembers((prev) => [newMember, ...prev]);
      toast({
        title: 'Invite sent',
        description: `Invitation sent to ${newEmail}.`,
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      setInviteOpen(false);
      setNewEmail('');
      setNewRole('manager');
      setNewOrgId('');
      setNewNote('');
    } catch {
      toast({
        title: 'Failed to send invite',
        description: 'An unexpected error occurred.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRevoke = async (memberId: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: 'removed' as const } : m)),
      );
      toast({
        title: 'Invite revoked',
        description: 'The invite has been revoked.',
        className: 'bg-amber-50 border-amber-200 text-amber-800',
      });
    } catch {
      toast({
        title: 'Failed to revoke',
        description: 'An unexpected error occurred.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: 'Copied',
        description: 'Invite token copied to clipboard.',
        className: 'bg-blue-50 border-blue-200 text-blue-800',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy token.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    }
  };

  const handleRetry = () => {
    setError(null);
    router.refresh();
  };

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Invites</h1>
            <p className="text-muted-foreground mt-1">Manage organisation invitations.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Unable to load invites</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            User Invites
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Manage organisation invitations and pending members.
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send Organisation Invite</DialogTitle>
              <DialogDescription>
                Invite a new member to an organisation. They will receive a link to join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="org">Organisation</Label>
                <Select value={newOrgId} onValueChange={setNewOrgId}>
                  <SelectTrigger id="org">
                    <SelectValue placeholder="Select organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as MemberRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="owner_view">Owner View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  rows={2}
                  placeholder="Optional message for the invitee"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={sendingInvite}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite} disabled={sendingInvite}>
                {sendingInvite ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Invite
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        <style>{`
          @media (max-width: 768px) {
            .invites-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .invites-summary-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="invites-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Total</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{counts.total}</p>
        </div>
        <div className="invites-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Pending</p>
          <p className="text-2xl font-bold mt-1 tag-amber">{counts.pending}</p>
        </div>
        <div className="invites-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Active</p>
          <p className="text-2xl font-bold mt-1 tag-green">{counts.active}</p>
        </div>
        <div className="invites-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Removed</p>
          <p className="text-2xl font-bold mt-1 tag-red">{counts.removed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--muted)' }}
            />
            <Input
              placeholder="Search by email, org, or token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="owner_view">Owner View</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setRoleFilter('all');
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Tabs: All / Pending / Active */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
        </TabsList>

        {(['all', 'pending', 'active'] as const).map((tab) => {
          const tabMembers = tab === 'all' ? filtered : filtered.filter((m) => m.status === tab);

          return (
            <TabsContent key={tab} value={tab} className="mt-6">
              {tabMembers.length === 0 ? (
                <div className="text-center py-16 card">
                  {tab === 'pending' ? (
                    <Clock className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
                  ) : tab === 'active' ? (
                    <CheckCircle2 className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
                  ) : (
                    <Users className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
                  )}
                  <p className="text-lg font-medium mt-4" style={{ color: 'var(--muted)' }}>
                    {tab === 'pending'
                      ? 'No pending invites'
                      : tab === 'active'
                        ? 'No active members'
                        : 'No invites found'}
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                    {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                      ? 'Try adjusting your filters.'
                      : tab === 'pending'
                        ? 'All invites have been accepted or revoked.'
                        : tab === 'active'
                          ? 'No active members yet.'
                          : 'Send your first invite to get started.'}
                  </p>
                </div>
              ) : (
                <div className="card overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Email
                        </th>
                        <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Organisation
                        </th>
                        <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Role
                        </th>
                        <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Token
                        </th>
                        <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Created
                        </th>
                        <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabMembers.map((m) => (
                        <tr key={m.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="rounded-full flex-shrink-0 flex items-center justify-center"
                                style={{
                                  width: 36,
                                  height: 36,
                                  background: 'var(--surface)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                <Mail className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                              </div>
                              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                                {m.email}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                            {m.orgName}
                          </td>
                          <td className="p-4">{roleBadge(m.role)}</td>
                          <td className="p-4">{statusBadge(m.status)}</td>
                          <td className="p-4">
                            {m.inviteToken ? (
                              <div className="flex items-center gap-2">
                                <code
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--muted)',
                                  }}
                                >
                                  {m.inviteToken.slice(0, 8)}...
                                </code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleCopyToken(m.inviteToken!)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                —
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                            {new Date(m.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            {m.status === 'pending' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRevoke(m.id)}
                                disabled={loading}
                              >
                                <ShieldOff className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            )}
                            {m.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevoke(m.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                            {m.status === 'removed' && (
                              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                Revoked
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
