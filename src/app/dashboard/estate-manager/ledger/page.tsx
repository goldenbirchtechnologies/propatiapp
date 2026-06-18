'use client';

import { useState } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, DollarSign, TrendingUp, AlertCircle, Building2 } from 'lucide-react';

export default function RentLedgerPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );

  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const org = orgsData?.data?.[0];

  // Mock rent entries (replace with real API data)
  const mockRentEntries = [
    {
      id: '1',
      unit: 'Flat 2B - Lekki Gardens',
      tenant: 'John Doe',
      amountDue: 2500000,
      amountPaid: 2500000,
      status: 'paid',
      dueDate: '2024-06-01',
      paidDate: '2024-06-01',
    },
    {
      id: '2',
      unit: 'Flat 3A - Lekki Gardens',
      tenant: 'Jane Smith',
      amountDue: 3000000,
      amountPaid: 3000000,
      status: 'paid',
      dueDate: '2024-06-01',
      paidDate: '2024-06-02',
    },
    {
      id: '3',
      unit: 'Flat 1C - Lekki Gardens',
      tenant: 'Bob Wilson',
      amountDue: 2000000,
      amountPaid: 0,
      status: 'pending',
      dueDate: '2024-06-01',
      paidDate: null,
    },
    {
      id: '4',
      unit: 'Flat 4D - Lekki Gardens',
      tenant: 'Alice Brown',
      amountDue: 2800000,
      amountPaid: 0,
      status: 'overdue',
      dueDate: '2024-05-01',
      paidDate: null,
    },
  ];

  if (orgsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No organization found</p>
      </div>
    );
  }

  const totalDue = mockRentEntries.reduce((sum, entry) => sum + entry.amountDue, 0);
  const totalPaid = mockRentEntries.reduce((sum, entry) => sum + entry.amountPaid, 0);
  const totalPending = totalDue - totalPaid;
  const collectionRate = totalDue > 0 ? ((totalPaid / totalDue) * 100).toFixed(1) : '0';

  const statusConfig: Record<string, { label: string; variant: any; color: string }> = {
    paid: { label: 'Paid', variant: 'success', color: 'text-green-600' },
    pending: { label: 'Pending', variant: 'secondary', color: 'text-yellow-600' },
    overdue: { label: 'Overdue', variant: 'destructive', color: 'text-red-600' },
  };

  const handleExportCSV = () => {
    // Mock CSV export
    const csv = [
      'Unit,Tenant,Amount Due,Amount Paid,Status,Due Date,Paid Date',
      ...mockRentEntries.map((entry) =>
        [
          entry.unit,
          entry.tenant,
          entry.amountDue,
          entry.amountPaid,
          entry.status,
          entry.dueDate,
          entry.paidDate || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent-ledger-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Generate month options for the past 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rent Ledger</h1>
          <p className="text-muted-foreground">
            Track rent payments and collections
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{(totalDue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {mockRentEntries.length} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₦{(totalPaid / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {collectionRate}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₦{(totalPending / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {mockRentEntries.filter((e) => e.status !== 'paid').length} units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockRentEntries.filter((e) => e.status === 'overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">Units overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Rent Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {mockRentEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRentEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.unit}</TableCell>
                    <TableCell>{entry.tenant}</TableCell>
                    <TableCell>
                      ₦{entry.amountDue.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={
                        entry.amountPaid === entry.amountDue
                          ? 'text-green-600'
                          : entry.amountPaid > 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      ₦{entry.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[entry.status].variant}>
                        {statusConfig[entry.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.status !== 'paid' && (
                        <Button size="sm" variant="outline">
                          Send Reminder
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No rent entries for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
