'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, RefreshCw, User, Phone, Mail, CheckCircle2, XCircle, ShieldOff, Trash2 } from 'lucide-react';

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-primary">Short-let requests</h2>
          <p className="text-sm text-on-surface-variant">Authorise tenants to list your approved properties for short-let.</p>
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
            <p className="text-sm text-on-surface-variant">No requests yet.</p>
          )}

          {filteredRequests.map((req) => {
            const actions = STATUS_ACTIONS[req.status] || [];
            const isActing = actionIds.includes(req.id);

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
