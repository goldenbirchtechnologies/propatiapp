'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, UserPlus, CheckCircle2, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganizations, useOrganizationListings } from '@/hooks/useOrganizations';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PERMISSIONS = [
  { id: 'add_tenants', label: 'Add tenants', description: 'Assign tenants to vacant units and create leases.' },
  { id: 'record_payments', label: 'Record payments', description: 'Mark rent or invoices as paid.' },
  { id: 'renew_leases', label: 'Renew leases', description: 'Extend existing leases on your behalf.' },
  { id: 'upload_agreements', label: 'Upload agreements', description: 'Attach tenancy agreements to leases.' },
  { id: 'maintenance', label: 'Maintenance', description: 'Triage and act on maintenance requests.' },
  { id: 'view_payments', label: 'View payments', description: 'Read-only access to payment history.' },
  { id: 'view_reports', label: 'View reports', description: 'Read-only access to financial reports.' },
  { id: 'remove_tenants', label: 'Remove tenants', description: 'Terminate leases and vacate units.' },
];

export default function InvitePropertyManagerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('');

  const { data: orgsData } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: listingsData, isLoading: listingsLoading } = useOrganizationListings(orgId || '', !!orgId);
  const { data: currentUser } = useCurrentUser();

  const isVerified = Boolean(
    currentUser?.ninVerified || currentUser?.phoneVerified || currentUser?.idVerified || currentUser?.profileCompleted
  );

  const togglePermission = (id: string) => {
    setSelectedPermissions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Email is required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const createResult = await api.post<{ success?: boolean; error?: string }>(
        '/dashboard/estate-manager/property-manager-invites',
        {
          email: email.trim(),
          permissions: selectedPermissions,
          scope: selectedListingId ? [selectedListingId] : [],
        }
      );

      const isSuccess = createResult?.success || !createResult?.error;
      if (isSuccess) {
        toast({
          title: 'Invitation sent',
          description: `Property manager invite sent to ${email.trim()}.`,
        });
        router.push('/dashboard/estate-manager/team');
      } else {
        toast({ title: createResult?.error || 'Failed to send invite', variant: 'destructive' });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast({
        title: 'Failed to send invite',
        description: err?.response?.data?.error || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard/estate-manager/team"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="font-heading text-headline-lg text-white">Invite property manager</h1>
          <p className="text-neutral-400">They'll get an email to accept the invite</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {isVerified ? 'Verified' : 'Unverified'}
                <ChevronDown className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-(--radix-dropdown-menu-trigger-width)">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/estate-manager/profile">View profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/estate-manager/verification">Start verification</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="size-4" />
            Refer &amp; earn
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="max-w-xl dark:bg-zinc-800/60 dark:placeholder:text-gray-400"
              required
            />
            <p className="text-sm text-neutral-400">
              If they don't have an account, they'll be prompted to create one when they accept.
            </p>
          </div>
        </Card>

        {/* Permissions Grid */}
        <Card className="p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-label-sm uppercase tracking-wide text-white">Permissions</h2>
              <p className="text-sm text-neutral-400">
                Pick what this property manager can do. You can change this later.
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
                    className={cn(
                      'text-left rounded-xl border p-4 transition-all',
                      isSelected
                        ? 'border-primary bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
                        : 'border-white/[0.08] hover:border-white/40 hover:bg-zinc-900est'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <div className="h-4 w-4 rounded-md border border-white/[0.08]" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm text-white">{permission.label}</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">
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
        <Card className="p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-2">
            <h2 className="font-label-sm uppercase tracking-wide text-white">Scope</h2>
            <p className="text-sm text-neutral-400">
              Leave empty to apply to all current and future properties. Add a property first to scope the property manager.
            </p>
            <div className="max-w-xl">
              <label className="block text-sm font-medium text-white mb-1">Property</label>
              <select
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="inp-field"
              >
                <option value="">All properties</option>
                {(listingsData?.data || []).map((listing: { id: string; title: string }) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title}
                  </option>
                ))}
              </select>
              {listingsLoading && <p className="text-xs text-zinc-400 mt-1">Loading properties...</p>}
              {!listingsLoading && !(listingsData?.data || []).length && (
                <p className="text-xs text-zinc-400 mt-1">No properties found.</p>
              )}
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending invite...' : 'Send invite'}
          </Button>
        </div>
      </form>
    </div>
  );
}
