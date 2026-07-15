'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

type LawFirm = {
  id: string;
  name: string;
  verified: boolean;
  verificationStatus: string;
  cacNumber: string;
  email: string;
  jurisdiction: string[];
  callToBarNumber?: string;
  yearOfCall?: number;
  nbaEnrollmentNumber?: string;
  nbaEnrollmentYear?: number;
  principalPartnerName?: string;
  principalPartnerCall?: string;
};

interface VerificationForm {
  callToBarNumber: string;
  yearOfCall: string | number;
  nbaEnrollmentNumber: string;
  nbaEnrollmentYear: string | number;
  principalPartnerName: string;
  principalPartnerCall: string;
  verified: boolean;
  verificationStatus: string;
}

export default function AdminLawFirmsClient() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    cacNumber: '',
    email: '',
    phone: '',
    address: '',
    jurisdiction: '',
    billingEmail: '',
  });
  const [drawer, setDrawer] = useState<{
    open: boolean;
    mode: 'verify' | 'create' | null;
    firm?: LawFirm;
  }>({ open: false, mode: null });
  const [verificationForm, setVerificationForm] = useState<VerificationForm>({
    callToBarNumber: '',
    yearOfCall: '',
    nbaEnrollmentNumber: '',
    nbaEnrollmentYear: '',
    principalPartnerName: '',
    principalPartnerCall: '',
    verified: false,
    verificationStatus: 'under_review',
  });

  const firms = useQuery({
    queryKey: ['admin-law-firms'],
    queryFn: async () => {
      const res = await fetch('/api/admin/law-firms');
      if (!res.ok) throw new Error('Failed to load law firms');
      return (await res.json()) as { firms: LawFirm[] };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (firm: Omit<LawFirm, 'id'>) => {
      const res = await fetch('/api/admin/law-firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firm),
      });
      if (!res.ok) throw new Error('Failed to create firm');
      return (await res.json()) as { firm: LawFirm };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-law-firms'] });
      setForm({
        name: '',
        cacNumber: '',
        email: '',
        phone: '',
        address: '',
        jurisdiction: '',
        billingEmail: '',
      });
      setDrawer({ open: false, mode: null });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (payload: typeof verificationForm & { firmId: string }) => {
      const res = await fetch('/api/admin/law-firms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to verify firm');
      return (await res.json()) as { firm: LawFirm };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-law-firms'] });
      setDrawer({ open: false, mode: null });
      setVerificationForm({
        callToBarNumber: '',
        yearOfCall: '',
        nbaEnrollmentNumber: '',
        nbaEnrollmentYear: '',
        principalPartnerName: '',
        principalPartnerCall: '',
        verified: false,
        verificationStatus: 'under_review',
      });
    },
  });

  const openCreateDrawer = () => {
    setForm({
      name: '',
      cacNumber: '',
      email: '',
      phone: '',
      address: '',
      jurisdiction: '',
      billingEmail: '',
    });
    setDrawer({ open: true, mode: 'create' });
  };

  const openVerifyDrawer = (firm: LawFirm) => {
    setVerificationForm({
      callToBarNumber: firm.callToBarNumber || '',
      yearOfCall: firm.yearOfCall?.toString() || '',
      nbaEnrollmentNumber: firm.nbaEnrollmentNumber || '',
      nbaEnrollmentYear: firm.nbaEnrollmentYear?.toString() || '',
      principalPartnerName: firm.principalPartnerName || '',
      principalPartnerCall: firm.principalPartnerCall || '',
      verified: firm.verified,
      verificationStatus: firm.verificationStatus || 'under_review',
    });
    setDrawer({ open: true, mode: 'verify', firm });
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawer.firm) return;
    verifyMutation.mutate({
      firmId: drawer.firm.id,
      callToBarNumber: verificationForm.callToBarNumber,
      yearOfCall: Number(verificationForm.yearOfCall) as number,
      nbaEnrollmentNumber: verificationForm.nbaEnrollmentNumber,
      nbaEnrollmentYear: Number(verificationForm.nbaEnrollmentYear) as number,
      principalPartnerName: verificationForm.principalPartnerName,
      principalPartnerCall: verificationForm.principalPartnerCall,
      verified: verificationForm.verified,
      verificationStatus: verificationForm.verificationStatus,
    });
  };

  const verificationStatusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      under_review: { variant: 'outline', label: 'Under Review' },
      verified: { variant: 'default', label: 'Verified' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      suspended: { variant: 'destructive', label: 'Suspended' },
    };
    const cfg = map[status] || { variant: 'secondary', label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Law Firms</h2>
        <Button size="sm" onClick={openCreateDrawer}>
          Add Firm
        </Button>
      </div>

      {firms.isLoading ? <p>Loading...</p> : null}
      {firms.isError ? <p className="text-red-600">Failed to load firms.</p> : null}
      {firms.data?.firms.length === 0 ? (
        <p className="text-sm text-gray-500">No law firms registered yet.</p>
      ) : (
        <div className="space-y-3">
          {firms.data?.firms.map((firm) => (
            <div key={firm.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{firm.name}</div>
                  <div className="text-sm text-gray-500">CAC: {firm.cacNumber}</div>
                  <div className="text-sm text-gray-500">{firm.email}</div>
                  <div className="text-sm text-gray-500">{firm.jurisdiction.join(', ') || 'Jurisdiction not set'}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {verificationStatusBadge(firm.verificationStatus)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openVerifyDrawer(firm)}
                  >
                    Verify
                  </Button>
                </div>
              </div>
              {(firm.callToBarNumber || firm.nbaEnrollmentNumber || firm.principalPartnerName) && (
                <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                  {firm.callToBarNumber && <MaterialIcon name="Call to Bar: {firm.callToBarNumber}" className="material-symbols-outlined" />}
                  {firm.nbaEnrollmentNumber && <span className="ml-3">NBA: {firm.nbaEnrollmentNumber}</span>}
                  {firm.principalPartnerName && <span className="ml-3">Partner: {firm.principalPartnerName}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Firm Drawer */}
      <Drawer
        open={drawer.open && drawer.mode === 'create'}
        onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
        title="Add Law Firm"
        description="Register a new law firm on the platform."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
            <Button
              type="submit"
              form="create-firm-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Saving...' : 'Create Firm'}
            </Button>
          </>
        }
      >
        <form
          id="create-firm-form"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              name: form.name,
              cacNumber: form.cacNumber,
              email: form.email,
              phone: form.phone,
              address: form.address,
              jurisdiction: form.jurisdiction.split(',').map((v) => v.trim()).filter(Boolean),
              billingEmail: form.billingEmail || undefined,
              verified: false,
              verificationStatus: 'pending',
            } as Omit<LawFirm, 'id'>);
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name">Firm Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="cacNumber">CAC Number *</Label>
            <Input id="cacNumber" value={form.cacNumber} onChange={(e) => setForm({ ...form, cacNumber: e.target.value })} required />
            <p className="text-xs text-gray-500 mt-1">Corporate Affairs Commission registration number</p>
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="jurisdiction">Jurisdiction (comma separated)</Label>
            <Input id="jurisdiction" value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} placeholder="Lagos, Ogun, Oyo" />
          </div>
          <div>
            <Label htmlFor="billingEmail">Billing Email</Label>
            <Input id="billingEmail" value={form.billingEmail} onChange={(e) => setForm({ ...form, billingEmail: e.target.value })} />
          </div>
        </form>
      </Drawer>

      {/* Verification Drawer: CAC + Call to Bar + NBA Enrollment */}
      <Drawer
        open={drawer.open && drawer.mode === 'verify'}
        onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
        title="Firm Verification"
        description="Verify CAC, Call to Bar, and NBA enrollment details for this firm."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
            <Button
              type="submit"
              form="verify-firm-form"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? 'Saving...' : 'Save Verification'}
            </Button>
          </>
        }
      >
        <form
          id="verify-firm-form"
          onSubmit={handleVerifySubmit}
          className="space-y-6"
        >
          {/* CAC Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">Corporate Affairs Commission (CAC)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cacNumberVerify">CAC Number</Label>
                <Input
                  id="cacNumberVerify"
                  value={drawer.firm?.cacNumber || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="rcNumber">RC Number</Label>
                <Input id="rcNumber" placeholder="RC1234567" />
              </div>
            </div>
            <div>
              <Label htmlFor="cacCertificate">Upload CAC Certificate</Label>
              <Input id="cacCertificate" type="file" accept="image/*,.pdf" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Upload scanned copy of CAC certificate</p>
            </div>
          </div>

          {/* Call to Bar Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">Call to Bar Verification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="callToBarNumber">Call to Bar Number *</Label>
                <Input
                  id="callToBarNumber"
                  value={verificationForm.callToBarNumber}
                  onChange={(e) => setVerificationForm({ ...verificationForm, callToBarNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="yearOfCall">Year of Call *</Label>
                <Input
                  id="yearOfCall"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={verificationForm.yearOfCall}
                  onChange={(e) => setVerificationForm({ ...verificationForm, yearOfCall: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="callToBarCertificate">Upload Call to Bar Certificate</Label>
              <Input id="callToBarCertificate" type="file" accept="image/*,.pdf" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Upload scanned copy of Call to Bar certificate</p>
            </div>
          </div>

          {/* NBA Enrollment Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">NBA Enrollment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nbaEnrollmentNumber">NBA Enrollment Number *</Label>
                <Input
                  id="nbaEnrollmentNumber"
                  value={verificationForm.nbaEnrollmentNumber}
                  onChange={(e) => setVerificationForm({ ...verificationForm, nbaEnrollmentNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nbaEnrollmentYear">NBA Enrollment Year *</Label>
                <Input
                  id="nbaEnrollmentYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={verificationForm.nbaEnrollmentYear}
                  onChange={(e) => setVerificationForm({ ...verificationForm, nbaEnrollmentYear: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="nbaCard">Upload NBA Membership Card</Label>
              <Input id="nbaCard" type="file" accept="image/*,.pdf" className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Upload scanned copy of NBA membership card</p>
            </div>
          </div>

          {/* Principal Partner */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-600">Principal Partner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principalPartnerName">Principal Partner Name</Label>
                <Input
                  id="principalPartnerName"
                  value={verificationForm.principalPartnerName}
                  onChange={(e) => setVerificationForm({ ...verificationForm, principalPartnerName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="principalPartnerCall">Principal Partner Call Number</Label>
                <Input
                  id="principalPartnerCall"
                  value={verificationForm.principalPartnerCall}
                  onChange={(e) => setVerificationForm({ ...verificationForm, principalPartnerCall: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="verificationStatus">Verification Status</Label>
              <select
                id="verificationStatus"
                className="w-full rounded border p-2"
                value={verificationForm.verificationStatus}
                onChange={(e) => setVerificationForm({ ...verificationForm, verificationStatus: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="verified"
                checked={verificationForm.verified}
                onChange={(e) => setVerificationForm({ ...verificationForm, verified: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="verified" className="cursor-pointer">Mark as Verified</Label>
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}