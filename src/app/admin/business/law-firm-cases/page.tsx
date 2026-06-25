'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type LawFirm = { id: string; name: string };
type Dispute = { id: string; type: string; status: string };
type LawFirmCase = {
  id: string;
  status: string;
  engagementType?: string;
  assignedAt: string;
  resolvedAt: string | null;
  firm: LawFirm;
  dispute: Dispute;
  feeModel?: Record<string, unknown>;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'consent_required', label: 'Consent Required' },
  { value: 'consent_pending', label: 'Consent Pending' },
  { value: 'consent_accepted', label: 'Consent Accepted' },
  { value: 'active', label: 'Active' },
  { value: 'resolved', label: 'Resolved' },
];

export default function AdminLawFirmCasesClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawer, setDrawer] = useState<{ open: boolean; action: 'assign' | 'engage' | null; caseId?: string }>({
    open: false,
    action: null,
  });

  const cases = useQuery({
    queryKey: ['admin-law-firm-cases'],
    queryFn: async () => {
      const res = await fetch('/api/admin/law-firm-cases');
      if (!res.ok) throw new Error('Failed to load law firm cases');
      return (await res.json()) as { cases: LawFirmCase[] };
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (payload: { caseId: string; firmId: string; disputeType: string }) => {
      const res = await fetch('/api/admin/law-firm-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to assign case');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-law-firm-cases'] });
      setDrawer({ open: false, action: null });
    },
  });

  const [firms, setFirms] = useState<LawFirm[]>([]);
  const [selectedFirmId, setSelectedFirmId] = useState('');

  // Auto-load firms when drawer opens for assign
  const openAssignDrawer = (caseId: string) => {
    setSelectedFirmId('');
    setDrawer({ open: true, action: 'assign', caseId });
    fetch('/api/admin/law-firms')
      .then((r) => r.json())
      .then((d) => setFirms(d.firms || []))
      .catch(() => setFirms([]));
  };

  const filteredCases = cases.data?.cases.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  }) || [];

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
      assigned: { variant: 'default' },
      consent_required: { variant: 'outline' },
      consent_pending: { variant: 'secondary' },
      consent_accepted: { variant: 'default' },
      active: { variant: 'success' },
      resolved: { variant: 'default' },
      conflict_check: { variant: 'secondary' },
      engaged: { variant: 'default' },
    };
    const cfg = map[status.toLowerCase()] || { variant: 'secondary' };
    return <Badge variant={cfg.variant}>{status.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Law Firm Cases</h2>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {cases.isLoading ? <p>Loading...</p> : null}
      {cases.isError ? <p className="text-red-600">Failed to load cases.</p> : null}
      {filteredCases.length === 0 ? (
        <p className="text-sm text-gray-500">No cases found for the selected filter.</p>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((lawCase) => (
            <div key={lawCase.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{lawCase.firm.name}</div>
                  <div className="text-sm text-gray-500">
                    Dispute: {lawCase.dispute.id} — <span className="capitalize">{lawCase.dispute.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-sm text-gray-500">Status: {statusBadge(lawCase.status)}</div>
                  <div className="text-sm text-gray-500">
                    Assigned: {new Date(lawCase.assignedAt).toLocaleString()}
                  </div>
                  {lawCase.resolvedAt && (
                    <div className="text-sm text-green-700">
                      Resolved: {new Date(lawCase.resolvedAt).toLocaleString()}
                    </div>
                  )}
                  {lawCase.engagementType && (
                    <div className="text-sm text-gray-500">
                      Engagement Type: {lawCase.engagementType.replace(/_/g, ' ')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAssignDrawer(lawCase.id)}
                  >
                    Reassign Firm
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reassign Firm Drawer */}
      <Drawer
        open={drawer.open && drawer.action === 'assign'}
        onOpenChange={(open) => setDrawer({ open, action: open ? drawer.action : null })}
        title="Reassign Law Firm"
        description="Select a new law firm to handle this case."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer({ open: false, action: null })}>Cancel</Button>
            <Button
              onClick={() => {
                if (!drawer.caseId || !selectedFirmId) return;
                assignMutation.mutate({
                  caseId: drawer.caseId,
                  firmId: selectedFirmId,
                  disputeType: '',
                });
              }}
              disabled={!selectedFirmId || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Assigning...' : 'Reassign'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="firm-select">Select Law Firm</Label>
            <Select value={selectedFirmId} onValueChange={setSelectedFirmId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a firm" />
              </SelectTrigger>
              <SelectContent>
                {firms.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>{firm.name} ({firm.cacNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Drawer>
    </div>
  );
}