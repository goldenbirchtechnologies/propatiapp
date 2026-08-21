'use client';

import React from 'react';
import { useOrganizations } from '@/hooks';
import { useRentLedger } from '@/hooks/useUnits';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LoadingState } from '@/components/feedback/LoadingState';
import { FailureState } from '@/components/feedback/FailureState';

type LedgerEntry = {
  id: string;
  date: string | null;
  description: string;
  amount: number;
};

export default function LedgerPage() {
  const { data: orgData, isLoading: orgsLoading, error: orgsError } = useOrganizations();
  const orgId = orgData?.data?.[0]?.id;

  const {
    data: ledger,
    isLoading: ledgerLoading,
    error: ledgerError,
  } = useRentLedger(orgId);

  const {
    data: serviceChargesData,
    isLoading: serviceChargesLoading,
    error: _serviceChargesError,
  } = useQuery({
    queryKey: ['estate-manager-service-charges', orgId],
    queryFn: async () => {
      if (!orgId) return { success: true, data: [] };
      const res = await fetch(`/api/dashboard/estate-manager/service-charges?orgId=${orgId}`);
      if (!res.ok) throw new Error('Failed to fetch service charges');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const isAnyLoading = orgsLoading || ledgerLoading || serviceChargesLoading;

  if (isAnyLoading) {
    return <LoadingState label="Loading ledger..." />;
  }

  if (orgsError) {
    return (
      <FailureState
        title="Failed to load organizations"
        description={orgsError.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!orgId) {
    return (
      <FailureState
        title="No organization found"
        description="Please create or select an organization to view the ledger."
      />
    );
  }

  if (ledgerError) {
    return (
      <FailureState
        title="Failed to load ledger entries"
        description={ledgerError.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Normalize transactions from the ledger API
  const transactions: LedgerEntry[] = Array.isArray(ledger?.data)
    ? ledger.data.map((tx: Record<string, unknown>) => ({
        id: `tx-${tx.id || Math.random()}`,
        date: (tx.createdAt as string) || (tx.date as string) || null,
        description:
          ((tx.description as string) || (tx.type as string) || 'Transaction').toString(),
        amount: Number(tx.amount ?? 0),
      }))
    : [];

  // Normalize service charges from the estate-manager API
  const normalizedServiceCharges: LedgerEntry[] = Array.isArray(serviceChargesData?.data)
    ? serviceChargesData.data.map((sc: Record<string, unknown>) => ({
        id: `sc-${sc.id || Math.random()}`,
        date:
          (sc.paidAt as string) ||
          (sc.dueDate as string) ||
          (sc.createdAt as string) ||
          null,
        description:
          (sc.description as string) ||
          (sc.listing?.title
            ? `Service charge — ${sc.listing.title}`
            : 'Service charge').toString(),
        amount: Number(sc.amount ?? 0),
      }))
    : [];

  // Merge and sort by date descending (newest first)
  const entries = [...transactions, ...normalizedServiceCharges]
    .filter((entry) => entry.date !== null)
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-8 text-center">
              No ledger entries found.
            </p>
          </CardContent>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount (₦)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry: LedgerEntry) => (
                <TableRow key={entry.id} className="animate-fadeUp">
                  <TableCell>
                    {new Date(entry.date || Date.now()).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {Number(entry.amount || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>
    </div>
  );
}
