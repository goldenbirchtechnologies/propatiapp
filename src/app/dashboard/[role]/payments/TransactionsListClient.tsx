'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreditCard, Receipt, Eye, Loader2, Plus, Filter } from 'lucide-react';
import { useTransactions } from '@/hooks/usePayments';
import { TransactionStatusBadge, type TransactionStatus } from '@/components/payments/transaction-status-badge';
import { formatAmountFromKobo } from '@/lib/payment-utils';

interface User {
  id: string;
  role: string;
}

interface TransactionsListClientProps {
  user: User;
}

export default function TransactionsListClient({ user }: TransactionsListClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');

  const { data: transactionsDataRaw, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions({ limit: 20 });
  const transactionsData = transactionsDataRaw as any;
  const transactions = transactionsData?.pages?.flatMap((page: any) => page.data || []) || [];

  const filteredTransactions = transactions.filter((tx: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return tx.status === 'pending';
    if (activeTab === 'in_escrow') return tx.status === 'in_escrow';
    if (activeTab === 'completed') return tx.status === 'released' || tx.status === 'completed';
    if (activeTab === 'failed') return tx.status === 'failed';
    return true;
  });

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/payments/${id}`);
  };

  const handleDownloadReceipt = (id: string) => {
    router.push(`/dashboard/payments/${id}/receipt`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-zinc-500">View and manage your payment history</p>
        </div>
        <Button onClick={() => router.push('/dashboard/payments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>

      {/* Tabs Filter */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in_escrow">In Escrow</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="glass-card">
            <div className="px-6 py-5 border-b border-white/[0.08]">
              <h3 className="text-lg font-semibold text-white">Transaction History</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-zinc-500" />
                  <p className="text-zinc-500">Loading transactions...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-zinc-500 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                  <p className="text-zinc-500 mb-4">
                    {activeTab === 'all'
                      ? 'You haven\'t made unknown payments yet'
                      : `No ${activeTab} transactions`}
                  </p>
                  {activeTab === 'all' && (
                    <Button onClick={() => router.push('/dashboard/payments/new')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Make Your First Payment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Property / Agreement</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {tx.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {tx.listing?.title || 'N/A'}
                              </p>
                              {tx.agreements?.[0] && (
                                <p className="text-xs text-zinc-500">
                                  Agreement: {tx.agreements[0].id.slice(-8).toUpperCase()}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatAmountFromKobo(tx.amount)}
                          </TableCell>
                          <TableCell>
                            <TransactionStatusBadge status={tx.status as TransactionStatus} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(tx.id)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(tx.status === 'released' || tx.status === 'completed') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownloadReceipt(tx.id)}
                                  title="Download Receipt"
                                >
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Load More */}
                  {hasNextPage && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
