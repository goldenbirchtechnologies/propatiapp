'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
  reference: string | null;
  listingId: string | null;
  payerId: string;
  payeeId: string;
  agentId: string | null;
  type: string;
  status: string;
  amount: number;
  currency: string | null;
  platformFee: number;
  agentCommission: number;
  payeeAmount: number | null;
  paystackRef: string | null;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; address: string } | null;
  payer: { id: string; fullName: string; email: string } | null;
  payee: { id: string; fullName: string; email: string } | null;
  paystackData: string | null;
}

interface AdminPaymentsClientProps {
  initialTransactions: Transaction[];
}

export default function AdminPaymentsClient({ initialTransactions }: AdminPaymentsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        (txn.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.payer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.payee?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (txn.listing?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const handleRetry = () => {
    setError(null);
    router.refresh();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="tag-amber">Pending</Badge>;
      case 'in_escrow':
        return <Badge className="tag-blue">In Escrow</Badge>;
      case 'released':
        return <Badge className="tag-green">Released</Badge>;
      case 'failed':
        return <Badge className="tag-red">Failed</Badge>;
      case 'refunded':
        return <Badge className="tag-gray">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payments Registry</h1>
            <p className="text-muted-foreground mt-1">Unable to load payment data</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeftRight className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Payments Registry</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Monitor platform transactions, status, and amounts.
        </p>
      </div>

      <div className="card p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-1 sm:grid-cols-2 max-w-md">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
                <Input
                  placeholder="Search by ref, payer, payee, or listing..."
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_escrow">In Escrow</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRetry} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>No transactions found</p>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Reference</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Parties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-4">
                          <p className="font-medium" style={{ color: 'var(--text)' }}>{txn.reference || txn.id.slice(-8)}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{txn.listing?.title ?? 'No listing'}</p>
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{txn.type}</td>
                        <td className="p-4">{statusBadge(txn.status)}</td>
                        <td className="p-4 text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {txn.currency || 'NGN'} {Number(txn.amount).toLocaleString()}
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                          {txn.paidAt ? new Date(txn.paidAt).toLocaleDateString() : new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                          <p>{txn.payer?.fullName ?? 'Unknown'} → {txn.payee?.fullName ?? 'Unknown'}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="text-center py-12">
              <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>Recent activity</p>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                Last 24 hours of payment events will appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
