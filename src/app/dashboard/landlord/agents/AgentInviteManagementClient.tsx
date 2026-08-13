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
import { cn } from '@/lib/utils';

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

export default function AgentInviteManagementClient({ properties = [] }: { properties?: PropertyItem[] }) {
  const [invites, setInvites] = useState<AgentInvite[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [scopeType, setScopeType] = useState<'all' | 'specific'>('all');
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
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
          <h1 className="font-heading text-headline-lg text-foreground">Invite agent</h1>
          <p className="text-sm text-muted-foreground">
            They'll get an email to accept the invite
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="size-4" />
            Refer &amp; earn
          </Button>
        </div>
      </div>

      <form onSubmit={sendInvite} className="space-y-6">
        {/* Email Input */}
        <Card className="p-6 border-0 ring-1 ring-foreground/5">
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
              className="max-w-xl dark:bg-slate-800/60 dark:placeholder:text-gray-400"
              required
            />
            <p className="text-sm text-muted-foreground">
              If they don't have an account, they'll be prompted to create one when they accept.
            </p>
          </div>
        </Card>

        {/* Permissions Grid */}
        <Card className="p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-label-sm uppercase tracking-wide text-foreground">Permissions</h2>
              <p className="text-sm text-muted-foreground">
                Pick what this agent can do. You can change this later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERMISSIONS.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                return (
                  <label
                    key={permission.id}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-outline hover:border-primary/40 hover:bg-surface-container-lowest'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => togglePermission(permission.id)}
                      className={cn(
                        "mt-0.5 dark:border-white/50 dark:bg-transparent",
                        isSelected && "dark:bg-primary"
                      )}
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-foreground">{permission.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {permission.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Scope */}
        <Card className="p-6 border-0 ring-1 ring-foreground/5 space-y-4">
          <div className="space-y-1">
            <h2 className="font-label-sm uppercase tracking-wide text-foreground">Property Scope</h2>
            <p className="text-sm text-muted-foreground">
              Choose which properties this agent can manage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* All Properties */}
            <label
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer select-none',
                scopeType === 'all'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-outline hover:border-primary/40 hover:bg-surface-container-lowest'
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
                <p className="font-medium text-sm text-foreground">All Current &amp; Future Properties</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Agent automatically gets access to all your present properties and any properties created in the future.
                </p>
              </div>
            </label>

            {/* Specific Properties */}
            <label
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-all cursor-pointer select-none',
                scopeType === 'specific'
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-outline hover:border-primary/40 hover:bg-surface-container-lowest'
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
                <p className="font-medium text-sm text-foreground">Specific Properties Only</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Restrict agent access strictly to selected properties.
                </p>
              </div>
            </label>
          </div>

          {/* Specific Property Selection Grid */}
          {scopeType === 'specific' && (
            <div className="pt-2 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Properties ({selectedListingIds.length} selected)</p>
              {properties.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed text-center space-y-2 bg-muted/20">
                  <p className="text-sm text-muted-foreground">No properties added yet.</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/landlord/properties/new">+ Add property</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {properties.map((prop) => {
                    const isSelected = selectedListingIds.includes(prop.id);
                    return (
                      <label
                        key={prop.id}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer select-none',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-outline hover:border-primary/40'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleListing(prop.id)}
                          className="mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm text-foreground line-clamp-1">{prop.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
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
        <h4 className="font-heading text-foreground mb-4">Sent Invites</h4>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invites yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-4 py-3 font-label-sm text-muted-foreground uppercase">Email</th>
                  <th className="px-4 py-3 font-label-sm text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-muted-foreground uppercase">Sent</th>
                  <th className="px-4 py-3 font-label-sm text-muted-foreground uppercase">Action</th>
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
                    <td className="px-4 py-3 text-sm text-muted-foreground">
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
