'use client';

import React from 'react';
import { useOrganizations } from '@/hooks';
import { useRentLedger } from '@/hooks/useUnits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LoadingState } from '@/components/feedback/LoadingState';
import { FailureState } from '@/components/feedback/FailureState';
import { formatCurrency } from '@/lib/utils';

// Safe mock fallback for the rent ledger when the orgs API is unavailable
// or the user has not yet created/selected an organization.
const MOCK_LEDGER_ENTRIES = [
  { id: 'mock-1', date: '2024-01-15', description: 'Rent payment — Unit 101', amount: 150000, type: 'payment' },
  { id: 'mock-2', date: '2024-02-15', description: 'Rent payment — Unit 102', amount: 200000, type: 'payment' },
  { id: 'mock-3', date: '2024-03-15', description: 'Service charge — Building A', amount: 15000, type: 'charge' },
];

export default function LedgerPage() {
  const { data: orgData, isLoading: orgsLoading, error: orgsError } = useOrganizations();
  const orgId = orgData?.data?.[0]?.id;

  // If the orgs API is unavailable, fall back to safe mock data and skip live fetching.
  if (orgsError || !orgId) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ledger Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              {orgsError
                ? 'Organizations API unavailable — showing sample ledger data.'
                : 'No organization found — showing sample ledger data.'}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount (₦)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_LEDGER_ENTRIES.map((entry) => (
                  <TableRow key={entry.id} className="animate-fadeUp">
                    <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">{Number(entry.amount || 0).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    data: ledger,
    isLoading: ledgerLoading,
    error: ledgerError,
  } = useRentLedger(orgId);

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
