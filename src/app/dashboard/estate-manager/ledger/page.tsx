import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// Mock ledger data
const ledgerEntries = [
  { id: '1', date: '2024-01-15', description: 'Rent payment', amount: 150000 },
  { id: '2', date: '2024-02-01', description: 'Maintenance fee', amount: 25000 },
  { id: '3', date: '2024-02-20', description: 'Utility bill', amount: 18000 },
];

export default function LedgerPage() {
  return (
    <div className="space-y-6">
      {/* Gradient Card */}
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
              {ledgerEntries.map(entry => (
                <TableRow key={entry.id} className="animate-fadeUp">
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">{entry.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

{/* Inline styles for animations (consistent with other dashboards) */}
<style>{`
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
.animate-fadeUp { animation: fadeUp 0.4s ease forwards; }
`}</style>
