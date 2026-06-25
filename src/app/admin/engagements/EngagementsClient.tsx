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

type Engagement = {
  id: string;
  caseId: string;
  status: string;
  type: string;
  scopeOfWork: string;
  feeModel: {
    type: string;
    amount: number;
    currency: string;
    billingFrequency?: string;
    disbursements?: Array<{ item: string; estimate?: number }>;
  };
  estimatedDuration?: string;
  advancePaymentRequired: boolean;
  advancePaymentAmount?: number;
  clientConsentText: string;
  lawyerReviewStatus: string;
  lawyerReviewNotes?: string;
  firmName: string;
  createdAt: string;
};

export default function AdminEngagementsClient() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawer, setDrawer] = useState<{
    open: boolean;
    mode: 'create' | 'send' | 'review' | null;
    engagement?: Engagement;
  }>({ open: false, mode: null });

  const engagements = useQuery({
    queryKey: ['admin-engagements'],
    queryFn: async () => {
      const res = await fetch('/api/admin/engagements');
      if (!res.ok) throw new Error('Failed to load engagements');
      const json = await res.json();
      return { engagements: json.data as Engagement[] };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      caseId: string;
      type: string;
      scopeOfWork: string;
      feeModel: Engagement['feeModel'];
      estimatedDuration?: string;
      advancePaymentRequired: boolean;
      advancePaymentAmount?: number;
      clientConsentText: string;
    }) => {
      const res = await fetch('/api/admin/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create engagement');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-engagements'] });
      setDrawer({ open: false, mode: null });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await fetch(`/api/admin/engagements/${id}/send`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send engagement');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-engagements'] });
      setDrawer({ open: false, mode: null });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: 'approved' | 'rejected';
      notes?: string;
    }) => {
      const res = await fetch(`/api/admin/engagements/${id}/lawyer-review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawyerReviewStatus: status, lawyerReviewNotes: notes }),
      });
      if (!res.ok) throw new Error('Failed to update review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-engagements'] });
      setDrawer({ open: false, mode: null });
    },
  });

  const [createForm, setCreateForm] = useState({
    caseId: '',
    type: 'limited_scope',
    scopeOfWork: '',
    feeType: 'fixed',
    feeAmount: '',
    currency: 'NGN',
    billingFrequency: 'one_time',
    estimatedDuration: '',
    advancePaymentRequired: false,
    advancePaymentAmount: '',
    clientConsentText: '',
  });
  const [reviewForm, setReviewForm] = useState({ status: 'approved' as 'approved' | 'rejected', notes: '' });

  const filteredEngagements = engagements.data?.engagements.filter((e) => {
    if (statusFilter === 'all') return true;
    return e.status.toLowerCase() === statusFilter.toLowerCase();
  }) || [];

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
      draft: { variant: 'secondary' },
      sent_to_client: { variant: 'outline' },
      consent_pending: { variant: 'secondary' },
      consent_rejected: { variant: 'destructive' },
      consent_accepted: { variant: 'default' },
      active: { variant: 'success' },
      completed: { variant: 'default' },
      withdrawn: { variant: 'destructive' },
    };
    const cfg = map[status.toLowerCase()] || { variant: 'secondary' };
    return <Badge variant={cfg.variant}>{status.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Engagements</h2>
        <Button size="sm" onClick={() => setDrawer({ open: true, mode: 'create' })}>
          New Engagement
        </Button>
      </div>

      {engagements.isLoading ? <p>Loading...</p> : null}
      {engagements.isError ? <p className="text-red-600">Failed to load engagements.</p> : null}
      {filteredEngagements.length === 0 ? (
        <p className="text-sm text-gray-500">No engagements found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium">Case</th>
                <th className="text-left p-3 text-sm font-medium">Firm</th>
                <th className="text-left p-3 text-sm font-medium">Type</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Lawyer Review</th>
                <th className="text-left p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEngagements.map((eng) => (
                <tr key={eng.id} className="border-b">
                  <td className="p-3 text-sm">{eng.caseId}</td>
                  <td className="p-3 text-sm">{eng.firmName}</td>
                  <td className="p-3 text-sm capitalize">{eng.type.replace(/_/g, ' ')}</td>
                  <td className="p-3">{statusBadge(eng.status)}</td>
                  <td className="p-3">
                    {eng.lawyerReviewStatus === 'approved' ? (
                      <Badge variant="success">Approved</Badge>
                    ) : eng.lawyerReviewStatus === 'rejected' ? (
                      <Badge variant="destructive">Rejected</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {eng.status.toLowerCase() === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDrawer({ open: true, mode: 'send', engagement: eng });
                          }}
                        >
                          Send to Client
                        </Button>
                      )}
                      {eng.lawyerReviewStatus.toLowerCase() === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReviewForm({ status: 'approved', notes: '' });
                            setDrawer({ open: true, mode: 'review', engagement: eng });
                          }}
                        >
                          Lawyer Review
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

      {/* Create Engagement Drawer */}
      <Drawer
        open={drawer.open && drawer.mode === 'create'}
        onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
        title="New Engagement Proposal"
        description="Create scope of work and fee model for client consent."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
            <Button
              onClick={() => {
                createMutation.mutate({
                  caseId: createForm.caseId,
                  type: createForm.type,
                  scopeOfWork: createForm.scopeOfWork,
                  feeModel: {
                    type: createForm.feeType,
                    amount: Number(createForm.feeAmount),
                    currency: createForm.currency,
                    billingFrequency: createForm.billingFrequency,
                  },
                  estimatedDuration: createForm.estimatedDuration || undefined,
                  advancePaymentRequired: createForm.advancePaymentRequired,
                  advancePaymentAmount: createForm.advancePaymentAmount
                    ? Number(createForm.advancePaymentAmount)
                    : undefined,
                  clientConsentText: createForm.clientConsentText,
                });
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Draft'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="caseId">Case ID *</Label>
            <Input id="caseId" value={createForm.caseId} onChange={(e) => setCreateForm({ ...createForm, caseId: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="type">Engagement Type</Label>
            <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_representation">Full Representation</SelectItem>
                <SelectItem value="advisory_only">Advisory Only</SelectItem>
                <SelectItem value="document_review">Document Review</SelectItem>
                <SelectItem value="limited_scope">Limited Scope</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="scopeOfWork">Scope of Work * (min 20 chars)</Label>
            <Textarea
              id="scopeOfWork"
              value={createForm.scopeOfWork}
              onChange={(e) => setCreateForm({ ...createForm, scopeOfWork: e.target.value })}
              required
              minLength={20}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="feeType">Fee Type</Label>
              <Select value={createForm.feeType} onValueChange={(v) => setCreateForm({ ...createForm, feeType: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="contingency">Contingency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feeAmount">Amount (NGN) *</Label>
              <Input id="feeAmount" type="number" min="0" value={createForm.feeAmount} onChange={(e) => setCreateForm({ ...createForm, feeAmount: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label htmlFor="billingFrequency">Billing Frequency</Label>
            <Select value={createForm.billingFrequency} onValueChange={(v) => setCreateForm({ ...createForm, billingFrequency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="milestone">Per Milestone</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estimatedDuration">Estimated Duration</Label>
            <Input id="estimatedDuration" value={createForm.estimatedDuration} onChange={(e) => setCreateForm({ ...createForm, estimatedDuration: e.target.value })} placeholder="e.g. 4-6 weeks" />
          </div>
          <div>
            <Label htmlFor="clientConsentText">Client Consent Text *</Label>
            <Textarea
              id="clientConsentText"
              value={createForm.clientConsentText}
              onChange={(e) => setCreateForm({ ...createForm, clientConsentText: e.target.value })}
              placeholder="I, [client], agree to engage [firm] for [scope] at [fee estimate]..."
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="advancePaymentRequired"
              checked={createForm.advancePaymentRequired}
              onChange={(e) => setCreateForm({ ...createForm, advancePaymentRequired: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="advancePaymentRequired" className="cursor-pointer">Advance Payment Required</Label>
          </div>
          {createForm.advancePaymentRequired && (
            <div>
              <Label htmlFor="advancePaymentAmount">Advance Payment Amount (NGN)</Label>
              <Input id="advancePaymentAmount" type="number" min="0" value={createForm.advancePaymentAmount} onChange={(e) => setCreateForm({ ...createForm, advancePaymentAmount: e.target.value })} />
            </div>
          )}
        </div>
      </Drawer>

      {drawer.engagement && drawer.mode === 'send' && (
        <Drawer
          open={drawer.open}
          onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
          title="Send Engagement to Client"
          description="Confirm before sending this engagement proposal to the client."
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
              <Button
                onClick={() => sendMutation.mutate({ id: drawer.engagement!.id })}
                disabled={sendMutation.isPending}
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Now'}
              </Button>
            </>
          }
        >
          <p className="text-sm">
            Send engagement <strong>{drawer.engagement.id}</strong> to client for review and consent.
          </p>
        </Drawer>
      )}

      {drawer.engagement && drawer.mode === 'review' && (
        <Drawer
          open={drawer.open}
          onOpenChange={(open) => setDrawer({ open, mode: open ? drawer.mode : null })}
          title="Lawyer Review"
          description="Review engagement terms and approve or reject."
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setDrawer({ open: false, mode: null })}>Cancel</Button>
              <Button
                onClick={() => {
                  reviewMutation.mutate({
                    id: drawer.engagement!.id,
                    status: reviewForm.status,
                    notes: reviewForm.notes,
                  });
                }}
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm"><strong>Case:</strong> {drawer.engagement.caseId}</p>
              <p className="text-sm"><strong>Firm:</strong> {drawer.engagement.firmName}</p>
              <p className="text-sm"><strong>Type:</strong> {drawer.engagement.type.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <Label htmlFor="reviewStatus">Review Decision</Label>
              <Select value={reviewForm.status} onValueChange={(v: 'approved' | 'rejected') => setReviewForm({ ...reviewForm, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reviewNotes">Review Notes</Label>
              <Textarea
                id="reviewNotes"
                value={reviewForm.notes}
                onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                placeholder="Add review notes..."
              />
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}