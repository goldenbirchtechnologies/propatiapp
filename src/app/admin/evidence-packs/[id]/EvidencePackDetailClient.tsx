'use client'

import AppIcon from '@/components/icons/app-icon';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {

  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  ArrowLeft,
  FileText,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  ExternalLink,
  Building2,
  PenLine,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustodyEntry {
  id: string;
  action: string;
  stateHash: string;
  exhibitRef: string | null;
  note: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Exhibit {
  id: string;
  exhibitNumber: string;
  category: string;
  contentHash: string | null;
  title: string;
  description: string | null;
  url: string | null;
  sourceRecordId: string | null;
  sourceTable: string | null;
  sortOrder: number;
  createdAt: string;
}

interface DisputeInfo {
  id: string;
  type: string;
  status: string;
  description: string;
  resolution: string | null;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    address: string;
    propertyType: string | null;
    price: unknown;
    owner: { fullName: string; email: string; phone: string | null } | null;
  } | null;
  raisedByUser: { id: string; fullName: string; email: string; phone: string | null };
  lawFirmCase: {
    id: string;
    status: string;
    fee: unknown;
    firm: { id: string; name: string; cacNumber: string };
  } | null;
}

interface LawFirmInfo {
  id: string;
  name: string;
  cacNumber: string;
  address: string;
  billingEmail: string;
}

export interface EvidencePackDetail {
  id: string;
  disputeId: string;
  lawFirmId: string | null;
  status: string;
  fileUrls: unknown;
  payments: unknown;
  messages: unknown;
  auditLogs: unknown;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  exhibitPrefix: string | null;
  exhibitCount: number;
  sealHash: string | null;
  sealedAt: string | null;
  sealedBy: string | null;
  chainHash: string | null;
  dispute: DisputeInfo;
  lawFirm: LawFirmInfo | null;
  exhibits: Exhibit[];
  custodyEntries: CustodyEntry[];
}

interface EvidencePackDetailClientProps {
  evidencePack: EvidencePackDetail | null;
  initialError?: string;
  initialEmpty?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  final: 'bg-blue-100 text-blue-700',
  sealed: 'bg-green-100 text-green-700',
  revoked: 'bg-red-100 text-red-700',
};

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-blue-100 text-blue-800',
  updated: 'bg-yellow-100 text-yellow-800',
  sealed: 'bg-green-100 text-green-800',
  revoked: 'bg-red-100 text-red-800',
  exported: 'bg-purple-100 text-purple-800',
};

function renderJsonSection(title: string, data: unknown): React.ReactNode {
  const jsonStr = JSON.stringify(data, null, 2);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
        {title}
      </p>
      <pre
        className="rounded-md bg-muted p-4 text-xs overflow-x-auto max-h-[400px] overflow-y-auto"
        style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}
      >
        {jsonStr}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ErrorState({
  error,
  onRetry,
  onBack,
}: {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-heading font-bold flex items-center gap-3"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            <Scale className="h-7 w-7" />
            Evidence Pack Details
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Unable to load page
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6"
        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}
      >
        <p className="text-red-800 font-medium">Unable to load page</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-heading font-bold flex items-center gap-3"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            <Scale className="h-7 w-7" />
            Evidence Pack Details
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Not found
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
      <div
        className="card p-12 text-center"
        style={{ borderColor: 'var(--border)' }}
      >
        <FileText
          className="mx-auto h-10 w-10 mb-3"
          style={{ color: 'var(--muted)' }}
        />
        <p style={{ color: 'var(--muted)' }}>
          Evidence pack not found. It may have been deleted or the ID is invalid.
        </p>
        <Button
          className="mt-4"
          onClick={() => (window.location.href = '/admin/evidence-packs')}
        >
          View all evidence packs
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn('text-sm', STATUS_COLORS[status] ?? '')}
      style={{ color: 'var(--text)' }}
    >
      {status}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EvidencePackDetailClient({
  evidencePack,
  initialError,
  initialEmpty,
}: EvidencePackDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [pack, setPack] = useState<EvidencePackDetail | null>(evidencePack);
  const [entryAction, setEntryAction] = useState('viewed');
  const [entryNote, setEntryNote] = useState('');
  const [entryExhibitRef, setEntryExhibitRef] = useState('');

  // If server-side passed empty flag, render empty state
  if (initialEmpty && !pack) {
    return <EmptyState onBack={() => router.back()} />;
  }

  // If server-side passed an error and no data
  if (initialError && !pack) {
    return (
      <ErrorState
        error={initialError}
        onRetry={() => router.refresh()}
        onBack={() => router.back()}
      />
    );
  }

  if (!pack) {
    return <EmptyState onBack={() => router.back()} />;
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/evidence-packs/${pack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'final' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to approve evidence pack');
      }
      toast({ title: 'Success', description: 'Evidence pack finalized' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update evidence pack',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/evidence-packs/${pack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'revoked' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to reject evidence pack');
      }
      toast({ title: 'Success', description: 'Evidence pack revoked' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update evidence pack',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const actionInProgress = loading;

  const handleAddCustodyEntry = async () => {
    if (!entryAction) {
      toast({
        title: 'Validation',
        description: 'Please select an action.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = { action: entryAction };
      if (entryNote) body.note = entryNote;
      if (entryExhibitRef) body.exhibitRef = entryExhibitRef;

      const res = await fetch(`/api/admin/evidence-packs/${pack!.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to add custody entry');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setPack({
          ...pack!,
          custodyEntries: [data.data, ...pack!.custodyEntries],
          chainHash: data.data.stateHash,
          updatedAt: data.data.createdAt,
        } as EvidencePackDetail);
      }
      setEntryNote('');
      setEntryExhibitRef('');
      setEntryAction('viewed');
      toast({ title: 'Success', description: 'Custody entry added' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add custody entry',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
            <button
              onClick={() => router.push('/admin/evidence-packs')}
              className="hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              Evidence Packs
            </button>
            <AppIcon name="/" className="lucide" />
            <span className="font-medium truncate max-w-[180px]" style={{ color: 'var(--text)' }}>
              {pack.id.slice(-8).toUpperCase()}
            </span>
          </nav>
        </div>
        <StatusBadge status={pack.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <h3
              className="font-heading font-bold"
              style={{ color: 'var(--text)' }}
            >
              Dispute Information
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                Dispute
              </p>
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                {pack.dispute.type}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Raised by {pack.dispute.raisedByUser.fullName} ({pack.dispute.raisedByUser.email})
              </p>
            </div>
            {pack.dispute.listing && (
              <div>
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                  Listing
                </p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {pack.dispute.listing.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {pack.dispute.listing.address}
                </p>
              </div>
            )}
            {pack.dispute.lawFirmCase && (
              <div>
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                  Law Firm Case
                </p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {pack.dispute.lawFirmCase.firm.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {pack.dispute.lawFirmCase.status}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <h3
              className="font-heading font-bold"
              style={{ color: 'var(--text)' }}
            >
              Pack Details
            </h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                Assigned Firm
              </p>
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                {pack.lawFirm?.name || '—'}
              </p>
              {pack.lawFirm?.cacNumber && (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  CAC: {pack.lawFirm.cacNumber}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                  Created
                </p>
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  {format(new Date(pack.createdAt), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                  Updated
                </p>
                <p className="text-sm" style={{ color: 'var(--text)' }}>
                  {format(new Date(pack.updatedAt), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
              {pack.sealedAt && (
                <div>
                  <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                    Sealed At
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>
                    {format(new Date(pack.sealedAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              )}
              {pack.sealHash && (
                <div>
                  <p className="text-xs font-medium uppercase" style={{ color: 'var(--muted)' }}>
                    Seal Hash
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text)' }}>
                    {pack.sealHash}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h3
            className="font-heading font-bold"
            style={{ color: 'var(--text)' }}
          >
            Administrative Actions
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Update the evidence pack workflow. Approving will finalize the pack; rejecting will revoke it.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleApprove}
            disabled={actionInProgress || pack.status === 'final' || pack.status === 'sealed'}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {actionInProgress ? 'Processing…' : 'Approve / Finalize'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={actionInProgress || pack.status === 'revoked'}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            {actionInProgress ? 'Processing…' : 'Reject / Revoke'}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-3">
            {error}
          </p>
        )}
      </div>

      {/* File List (Exhibits) */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h3
            className="font-heading font-bold"
            style={{ color: 'var(--text)' }}
          >
            Exhibits & Files ({pack.exhibits.length})
          </h3>
        </div>
        {pack.exhibits.length === 0 ? (
          <div className="text-center py-8">
            <FileText
              className="mx-auto h-10 w-10 mb-3"
              style={{ color: 'var(--muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No exhibits recorded for this pack yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exhibit #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pack.exhibits.map((ex) => (
                  <TableRow key={ex.id}>
                    <TableCell className="font-mono text-xs">
                      {ex.exhibitNumber}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {ex.title}
                      </p>
                      {ex.description && (
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {ex.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ex.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {ex.contentHash ? (
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {ex.contentHash.slice(0, 12)}…
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: 'var(--muted)' }}>
                      {ex.sourceTable ? `${ex.sourceTable}:${ex.sourceRecordId}` : '—'}
                    </TableCell>
                    <TableCell>
                      {ex.url ? (
                        <a
                          href={ex.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline flex items-center gap-1"
                          style={{ color: 'var(--accent)' }}
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Raw File URLs */}
      {pack.fileUrls != null && (
        <div className="card p-6">
          {renderJsonSection('File URLs & Artifacts', pack.fileUrls)}
        </div>
      )}

      {/* Custody Entry Form */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h3
            className="font-heading font-bold"
            style={{ color: 'var(--text)' }}
          >
            Add Chain-of-Custody Entry
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          Record an event in this pack's chain of custody (view, transfer, seal, etc.).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="custody-action">Action</Label>
            <select
              id="custody-action"
              value={entryAction}
              onChange={(e) => setEntryAction(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text)', borderColor: 'var(--border)' }}
            >
              <option value="viewed">Viewed</option>
              <option value="downloaded">Downloaded</option>
              <option value="transferred">Transferred</option>
              <option value="sealed">Sealed</option>
              <option value="exported">Exported</option>
              <option value="printed">Printed</option>
            </select>
          </div>
          <div>
            <Label htmlFor="custody-exhibit">Exhibit Ref (optional)</Label>
            <Input
              id="custody-exhibit"
              placeholder="e.g. EX-001"
              value={entryExhibitRef}
              onChange={(e) => setEntryExhibitRef(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="custody-note">Note (optional)</Label>
            <Textarea
              id="custody-note"
              placeholder="Who / why / circumstances…"
              value={entryNote}
              onChange={(e) => setEntryNote(e.target.value)}
              className="mt-1"
              rows={1}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleAddCustodyEntry} disabled={loading}>
            <PenLine className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h3
            className="font-heading font-bold"
            style={{ color: 'var(--text)' }}
          >
            Status Timeline ({pack.custodyEntries.length})
          </h3>
        </div>
        {pack.custodyEntries.length === 0 ? (
          <div className="text-center py-8">
            <Clock
              className="mx-auto h-10 w-10 mb-3"
              style={{ color: 'var(--muted)' }}
            />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No custody entries yet.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {pack.custodyEntries.map((entry, idx) => (
              <div key={entry.id} className="relative flex gap-4 pb-6">
                {idx !== pack.custodyEntries.length - 1 && (
                  <div
                    className="absolute left-[11px] top-5 bottom-0 w-px"
                    style={{ background: 'var(--border)' }}
                  />
                )}
                <div
                  className="mt-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                  }}
                >
                  {idx + 1}
                </div>
                <div
                  className="flex-1 rounded-lg border p-3"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-elevated)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn('text-xs', ACTION_COLORS[entry.action] ?? '')}
                        variant="outline"
                      >
                        {entry.action}
                      </Badge>
                      {entry.exhibitRef && (
                        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                          {entry.exhibitRef}
                        </span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {format(new Date(entry.createdAt), 'dd MMM yyyy, HH:mm')}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm mt-2" style={{ color: 'var(--text)' }}>
                      {entry.note}
                    </p>
                  )}
                  <p className="text-xs mt-2 font-mono" style={{ color: 'var(--muted)' }}>
                    Hash: {entry.stateHash}
                  </p>
                  {entry.ipAddress && (
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      IP: {entry.ipAddress}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Data Sections */}
      <div className="space-y-6">
        {pack.payments != null && (
          <div className="card p-6">
            {renderJsonSection('Payment Records', pack.payments)}
          </div>
        )}
        {pack.messages != null && (
          <div className="card p-6">
            {renderJsonSection('Message Threads', pack.messages)}
          </div>
        )}
        {pack.auditLogs != null && (
          <div className="card p-6">
            {renderJsonSection('Audit Log Entries', pack.auditLogs)}
          </div>
        )}
        {pack.metadata != null && (
          <div className="card p-6">
            {renderJsonSection('Metadata', pack.metadata)}
          </div>
        )}
      </div>
    </div>
  );
}
