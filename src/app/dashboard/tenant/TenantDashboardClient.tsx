'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Home, FileText, MessageSquare, Bell, Settings, Search, Receipt, Heart, FileCheck, HelpCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function TenantDashboardClient({ userName }: { userName?: string }) {
  const [loading, setLoading] = useState(true);
  const greeting = userName || 'Tenant';

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const searchCategories = [
    { label: 'Rent', href: '/dashboard/tenant/search?type=rent' },
    { label: 'Buy', href: '/dashboard/tenant/search?type=buy' },
    { label: 'Short-let', href: '/dashboard/tenant/search?type=shortlet' },
  ];

  const commercialCategories = [
    { label: 'Lease', href: '/dashboard/tenant/search?type=lease' },
    { label: 'Buy', href: '/dashboard/tenant/search?type=buy' },
    { label: 'Short-let', href: '/dashboard/tenant/search?type=shortlet' },
  ];

  const recommended = [
    { title: '2 Bed Flat · Ikoyi', badge: 'Verified', price: '₦4.2M/yr' },
    { title: 'Office Suite · VI', badge: 'Verified', price: '₦18M/yr' },
    { title: 'Short-let · Lekki', badge: 'Featured', price: '₦180k/night' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="rounded-2xl border border-[#262626] bg-zinc-900 p-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-headline-lg-mobile font-bold text-white">Welcome back, {greeting}</h1>
            <p className="text-zinc-400 mt-1">Track your search, tenancy, and payments.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" aria-label="Settings"><Settings className="h-5 w-5" /></Button>
          </div>
        </div>
      </section>

      {/* Search Hub */}
      <section className="rounded-2xl border border-[#262626] bg-zinc-900 p-lg shadow-sm">
        <Tabs defaultValue="residential" className="w-full">
          <TabsList>
            <TabsTrigger value="residential">Residential</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
          </TabsList>
          <TabsContent value="residential" className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {searchCategories.map(item => (
                <Link key={item.label} href={item.href} className="rounded-xl border border-[#262626] bg-zinc-900 p-4 text-center transition hover:border-white">
                  <Search className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                </Link>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="commercial" className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {commercialCategories.map(item => (
                <Link key={item.label} href={item.href} className="rounded-xl border border-[#262626] bg-zinc-900 p-4 text-center transition hover:border-white">
                  <Search className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Total Payments Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline-md text-headline-md text-white">₦1.85M</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[#00ff66]">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">On track</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Active Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline-md text-headline-md text-white">3</div>
            <p className="text-xs text-zinc-400">1 pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Saved Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-headline-md text-headline-md text-white">12</div>
            <p className="text-xs text-zinc-400">4 updated this week</p>
          </CardContent>
        </Card>
      </section>

      {/* Current Property */}
      <section className="rounded-2xl border border-[#262626] bg-zinc-900 p-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-40 w-full md:w-64 rounded-xl bg-zinc-900" />
          <div className="flex-1 space-y-2">
            <Badge variant="secondary">Active Lease</Badge>
            <h2 className="font-headline-sm text-headline-sm text-white">2 Bed Flat · Ikoyi</h2>
            <p className="text-sm text-zinc-400">Landlord: Adebayo Estates</p>
            <p className="text-sm text-zinc-400">Next rent due in 18 days</p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm">View Lease</Button>
              <Button size="sm" variant="outline">Pay Now</Button>
              <Button size="sm" variant="ghost">Message Landlord</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Payments */}
      <section className="rounded-2xl border border-[#262626] bg-zinc-900 shadow-sm">
        <div className="section-content">
        <div className="flex items-center justify-between p-lg">
          <h2 className="font-headline-sm text-headline-sm text-white">Recent Payments</h2>
          <Link href="/dashboard/tenant/payments" className="text-sm font-semibold text-white">View All</Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-800/50">
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Date</TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Reference</TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Amount</TableHead>
              <TableHead className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Status</TableHead>
              <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider text-neutral-400">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#262626]/30">
            {[1, 2, 3].map(row => (
              <TableRow key={row} className="hover:bg-obsidian-800/30 transition-colors">
                <TableCell className="px-lg py-4 text-sm text-zinc-400">2026-06-{10 + row}</TableCell>
                <TableCell className="px-lg py-4 text-sm">TXN-{1000 + row}</TableCell>
                <TableCell className="px-lg py-4 text-sm font-semibold">₦450,000</TableCell>
                <TableCell className="px-lg py-4">
                  <Badge variant="secondary" className="bg-success/10 text-[#00ff66]">Paid</Badge>
                </TableCell>
                <TableCell className="px-lg py-4 text-right text-sm text-white">Download</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        <div className="section-empty-msg items-center justify-center p-8 text-center">
          <p className="text-sm text-zinc-400">No payments yet.</p>
        </div>
      </section>

      {/* Recommended */}
      <section className="space-y-3">
        <h2 className="font-headline-sm text-headline-sm text-white">Recommended for You</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {recommended.map(item => (
            <Card key={item.title} className="transition hover:shadow-lg">
              <div className="h-36 rounded-t-xl bg-zinc-900" />
              <CardHeader>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="secondary">{item.badge}</Badge>
                <span className="text-sm font-semibold text-white">{item.price}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Activity + Pending Lease */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline-sm text-headline-sm">Recent Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="text-xs text-zinc-400">Application Timeline</div>
              <div className="mt-2 h-24 rounded-xl bg-zinc-900" />
            </div>
            <div>
              <div className="text-xs text-zinc-400">Next Rent Due</div>
              <div className="mt-2 font-headline-md text-headline-md text-white">18 days</div>
            </div>
            <div>
              <div className="text-xs text-zinc-400">Saved Searches</div>
              <div className="mt-2 font-headline-md text-headline-md text-white">4</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline-sm text-headline-sm">Pending Lease</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={45} />
            <p className="text-sm text-zinc-400">Verification stage: documents uploaded</p>
            <Button className="w-full">Track Application</Button>
          </CardContent>
        </Card>
      </section>

      {/* Help */}
      <section className="rounded-2xl border border-[#262626] bg-zinc-900 p-lg shadow-sm">
        <h2 className="font-headline-sm text-headline-sm text-white">Help Center</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link href="/dashboard/tenant/messages" className="rounded-xl border border-[#262626] bg-zinc-900 p-4 text-sm font-semibold text-white transition hover:border-white">Chat with verified agent</Link>
          <Link href="/dashboard/support" className="rounded-xl border border-[#262626] bg-zinc-900 p-4 text-sm font-semibold text-white transition hover:border-white">Tenant Rights & FAQs</Link>
          <Button variant="secondary" className="justify-start">Report maintenance issue</Button>
        </div>
      </section>
    </div>
  );
}
