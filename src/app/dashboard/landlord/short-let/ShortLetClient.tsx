'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, RefreshCw, User, Phone, Mail } from 'lucide-react';

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
  listings: { id: string; title: string }[];
};

export default function ShortLetClient({ initialRequests, listings }: ShortLetClientProps) {
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [requests, setRequests] = useState<RequestRow[]>(initialRequests);
  const [loading, setLoading] = useState(false);

  const filteredRequests = selectedListingId === 'all'
    ? requests
    : requests.filter((r) => r.listingId === selectedListingId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-primary">Short-let requests</h2>
          <p className="text-sm text-on-surface-variant">Authorise tenants to list your approved properties for short-let.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
        </div>
      </div>

      <Card className="space-y-4 p-4">
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
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-primary">Tenant shortlet access</label>
            <p className="text-xs text-slate-500">Tenants can request shortlet access on listings you own.</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {loading && <p className="text-sm text-on-surface-variant">Loading requests…</p>}
          {!loading && filteredRequests.length === 0 && (
            <p className="text-sm text-on-surface-variant">No requests yet.</p>
          )}
          {filteredRequests.map((req) => (
            <div key={req.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-surface-container-lowest p-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{req.listingTitle}</p>
                <p className="text-xs text-on-surface-variant">Tenant: {req.tenantName}</p>
                {req.notes && <p className="text-xs text-on-surface-variant">Note: {req.notes}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize">{req.status}</Badge>
                {/* Note: approval API is not yet wired — mutations require /api/tenant-shortlets/[id] */}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
