'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

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
          scope: [],
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
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <h1 className="font-heading text-headline-lg text-primary">Invite property manager</h1>
          <p className="text-on-surface-variant">They'll get an email to accept the invite</p>
        </div>
        <div className="flex items-center gap-2">
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
              className="max-w-xl dark:bg-slate-800/60 dark:placeholder:text-gray-400"
              required
            />
            <p className="text-sm text-on-surface-variant">
              If they don't have an account, they'll be prompted to create one when they accept.
            </p>
          </div>
        </Card>

        {/* Permissions Grid */}
        <Card className="p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-label-sm uppercase tracking-wide text-primary">Permissions</h2>
              <p className="text-sm text-on-surface-variant">
                Pick what this property manager can do. You can change this later.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERMISSIONS.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                return (
                  <div
                    key={permission.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => togglePermission(permission.id)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        togglePermission(permission.id);
                      }
                    }}
                    className={cn(
                      'text-left rounded-xl border p-4 transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-outline hover:border-primary/40 hover:bg-surface-container-lowest'
                    )}
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
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Scope */}
        <Card className="p-6 border-0 ring-1 ring-foreground/5">
          <div className="space-y-2">
            <h2 className="font-label-sm uppercase tracking-wide text-primary">Scope</h2>
            <p className="text-sm text-on-surface-variant">
              Leave empty to apply to all current and future properties. Add a property first to scope the property manager.
            </p>
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
