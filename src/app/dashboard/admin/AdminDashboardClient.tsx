'use client';

import AppIcon from '@/components/icons/app-icon';
import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

const shimmerBg = 'bg-zinc-800';
const shimmerAnimation = 'animate-pulse';

const StatCardSkeleton = () => (
  <div className={`${shimmerBg} ${shimmerAnimation} rounded-lg border border-zinc-800 p-4 sm:p-6`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={`${shimmerBg} h-4 rounded w-24 mb-3`} />
        <div className={`${shimmerBg} h-8 rounded w-16 mb-2`} />
        <div className={`${shimmerBg} h-3 rounded w-20`} />
      </div>
      <div className="w-10 h-10 rounded-lg" />
    </div>
  </div>
);

const ActionCardSkeleton = () => (
  <div className={`${shimmerBg} ${shimmerAnimation} rounded-lg border border-zinc-800 p-4 sm:p-5`}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <div className="h-5 rounded w-32 mb-2" />
        <div className="h-3 rounded w-full" />
      </div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-800/30">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="h-4 rounded w-32 mb-2" />
        <div className="h-3 rounded w-48" />
      </div>
    </div>
    <div className="hidden sm:block w-24 h-6 rounded-full" />
  </div>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  colorClass: string;
  bgClass: string;
}

const StatCard = ({ title, value, icon, trend, trendUp, colorClass, bgClass }: StatCardProps) => (
  <div className={`bg-zinc-900/50 rounded-lg border border-zinc-800 p-4 sm:p-6 hover:shadow-card-hover hover:scale-105 transition-all duration-300 ease-in-out`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-zinc-400 text-sm font-medium mb-2">{title}</p>
        <p className={`text-white font-headline-md mb-1`}>{value}</p>
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`lucide text-sm ${trendUp ? 'text-[#10b981]' : 'text-red-500'}`}>
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-xs font-medium ${trendUp ? 'text-[#10b981]' : 'text-red-500'}`}>{trend}</span>
          </div>
        )}
      </div>
      <div className={`${bgClass} p-2 sm:p-3 rounded-lg`}>
        <span className={`lucide text-xl sm:text-2xl ${colorClass}`}>{icon}</span>
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

const ActionCard = ({ title, description, icon, href, count, colorClass, bgClass }: ActionCardProps) => (
  <a href={href}>
    <div className={`bg-zinc-900/50 rounded-lg border border-zinc-800 p-4 sm:p-5 hover:shadow-card-hover hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer relative`}>
      <div className="flex items-center gap-3">
        <div className={`${bgClass} p-2 sm:p-3 rounded-lg`}>
          <span className={`lucide text-xl sm:text-2xl ${colorClass}`}>{icon}</span>
        </div>
        <div className="flex-1">
          <h3 className={`font-headline-sm text-white mb-1`}>{title}</h3>
          <p className="text-zinc-400 text-xs sm:text-sm">{description}</p>
        </div>
      </div>
      {count !== undefined && count > 0 && (
        <div className="absolute top-3 right-3 bg-destructive text-on-destructive text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </div>
      )}
    </div>
  </a>
);

interface UserActivityProps {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  status: 'pending' | 'verified' | 'active';
}

const UserActivityRow = ({ user: userItem }: { user: UserActivityProps }) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    verified: 'bg-verification-verified/10 text-verification-verified',
    active: 'bg-success/10 text-[#10b981]',
  };

  const roleColors: Record<string, string> = {
    tenant: 'bg-verification-verified/10 text-verification-verified',
    landlord: 'bg-amber-400/10 text-amber-400',
    agent: 'bg-zinc-800 text-white',
    'estate-manager': 'bg-amber-400/10 text-amber-400',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-zinc-800/30 gap-2 sm:gap-4 hover:bg-zinc-900/50 transition-colors duration-150">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-emerald-500 to-emerald-400">
          {userItem.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm sm:text-base truncate">{userItem.name}</p>
          <p className="text-zinc-400 text-xs sm:text-sm truncate">{userItem.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        <span className={`${roleColors[userItem.role] || 'bg-muted text-white'} px-2 py-1 rounded-full text-xs font-medium`}>
          {userItem.role}
        </span>
        <span className={`${statusColors[userItem.status]} px-2 py-1 rounded-full text-xs font-medium hidden sm:inline`}>
          {userItem.status}
        </span>
        <span className="text-zinc-400 text-xs hidden sm:block">{userItem.registeredAt}</span>
      </div>
    </div>
  );
};

interface AlertBannerProps {
  type: 'warning' | 'info' | 'success';
  message: string;
  count?: number;
}

const AlertBanner = ({ type, message, count }: AlertBannerProps) => {
  const styles: Record<string, string> = {
    warning: 'bg-warning/10 border-zinc-800 text-warning',
    info: 'bg-primary/5 border-zinc-800 text-white',
    success: 'bg-success/10 border-zinc-800 text-[#10b981]',
  };

  const iconMap: Record<string, string> = {
    warning: 'warning',
    info: 'info',
    success: 'check_circle',
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 flex items-center gap-3`}>
      <AppIcon name={iconMap[type]} className="lucide" />
      <p className="flex-1 text-sm font-medium">
        {message}
        {count !== undefined && <span className="ml-2 font-bold">({count})</span>}
      </p>
    </div>
  );
};

interface AdminDashboardClientProps {
  userName: string;
  userAvatar?: string;
}

export default function AdminDashboardClient({ userName, userAvatar }: AdminDashboardClientProps) {
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
  }, []);

  return (
    <div className="dashboard-content-area fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Alert Banners */}
        <div className="space-y-3">
          <AlertBanner type="warning" message="Pending user verifications require attention" count={stats.pendingVerifications} />
          <AlertBanner type="info" message="System maintenance scheduled for June 25, 2026 at 2:00 AM" />
        </div>

        {/* Platform Statistics */}
        <div>
          <h2 className="font-headline-md text-white mb-4">Platform Statistics</h2>
          {stats.totalUsers === 0 ? (
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
                colorClass="text-amber-400"
                bgClass="bg-amber-400/10"
              />
              <StatCard
                title="Pending Verifications"
                value={stats.pendingVerifications.toLocaleString()}
                icon="verified"
                trend="-3.1% this month"
                trendUp={false}
                colorClass="text-warning"
                bgClass="bg-warning/10"
              />
              <StatCard
                title="Monthly Revenue"
                value={'₦' + stats.monthlyRevenue.toLocaleString()}
                icon="payments"
                trend="+14.7% this month"
                trendUp={true}
                colorClass="text-[#10b981]"
                bgClass="bg-success/10"
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-headline-md text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <ActionCard
              title="User Management"
              description="Review and manage platform users"
              icon="people"
              href="/dashboard/admin/users"
              count={12}
              colorClass="text-verification-verified"
              bgClass="bg-verification-verified/10"
            />
            <ActionCard
              title="Verifications"
              description="Process pending verifications"
              icon="verified"
              href="/dashboard/admin/verifications"
              count={stats.pendingVerifications}
              colorClass="text-warning"
              bgClass="bg-warning/10"
            />
            <ActionCard
              title="Disputes"
              description="Handle arbitration cases"
              icon="gavel"
              href="/dashboard/admin/disputes"
              count={stats.disputesCases}
              colorClass="text-red-500"
              bgClass="bg-red-500/10"
            />
            <ActionCard
              title="Properties"
              description="Monitor property listings"
              icon="apartment"
              href="/dashboard/admin/properties"
              colorClass="text-amber-400"
              bgClass="bg-amber-400/10"
            />
            <ActionCard
              title="Transactions"
              description="Review escrow and payments"
              icon="payments"
              href="/dashboard/admin/transactions/escrow"
              colorClass="text-[#10b981]"
              bgClass="bg-success/10"
            />
            <ActionCard
              title="Revenue Reports"
              description="View financial analytics"
              icon="insights"
              href="/dashboard/admin/revenue"
              colorClass="text-white"
              bgClass="bg-zinc-800"
            />
          </div>
        </div>

        {/* Recent User Registrations */}
        <div>
          <h2 className="font-headline-md text-white">Recent User Registrations</h2>
          <div className="mt-4 bg-zinc-900/50 rounded-lg border border-zinc-800 divide-y divide-[#262626]/30">
            {stats.totalUsers === 0 ? (
              <div className="p-4">
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </div>
            ) : (
              recentUsers.map((userItem) => (
                <UserActivityRow key={userItem.id} user={userItem} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
