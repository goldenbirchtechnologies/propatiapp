'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, RefreshCw, ChevronLeft, ChevronRight, User, Phone, Mail } from 'lucide-react';

type CalendarStatus = 'available' | 'booked' | 'blocked';

const STATUS_COLORS: Record<CalendarStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  booked: 'bg-amber-100 text-amber-800',
  blocked: 'bg-slate-200 text-slate-700',
};

const LANDLORD_NAVIGATION = [
  { label: 'Overview', href: '/dashboard/landlord' },
  { label: 'Properties', href: '/dashboard/landlord/properties' },
  { label: 'Short-let', href: '/dashboard/landlord/short-let' },
  { label: 'Messages', href: '/dashboard/landlord/messages' },
  { label: 'Payments', href: '/dashboard/landlord/payments' },
  { label: 'Profile', href: '/dashboard/landlord/profile' },
];

type RequestRow = {
  id: string;
  listingId: string;
  listingTitle: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked' | 'withdrawn';
  notes?: string;
};

export default function LandlordShortLetPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<CalendarStatus>('available');
  const [selectedListingId, setSelectedListingId] = useState<string>('all');
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const res = await fetch('/api/tenant-shortlets' + (selectedListingId === 'all' ? '' : `?listingId=${selectedListingId}`));
        const json = await res.json();
        const mapped: RequestRow[] = (json.records || []).map((r: any) => ({
          id: r.id,
          listingId: r.listingId,
          listingTitle: r.listing?.title || 'Property',
          tenantName: r.listing?.owner?.fullName || 'Tenant',
          tenantEmail: r.listing?.owner?.email,
          tenantPhone: r.listing?.owner?.phone,
          status: r.status,
          notes: r.notes,
        }));
        setRequests(mapped);
      } catch (e) {
        setRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [selectedListingId]);

  const updateStatus = async (id: string, status: RequestRow['status']) => {
    const previous = requests;
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      const res = await fetch(`/api/tenant-shortlets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('failed');
    } catch (e) {
      setRequests(previous);
    }
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord User">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Short-let requests</h2>
            <p className="text-sm text-slate-600">Authorise tenants to list your approved properties for short-let.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
          </div>
        </div>

        <Card className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Property</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
              >
                <option value="all">All properties</option>
                <option value="lst_1">Lekki Phase 1 Apartment</option>
                <option value="lst_2">VI Studio with Pool Access</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Tenant shortlet access</label>
              <p className="text-xs text-slate-500">Tenants can request shortlet access on listings you own. Approve to allow booking and calendar management.</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            {loadingRequests && <p className="text-sm text-slate-600">Loading requests…</p>}
            {!loadingRequests && requests.length === 0 && (
              <p className="text-sm text-slate-600">No requests yet.</p>
            )}
            {requests.map((req) => (
              <div key={req.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{req.listingTitle}</p>
                  <p className="text-xs text-slate-600">Tenant: {req.tenantName}</p>
                  {req.notes && <p className="text-xs text-slate-600">Note: {req.notes}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{req.status}</Badge>
                  {req.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(req.id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(req.id, 'rejected')}>Reject</Button>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <Button size="sm" variant="secondary" onClick={() => updateStatus(req.id, 'revoked')}>Revoke</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
