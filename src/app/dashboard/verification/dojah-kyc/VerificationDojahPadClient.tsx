'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ShieldQuestion, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DojahWidgetClient from '@/components/verification/DojahWidgetClient';
import { toast } from 'sonner';

type KycStatus = 'not_started' | 'in_progress' | 'approved' | 'rejected' | 'requires_review';

type StatusCheckItem = {
  id: string;
  label: string;
  description: string;
  status: 'not_started' | 'pending' | 'in_progress' | 'approved' | 'rejected' | 'requires_review';
};

type BackendKycStatus = {
  status: KycStatus;
  level: number;
  dojahRef?: string | null;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  dojahData?: Record<string, unknown> | null;
};

function normalizeCheckStatus(input: unknown): StatusCheckItem['status'] {
  if (input === null || input === undefined) return 'not_started';
  const raw = typeof input === 'string' ? input.toLowerCase() : 'not_started';
  if (['approved', 'success', 'verified', 'complete', 'completed'].includes(raw)) return 'approved';
  if (['rejected', 'failed', 'denied', 'error'].includes(raw)) return 'rejected';
  if (['review', 'requires_review', 'manual_review', 'pending_review'].includes(raw)) return 'requires_review';
  if (['in_progress', 'pending', 'processing', 'submitted'].includes(raw)) return 'in_progress';
  return 'not_started';
}

function deriveChecks(status: BackendKycStatus | null): StatusCheckItem[] {
  if (!status) {
    return [
      { id: 'nin', label: 'NIN Check', description: 'National Identity Number validation', status: 'not_started' },
      { id: 'id', label: 'ID Verification', description: 'Government-issued ID confirmation', status: 'not_started' },
      { id: 'liveness', label: 'Liveness Check', description: 'Face match / liveness confirmation', status: 'not_started' },
      { id: 'review', label: 'Admin Review', description: 'Final review and approval', status: 'not_started' },
    ];
  }

  const dojahData = (status.dojahData || {}) as Record<string, unknown>;
  const nestedStatus = (input: unknown): StatusCheckItem['status'] => {
    if (!input || typeof input !== 'object') return 'not_started';
    const record = input as Record<string, unknown>;
    const nested = record.status ?? record.verification_status ?? record.state;
    return normalizeCheckStatus(nested);
  };

  const ninStatus = nestedStatus(dojahData.nin) || status.status === 'approved' ? 'approved' : status.status === 'rejected' ? 'rejected' : status.status;
  const bvnStatus = nestedStatus(dojahData.bvn) || status.status === 'approved' ? 'approved' : status.status === 'rejected' ? 'rejected' : status.status;
  const idStatus = nestedStatus(dojahData.id_verification) || status.status === 'approved' ? 'approved' : status.status === 'rejected' ? 'rejected' : status.status;
  const livenessStatus = nestedStatus(dojahData.liveness_check || dojahData.face_match) || status.status === 'approved' ? 'approved' : status.status === 'rejected' ? 'rejected' : status.status;
  const reviewStatus = status.status === 'requires_review' ? 'requires_review' : status.status === 'approved' ? 'approved' : status.status === 'rejected' ? 'rejected' : 'not_started';

  return [
    { id: 'nin', label: 'NIN Check', description: 'National Identity Number validation', status: ninStatus },
    { id: 'bvn', label: 'BVN Check', description: 'Bank Verification Number validation', status: bvnStatus },
    { id: 'id', label: 'ID Verification', description: 'Government-issued ID confirmation', status: idStatus },
    { id: 'liveness', label: 'Liveness Check', description: 'Face match / liveness confirmation', status: livenessStatus },
    { id: 'review', label: 'Admin Review', description: 'Final review and approval', status: reviewStatus },
  ];
}

function StatusIcon({ status }: { status: StatusCheckItem['status'] }) {
  if (status === 'approved') return <CheckCircle2 className="h-5 w-5" />;
  if (status === 'pending' || status === 'in_progress') return <Clock className="h-5 w-5" />;
  if (status === 'requires_review') return <ShieldQuestion className="h-5 w-5" />;
  if (status === 'rejected') return <XCircle className="h-5 w-5" />;
  return <ShieldQuestion className="h-5 w-5" />;
}

function statusMeta(status: StatusCheckItem['status']) {
  switch (status) {
    case 'approved':
      return { badge: 'secondary' as const, label: 'Verified', text: 'text-emerald-400', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'pending':
    case 'in_progress':
      return { badge: 'secondary' as const, label: 'Pending', text: 'text-neutral-300', className: 'bg-[#262626] text-neutral-300 border-[#262626]' };
    case 'requires_review':
      return { badge: 'outline' as const, label: 'Needs Review', text: 'text-neutral-300', className: 'border-amber-500/30 text-neutral-300' };
    case 'rejected':
      return { badge: 'destructive' as const, label: 'Not Verified', text: 'text-red-500', className: '' };
    default:
      return { badge: 'secondary' as const, label: 'Not Verified', text: 'text-slate-400', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  }
}

export default function VerificationDojahPadClient({ _userId }: { _userId: string }) {
  const [status, setStatus] = useState<BackendKycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verification/dojah/status');
      const json = (await res.json().catch(() => ({ success: false }))) as { success?: boolean; data?: BackendKycStatus; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load verification status');
      }
      setStatus(json.data || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load verification status';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const checks = useMemo(() => deriveChecks(status), [status]);
  const allVerified = checks.every((item) => item.status === 'approved');
  const anyPendingOrInProgress = checks.some((item) => item.status === 'pending' || item.status === 'in_progress' || item.status === 'requires_review');
  const isApproved = status?.status === 'approved';

  const handleWidgetComplete = async (result: { success: boolean; referenceId?: string; data?: Record<string, unknown>; error?: string }) => {
    if (result.success) {
      toast.success('Verification submitted. We will update your status shortly.');
      await loadStatus();
    } else {
      toast.error(result.error || 'Verification did not complete.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatus();
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {error && !loading && (
        <Card className="border-red-500/30 bg-red-950/20">
          <CardContent className="p-6 text-sm text-red-300">
            {error}
            <Button variant="outline" size="sm" className="ml-3" onClick={handleRefresh}>
              Retry
            </Button>
          </CardContent>
        </div>
      )}

      {isApproved && (
        <Card className="border-emerald-500/30 bg-emerald-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Fully Verified</p>
                <p className="text-xs text-emerald-400/80 mt-1">
                  Your identity checks are complete. You can proceed with payments, agreements, and full platform access.
                </p>
              </div>
            </div>
          </CardContent>
        </div>
      )}

      {!allVerified && (
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-100">Identity Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {checks.map((item) => {
                const meta = statusMeta(item.status);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className={meta.text}>{StatusIcon({ status: item.status })}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                    <Badge variant={meta.badge} className={cn('text-[10px]', meta.className)}>
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {anyPendingOrInProgress && (
              <p className="text-xs text-slate-400 mt-4">
                Identity checks are in progress. This usually completes within a few minutes.
              </p>
            )}
          </CardContent>
        </div>
      )}

      {!allVerified && (
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-100">Complete Identity Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-4">
              Launch the secure identity widget to complete your verification. All checks are handled securely by Dojah.
            </p>
            <DojahWidgetClient
              type="identification"
              onComplete={handleWidgetComplete}
            />
          </CardContent>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="gap-2"
        >
          {(loading || refreshing) && <Loader2 className="h-4 w-4 animate-spin" />}
          Refresh Status
        </Button>
      </div>
    </div>
  );
}
