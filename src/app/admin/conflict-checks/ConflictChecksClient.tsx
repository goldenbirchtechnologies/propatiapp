'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

type ConflictCheck = {
  id: string;
  status: string;
  caseId: string;
  lawFirmId: string;
  lawFirmName: string;
  adversePartyType: string;
  adversePartyName: string;
  conflictRationale?: string;
  waiverApproved: boolean;
  reviewedAt?: string;
};

export default function AdminConflictChecksClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawer, setDrawer] = useState<{
    open: boolean;
    mode: 'create' | 'waive' | null;
    check?: ConflictCheck;
  }>({ open: false, mode: null });

  const checks = useQuery({
    queryKey: ['admin-conflict-checks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/conflict-checks');
      if (!res.ok) throw new Error('Failed to load conflict checks');
      const json = await res.json();
      return { checks: json.data as ConflictCheck[] };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      caseId: string;
      lawFirmId: string;
      lawyerProfileId?: string;
      adversePartyType: string;
      adversePartyId: string;
      adversePartyName: string;
    }) => {
      const res = await fetch('/api/admin/conflict-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create conflict check');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-conflict-checks'] });
      setDrawer({ open: false, mode: null });
    },
  });

  const waiveMutation = useMutation({
    mutationFn: async (payload: { checkId: string; waiverApproved: boolean; rationale?: string }) => {
      const res = await fetch(`/api/admin/conflict-checks/${payload.checkId}/waive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to waive conflict');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-conflict-checks'] });
      setDrawer({ open: false, mode: null });
    },
  });

  const [createForm, setCreateForm] = useState({
    caseId: '',
    lawFirmId: '',
    lawyerProfileId: '',
    adversePartyType: 'landlord',
    adversePartyId: '',
    adversePartyName: '',
  });
  const [waiveForm, setWaiveForm] = useState({ rationale: '', waiverApproved: true });

  const filteredChecks = checks.data?.checks.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  }) || [];

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      not_checked: { variant: 'secondary' },
      clear: { variant: 'default' },
      conflict: { variant: 'destructive' },
      waived: { variant: 'outline' },
    };
    const cfg = map[status.toLowerCase()] || { variant: 'secondary' };
    return <Badge variant={cfg.variant}>{status.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conflict Checks</h2>
        <Button size="sm" onClick={() => setDrawer({ open: true, mode: 'create' })}>
          Run Conflict Check
        </Button>
      </div>

      {checks.isLoading ? <p>Loading...</p> : null}
      {checks.isError ? <p className="text-red-600">Failed to load conflict checks.</p> : null}
      {filteredChecks.length === 0 ? (
        <p className="text-sm text-gray-500">No conflict checks found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium">Case</th>
                <th className="text-left p-3 text-sm font-medium">Law Firm</th>
                <th className="text-left p-3 text-sm font-medium">Adverse Party</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Waived</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((check) => (
                <tr key={check.id} className="border-b">
                  <td className="p-3 text-sm">{check.caseId}</td>
                  <td className="p-3 text-sm">{check.lawFirmName}</td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm font-medium capitalize">{check.adversePartyType}</p>
                      <p className="text-xs text-gray-500">{check.adversePartyName}</p>
                    </div>
                  </td>
                  <td className="p-3">{statusBadge(check.status)}</td>
                  <td className="p-3">
                    {check.waiverApproved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <span className="text-xs text-gray-500">No</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {check.status.toLowerCase() === 'conflict' && !check.waiverApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setWaiveForm({ rationale: '', waiverApproved: true });
                            setDrawer({ open: true, mode: 'waive', check });
                          }}
                        >
                          Waive Conflict
                        </Button>
                      )}
                      {check.status.toLowerCase() === 'not_checked' && (
                        <Button
                          size="sm"
                          onClick={() => setDrawer({ open: true, mode: 'create' })}
                        >
                          Run Check
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Conflict Check Drawer */}
      <Drawer
        open={drawer.open && drawer.mode === 'create'}
        onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
        title="Run Conflict Check"
        description="Enter case and adverse party details to run a conflict check."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
            <Button
              onClick={() => {
                createMutation.mutate({
                  caseId: createForm.caseId,
                  lawFirmId: createForm.lawFirmId,
                  lawyerProfileId: createForm.lawyerProfileId || undefined,
                  adversePartyType: createForm.adversePartyType,
                  adversePartyId: createForm.adversePartyId,
                  adversePartyName: createForm.adversePartyName,
                });
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Running...' : 'Run Check'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="caseId">Case ID</Label>
            <Input id="caseId" value={createForm.caseId} onChange={(e) => setCreateForm({ ...createForm, caseId: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="lawFirmId">Law Firm ID</Label>
            <Input id="lawFirmId" value={createForm.lawFirmId} onChange={(e) => setCreateForm({ ...createForm, lawFirmId: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="lawyerProfileId">Lawyer Profile ID (optional)</Label>
            <Input id="lawyerProfileId" value={createForm.lawyerProfileId} onChange={(e) => setCreateForm({ ...createForm, lawyerProfileId: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="adversePartyType">Adverse Party Type</Label>
            <select
              id="adversePartyType"
              className="w-full rounded border p-2"
              value={createForm.adversePartyType}
              onChange={(e) => setCreateForm({ ...createForm, adversePartyType: e.target.value })}
            >
              <option value="landlord">Landlord</option>
              <option value="tenant">Tenant</option>
              <option value="organisation">Organisation</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <Label htmlFor="adversePartyId">Adverse Party ID</Label>
            <Input id="adversePartyId" value={createForm.adversePartyId} onChange={(e) => setCreateForm({ ...createForm, adversePartyId: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="adversePartyName">Adverse Party Name</Label>
            <Input id="adversePartyName" value={createForm.adversePartyName} onChange={(e) => setCreateForm({ ...createForm, adversePartyName: e.target.value })} required />
          </div>
        </div>
      </Drawer>

      {/* Waive Conflict Drawer */}
      <Drawer
        open={drawer.open && drawer.mode === 'waive'}
        onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
        title="Waive Conflict"
        description="Approve a conflict waiver with written justification."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
            <Button
              onClick={() => {
                if (!drawer.check) return;
                waiveMutation.mutate({
                  checkId: drawer.check.id,
                  waiverApproved: waiveForm.waiverApproved,
                  rationale: waiveForm.rationale,
                });
              }}
              disabled={waiveMutation.isPending}
            >
              {waiveMutation.isPending ? 'Submitting...' : 'Submit Waiver'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm">
            You are waiving a conflict for case <strong>{drawer.check?.caseId}</strong> involving firm{' '}
            <strong>{drawer.check?.lawFirmName}</strong> and adverse party{' '}
            <strong className="capitalize">{drawer.check?.adversePartyType}</strong>{' '}
            ({drawer.check?.adversePartyName}).
          </div>
          <div>
            <Label htmlFor="rationale">Waiver Rationale *</Label>
            <Textarea
              id="rationale"
              value={waiveForm.rationale}
              onChange={(e) => setWaiveForm({ ...waiveForm, rationale: e.target.value })}
              placeholder="Provide written justification for waiving this conflict..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="waiverApproved"
              checked={waiveForm.waiverApproved}
              onChange={(e) => setWaiveForm({ ...waiveForm, waiverApproved: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="waiverApproved" className="cursor-pointer">Principal partner + admin sign-off confirmed</Label>
          </div>
        </div>
      </Drawer>
    </div>
  );
}