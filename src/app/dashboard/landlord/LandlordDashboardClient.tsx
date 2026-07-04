'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLandlordWallet } from '@/hooks/useLandlordWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LandlordDashboardClientProps {
  userName?: string;
}

const applications = [
  { initials: 'EO', name: 'Emeka Okafor', listing: '3BR Luxury Flat, Lekki Ph 1', status: 'Pending', date: 'Oct 24, 2023', color: 'bg-gray-200' },
  { initials: 'SA', name: 'Sade Adekunle', listing: 'Penthouse, Victoria Island', status: 'Verified', date: 'Oct 22, 2023', color: 'bg-green-100 text-green-700' },
  { initials: 'JO', name: 'John Obinna', listing: 'Modern Duplex, Ikoyi', status: 'Rejected', date: 'Oct 20, 2023', color: 'bg-red-100 text-red-700' },
  { initials: 'FA', name: 'Funmi Alakija', listing: 'Studio, Maryland', status: 'Pending', date: 'Oct 19, 2023', color: 'bg-amber-100 text-amber-700' },
];

const rentSchedule = [
  { title: 'Rent Received - Apt 4B', detail: '₦450,000 • Received Today', icon: 'check_circle', bg: 'bg-green-600', ring: 'ring-green-600' },
  { title: 'Rent Due - Villa 12', detail: '₦1,200,000 • Due in 2 days', icon: 'schedule', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { title: 'Auto-Reminders Sent', detail: '6 Tenants Notified • Oct 25', icon: 'notifications_active', bg: 'bg-gray-300', ring: 'ring-gray-300' },
  { title: 'Upcoming Renewal', detail: 'Lekki Flat C • Oct 30', icon: 'event', bg: 'bg-gray-300', ring: 'ring-gray-300' },
];

export default function LandlordDashboardClient({ userName }: LandlordDashboardClientProps) {
  const { balance, isLoading, error } = useLandlordWallet();
  const displayName = userName || 'Landlord';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl" style={{ color: 'var(--foreground)' }}>
            Welcome back, {displayName.split(' ')[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here is what is happening with your Lagos portfolio today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/landlord/listing/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:shadow-lg transition-all"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Add Listing
          </Link>
          <Link
            href="/dashboard/landlord/applications"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-bold hover:bg-muted transition-all"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            View Applications
          </Link>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-5xl">home_work</span>
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Active Listings</p>
            <p className="text-3xl font-heading font-bold">12</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +2 since last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-5xl">pending_actions</span>
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Pending Applications</p>
            <p className="text-3xl font-heading font-bold">08</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600">
              <span className="material-symbols-outlined text-sm">priority_high</span>
              3 require urgent review
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden" style={{ background: 'hsl(var(--primary-dark))' }}>
          <div className="absolute inset-0 animate-shimmer opacity-30 pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70 mb-1">This Month&apos;s Rent</p>
            <p className="text-3xl font-heading font-bold text-white">₦4,250,000</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-green-300">
              <span className="material-symbols-outlined text-sm">verified</span>
              85% Collected
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-5xl">verified_user</span>
          </div>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Verification Status</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="certified" className="text-[10px] uppercase tracking-wider">Certified</Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Platinum Partner Level</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg">Recent Applications</h3>
          <Link href="/dashboard/landlord/applications" className="text-sm font-bold text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Tenant Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Listing</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.map((app, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold', app.color)}>
                        {app.initials}
                      </div>
                      <span className="font-medium text-sm">{app.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{app.listing}</td>
                  <td className="px-6 py-4">
                    <Badge variant={app.status === 'Verified' ? 'certified' : app.status === 'Rejected' ? 'destructive' : 'secondary'} className="text-[11px]">
                      {app.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{app.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-muted-foreground hover:text-primary transition-colors">more_vert</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rent Schedule Timeline + Ecosystem Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h5 className="font-heading font-semibold">Rent Schedule</h5>
            <button className="material-symbols-outlined text-muted-foreground hover:text-primary transition-colors">calendar_month</button>
          </div>
          <div className="p-6 space-y-6">
            {rentSchedule.map((item, idx) => (
              <div key={idx} className="relative flex items-center gap-4">
                <div className={cn('absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ring-8 ring-background', item.bg)}>
                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="ml-12">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className={cn('text-xs font-medium', idx === 0 ? 'text-green-600' : idx === 1 ? 'text-amber-600' : 'text-muted-foreground')}>
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-primary-container rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-white/80">Ecosystem Health</p>
                <span className="text-sm font-bold text-white">98%</span>
              </div>
              <div className="w-full bg-primary h-2 rounded-full overflow-hidden">
                <div className="bg-secondary-container h-full w-[98%] rounded-full" />
              </div>
              <p className="mt-2 text-[11px] text-white/70">Your portfolio trust rating is exceptional this month.</p>
            </div>
          </div>
        </Card>

        <Card className="bg-surface-container-lowest">
          <CardContent className="p-6">
            <h5 className="font-heading font-semibold mb-4">Quick Actions</h5>
            <div className="space-y-3">
              <Link
                href="/dashboard/landlord/listing/new"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <span className="text-sm font-medium">Post New Listing</span>
              </Link>
              <Link
                href="/dashboard/landlord/applications"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-primary">description</span>
                <span className="text-sm font-medium">Review Applications</span>
              </Link>
              <Link
                href="/dashboard/landlord/rents"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-primary">payments</span>
                <span className="text-sm font-medium">Collect Rent</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
