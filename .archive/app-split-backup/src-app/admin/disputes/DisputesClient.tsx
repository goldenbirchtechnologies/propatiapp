'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Search, AlertTriangle, Clock, CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react';
import { useDisputes, useAdminDisputeAction } from '@/hooks/useMaintenanceScreeningsDisputes';
import { useToast } from '@/hooks/use-toast';

interface DisputeStats {
  open: number;
  investigating: number;
  mediated: number;
  resolved: number;
  closed: number;
}

interface DisputesClientProps {
  stats: DisputeStats;
}

const STATUS_BADGE: Record<string, string> = {
  open: 'tag-gold',
  investigating: 'tag-blue',
  mediated: 'tag-teal',
  resolved: 'tag-green',
  closed: 'tag-amber',
};

const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  investigating: 'Investigating',
  mediated: 'Mediated',
  resolved: 'Resolved',
  closed: 'Closed',
};

const TYPE_LABEL: Record<string, string> = {
  non_delivery: 'Non-Delivery',
  misrepresentation: 'Misrepresentation',
  refund: 'Refund',
  other: 'Other',
};

export default function DisputesClient({ stats }: DisputesClientProps) {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<unknown>(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { data: disputesData, isLoading, refetch } = useDisputes() as unknown;
  const adminAction = useAdminDisputeAction();

  const disputes: unknown[] = disputesData?.data ?? [];

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        d.id.toLowerCase().includes(term) ||
        d.raisedByUser?.fullName?.toLowerCase().includes(term) ||
        d.listing?.title?.toLowerCase().includes(term) ||
        d.type.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [disputes, statusFilter, searchTerm]);

  const openReviewModal = (dispute: unknown) => {
    setSelectedDispute(dispute);
    setResolution(dispute.resolution || '');
    setReviewModalOpen(true);
  };

  const handleAction = async (action: string) => {
    if (!selectedDispute) return;
    setActionLoading(true);
    try {
      await adminAction.mutateAsync({
        disputeId: selectedDispute.id,
        action,
        resolution: resolution || undefined,
      });
      toast({ title: 'Updated', description: `Dispute marked as ${STATUS_LABEL[action === 'resolve' ? 'resolved' : action === 'close' ? 'closed' : action === 'investigate' ? 'investigating' : 'mediated']}.` });
      setReviewModalOpen(false);
      setSelectedDispute(null);
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to update dispute.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickAction = async (dispute: unknown, action: string) => {
    try {
      await adminAction.mutateAsync({ disputeId: dispute.id, action });
      toast({ title: 'Updated', description: `Dispute ${action === 'resolve' ? 'resolved' : 'closed'}.` });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to update dispute.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="font-heading font-bold"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
        >
          Disputes
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Review and resolve platform disputes between tenants and landlords.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.open}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Investigating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.investigating}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Mediated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.mediated}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.resolved}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {stats.closed}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[240px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--muted)' }}
            />
            <Input
              placeholder="Search by ID, user, listing or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="mediated">Mediated</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--muted)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
              No disputes found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Raised By</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {dispute.id.slice(0, 12)}…
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                          {dispute.raisedByUser?.fullName ?? '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {dispute.raisedByUser?.email ?? ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[180px]" style={{ color: 'var(--text)' }}>
                        {dispute.listing?.title ?? 'No listing'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" style={{ color: 'var(--text)' }}>
                        {TYPE_LABEL[dispute.type] ?? dispute.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[dispute.status] ?? 'tag-gray'}>
                        {STATUS_LABEL[dispute.status] ?? dispute.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: 'var(--muted)' }}>
                      {format(new Date(dispute.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewModal(dispute)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleQuickAction(dispute, 'resolve')}
                            disabled={adminAction.isPending}
                          >
                            Resolve
                          </Button>
                        )}
                        {dispute.status !== 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gray-500 border-gray-200 hover:bg-gray-50"
                            onClick={() => handleQuickAction(dispute, 'close')}
                            disabled={adminAction.isPending}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Dispute</DialogTitle>
            <DialogDescription>
              {selectedDispute?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Type</p>
                  <p style={{ color: 'var(--text)' }}>{TYPE_LABEL[selectedDispute.type] ?? selectedDispute.type}</p>
                </div>
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Status</p>
                  <Badge className={STATUS_BADGE[selectedDispute.status] ?? 'tag-gray'}>
                    {STATUS_LABEL[selectedDispute.status] ?? selectedDispute.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Raised By</p>
                  <p style={{ color: 'var(--text)' }}>{selectedDispute.raisedByUser?.fullName ?? '—'}</p>
                </div>
                <div>
                  <p className="font-medium mb-1" style={{ color: 'var(--muted)' }}>Listing</p>
                  <p style={{ color: 'var(--text)' }}>{selectedDispute.listing?.title ?? 'No listing'}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm mb-1" style={{ color: 'var(--muted)' }}>Description</p>
                <p className="text-sm p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', color: 'var(--text)' }}>
                  {selectedDispute.description}
                </p>
              </div>

              <div>
                <p className="font-medium text-sm mb-1" style={{ color: 'var(--muted)' }}>Resolution Notes</p>
                <Textarea
                  placeholder="Add resolution notes..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            {selectedDispute?.status === 'open' && (
              <Button
                variant="outline"
                onClick={() => handleAction('investigate')}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Investigate
              </Button>
            )}
            {(selectedDispute?.status === 'open' || selectedDispute?.status === 'investigating') && (
              <Button
                variant="outline"
                onClick={() => handleAction('mediate')}
                disabled={actionLoading}
              >
                Mediate
              </Button>
            )}
            {selectedDispute?.status !== 'resolved' && selectedDispute?.status !== 'closed' && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleAction('resolve')}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Resolve
              </Button>
            )}
            {selectedDispute?.status !== 'closed' && (
              <Button
                variant="destructive"
                onClick={() => handleAction('close')}
                disabled={actionLoading}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
