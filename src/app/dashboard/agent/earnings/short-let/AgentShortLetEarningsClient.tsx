'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
import MaterialIcon from '@/components/icons/material-icon';

  Wallet,
  CalendarDays,
  Download,
  Wrench,
  TrendingUp,

} from 'lucide-react';

type Stay = {
  id: string;
  property: string;
  guest: string;
  dates: string;
  nights: number;
  gross: number;
  serviceFee: number;
  net: number;
  status: 'Settled' | 'Processing';
};

const initialStays: Stay[] = [
  {
    id: '1',
    property: 'Skyline Penthouse VI',
    guest: 'Amara Okafor',
    dates: 'May 12 - May 15',
    nights: 3,
    gross: 450000,
    serviceFee: 36000,
    net: 414000,
    status: 'Settled',
  },
  {
    id: '2',
    property: 'Lekki Scandi Studio',
    guest: 'Tunde Balogun',
    dates: 'May 08 - May 10',
    nights: 2,
    gross: 180000,
    serviceFee: 14400,
    net: 165600,
    status: 'Settled',
  },
  {
    id: '3',
    property: 'Maitama Terrace House',
    guest: 'Chidi Benson',
    dates: 'May 01 - May 07',
    nights: 6,
    gross: 1200000,
    serviceFee: 96000,
    net: 1104000,
    status: 'Processing',
  },
];

const calendarDays = [
  { date: 29, disabled: true },
  { date: 30, disabled: true },
  { date: 1, revenue: 45000 },
  { date: 2, revenue: 45000 },
  { date: 3, revenue: 110000, active: true },
  { date: 4, revenue: 110000, active: true },
  { date: 5, revenue: 110000, active: true },
  { date: 6, revenue: 85000 },
  { date: 7, revenue: 85000 },
  { date: 8, blocked: true },
  { date: 9, revenue: 92000 },
  { date: 10, revenue: 150000 },
  { date: 11, revenue: 210000, peak: true },
  { date: 12, revenue: 210000, peak: true },
];

export default function AgentShortLetEarningsClient() {
  const [loading] = useState(false);

  const totalRevenue = initialStays.reduce((sum, s) => sum + s.net, 0);
  const occupancy = 84.2;
  const nextPayout = 'May 24';
  const nextPayoutAmount = 2105400;

  const breakdown = [
    { label: 'Gross Booking', value: '₦15,240,000', pct: 100 },
    { label: 'PROPATI Service Fee (8%)', value: '-₦1,219,200', pct: 8 },
    { label: 'Maintenance & Cleaning', value: '-₦840,000', pct: 5 },
    { label: 'VAT & Local Levies', value: '-₦730,800', pct: 4 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-sm font-bold">Short-let Revenue</h1>
        <p className="mt-2 text-[10px] font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Track earnings, occupancy, and payouts.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2 bg-primary text-primary-foreground relative overflow-hidden">
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-label-md uppercase tracking-wider opacity-80">Available Revenue</p>
            <h2 className="text-headline-sm font-bold mt-2">₦12,450,000.00</h2>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button className="bg-warning text-primary hover:brightness-110">
                <Wallet className="h-4 w-4 mr-2" /> Withdraw Earnings
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-surface-container-lowest/10">
                History
              </Button>
            </div>
          </CardContent>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-warning opacity-10 rounded-full blur-3xl" />
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Occupancy Rate</p>
              <span className="bg-success/10 text-success px-2 py-1 rounded text-xs font-bold border border-outline-variant">+12%</span>
            </div>
            <h3 className="text-headline-sm font-bold mt-2">{occupancy}%</h3>
            <Progress value={occupancy} className="mt-4 h-2" />
            <p className="text-xs font-label-md uppercase tracking-wider mt-2" style={{ color: 'text-on-surface-variant' }}>Average across 14 properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Next Payout</p>
            <h3 className="text-headline-sm font-bold mt-2">{nextPayout}</h3>
            <div className="flex items-center gap-3 mt-4">
              <div className="p-2 bg-warning/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-bold">₦{nextPayoutAmount.toLocaleString()}</p>
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Estimated amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-headline-sm">Revenue Forecast</CardTitle>
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>May 2024 Bookings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MaterialIcon name="chevron_left" className="material-symbols-outlined" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MaterialIcon name="chevron_right" className="material-symbols-outlined" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-w-[600px] grid grid-cols-7 gap-2">
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>MON</div>
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>TUE</div>
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>WED</div>
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>THU</div>
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>FRI</div>
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>SAT</div>
              <div className="text-center text-xs font-label-md uppercase tracking-wider py-2" style={{ color: 'text-on-surface-variant' }}>SUN</div>
              {calendarDays.map((d) => (
                <div
                  key={d.date}
                  className={cn(
                    'h-24 p-2 rounded-lg border flex flex-col justify-between transition-colors',
                    d.disabled ? 'bg-muted border-outline-variant opacity-40' : 'bg-surface-container-lowest border-outline-variant hover:border-primary cursor-pointer',
                    d.active ? 'bg-primary text-white border-primary' : '',
                    d.peak ? 'bg-warning text-white border-warning' : ''
                  )}
                >
                  <span className="text-xs">{d.date}</span>
                  {d.revenue && (
                    <div>
                      <span className={cn('text-[10px] font-label-md uppercase tracking-wider', d.active || d.peak ? 'text-white' : 'text-success')}>
                        ₦{(d.revenue / 1000).toFixed(0)}k
                      </span>
                      {(d.active || d.peak) && (
                        <div className="h-1 w-full bg-warning/60 rounded-full mt-1" />
                      )}
                    </div>
                  )}
                  {d.blocked && (
                    <div className="flex items-center gap-1" style={{ color: 'text-on-surface-variant' }}>
                      <Wrench className="h-3 w-3" />
                      <span className="text-[10px] font-label-md uppercase tracking-wider">Blocked</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-headline-sm">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className={cn('text-xs font-label-md uppercase tracking-wider', item.value.startsWith('-') ? 'text-on-surface-variant' : '')}>
                    {item.label}
                  </span>
                  <span className={cn('text-xs font-label-md uppercase tracking-wider', item.value.startsWith('-') ? 'text-destructive' : '')}>{item.value}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={cn('h-full rounded-full', item.value.startsWith('-') ? 'bg-destructive/60' : 'bg-primary')}
                    style={{ width: `${Math.min(item.pct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-6 mt-6 border-t border-outline-variant">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Net Revenue</p>
                  <p className="text-headline-sm font-bold text-success">₦12,450,000</p>
                </div>
                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold border border-outline-variant">
                  VERIFIED
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Completed Stays */}
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-headline-sm">Recent Completed Stays</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50" style={{ color: 'text-on-surface-variant' }}>
              <tr>
                <th className="px-4 py-3 text-xs font-label-md uppercase tracking-wider">Property & Guest</th>
                <th className="px-4 py-3 text-xs font-label-md uppercase tracking-wider">Stay Dates</th>
                <th className="px-4 py-3 text-xs font-label-md uppercase tracking-wider">Gross Amount</th>
                <th className="px-4 py-3 text-xs font-label-md uppercase tracking-wider">Service Fee</th>
                <th className="px-4 py-3 text-xs font-label-md uppercase tracking-wider">Net Payout</th>
                <th className="px-4 py-3 text-xs font-label-md uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {initialStays.map((stay) => (
                <tr key={stay.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <CalendarDays className="h-5 w-5" style={{ color: 'text-on-surface-variant' }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{stay.property}</p>
                        <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Guest: {stay.guest}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-label-md uppercase tracking-wider">
                    {stay.dates}
                    <span className="text-xs font-label-md uppercase tracking-wider block" style={{ color: 'text-on-surface-variant' }}>({stay.nights} nights)</span>
                  </td>
                  <td className="px-4 py-4 text-sm font-mono">₦{stay.gross.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm font-label-md uppercase tracking-wider text-destructive">-₦{stay.serviceFee.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm font-bold">₦{stay.net.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={stay.status === 'Settled' ? 'default' : 'secondary'}
                      className="bg-success/10 text-success hover:bg-success/10"
                    >
                      {stay.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
