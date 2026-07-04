'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardList,
  Plus,
  Eye,
  Trash2,
  ChevronRight,
  Scale,
  FileText,
  DollarSign,
  MessageSquare,
  ScrollText,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Dispute {
  id: string;
  type: string;
  listing: { id: string; title: string } | null;
  raisedByUser: { id: string; fullName: string; email: string };
}

interface Firm {
  id: string;
  name: string;
  cacNumber: string;
}

interface EvidencePackData {
  id: string;
  disputeId: string;
  lawFirmId: string | null;
  status: string;
  fileUrls: unknown;
  payments: unknown;
  messages: unknown;
  auditLogs: any;
  metadata: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
  dispute: {
    id: string;
    type: string;
    status: string;
    description: string;
    createdAt: Date | string;
    listing: { id: string; title: string } | null;
    raisedByUser: { id: string; fullName: string; email: string };
    lawFirmCase: { id: string; status: string; firm: { id: string; name: string } } | null;
  };
  lawFirm: Firm | null;
}

interface EvidencePacksClientProps {
  evidencePacks: EvidencePackData[];
  openDisputes: Dispute[];
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

function renderJsonSection(title: string, data: any, icon: React.ReactNode) {
  const jsonStr = JSON.stringify(data, null, 2);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium text-sm">{title}</span>
        <Badge variant="outline" className="text-xs">
          {Array.isArray(data) ? data.length : '1'} record(s)
        </Badge>
      </div>
      <pre className="rounded-md bg-muted p-4 text-xs overflow-x-auto max-h-[400px] overflow-y-auto">
        {jsonStr}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EvidencePacksClient({
  evidencePacks: initialPacks,
  openDisputes,
}: EvidencePacksClientProps) {
  const { toast } = useToast();
  const [packs, setPacks] = useState<EvidencePackData[]>(initialPacks);
  const [selectedPack, setSelectedPack] = useState<EvidencePackData | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [newDisputeId, setNewDisputeId] = useState('');
  const [newFirmId, setNewFirmId] = useState<string>('');

  const reload = async () => {
    try {
      const res = await fetch('/api/admin/evidence-packs');
      if (!res.ok) throw new Error('Failed to reload');
      const data = await res.json();
      if (data.success) setPacks(data.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to reload evidence packs', variant: 'destructive' });
    }
  };

  const handleCreate = async () => {
    if (!newDisputeId) {
      toast({ title: 'Validation', description: 'Please select a dispute', variant: 'destructive' });
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/evidence-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: newDisputeId,
          firmId: newFirmId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create pack');
      }
      toast({ title: 'Success', description: 'Evidence pack created' });
      setShowCreateDialog(false);
      setNewDisputeId('');
      setNewFirmId('');
      await reload();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedPack) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/evidence-packs/${selectedPack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update');
      }
      toast({ title: 'Updated', description: `Status set to ${status}` });
      setSelectedPack({ ...selectedPack, status });
      await reload();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPack) return;
    try {
      const res = await fetch(`/api/admin/evidence-packs/${selectedPack.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete');
      }
      toast({ title: 'Deleted', description: 'Evidence pack deleted' });
      setShowDetailDialog(false);
      setSelectedPack(null);
      await reload();
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  const openDetail = async (pack: EvidencePackData) => {
    try {
      const res = await fetch(`/api/admin/evidence-packs/${pack.id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load detail');
      }
      setSelectedPack(data.data);
      setShowDetailDialog(true);
    } catch {
      // Fall back to the list data
      setSelectedPack(pack);
      setShowDetailDialog(true);
    }
  };

  const packsByStatus = useMemo(() => {
    const grouped: Record<string, EvidencePackData[]> = {};
    packs.forEach((p) => {
      if (!grouped[p.status]) grouped[p.status] = [];
      grouped[p.status].push(p);
    });
    return grouped;
  }, [packs]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-heading font-bold flex items-center gap-3"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            <Scale className="h-7 w-7" />
            Evidence Packs
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Court-ready evidence exports for dispute resolution
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Evidence Pack
        </Button>
      </div>

      {/* Status summary badges */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(packsByStatus).map(([status, ps]) => (
          <Badge key={status} variant="outline" className={cn('px-3 py-1 text-sm', STATUS_COLORS[status])}>
            {status} ({ps.length})
          </Badge>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Evidence Packs ({packs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {packs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-10 w-10 mb-3" style={{ color: 'var(--muted)' }} />
              <p style={{ color: 'var(--muted)' }}>No evidence packs yet. Create one from an active dispute.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Dispute</TableHead>
                    <TableHead>Listing</TableHead>
                    <TableHead>Firm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packs.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell className="font-mono text-xs">{pack.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{pack.dispute.type}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            Raised by: {pack.dispute.raisedByUser.fullName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {pack.dispute.listing?.title || '(no listing)'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pack.lawFirm?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', STATUS_COLORS[pack.status] ?? '')}>
                          {pack.status}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ color: 'var(--text)' }}>
                        {format(new Date(pack.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetail(pack)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Evidence Pack</DialogTitle>
            <DialogDescription>
              Select an open dispute to generate a court-ready evidence pack.
              The system will auto-collect agreements, payments, messages, and audit logs for that dispute.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dispute">Dispute</Label>
              <Select value={newDisputeId} onValueChange={setNewDisputeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dispute" />
                </SelectTrigger>
                <SelectContent>
                  {openDisputes.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.type} — {d.listing?.title || 'No listing'} (Raised by: {d.raisedByUser.fullName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/** Optional firm assignment — could extend to a proper firm dropdown */}
            <div>
              <Label htmlFor="firmId">Assigned Firm (optional)</Label>
              <Input
                id="firmId"
                value={newFirmId}
                onChange={(e) => setNewFirmId(e.target.value)}
                placeholder="Organisation / firm CUID"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating…' : 'Create Pack'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="!max-w-4xl">
          {selectedPack && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Evidence Pack: {selectedPack.id}
                    </DialogTitle>
                    <DialogDescription>
                      Dispute {selectedPack.dispute.type} —{' '}
                      {selectedPack.dispute.listing?.title || 'No listing'}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-sm', STATUS_COLORS[selectedPack.status] ?? '')}>
                      {selectedPack.status}
                    </Badge>
                    <Select
                      value={selectedPack.status}
                      onValueChange={handleUpdateStatus}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="sealed">Sealed</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6">
                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Dispute ID</span>
                      <p className="font-mono">{selectedPack.disputeId}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Firm</span>
                      <p>{selectedPack.lawFirm?.name || '—'}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Created</span>
                      <p>{format(new Date(selectedPack.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Updated</span>
                      <p>{format(new Date(selectedPack.updatedAt), 'dd MMM yyyy, HH:mm')}</p>
                    </div>
                    <div className="col-span-2">
                      <span style={{ color: 'var(--muted)' }}>Dispute Description</span>
                      <p className="text-sm mt-1">{selectedPack.dispute.description}</p>
                    </div>
                    {selectedPack.dispute.lawFirmCase && (
                      <div>
                        <span style={{ color: 'var(--muted)' }}>Law Firm Case</span>
                        <p className="text-sm">
                          {selectedPack.dispute.lawFirmCase.firm.name} —{' '}
                          {selectedPack.dispute.lawFirmCase.status}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* JSON sections */}
                  {renderJsonSection(
                    'File URLs & Artifacts',
                    selectedPack.fileUrls,
                    <FileText className="h-4 w-4" />
                  )}
                  <Separator />
                  {renderJsonSection(
                    'Payment Records',
                    selectedPack.payments,
                    <DollarSign className="h-4 w-4" />
                  )}
                  <Separator />
                  {renderJsonSection(
                    'Messagethreads',
                    selectedPack.messages,
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <Separator />
                  {(renderJsonSection(
                    'Audit Log Entries',
                    selectedPack.auditLogs as any,
                    <ScrollText className="h-4 w-4" />
                  ) as any)}
                  <Separator />
                  {selectedPack.metadata && (
                    <>
                      {renderJsonSection(
                        'Metadata',
                        selectedPack.metadata,
                        <Settings2 className="h-4 w-4" />
                      )}
                      <Separator />
                    </>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Pack
                </Button>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
