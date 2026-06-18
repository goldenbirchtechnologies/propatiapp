'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, DollarSign, Download, ChevronDown, ChevronUp, Calendar, AlertCircle, CheckCircle, Clock, Eye, FileText, AlertTriangle } from 'lucide-react';
import { format, subMonths, addMonths } from 'date-fns';

const mockRentSchedule = [
  { id: '1', property: 'Sunrise Apartments', unit: 'A-101', tenant: 'John Doe', amount: 150000, dueDate: '2026-07-01', status: 'upcoming', paidDate: null, receipt: null },
  { id: '2', property: 'Sunrise Apartments', unit: 'A-102', tenant: 'Jane Smith', amount: 150000, dueDate: '2026-07-01', status: 'upcoming', paidDate: null, receipt: null },
  { id: '3', property: 'Greenview Estate', unit: 'B-201', tenant: 'Mike Johnson', amount: 400000, dueDate: '2026-07-05', status: 'upcoming', paidDate: null, receipt: null },
  { id: '4', property: 'Lekki Heights', unit: 'C-305', tenant: 'Sarah Williams', amount: 180000, dueDate: '2026-06-28', status: 'overdue', paidDate: null, receipt: null },
  { id: '5', property: 'Victoria Court', unit: 'D-101', tenant: 'David Lee', amount: 400000, dueDate: '2026-06-15', status: 'paid', paidDate: '2026-06-14', receipt: 'RCT-001' },
  { id: '6', property: 'Osborne Towers', unit: 'E-202', tenant: 'Lisa Chen', amount: 300000, dueDate: '2026-06-20', status: 'paid', paidDate: '2026-06-19', receipt: 'RCT-002' },
  { id: '7', property: 'Sunrise Apartments', unit: 'A-201', tenant: 'Peter Okonkwo', amount: 150000, dueDate: '2026-06-10', status: 'partial', paidDate: '2026-06-10', receipt: 'RCT-003' },
];

const mockTransactions = [
  { id: 'txn_001', date: '2026-06-14', property: 'Victoria Court', unit: 'D-101', tenant: 'David Lee', type: 'rent', amount: 400000, status: 'received', method: 'bank_transfer', reference: 'TXN-001' },
  { id: 'txn_002', date: '2026-06-19', property: 'Osborne Towers', unit: 'E-202', tenant: 'Lisa Chen', type: 'rent', amount: 300000, status: 'received', method: 'bank_transfer', reference: 'TXN-002' },
  { id: 'txn_003', date: '2026-06-10', property: 'Sunrise Apartments', unit: 'A-201', tenant: 'Peter Okonkwo', type: 'rent', amount: 100000, status: 'received', method: 'cash', reference: 'TXN-003' },
  { id: 'txn_004', date: '2026-06-05', property: 'Greenview Estate', unit: 'B-201', tenant: 'Mike Johnson', type: 'caution', amount: 400000, status: 'received', method: 'bank_transfer', reference: 'TXN-004' },
];

export default function EstateManagerLedgerPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'));

  const upcomingCount = mockRentSchedule.filter(s => s.status === 'upcoming').length;
  const overdueCount = mockRentSchedule.filter(s => s.status === 'overdue').length;
  const paidThisMonth = mockTransactions
    .filter(t => t.date.startsWith(monthFilter) && t.status === 'received')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutstanding = mockRentSchedule
    .filter(s => s.status === 'overdue' || s.status === 'partial')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Rent Ledger
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Track rent collection, due dates, and payment history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="inp-field" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={{ width: 'auto' }}>
            {Array.from({ length: 12 }, (_, i) => {
              const date = subMonths(new Date(), i);
              return <option key={i} value={format(date, 'yyyy-MM')}>{format(date, 'MMMM yyyy')}</option>;
            })}
          </select>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Upcoming" value={upcomingCount} icon={<Calendar />} trend={`₦${mockRentSchedule.filter(s => s.status === 'upcoming').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}`} />
        <StatCard label="Overdue" value={overdueCount} icon={<AlertTriangle />} trend={`₦${mockRentSchedule.filter(s => s.status === 'overdue').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}`} trendPositive={false} />
        <StatCard label="Collected This Month" value={`₦${(paidThisMonth / 1000000).toFixed(1)}M`} icon={<DollarSign />} trendPositive />
        <StatCard label="Outstanding" value={`₦${(totalOutstanding / 1000000).toFixed(1)}M`} icon={<AlertCircle />} trendPositive={false} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">Rent Schedule</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="arrears">Arrears Report</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <RentScheduleTable schedule={mockRentSchedule} searchQuery={searchQuery} setSearchQuery={setSearchQuery} monthFilter={monthFilter} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsTable transactions={mockTransactions} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </TabsContent>

        <TabsContent value="arrears" className="mt-6">
          <ArrearsTable arrears={mockRentSchedule.filter(s => s.status === 'overdue' || s.status === 'partial')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RentScheduleTable({ schedule, searchQuery, setSearchQuery, monthFilter }: any) {
  const filteredSchedule = schedule.filter((s: any) =>
    s.dueDate.startsWith(monthFilter) &&
    (s.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.unit.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardContent className="p-4">
        <Input
          placeholder="Search by property, unit, or tenant..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 max-w-xs"
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Unit</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Due Date</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((item: any) => (
                <tr key={item.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">
                    <p className="font-medium" style={{ color: 'var(--text)' }}>{item.property}</p>
                  </td>
                  <td className="p-4"><code className="text-sm">{item.unit}</code></td>
                  <td className="p-4" style={{ color: 'var(--text)' }}>{item.tenant}</td>
                  <td className="p-4 text-right font-bold" style={{ color: 'var(--text)' }}>₦{item.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                      {format(new Date(item.dueDate), 'dd MMM yyyy')}
                      {item.status === 'overdue' && <span className="text-xs text-red-500 font-medium">OVERDUE</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {item.status !== 'paid' && <Button variant="primary" size="sm">Collect</Button>}
                      <Button variant="ghost" size="icon" title="View Details"><Eye className="w-4 h-4" /></Button>
                      {item.receipt && <Button variant="ghost" size="icon" title="View Receipt"><FileText className="w-4 h-4" /></Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionsTable({ transactions, searchQuery, setSearchQuery }: any) {
  return (
    <Card>
      <CardContent className="p-4">
        <Input
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 max-w-xs"
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Unit</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Method</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4">{format(new Date(tx.date), 'dd MMM yyyy')}</td>
                  <td className="p-4" style={{ color: 'var(--text)' }}>{tx.property}</td>
                  <td className="p-4"><code className="text-sm">{tx.unit}</code></td>
                  <td className="p-4" style={{ color: 'var(--text)' }}>{tx.tenant}</td>
                  <td className="p-4"><Badge variant="secondary" className="capitalize">{tx.type}</Badge></td>
                  <td className="p-4 text-right font-bold" style={{ color: 'var(--text)' }}>₦{tx.amount.toLocaleString()}</td>
                  <td className="p-4">{tx.method.replace('_', ' ')}</td>
                  <td className="p-4"><code className="text-sm">{tx.reference}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ArrearsTable({ arrears }: any) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Unit</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount Due</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Due Date</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Days Overdue</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {arrears.map((item: any) => (
                <tr key={item.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4" style={{ color: 'var(--text)' }}>{item.property}</td>
                  <td className="p-4"><code className="text-sm">{item.unit}</code></td>
                  <td className="p-4" style={{ color: 'var(--text)' }}>{item.tenant}</td>
                  <td className="p-4 text-right font-bold text-red-500">₦{item.amount.toLocaleString()}</td>
                  <td className="p-4">{format(new Date(item.dueDate), 'dd MMM yyyy')}</td>
                  <td className="p-4">
                    <span className="font-medium text-red-500">
                      {Math.floor((new Date().getTime() - new Date(item.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="destructive" size="sm">Send Reminder</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string; icon: any }> = {
    upcoming: { class: 'tag-blue', label: 'Upcoming', icon: <Clock className="w-3 h-3 mr-1" /> },
    overdue: { class: 'tag-red', label: 'Overdue', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
    paid: { class: 'tag-green', label: 'Paid', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    partial: { class: 'tag-amber', label: 'Partial', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
  };
  const cfg = config[status] || config.upcoming;
  return (
    <Badge variant={cfg.class.replace('tag-', '') as any} className="flex items-center gap-1">
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

function StatCard({ label, value, icon: Icon, trend, trendPositive = true }: { label: string; value: string | number; icon: React.ReactNode; trend?: string; trendPositive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            {Icon}
          </div>
        </div>
        {trend && (
          <div className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>{trend}</div>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function AlertTriangleIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function CheckCircleIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function AlertCircleIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function ClockIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function DollarSignIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function EyeIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>; }
function FileTextIcon() { return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }