'use client';

import { format } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface RentScheduleEntry {
  id: string;
  dueDate: string;
  type: 'rent' | 'deposit' | 'service_charge';
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
}

interface RentScheduleTableProps {
  entries: RentScheduleEntry[];
  onPayNow?: (entryId: string) => void;
  onExportCSV?: () => void;
  showActions?: boolean;
}

const typeLabels: Record<RentScheduleEntry['type'], string> = {
  rent: 'Rent Payment',
  deposit: 'Caution Deposit',
  service_charge: 'Service Charge',
};

const statusConfig: Record<
  RentScheduleEntry['status'],
  { label: string; className: string }
> = {
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-800' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
};

export function RentScheduleTable({
  entries,
  onPayNow,
  onExportCSV,
  showActions = true,
}: RentScheduleTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const handleExportCSV = () => {
    if (!onExportCSV) {
      // Fallback: create CSV manually
      const headers = ['Due Date', 'Type', 'Amount', 'Status', 'Paid At'];
      const rows = entries.map((entry) => [
        format(new Date(entry.dueDate), 'yyyy-MM-dd'),
        typeLabels[entry.type],
        entry.amount.toString(),
        statusConfig[entry.status].label,
        entry.paidAt ? format(new Date(entry.paidAt), 'yyyy-MM-dd HH:mm') : '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rent-schedule-${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      onExportCSV();
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No rent schedule entries available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Rent Payment Schedule</h3>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Due Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {format(new Date(entry.dueDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{typeLabels[entry.type]}</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(entry.amount)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusConfig[entry.status].className}
                  >
                    {statusConfig[entry.status].label}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    {entry.status === 'pending' && onPayNow && (
                      <Button size="sm" onClick={() => onPayNow(entry.id)}>
                        Pay Now
                      </Button>
                    )}
                    {entry.status === 'paid' && entry.paidAt && (
                      <span className="text-xs text-muted-foreground">
                        Paid {format(new Date(entry.paidAt), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
