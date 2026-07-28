'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, User, Phone, Mail, CheckCircle2, XCircle, ShieldOff, Trash2, ClipboardList } from 'lucide-react';
import Link from 'next/link';

type RequestRow = {
  id: string;
  listingId: string;
  listingTitle: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  status: string;
  notes?: string;
};

type ShortLetClientProps = {
  initialRequests: RequestRow[];
  listings: { id: string; title: string; allowShortlet: boolean }[];
};

type ActionItem = {
  next: string;
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
};

const STATUS_ACTIONS: Record<string, ActionItem[]> = {
  pending: [
    { next: 'approved', label: 'Approve', icon: <CheckCircle2 className="h-4 w-4" />, variant: 'default' },
    { next: 'rejected', label: 'Reject', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' },
  ],
  approved: [
    { next: 'revoked', label: 'Revoke', icon: <ShieldOff className="h-4 w-4" />, variant: 'outline' },
  ],
  rejected: [
    { next: 'approved', label: 'Approve', icon: <CheckCircle2 className="h-4 w-4" />, variant: 'default' },
  ],
  revoked: [
    { next: 'approved', label: 'Approve', icon: <CheckCircle2 className="h-4 w-4" />, variant: 'default' },
  ],
  withdrawn: [
    { next: 'approved', label: 'Approve', icon: <CheckCircle2 className="h-4 w-4" />, variant: 'default' },
    { next: 'rejected', label: 'Reject', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' },
  ],
};

export default function ShortLetClient({ initialRequests, listings }: ShortLetClientProps) {
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [requests, setRequests] = useState<RequestRow[]>(initialRequests);
  const [loading, setLoading] = useState(false);
  const [actionIds, setActionIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const filteredRequests = selectedListingId === 'all'
    ? requests
    : requests.filter((r) => r.listingId === selectedListingId);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const revokedCount = requests.filter((r) => r.status === 'revoked').length;

  const mutate = async (id: string, body: { status: string; notes?: string }) => {
    setLoading(true);
    setActionIds((prev) => [...prev, id]);
    setErrors((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`/api/tenant-shortlets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Action failed');
      }

      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...json.data } : r)));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : 'Action failed' }));
    } finally {
      setLoading(false);
      setActionIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    setActionIds((prev) => [...prev, id]);
    setErrors((prev) => ({ ...prev, [id]: null }));
    try {
      const res = await fetch(`/api/tenant-shortlets/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Delete failed');
      }
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : 'Delete failed' }));
    } finally {
      setLoading(false);
      setActionIds((prev) => prev.filter((item) => item !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">Operations</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Short-let requests</h2>
          <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
            Authorise tenants to list your approved properties for short-let.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              const res = await fetch('/api/tenant-shortlets');
              const json = await res.json();
              if (res.ok && json?.success) setRequests(json.data);
              setLoading(false);
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{requests.length}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Requests across all properties</p>
        </Card>
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Pending</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{pendingCount}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Need your review</p>
        </Card>
        <Card className="border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Approved</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{approvedCount}</p>
          <p className="mt-1 text-xs text-on-surface-variant">{revokedCount} revoked</p>
        </Card>
      </div>

      <Card className="space-y-5 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-primary">Property</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-surface-container-lowest p-2 text-sm"
              value={selectedListingId}
              onChange={(e) => setSelectedListingId(e.target.value)}
            >
              <option value="all">All properties</option>
              {listings.map((l) => (
                <option key={l.id} value={l.id}>{l.title} {l.allowShortlet ? '(enabled)' : ''}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-primary">Tenant shortlet access</label>
            <p className="text-xs text-slate-500">Tenants can request shortlet access on listings you own.</p>
            {listings.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">No listings matched.</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {loading && !actionIds.length && <p className="text-sm text-on-surface-variant">Loading requests…</p>}
          {!loading && filteredRequests.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest/70 p-8 text-center shadow-sm">
              <ClipboardList className="w-9 h-9 mx-auto mb-3 text-primary" />
              <p className="font-semibold text-foreground mb-1">No requests yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Tenant shortlet requests will appear here once guests request access.</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" variant="outline" className="gap-2" onClick={async () => {
                  setLoading(true);
                  const res = await fetch('/api/tenant-shortlets');
                  const json = await res.json();
                  if (res.ok && json?.success) setRequests(json.data);
                  setLoading(false);
                }}>
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
                <Button asChild size="sm" className="gap-2">
                  <Link href="/dashboard/landlord/properties">
                    <User className="h-4 w-4" /> View properties
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {filteredRequests.map((req) => {
            const actions = STATUS_ACTIONS[req.status] || [];
            return (
              <div key={req.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-surface-container-lowest p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">{req.listingTitle}</p>
                  <p className="text-xs text-on-surface-variant">Tenant: {req.tenantName}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant">
                    {req.tenantEmail && (
                      <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {req.tenantEmail}</span>
                    )}
                    {req.tenantPhone && (
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {req.tenantPhone}</span>
                    )}
                  </div>
                  {req.notes && <p className="text-xs text-on-surface-variant">Note: {req.notes}</p>}
                  {errors[req.id] && <p className="text-xs text-red-600">{errors[req.id]}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{req.status}</Badge>
                  {actions.map((action) => (
                    <Button
                      key={action.next}
                      size="sm"
                      variant={action.variant}
                      disabled={loading}
                      onClick={() => mutate(req.id, { status: action.next })}
                    >
                      {action.icon} {action.label}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={loading}
                    onClick={() => remove(req.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
