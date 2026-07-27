'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiEndpoints } from '@/lib/api';
import type { AgentInvite } from '@/lib/api';

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

export default function AgentInviteManagementClient() {
  const [invites, setInvites] = useState<AgentInvite[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();

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

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
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
      await apiEndpoints.agentInvites.create({ email: email.trim() });
      setEmail('');
      setSelectedPermissions([]);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/landlord/agents"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="font-heading text-headline-lg text-primary">Invite agent</h1>
          <p className="text-on-surface-variant">They&apos;ll get an email to accept the invite</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="size-4" />
            Refer &amp; earn
          </Button>
          <Badge variant="destructive" className="px-2.5 py-1 text-xs">UNVERIFIED</Badge>
        </div>
      </div>

      <form onSubmit={sendInvite} className="space-y-6">
        {/* Email Input */}
        <Card className="p-6">
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
              className="max-w-xl"
              required
            />
            <p className="text-sm text-on-surface-variant">
              If they don&apos;t have an account, they&apos;ll be prompted to create one when they accept.
            </p>
          </div>
        </Card>

        {/* Permissions Grid */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-label-sm uppercase tracking-wide text-primary">Permissions</h2>
              <p className="text-sm text-on-surface-variant">
                Pick what this agent can do. You can change this later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERMISSIONS.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                return (
                  <button
                    key={permission.id}
                    type="button"
                    onClick={() => togglePermission(permission.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-outline hover:border-primary/40 hover:bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePermission(permission.id)}
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-primary">{permission.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Scope */}
        <Card className="p-6">
          <div className="space-y-2">
            <h2 className="font-label-sm uppercase tracking-wide text-primary">Scope</h2>
            <p className="text-sm text-on-surface-variant">
              Leave empty to apply to all current and future listings. Add a listing first to scope the agent&apos;s access.
            </p>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={sending}>
            {sending ? 'Sending invite...' : 'Send invite'}
          </Button>
        </div>
      </form>

      {/* Sent Invites */}
      <Card className="p-6">
        <h4 className="font-heading text-primary mb-4">Sent Invites</h4>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No invites yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Email</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Sent</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-3 text-sm">{invite.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'revoked' ? 'destructive' : 'secondary'}>
                        {invite.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {new Date(invite.createdAt).toLocaleDateString()}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
