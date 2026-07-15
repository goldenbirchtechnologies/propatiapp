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
import { Search, Shield, Scale, Eye, Download, Lock, Unlock, UserPlus, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Signature {
  id: string;
  role: string;
  signedAt: string;
  signer: { id: string; fullName: string; email: string };
}

interface Listing {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  price: unknown;
  propertyType: string | null;
  images: { url: string }[];
}

interface Agreement {
  id: string;
  type: string;
  status: string;
  lockStatus: string;
  riskTier: string | null;
  governingStatute: string | null;
  jurisdictionState: string | null;
  createdAt: string;
  listing: Listing;
  landlord: { id: string; fullName: string; email: string; phone: string | null } | null;
  tenant: { id: string; fullName: string; email: string; phone: string | null } | null;
  agent: { id: string; fullName: string; email: string } | null;
  signatures: Signature[];
  stampDuty: { id: string; status: string; certificateHash: string | null } | null;
}

interface LegalAgreementsClientProps {
  agreements: Agreement[];
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'tag-amber',
  pending_landlord: 'tag-blue',
  pending_tenant: 'tag-blue',
  tenant_signed: 'tag-teal',
  landlord_signed: 'tag-teal',
  fully_signed: 'tag-green',
  terminated: 'tag-red',
  expired: 'tag-gray',
};

const LOCK_COLORS: Record<string, string> = {
  mutable: 'tag-green',
  locked: 'tag-red',
  pending_approval: 'tag-blue',
  immutable: 'tag-gray',
};

export default function LegalAgreementsClient({ agreements: initialAgreements }: LegalAgreementsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [agreements, setAgreements] = useState<Agreement[]>(initialAgreements);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return agreements.filter((a) => {
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesRisk = riskFilter === 'all' || a.riskTier === riskFilter;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        a.id.toLowerCase().includes(term) ||
        a.listing.title.toLowerCase().includes(term) ||
        a.governingStatute?.toLowerCase().includes(term) ||
        a.jurisdictionState?.toLowerCase().includes(term) ||
        (a.landlord?.fullName || '').toLowerCase().includes(term) ||
        (a.tenant?.fullName || '').toLowerCase().includes(term);
      return matchesStatus && matchesRisk && matchesSearch;
    });
  }, [agreements, searchTerm, statusFilter, riskFilter]);

  const handleLock = async (id: string) => {
    setActionTarget(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/legal-agreements/${id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockStatus: 'locked' }),
      });
      if (!res.ok) throw new Error('Failed to lock agreement');
      toast({ title: 'Success', description: 'Agreement locked for legal hold' });
      setAgreements((prev) => prev.map((a) => (a.id === id ? { ...a, lockStatus: 'locked' } : a)));
    } catch {
      toast({ title: 'Error', description: 'Failed to lock agreement', variant: 'destructive' });
    } finally {
      setLoading(false);
      setActionTarget(null);
    }
  };

  const handleUnlock = async (id: string) => {
    setActionTarget(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/legal-agreements/${id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockStatus: 'mutable' }),
      });
      if (!res.ok) throw new Error('Failed to unlock agreement');
      toast({ title: 'Success', description: 'Agreement unlocked' });
      setAgreements((prev) => prev.map((a) => (a.id === id ? { ...a, lockStatus: 'mutable' } : a)));
    } catch {
      toast({ title: 'Error', description: 'Failed to unlock agreement', variant: 'destructive' });
    } finally {
      setLoading(false);
      setActionTarget(null);
    }
  };

  const handleAssignAdmin = async (id: string) => {
    setActionTarget(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/legal-agreements/${id}/assign`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to assign admin');
      toast({ title: 'Success', description: 'Agreement assigned to you' });
    } catch {
      toast({ title: 'Error', description: 'Failed to assign admin', variant: 'destructive' });
    } finally {
      setLoading(false);
      setActionTarget(null);
    }
  };

  const handleEscalate = async (id: string) => {
    setActionTarget(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/legal-agreements/${id}/escalate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to escalate');
      toast({ title: 'Escalated', description: 'Agreement escalated for legal review' });
    } catch {
      toast({ title: 'Error', description: 'Failed to escalate', variant: 'destructive' });
    } finally {
      setLoading(false);
      setActionTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="font-heading font-bold flex items-center gap-3"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
        >
          <Scale className="h-7 w-7" />
          Legal Agreements
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Agreements requiring legal review, lock status, or statute compliance.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
          <Input
            placeholder="Search by ID, property, statute, or party..."
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
          <option value="draft">Draft</option>
          <option value="pending_landlord">Pending Landlord</option>
          <option value="pending_tenant">Pending Tenant</option>
          <option value="fully_signed">Fully Signed</option>
          <option value="terminated">Terminated</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="h-10 rounded-md border px-3 text-sm"
          style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface-elevated)' }}
        >
          <option value="all">All Risk Tiers</option>
          <option value="review_required">Review Required</option>
          <option value="self_serve">Self Serve</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center" style={{ borderColor: 'var(--border)' }}>
          <FileText className="mx-auto h-10 w-10 mb-3" style={{ color: 'var(--muted)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>No legal agreements found</p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Agreement</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Parties</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Legal Context</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Lock</TableHead>
                <TableHead className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agreement) => (
                <TableRow key={agreement.id}>
                  <TableCell>
                    <p className="font-mono text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {agreement.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {format(new Date(agreement.createdAt), 'dd MMM yyyy')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                        {agreement.listing.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {agreement.listing.address}, {agreement.listing.state}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm" style={{ color: 'var(--text)' }}>
                        {agreement.landlord?.fullName || '—'} (L)
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text)' }}>
                        {agreement.tenant?.fullName || '—'} (T)
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {agreement.jurisdictionState && (
                        <Badge variant="outline" className="text-xs">
                          {agreement.jurisdictionState}
                        </Badge>
                      )}
                      {agreement.governingStatute && (
                        <Badge variant="outline" className="text-xs">
                          {agreement.governingStatute}
                        </Badge>
                      )}
                      {agreement.riskTier && (
                        <Badge className={cn('text-xs', agreement.riskTier === 'review_required' ? 'tag-red' : 'tag-green')}>
                          {agreement.riskTier}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', STATUS_COLORS[agreement.status] ?? 'tag-gray')}>
                      {agreement.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', LOCK_COLORS[agreement.lockStatus] ?? 'tag-gray')}>
                      {agreement.lockStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/agreements/${agreement.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      {agreement.lockStatus !== 'locked' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLock(agreement.id)}
                          disabled={loading && actionTarget === agreement.id}
                        >
                          <Lock className="h-3 w-3 mr-1" /> Lock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnlock(agreement.id)}
                          disabled={loading && actionTarget === agreement.id}
                        >
                          <Unlock className="h-3 w-3 mr-1" /> Unlock
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignAdmin(agreement.id)}
                        disabled={loading && actionTarget === agreement.id}
                      >
                        <UserPlus className="h-3 w-3 mr-1" /> Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(agreement.id)}
                        disabled={loading && actionTarget === agreement.id}
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" /> Escalate
                      </Button>
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
