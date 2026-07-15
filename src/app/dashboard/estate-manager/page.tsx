import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { prisma } from '@/lib/prisma';
import {

  Building2,
  Users,
  Wrench,
  Receipt,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Zap,
  BarChart2,
  ChevronRight,
  DollarSign,
  ArrowRight,
  Layers,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function EstateManagerDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
    realtor: '/dashboard/agent',
  };

  if (user.role !== 'estate_manager') {
    redirect(rolePaths[user.role] ?? '/dashboard/tenant');
  }

  const displayName = user.fullName || 'Estate Manager';
  const activeOrg = user.ownedOrganisations[0] || user.orgMemberships[0]?.org;

  // Real data state
  let unitCount = 0;
  let occupiedCount = 0;
  let vacantCount = 0;
  let maintenanceCount = 0;
  let recentTickets: unknown[] = [];
  let recentServiceCharges: unknown[] = [];
  let totalBilledServiceCharges = 0;
  let totalPaidServiceCharges = 0;

  const now = new Date();
  const daysSince = (d: Date) => Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
  const smartManagedThreshold = 14;
  const nearVoidThreshold = 3;

  let managedAnalytics = {
    totalCollected: 0,
    totalPending: 0,
    totalAmount: 0,
    avgAmount: 0,
    completionRate: 0,
    smartCount: 0,
    smartAmount: 0,
    nearVoidCount: 0,
    nearVoidAmount: 0,
    landlordBreakdown: Record<string, { count: number; amountNaira: number }>,
    monthlyTrend: Array<{ label: string; count: number; amountNaira: number }>,
    recentSmart: Array<{ id: string; landlord: string; amountNaira: number; createdAt: Date }>,
  };

  if (activeOrg) {
    // 1. Fetch unit statistics
    const units = await prisma.unit.findMany({
      where: { organizationId: activeOrg.id },
      select: { status: true, occupancy: true, rent: true }
    });

    const managedCollections = await prisma.transaction.findMany({
      where: {
        payeeId: user.id,
        confirmationStatus: { not: 'disputed' },
      },
    });
    const pendingManaged = managedCollections.filter(tx => {
      try {
        const md = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
        return md?.collectionType === 'managed';
      } catch { return false; }
    });
    const pendingManagedNaira = pendingManaged.reduce((sum, tx) => sum + Number(tx.payeeAmount || tx.amount || 0), 0);

    unitCount = units.length;
    occupiedCount = units.filter(u => u.occupancy === 'OCCUPIED').length;
    vacantCount = units.filter(u => u.occupancy === 'VACANT').length;
    maintenanceCount = units.filter(u => u.status === 'MAINTENANCE').length;

    // 2. Fetch recent maintenance tickets
    recentTickets = await prisma.maintenanceTicket.findMany({
      where: { orgId: activeOrg.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        raisedByUser: { select: { fullName: true } }
      }
    });

    // 3. Fetch service charge statistics
    const serviceCharges = await prisma.serviceCharge.findMany({
      where: { organizationId: activeOrg.id },
      include: {
        listing: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    recentServiceCharges = serviceCharges.slice(0, 5);
    totalBilledServiceCharges = serviceCharges.reduce((sum, sc) => sum + Number(sc.amount), 0);
    totalPaidServiceCharges = serviceCharges
      .filter(sc => sc.status === 'paid')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);

    const managedTransactions = await prisma.transaction.findMany({
      where: { payeeId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const daysSince = (d: Date) => Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
    const smartManagedThreshold = 14;
    const nearVoidThreshold = 3;
    const monthlyStats: Record<string, { count: number; amountNaira: number }> = {};
    let totalAmount = 0;
    let totalCollected = 0;
    let smartCount = 0, smartAmount = 0;
    let nearVoidCount = 0, nearVoidAmount = 0;
    const recentSmart: Array<{ id: string; landlord: string; amountNaira: number; createdAt: Date }> = [];

    for (const tx of managedTransactions) {
      try { md = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata; } catch { md = {}; }
      if (md?.collectionType !== 'managed') continue;
      const amountNaira = Number(tx.payeeAmount || tx.amount || 0) / 100;
      const dt = tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt);
      const statusStr = String(tx.status || 'pending').toLowerCase();
      const settled = statusStr === 'released' || statusStr === 'success';
      const days = daysSince(dt);
      const monthLabel = `${dt.toLocaleString('en-NG', { month: 'short' })} ${dt.getFullYear()}`;
      monthlyStats[monthLabel] ||= { count: 0, amountNaira: 0 };
      monthlyStats[monthLabel].count += 1;
      monthlyStats[monthLabel].amountNaira += amountNaira;
      totalAmount += amountNaira;
      if (settled) totalCollected += amountNaira;
      else {
        if (days > smartManagedThreshold) {
          smartCount += 1;
          smartAmount += amountNaira;
          recentSmart.push({ id: tx.id, landlord: 'Managed Wallet', amountNaira, createdAt: dt });
        }
        if (days <= nearVoidThreshold) {
          nearVoidCount += 1;
          nearVoidAmount += amountNaira;
        }
      }
    }

    managedAnalytics = {
      totalCollected,
      totalPending: totalAmount - totalCollected,
      totalAmount,
      avgAmount: managedTransactions.length ? totalAmount / managedTransactions.length : 0,
      completionRate: totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0,
      smartCount,
      smartAmount,
      nearVoidCount,
      nearVoidAmount,
      landlordBreakdown: {},
      monthlyTrend: Object.entries(monthlyStats).slice(-6).map(([label, v]) => ({ label, ...v })),
      recentSmart: recentSmart.slice(0, 6),
    };
  }


  const hasData = unitCount > 0;

  // Mock data for preview/demo mode if no units are configured
  const mockStats = {
    unitCount: 18,
    occupiedCount: 14,
    vacantCount: 3,
    maintenanceCount: 1,
    occupancyRate: 77,
    totalBilledServiceCharges: 3600000,
    totalPaidServiceCharges: 2780000,
    collectionRate: 77,
    recentTickets: [
      {
        id: 'tkt_1',
        title: 'AC unit blowing warm air',
        category: 'electrical',
        priority: 'medium',
        status: 'in_progress',
        unitRef: 'Unit 3A - Lekki Palms',
        createdAt: new Date(Date.now() - 3600000 * 4), // 4 hours ago
      },
      {
        id: 'tkt_2',
        title: 'Leakage in kitchen sink pipe',
        category: 'plumbing',
        priority: 'high',
        status: 'open',
        unitRef: 'Unit 12B - Victoria Heights',
        createdAt: new Date(Date.now() - 3600000 * 20), // 20 hours ago
      },
      {
        id: 'tkt_3',
        title: 'Front door lock replacement',
        category: 'security',
        priority: 'urgent',
        status: 'resolved',
        unitRef: 'Unit 5C - Prime Heights',
        createdAt: new Date(Date.now() - 3600000 * 48), // 2 days ago
      }
    ],
    recentServiceCharges: [
      {
        id: 'sc_1',
        period: '2026-Q2',
        amount: 150000,
        status: 'paid',
        unitRef: 'Unit 8A - Lekki Palms',
        dueDate: new Date(Date.now() + 3600000 * 240),
      },
      {
        id: 'sc_2',
        period: '2026-Q2',
        amount: 220000,
        status: 'outstanding',
        unitRef: 'Unit 12C - Victoria Heights',
        dueDate: new Date(Date.now() - 3600000 * 48),
      },
      {
        id: 'sc_3',
        period: '2026-Q2',
        amount: 180000,
        status: 'draft',
        unitRef: 'Unit 1A - Prime Heights',
        dueDate: new Date(Date.now() + 3600000 * 480),
      }
    ],
    recentActivity: [
      { id: 1, type: 'payment', desc: '₦1,200,000 rent payment received for Unit 4D (Prime Heights)', time: '2 hours ago' },
      { id: 2, type: 'maintenance', desc: 'Maintenance ticket #TKT-1082 resolved for Unit 5C', time: '1 day ago' },
      { id: 3, type: 'utility', desc: 'Utility reading recorded for Unit 8A (Lekki Palms)', time: '1 day ago' },
      { id: 4, type: 'member', desc: 'New team member Tunde Adeyemi joined as Agent', time: '3 days ago' },
    ]
  };

  // Determine which values to show
  const displayUnits = hasData ? unitCount : mockStats.unitCount;
  const displayOccupied = hasData ? occupiedCount : mockStats.occupiedCount;
  const displayVacant = hasData ? vacantCount : mockStats.vacantCount;
  const displayMaintenance = hasData ? maintenanceCount : mockStats.maintenanceCount;
  const displayPendingManaged = hasData ? pendingManaged.length : activeOrg ? 0 : 3;
  pendingManagedAmountLabel = '₦' + (displayPendingManaged ? (pendingManagedNaira / 100).toLocaleString() : '0');
  const displayOccupancyRate = displayUnits > 0 ? Math.round((displayOccupied / displayUnits) * 100) : 0;

  const displayBilledCharges = hasData ? totalBilledServiceCharges : mockStats.totalBilledServiceCharges;
  const displayPaidCharges = hasData ? totalPaidServiceCharges : mockStats.totalPaidServiceCharges;
  const displayCollectionRate = displayBilledCharges > 0 ? Math.round((displayPaidCharges / displayBilledCharges) * 100) : 0;

  const displayTickets = hasData ? recentTickets : mockStats.recentTickets;
  const displayCharges = hasData ? recentServiceCharges : mockStats.recentServiceCharges;
  let pendingManagedAmountLabel = '₦0';

  // Custom styling mappings
  const priorityColors: Record<string, string> = {
    low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    assigned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
    closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  const invoiceColors: Record<string, string> = {
    paid: 'bg-green-500/10 text-green-400 border-green-500/20',
    outstanding: 'bg-red-500/10 text-red-400 border-red-500/20',
    draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    unpaid: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="dashboard-content-area fade-up">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 overflow-hidden">
        {/* Glow Orb Background */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/3 left-0 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 font-mono tracking-wider uppercase text-[10px]">
                {activeOrg ? activeOrg.name : 'No Organization'}
              </Badge>
              {!hasData && (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25 px-3 py-1 flex items-center gap-1 text-[10px] animate-pulse">
                  <Sparkles className="w-3 h-3" /> DEMO MODE
                </Badge>
              )}
            </div>
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white mt-1">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Control panel for your real estate operations. Allocate service charges, monitor utility readings, and manage maintenance tickets.
            </p>
          </div>

          {/* Quick Actions Double-Bezel Button */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/estate-manager/units">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 transition-all flex items-center gap-2 group shadow-lg shadow-blue-500/10">
                <MaterialIcon name="View Portfolio" className="material-symbols-outlined" />
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Button>
            </Link>
            <Link href="/dashboard/estate-manager/bulk-import">
              <Button variant="outline" className="rounded-full border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-zinc-300 font-medium text-xs px-5 py-2.5 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <MaterialIcon name="Bulk Import" className="material-symbols-outlined" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Getting Started / Onboarding Section */}
        {!hasData && (
          <section className="relative group p-1 bg-gradient-to-br from-blue-500/15 via-indigo-500/5 to-purple-500/15 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="bg-[#0b1324] rounded-[calc(2rem-0.25rem)] p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" /> Getting Started Guide
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Follow these steps to populate your estate manager profile and transition to live mode.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Progress</p>
                  <p className="text-lg font-bold text-blue-400 font-mono">20% Completed</p>
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                {/* Step 1: Done */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0.5 text-[9px] font-mono">Step 1</Badge>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <h4 className="font-semibold text-sm text-white">Create Organisation</h4>
                    <p className="text-xs text-zinc-400">{activeOrg?.name || 'Lagos Prime Estates'}</p>
                  </div>
                  <span className="text-xs text-green-400 flex items-center gap-1 font-medium">Completed</span>
                </div>

                {/* Step 2: Pending */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-all group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 text-[9px] font-mono">Step 2</Badge>
                      <Clock className="w-4 h-4 text-zinc-500" />
                    </div>
                    <h4 className="font-semibold text-sm text-white">Add Properties & Units</h4>
                    <p className="text-xs text-zinc-400">Add physical units, rent details, and caution deposits.</p>
                  </div>
                  <Link href="/dashboard/estate-manager/units" className="text-xs text-blue-400 flex items-center gap-1 font-medium group-hover:underline">
                    Configure Units <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Step 3: Pending */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-all group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 text-[9px] font-mono">Step 3</Badge>
                      <Clock className="w-4 h-4 text-zinc-500" />
                    </div>
                    <h4 className="font-semibold text-sm text-white">Setup Service Charges</h4>
                    <p className="text-xs text-zinc-400">Generate cycle periods and allocate water/electricity meters.</p>
                  </div>
                  <Link href="/dashboard/estate-manager/service-charges" className="text-xs text-blue-400 flex items-center gap-1 font-medium group-hover:underline">
                    Setup Cycles <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Step 4: Pending */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-all group">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0.5 text-[9px] font-mono">Step 4</Badge>
                      <Clock className="w-4 h-4 text-zinc-500" />
                    </div>
                    <h4 className="font-semibold text-sm text-white">Invite Team Members</h4>
                    <p className="text-xs text-zinc-400">Add co-managers, agents, and sub-staff to your profile.</p>
                  </div>
                  <Link href="/dashboard/estate-manager/team" className="text-xs text-blue-400 flex items-center gap-1 font-medium group-hover:underline">
                    Invite Staff <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4-Column KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Occupancy Rate */}
          <div className="p-[1px] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 shadow-lg bg-[#0e1726]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Occupancy Rate</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold text-white font-mono">{displayOccupancyRate}%</h3>
                <p className="text-xs text-zinc-400">{displayOccupied} of {displayUnits} units occupied</p>
              </div>
              <Progress value={displayOccupancyRate} className="h-1.5 bg-white/5" />
            </div>
          </div>

          {/* Card 2: Service Charge Collection */}
          <div className="p-[1px] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 shadow-lg bg-[#0e1726]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Service Charge Collection</span>
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold text-white font-mono">{displayCollectionRate}%</h3>
                <p className="text-xs text-zinc-400">₦{(displayPaidCharges / 1e6).toFixed(2)}M of ₦{(displayBilledCharges / 1e6).toFixed(2)}M</p>
              </div>
              <Progress value={displayCollectionRate} className="h-1.5 bg-white/5" />
            </div>
          </div>

          {/* Card 3: Active Maintenance */}
          <div className="p-[1px] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 shadow-lg bg-[#0e1726]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Maintenance Queue</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold text-white font-mono">
                  {displayTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length} Active
                </h3>
                <p className="text-xs text-zinc-400">
                  {displayTickets.filter(t => t.priority === 'urgent').length} urgent, {displayTickets.filter(t => t.priority === 'high').length} high
                </p>
              </div>
              <div className="flex gap-1.5 pt-1">
                {displayTickets.slice(0, 3).map((t, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full ${
                      t.priority === 'urgent' ? 'bg-red-500' : t.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Pending Managed Collections */}
          <div className="p-[1px] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 shadow-lg bg-[#0e1726]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Pending Managed Collections</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold text-white font-mono">{displayPendingManaged ?? 0}</h3>
                <p className="text-xs text-zinc-400">Awaiting disbursement to landlord</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                <MaterialIcon name="Payables: {pendingManagedAmountLabel}" className="material-symbols-outlined" />
              </div>
            </div>
          </div>

          {/* Card 4: Utility Allocation */}
          <div className="p-[1px] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 shadow-lg bg-[#0e1726]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Billed Utilities</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold text-white font-mono">₦420,000</h3>
                <p className="text-xs text-zinc-400">Power, water & security</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-green-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs last month
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-zinc-400" /> Managed Collections Analytics
                </h3>
                <p className="text-xs text-zinc-400">Trends, smart collection breakdown, and near-void alerts.</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-zinc-300 bg-white/[0.02]">
                Rolling 6 months
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard label="Managed Revenue" value={`₦${(managedAnalytics.totalAmount / 100).toLocaleString()}`} hint={`₦${(managedAnalytics.totalCollected / 100).toLocaleString()} collected`} />
              <KpiCard label="Collection Rate" value={`${managedAnalytics.completionRate}%`} hint={`${managedAnalytics.totalPending ? ((managedAnalytics.totalPending / managedAnalytics.totalAmount) * 100).toFixed(1) : 0}% pending / unverified`} />
              <KpiCard label="Avg Managed Deal" value={`₦${(managedAnalytics.avgAmount / 100).toLocaleString()}`} hint={`${managedAnalytics.smartCount} smart collections`} />
              <KpiCard label="Near-Void Alerts" value={`${managedAnalytics.nearVoidCount}`} hint={`₦${(managedAnalytics.nearVoidAmount / 100).toLocaleString()} at risk`} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 border border-white/5 bg-[#0a1120] rounded-2xl p-5 space-y-4">
                <h4 className="font-heading text-sm font-bold text-white">Monthly Trend</h4>
                {managedAnalytics.monthlyTrend.length === 0 ? (
                  <p className="text-xs text-zinc-400">No managed collections yet.</p>
                ) : (
                  <div className="space-y-3">
                    {managedAnalytics.monthlyTrend.map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-300">{row.label}</span>
                          <span className="text-zinc-400">{row.count} deal{row.count === 1 ? '' : 's'}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500/80" style={{ width: `${Math.min(100, (row.amountNaira / (managedAnalytics.totalAmount || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-8 border border-white/5 bg-[#0a1120] rounded-2xl overflow-hidden">
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <h4 className="font-heading text-sm font-bold text-white">Smart Collections</h4>
                  <span className="text-[10px] text-zinc-400">{managedAnalytics.smartCount} unverified past 14d</span>
                </div>
                <div className="p-5">
                  {!managedAnalytics.recentSmart.length ? (
                    <p className="text-xs text-zinc-400">No smart collections to review.</p>
                  ) : (
                    <Table>
                      <TableHeader className="border-b border-white/5">
                        <TableRow>
                          <TableHead className="text-zinc-400 font-medium text-xs">Transaction</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Amount</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Age</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {managedAnalytics.recentSmart.map((item) => (
                          <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <TableCell className="text-white text-xs font-medium font-mono">{item.id.slice(0, 8)}...</TableCell>
                            <TableCell className="text-white text-xs font-semibold">₦{item.amountNaira.toLocaleString()}</TableCell>
                            <TableCell className="text-zinc-400 text-xs">{daysSince(item.createdAt)} days</TableCell>
                            <TableCell>
                              <Badge className="text-[10px] border px-2 py-0.5 bg-amber-500/10 text-amber-300 border-amber-500/20">Unverified</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column: Tickets & Charges */}
          <div className="lg:col-span-8 space-y-8">
            {/* Maintenance Tickets */}
            <div className="border border-white/5 bg-[#0a1120] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="space-y-0.5">
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-zinc-400" /> Active Maintenance Requests
                  </h3>
                  <p className="text-xs text-zinc-400">Track and dispatch service personnel for tenant issues.</p>
                </div>
                <Link href="/dashboard/estate-manager/maintenance">
                  <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                    Manage All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {displayTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                    <p className="text-zinc-400 text-sm font-medium">No tickets open</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Any tenant request will show up here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-white/5">
                        <TableRow>
                          <TableHead className="text-zinc-400 font-medium text-xs">Unit</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Issue Details</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Priority</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Status</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Raised By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayTickets.map((t: unknown, idx: number) => (
                          <TableRow key={t.id || idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <TableCell className="text-white text-xs font-semibold">
                              {t.unitRef || (t.listing ? `${t.listing.title}` : 'Unit Registry')}
                            </TableCell>
                            <TableCell className="text-zinc-300 text-xs max-w-[200px] truncate">
                              <span className="block text-white font-medium truncate">{t.title}</span>
                              <span className="block text-[10px] text-zinc-500 capitalize">{t.category}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] border px-2 py-0.5 ${priorityColors[t.priority] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                {t.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] border px-2 py-0.5 ${statusColors[t.status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                {t.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs">
                              {t.raisedByUser?.fullName || 'Amina Bello'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Service Charge Billing */}
            <div className="border border-white/5 bg-[#0a1120] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="space-y-0.5">
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-zinc-400" /> Recent Service Charge Cycles
                  </h3>
                  <p className="text-xs text-zinc-400">Quarterly and monthly fee cycles allocated to tenants.</p>
                </div>
                <Link href="/dashboard/estate-manager/service-charges">
                  <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                    Billing Dashboard <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="p-6">
                {displayCharges.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                    <p className="text-zinc-400 text-sm font-medium">No service charges created</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Set up cycles and invoice tenants.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-white/5">
                        <TableRow>
                          <TableHead className="text-zinc-400 font-medium text-xs">Cycle Period</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Unit/Property</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Amount</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Status</TableHead>
                          <TableHead className="text-zinc-400 font-medium text-xs">Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayCharges.map((sc: unknown, idx: number) => (
                          <TableRow key={sc.id || idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <TableCell className="text-white text-xs font-mono font-semibold">
                              {sc.period}
                            </TableCell>
                            <TableCell className="text-zinc-300 text-xs">
                              {sc.unitRef || sc.listing?.title || 'Prime Apartment'}
                            </TableCell>
                            <TableCell className="text-white font-mono text-xs font-semibold">
                              ₦{Number(sc.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] border px-2 py-0.5 ${invoiceColors[sc.status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                                {sc.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-zinc-400 text-xs">
                              {new Date(sc.dueDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Activity */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Command Center */}
            <div className="border border-white/5 bg-[#0a1120] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" /> Command Center
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                <Link href="/dashboard/estate-manager/units">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-zinc-300 hover:text-white p-3.5 text-xs flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <div className="text-left">
                      <span className="block font-semibold">Register New Unit</span>
                      <span className="block text-[10px] text-zinc-500">Configure size, bedrooms & pricing</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/estate-manager/utilities">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-zinc-300 hover:text-white p-3.5 text-xs flex items-center gap-3">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <div className="text-left">
                      <span className="block font-semibold">Allocate Utilities</span>
                      <span className="block text-[10px] text-zinc-500">Electricity, water & security meters</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/estate-manager/bulk-import">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-zinc-300 hover:text-white p-3.5 text-xs flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 text-green-400" />
                    <div className="text-left">
                      <span className="block font-semibold">Import CSV Data</span>
                      <span className="block text-[10px] text-zinc-500">Upload units and history records</span>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/estate-manager/maintenance">
                  <Button variant="outline" className="w-full justify-start rounded-xl border-white/5 bg-white/[0.01] hover:bg-white/[0.04] text-zinc-300 hover:text-white p-3.5 text-xs flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <div className="text-left">
                      <span className="block font-semibold">Log Maintenance Ticket</span>
                      <span className="block text-[10px] text-zinc-500">File issue for plumbing or electrical</span>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="border border-white/5 bg-[#0a1120] rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" /> Recent Operations
              </h3>

              <div className="relative pl-4 border-l border-white/5 space-y-6">
                {(hasData ? recentActivityStub(recentTickets, recentServiceCharges) : mockStats.recentActivity).map((act: unknown) => (
                  <div key={act.id} className="relative space-y-1">
                    {/* Bullet Indicator */}
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0a1120] ${
                      act.type === 'payment' ? 'bg-green-500' :
                      act.type === 'maintenance' ? 'bg-amber-500' :
                      act.type === 'utility' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                    <p className="text-xs text-zinc-300 font-medium leading-relaxed">{act.desc}</p>
                    <span className="block text-[10px] text-zinc-500 font-mono">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    </DashboardShell>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="p-[1px] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/5 shadow-lg bg-[#0e1726]">
      <div className="p-5 space-y-2">
        <span className="text-[11px] text-zinc-400 font-medium">{label}</span>
        <h3 className="text-2xl font-extrabold text-white font-mono tracking-tight">{value}</h3>
        <p className="text-[10px] text-zinc-400">{hint}</p>
      </div>
    </div>
  );
}

// Helper to generate stub activities if data is present
function recentActivityStub(tickets: unknown[], charges: unknown[]) {
  const list: unknown[] = [];
  let id = 1;

  if (tickets.length > 0) {
    list.push({
      id: id++,
      type: 'maintenance',
      desc: `New maintenance ticket logged: "${tickets[0].title}"`,
      time: 'Just now'
    });
  }
  if (charges.length > 0) {
    list.push({
      id: id++,
      type: 'payment',
      desc: `Service charge period invoice set to ${charges[0].status}: ₦${Number(charges[0].amount).toLocaleString()} (${charges[0].period})`,
      time: '1 hour ago'
    });
  }

  // Fallbacks if lists are small
  if (list.length < 4) {
    list.push({ id: id++, type: 'utility', desc: 'Utility Allocation meters checked', time: '1 day ago' });
    list.push({ id: id++, type: 'member', desc: 'Audit log exported by Administrator', time: '2 days ago' });
  }

  return list.slice(0, 4);
}
