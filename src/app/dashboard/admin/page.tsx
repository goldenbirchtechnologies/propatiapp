'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

// Skeleton Loading Components
const StatCardSkeleton = () => (
  <div className="bg-card rounded-lg shadow-card p-4 sm:p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 rounded w-24 mb-3" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
        <div className="h-8 rounded w-16 mb-2" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
        <div className="h-3 rounded w-20" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
      </div>
      <div className="w-10 h-10 rounded-lg" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
    </div>
  </div>
);

const ActionCardSkeleton = () => (
  <div className="bg-card rounded-lg shadow-card p-4 sm:p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
      <div className="flex-1">
        <div className="h-5 rounded w-32 mb-2" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
        <div className="h-3 rounded w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
      </div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <div className="flex items-center justify-between py-3 border-b border-border animate-pulse">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
      <div className="flex-1">
        <div className="h-4 rounded w-32 mb-2" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
        <div className="h-3 rounded w-48" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
      </div>
    </div>
    <div className="hidden sm:block w-24 h-6 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--border)) 25%, hsl(var(--muted-foreground)/0.1) 50%, hsl(var(--border)) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s linear infinite' }}></div>
  </div>
);

// TypeScript Interfaces
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  colorClass: string;
  bgClass: string;
}

// Stat Card Component with Hover Effects
const StatCard = ({ title, value, icon, trend, trendUp, colorClass, bgClass }: StatCardProps) => (
  <div className={`${bgClass} rounded-lg shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-200 ease-in-out p-4 sm:p-6`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-muted-foreground text-sm font-medium mb-2">{title}</p>
        <p className={`${colorClass} text-2xl sm:text-3xl lg:text-4xl font-bold mb-1`}>{value}</p>
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-sm ${trendUp ? 'text-success' : 'text-destructive'}`}>
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>{trend}</span>
          </div>
        )}
      </div>
      <div className={`${colorClass} ${bgClass} p-2 sm:p-3 rounded-lg`}>
        <span className="material-symbols-outlined text-xl sm:text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  count?: number;
  colorClass: string;
  bgClass: string;
}

// Action Card Component with Hover Effects
const ActionCard = ({ title, description, icon, href, count, colorClass, bgClass }: ActionCardProps) => (
  <Link href={href}>
    <div className={`${bgClass} rounded-lg shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-200 ease-in-out p-4 sm:p-5 cursor-pointer relative`}>
      <div className="flex items-center gap-3">
        <div className={`${colorClass} ${bgClass} p-2 sm:p-3 rounded-lg`}>
          <span className="material-symbols-outlined text-xl sm:text-2xl">{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className={`${colorClass} font-semibold text-base sm:text-lg mb-1`}>{title}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
        </div>
      </div>
      {count !== undefined && count > 0 && (
        <div className="absolute top-3 right-3 bg-destructive text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  </Link>
);

interface UserActivityProps {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  status: 'pending' | 'verified' | 'active';
}

// User Activity Row Component
const UserActivityRow = ({ user }: { user: UserActivityProps }) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-yellow-800',
    verified: 'bg-verification-verified/10 text-verification-verified',
    active: 'bg-success/10 text-success',
  };

  const roleColors: Record<string, string> = {
    tenant: 'bg-verification-verified/10 text-verification-verified',
    landlord: 'bg-purple-100 text-purple-800',
    agent: 'bg-blue-100 text-blue-800',
    'estate-manager': 'bg-commercial-gold/10 text-commercial-gold',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border gap-2 sm:gap-4 hover:bg-accent/50 transition-colors duration-150">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 1), hsl(var(--accent) / 1))' }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm sm:text-base truncate">{user.name}</p>
          <p className="text-muted-foreground text-xs sm:text-sm truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        <span className={`${roleColors[user.role] || 'bg-muted text-foreground'} px-2 py-1 rounded-full text-xs font-medium`}>
          {user.role}
        </span>
        <span className={`${statusColors[user.status]} px-2 py-1 rounded-full text-xs font-medium hidden sm:inline`}>
          {user.status}
        </span>
        <span className="text-muted-foreground text-xs hidden sm:block">{user.registeredAt}</span>
      </div>
    </div>
  );
};

interface AlertBannerProps {
  type: 'warning' | 'info' | 'success';
  message: string;
  count?: number;
}

// Alert Banner Component
const AlertBanner = ({ type, message, count }: AlertBannerProps) => {
  const styles: Record<string, string> = {
    warning: 'bg-warning/10 border-yellow-200 text-yellow-800',
    info: 'bg-primary/5 border-border text-foreground',
    success: 'bg-success/10 border-green-200 text-green-800',
  };

  const iconMap: Record<string, string> = {
    warning: 'warning',
    info: 'info',
    success: 'check_circle',
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 flex items-center gap-3`}>
      <span className="material-symbols-outlined text-xl">{iconMap[type]}</span>
      <p className="flex-1 text-sm font-medium">
        {message}
        {count !== undefined && <span className="ml-2 font-bold">({count})</span>}
      </p>
    </div>
  );
};

// Main Admin Dashboard Component
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    monthlyRevenue: 0,
    activeListings: 0,
    totalTransactions: 0,
    disputesCases: 0,
    platformFees: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserActivityProps[]>([]);

  useEffect(() => {
    // Mock data fetching
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStats({
        totalUsers: 12847,
        totalProperties: 3426,
        pendingVerifications: 47,
        monthlyRevenue: 8450000,
        activeListings: 2891,
        totalTransactions: 1534,
        disputesCases: 12,
        platformFees: 3420000,
      });

      setRecentUsers([
        { id: '1', name: 'Adebayo Johnson', email: 'adebayo.j@email.com', role: 'tenant', registeredAt: '2 hours ago', status: 'pending' },
        { id: '2', name: 'Chioma Nwankwo', email: 'chioma.nw@email.com', role: 'landlord', registeredAt: '5 hours ago', status: 'verified' },
        { id: '3', name: 'Ibrahim Hassan', email: 'ibrahim.h@email.com', role: 'agent', registeredAt: '1 day ago', status: 'active' },
        { id: '4', name: 'Blessing Okoro', email: 'blessing.o@email.com', role: 'estate-manager', registeredAt: '1 day ago', status: 'verified' },
        { id: '5', name: 'Tunde Adeyemi', email: 'tunde.a@email.com', role: 'tenant', registeredAt: '2 days ago', status: 'active' },
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Alert Banners */}
        <div className="space-y-3">
          <AlertBanner type="warning" message="Pending user verifications require attention" count={stats.pendingVerifications} />
          <AlertBanner type="info" message="System maintenance scheduled for June 25, 2026 at 2:00 AM" />
        </div>

        {/* Platform Statistics */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Platform Statistics</h2>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon="group"
                trend="+12.5% this month"
                trendUp={true}
                colorClass="text-verification-verified"
                bgClass="bg-verification-verified/10"
              />
              <StatCard
                title="Total Properties"
                value={stats.totalProperties.toLocaleString()}
                icon="apartment"
                trend="+8.3% this month"
                trendUp={true}
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
              <StatCard
                title="Pending Verifications"
                value={stats.pendingVerifications}
                icon="verified_user"
                colorClass="text-warning"
                bgClass="bg-warning/10"
              />
              <StatCard
                title="Monthly Revenue"
                value={`₦${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
                icon="payments"
                trend="+15.7% this month"
                trendUp={true}
                colorClass="text-secondary"
                bgClass="bg-secondary/10"
              />
              <StatCard
                title="Active Listings"
                value={stats.activeListings.toLocaleString()}
                icon="home"
                trend="+6.2% this month"
                trendUp={true}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />
              <StatCard
                title="Total Transactions"
                value={stats.totalTransactions.toLocaleString()}
                icon="receipt_long"
                trend="+9.4% this month"
                trendUp={true}
                colorClass="text-success"
                bgClass="bg-success/10"
              />
              <StatCard
                title="Disputes Cases"
                value={stats.disputesCases}
                icon="flag"
                trend="-3.1% this month"
                trendUp={true}
                colorClass="text-destructive"
                bgClass="bg-destructive/10"
              />
              <StatCard
                title="Platform Fees"
                value={`₦${(stats.platformFees / 1000000).toFixed(1)}M`}
                icon="account_balance"
                trend="+11.8% this month"
                trendUp={true}
                colorClass="text-secondary"
                bgClass="bg-secondary/10"
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <ActionCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ActionCard
                title="User Verifications"
                description="Review pending user verifications"
                icon="verified_user"
                href="/dashboard/admin/verifications"
                count={stats.pendingVerifications}
                colorClass="text-verification-verified"
                bgClass="bg-verification-verified/10"
              />
              <ActionCard
                title="Property Approvals"
                description="Review property listings"
                icon="apartment"
                href="/dashboard/admin/properties"
                count={23}
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
              <ActionCard
                title="Dispute Resolution"
                description="Manage active disputes"
                icon="gavel"
                href="/dashboard/admin/disputes"
                count={stats.disputesCases}
                colorClass="text-destructive"
                bgClass="bg-destructive/10"
              />
              <ActionCard
                title="Financial Reports"
                description="View revenue and transactions"
                icon="analytics"
                href="/dashboard/admin/reports"
                colorClass="text-secondary"
                bgClass="bg-secondary/10"
              />
              <ActionCard
                title="System Settings"
                description="Configure platform settings"
                icon="settings"
                href="/dashboard/admin/settings"
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />
              <ActionCard
                title="User Management"
                description="Manage user accounts and roles"
                icon="manage_accounts"
                href="/dashboard/admin/users"
                colorClass="text-success"
                bgClass="bg-success/10"
              />
            </div>
          )}
        </div>

        {/* Recent User Registrations */}
        <div>
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent User Registrations</h2>
              <Link href="/dashboard/admin/users" className="text-verification-verified hover:text-verification-verified/80 font-semibold text-sm flex items-center gap-1">
                View All
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)}
              </div>
            ) : (
              <div className="space-y-1">
                {recentUsers.map(user => <UserActivityRow key={user.id} user={user} />)}
              </div>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Status */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-success">check_circle</span>
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">API Server</span>
                <span className="text-success font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Database</span>
                <span className="text-success font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Payment Gateway</span>
                <span className="text-success font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-success rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Email Service</span>
                <span className="text-warning font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-warning rounded-full"></span>
                  Degraded
                </span>
              </div>
            </div>
          </div>

          {/* Top Regions */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-verification-verified">location_on</span>
              Top Regions
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm font-medium">Lagos</span>
                  <span className="text-foreground font-bold text-sm">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-verification-verified h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm font-medium">Abuja</span>
                  <span className="text-foreground font-bold text-sm">28%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-verification-verified h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm font-medium">Port Harcourt</span>
                  <span className="text-foreground font-bold text-sm">15%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm font-medium">Other</span>
                  <span className="text-foreground font-bold text-sm">12%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">trending_up</span>
              Growth Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm">User Growth</span>
                  <span className="text-success font-bold text-sm">+12.5%</span>
                </div>
                <p className="text-foreground text-2xl font-bold">1,604</p>
                <p className="text-muted-foreground text-xs">New users this month</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm">Property Growth</span>
                  <span className="text-success font-bold text-sm">+8.3%</span>
                </div>
                <p className="text-foreground text-2xl font-bold">324</p>
                <p className="text-muted-foreground text-xs">New properties this month</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground text-sm">Verification Rate</span>
                  <span className="text-warning font-bold text-sm">+5.2%</span>
                </div>
                <p className="text-foreground text-2xl font-bold">94.8%</p>
                <p className="text-muted-foreground text-xs">Of total listings verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
