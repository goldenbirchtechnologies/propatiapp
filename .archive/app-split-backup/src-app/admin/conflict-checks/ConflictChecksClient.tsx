'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Search, Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ConflictCheck {
  id: string;
  status: string;
  adversePartyType: string;
  adversePartyName: string;
  conflictRationale: string | null;
  createdAt: string;
  case: { id: string; status: string };
  lawFirm: { id: string; name: string; cacNumber: string };
  lawyerProfile: { id: string; fullName: string; callToBarNumber: string } | null;
}

interface ConflictChecksClientProps {
  conflictChecks: ConflictCheck[];
}

const STATUS_COLORS: Record<string, string> = {
  not_checked: 'tag-gray',
  clear: 'tag-green',
  conflict: 'tag-red',
  waived: 'tag-amber',
};

export default function ConflictChecksClient({ conflictChecks: initialChecks }: ConflictChecksClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [checks, setChecks] = useState<ConflictCheck[]>(initialChecks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCheckId, setSelectedCheckId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return checks.filter((c) => {
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        c.id.toLowerCase().includes(term) ||
        c.lawFirm.name.toLowerCase().includes(term) ||
        c.adversePartyName.toLowerCase().includes(term) ||
        c.case.id.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [checks, searchTerm, statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    setSelectedCheckId(id);
    try {
      const res = await fetch(`/api/admin/conflict-checks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update conflict check');
      }
      toast({ title: 'Success', description: `Status set to ${status}` });
      setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setActionLoading(false);
      setSelectedCheckId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="font-heading font-bold flex items-center gap-3"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
        >
          <Search className="h-7 w-7" />
          Conflict Checks
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Review law-firm conflict-of-interest checks before engagement.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
          <Input
            placeholder="Search by party, firm, or case..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border px-3 text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface-elevated)' }}
        >
          <option value="all">All Statuses</option>
          <option value="not_checked">Not Checked</option>
          <option value="clear">Clear</option>
          <option value="conflict">Conflict</option>
          <option value="waived">Waived</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>No conflict checks found</p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>ID</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Firm</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Lawyer</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Adverse Party</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Case</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Created</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((check) => (
                <TableRow key={check.id}>
                  <TableCell className="font-mono text-xs" style={{ color: 'var(--text)' }}>
                    {check.id.slice(0, 12)}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {check.lawFirm.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      CAC: {check.lawFirm.cacNumber}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>
                      {check.lawyerProfile?.fullName || '—'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {check.lawyerProfile?.callToBarNumber || ''}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>
                      {check.adversePartyName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {check.adversePartyType}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/admin/business/law-firm-cases/${check.case.id}`)}
                    >
                      {check.case.id.slice(0, 12)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', STATUS_COLORS[check.status] ?? 'tag-gray')}>
                      {check.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--muted)' }}>
                    {format(new Date(check.createdAt), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/conflict-checks/${check.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {check.status !== 'clear' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(check.id, 'clear')}
                          disabled={actionLoading && selectedCheckId === check.id}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                        </Button>
                      )}
                      {check.status !== 'conflict' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(check.id, 'conflict')}
                          disabled={actionLoading && selectedCheckId === check.id}
                        >
                          <XCircle className="h-3 w-3 mr-1" /> Reject
                        </Button>
                      )}
                      {check.status !== 'waived' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(check.id, 'waived')}
                          disabled={actionLoading && selectedCheckId === check.id}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Waive
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
  );
}
