'use client';

import { useState } from 'react';
import { useAdminVerificationQueue, useAdminReviewVerification } from '@/hooks/useVerifications';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, User, MapPin, Building, MoreVertical, ChevronDown, Loader2 } from 'lucide-react';
import { format } from 'date-fn';

interface AdminVerificationClientProps {
  stats: {
    pendingCount: number;
    inProgressCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export default function AdminVerificationClient({ stats }: AdminVerificationClientProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLayer, setReviewLayer] = useState(1);

  const { data: queueData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminVerificationQueue({
    status: activeTab === 'all' ? undefined : activeTab,
    limit: 20,
  });
  const reviewMutation = useAdminReviewVerification();

  const verifications = queueData?.pages.flatMap(page => page.data || []) || [];

  const handleReview = async (verification: any, action: 'approve' | 'reject', layer: number) => {
    setSelectedVerification(verification);
    setReviewAction(action);
    setReviewLayer(layer);
    setReviewNotes('');
  };

  const handleSubmitReview = async () => {
    if (!selectedVerification) return;
    try {
      await reviewMutation.mutateAsync({
        listingId: selectedVerification.listingId,
        layer: reviewLayer,
        action: reviewAction,
        notes: reviewNotes,
      });
      setSelectedVerification(null);
      setReviewNotes('');
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    }
  };

  const tabs = [
    { value: 'pending', label: 'Pending Review', count: stats.pendingCount + stats.inProgressCount, icon: <Clock className="w-4 h-4" /> },
    { value: 'approved', label: 'Approved', count: stats.approvedCount, icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'rejected', label: 'Rejected', count: stats.rejectedCount, icon: <XCircle className="w-4 h-4" /> },
    { value: 'all', label: 'All', count: stats.pendingCount + stats.inProgressCount + stats.approvedCount + stats.rejectedCount, icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Verification Queue
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Review and approve property verification submissions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={stats.pendingCount + stats.inProgressCount} icon={<Clock />} />
        <StatCard label="In Progress" value={stats.inProgressCount} icon={<Loader2 />} />
        <StatCard label="Approved" value={stats.approvedCount} icon={<CheckCircle />} trendPositive />
        <StatCard label="Rejected" value={stats.rejectedCount} icon={<XCircle />} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <VerificationTable verifications={verifications} onReview={handleReview} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="approved" className="mt-6">
          <VerificationTable verifications={verifications} onReview={handleReview} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="rejected" className="mt-6">
          <VerificationTable verifications={verifications} onReview={handleReview} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <VerificationTable verifications={verifications} onReview={handleReview} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      {/* Load More */}
      {(hasNextPage || isFetchingNextPage) && (
        <div className="text-center pt-8">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full max-w-xs"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading more...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Review Modal */}
      {selectedVerification && (
        <ReviewModal
          verification={selectedVerification}
          action={reviewAction}
          layer={reviewLayer}
          notes={reviewNotes}
          onNotesChange={setReviewNotes}
          onSubmit={handleSubmitReview}
          onClose={() => setSelectedVerification(null)}
          isSubmitting={reviewMutation.isPending}
        />
      )}
    </div>
  );
}

function VerificationTable({ verifications, onReview, isLoading }: { verifications: any[]; onReview: (v: any, a: 'approve' | 'reject', l: number) => void; isLoading: boolean }) {
  if (isLoading && verifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          {[...Array(5)].map((_, i) => <VerificationRowSkeleton key={i} />)}
        </CardContent>
      </Card>
    );
  }

  if (verifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
        <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No verifications found</h3>
        <p style={{ color: 'var(--muted)' }}>No verifications match the current filter.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Owner</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Layer</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Submitted</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map((verification) => (
              <VerificationRow
                key={verification.id}
                verification={verification}
                onReview={onReview}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function VerificationRow({ verification, onReview }: { verification: any; onReview: (v: any, a: 'approve' | 'reject', l: number) => void }) {
  const layerLabels = ['Documents', 'Identity', 'Video', 'Inspection', 'Certified'];
  const currentLayer = verification.currentLayer || 1;
  const layerStatus = [
    verification.l1Status,
    verification.l2Status,
    verification.l3Status,
    verification.l4Status,
    verification.l5Status,
  ];

  return (
    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{verification.listing?.title || 'Unknown Property'}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {verification.listing?.area}, {verification.listing?.state}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            {verification.owner?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{verification.owner?.fullName || 'Unknown'}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{verification.owner?.email}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1">
          {layerLabels.map((label, index) => {
            const status = layerStatus[index];
            const isCurrent = index + 1 === currentLayer;
            const isDone = status === 'approved';
            
            return (
              <span
                key={label}
                className={`px-2 py-1 rounded text-[10px] font-medium ${isCurrent ? 'ring-2' : ''}`}
                style={{
                  background: isDone ? 'var(--green-bg)' : isCurrent ? 'var(--blue-bg)' : 'var(--border)',
                  color: isDone ? 'var(--green)' : isCurrent ? 'var(--blue)' : 'var(--muted)',
                  borderColor: isCurrent ? 'var(--blue)' : 'transparent',
                }}
                title={label}
              >
                {index + 1}
              </span>
            );
          })}
        </div>
      </td>
      <td className="p-4" style={{ color: 'var(--muted)' }}>
        {verification.l1SubmittedAt ? format(new Date(verification.l1SubmittedAt), 'dd MMM yyyy') : '—'}
      </td>
      <td className="p-4">
        <StatusBadge status={verification.overallStatus} />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onReview(verification, 'approve', currentLayer)} title="Approve">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onReview(verification, 'reject', currentLayer)} title="Reject">
            <XCircle className="w-4 h-4 text-red-500" />
          </Button>
          <Button variant="ghost" size="icon" title="View Details">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function VerificationRowSkeleton() {
  return (
    <tr className="border-b animate-pulse" style={{ borderColor: 'var(--border)' }}>
      <td className="p-4"><div className="h-4 w-40" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-4 w-32" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-6 w-48" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-4 w-24" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-6 w-24 rounded" style={{ background: 'var(--border)' }} /></td>
      <td className="p-4"><div className="h-8 w-24" style={{ background: 'var(--border)' }} /></td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string; icon: any }> = {
    not_started: { class: 'tag-amber', label: 'Not Started', icon: <Clock className="w-3 h-3 mr-1" /> },
    in_progress: { class: 'tag-blue', label: 'In Progress', icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" /> },
    certified: { class: 'tag-green', label: 'Approved', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    rejected: { class: 'tag-red', label: 'Rejected', icon: <XCircle className="w-3 h-3 mr-1" /> },
  };
  const cfg = config[status] || config.not_started;
  return (
    <Badge variant={cfg.class.replace('tag-', '') as any} className="flex items-center gap-1">
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

function ReviewModal({ verification, action, layer, notes, onNotesChange, onSubmit, onClose, isSubmitting }: any) {
  if (!verification) return null;

  const layerNames = ['', 'Documents', 'Identity', 'Video', 'Inspection', 'Certified'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md rounded-xl" style={{ background: 'var(--surface)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-heading font-bold">Review Verification</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted" style={{ color: 'var(--muted)' }}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Property</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{verification.listing?.title}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{verification.listing?.area}, {verification.listing?.state}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Owner</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{verification.owner?.fullName}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{verification.owner?.email}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Layer Under Review</p>
            <p className="font-medium" style={{ color: 'var(--text)' }}>{layerNames[layer]}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Current status: {verification[`l${layer}Status`] || 'pending'}</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
              Notes (required for rejection)
            </label>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              className="inp-field"
              placeholder={action === 'reject' ? 'Explain why you are rejecting this verification...' : 'Optional notes...'}
              required={action === 'reject'}
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--border)' }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || (action === 'reject' && !notes.trim())}
            variant={action === 'reject' ? 'destructive' : 'primary'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              action === 'reject' ? 'Reject' : 'Approve'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trendPositive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            {Icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckCircleIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function XCircleIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>; }
function ClockIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function Loader2Icon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>; }
function ShieldIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function BuildingIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>; }
function FileTextIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function EyeIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>; }
function UserIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function MapPinIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function MoreVerticalIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>; }
function Loader2() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>; }
function ChevronDownIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>; }
function CheckCircle() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>; }
function XCircle() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }