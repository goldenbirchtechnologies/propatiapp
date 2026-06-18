import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Building2, Home, DollarSign, Clock, Plus, Users, Shield, Search, TrendingUp, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function LandlordDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'LANDLORD') {
    redirect('/dashboard');
  }

  // Fetch dashboard stats
  const [
    propertiesCount,
    activeListings,
    totalRevenue,
    pendingPayments,
  ] = await Promise.all([
    prisma.listing.count({ where: { ownerId: user.id } }),
    prisma.listing.count({ where: { ownerId: user.id, status: 'ACTIVE' } }),
    prisma.transaction.aggregate({
      where: { payeeId: user.id, status: 'RELEASED' },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { payeeId: user.id, status: 'IN_ESCROW' } }),
  ]);

  const stats = [
    { label: 'Total Properties', value: propertiesCount.toString(), icon: <Building2 className="h-6 w-6" />, trend: '+2 this month', trendPositive: true },
    { label: 'Active Listings', value: activeListings.toString(), icon: <Home className="h-6 w-6" />, trend: '+1 this month', trendPositive: true },
    { label: 'Total Revenue', value: `₦${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: <DollarSign className="h-6 w-6" />, trend: '+12% vs last month', trendPositive: true },
    { label: 'Pending Payments', value: pendingPayments.toString(), icon: <Clock className="h-6 w-6" />, trend: '3 awaiting release', trendPositive: false },
  ];

  const actions = [
    { title: 'Add New Listing', description: 'Create a new property listing', icon: <Plus className="h-5 w-5" />, href: '/dashboard/landlord/properties/new' },
    { title: 'Manage Properties', description: 'View and edit your listings', icon: <Building2 className="h-5 w-5" />, href: '/dashboard/landlord/properties' },
    { title: 'Rent Collection', description: 'Track payments and receipts', icon: <DollarSign className="h-5 w-5" />, href: '/dashboard/landlord/rent' },
    { title: 'Screen Tenants', description: 'Review tenant applications', icon: <Users className="h-5 w-5" />, href: '/dashboard/landlord/screening' },
    { title: 'Verify Property', description: 'Start verification process', icon: <Shield className="h-5 w-5" />, href: '/dashboard/landlord/verify' },
  ];

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="Landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>Welcome back, {user.fullName.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--muted)' }}>Here's what's happening with your properties today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, i) => (
              <ActionCard key={i} {...action} />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Recent Activity</h2>
          <Card>
            <CardContent className="pt-0">
              <p style={{ color: 'var(--muted)' }}>No recent activity. Start by adding a property!</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value, icon, trend, trendPositive = true }: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: string; 
  trendPositive?: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trend}
        </span>
      </div>
    </Card>
  );
}

function ActionCard({ title, description, icon, href }: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string;
}) {
  return (
    <Link href={href} className="card p-6 hover:border-[var(--accent)] transition-colors">
      <div className="p-3 rounded-xl mb-4" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', width: 'fit-content' }}>
        {icon}
      </div>
      <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{description}</p>
    </Link>
  );
}