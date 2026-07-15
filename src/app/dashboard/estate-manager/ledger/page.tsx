'use client';

import React from 'react';
import { useOrganizations } from '@/hooks';
import { useRentLedger } from '@/hooks/useUnits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LoadingState } from '@/components/feedback/LoadingState';
import { FailureState } from '@/components/feedback/FailureState';
import { formatCurrency } from '@/lib/utils';

// TODO: If orgs API is unavailable, keep safe mock below and skip fetching
// const ledgerEntries = [
//   { id: '1', date: '2024-01-15', description: 'Rent payment', amount: 150000 },
//   ...
// ];

export default function LedgerPage() {
  const { data: orgData, isLoading: orgsLoading, error: orgsError } = useOrganizations();
  const orgId = orgData?.data?.[0]?.id;

  // Fetch ledger only after we have a valid organization ID
  const {
    data: ledger,
    isLoading: ledgerLoading,
    error: ledgerError,
  } = useRentLedger(orgId ?? '');

  if (orgsLoading || ledgerLoading) {
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

  if (ledgerError) {
    return (
      <FailureState
        title="Failed to load ledger entries"
        description={ledgerError.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!orgId) {
    return <FailureState title="No organization found" description="Please select an organization to view the ledger." />;
  }

  const entries = Array.isArray(ledger?.data) ? ledger.data : [];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No ledger entries found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (₦)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry: unknown) => (
                  <TableRow key={entry.id} className="animate-fadeUp">
                    <TableCell>{new Date(entry.date || entry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.description || entry.type || '—'}</TableCell>
                    <TableCell className="text-right">{Number(entry.amount || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
