'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Skeleton Loading Components
const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-card p-4 sm:p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const ActionCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-card p-4 sm:p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48"></div>
      </div>
    </div>
    <div className="hidden sm:block w-24 h-6 bg-gray-200 rounded-full"></div>
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
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <p className={`${colorClass} text-2xl sm:text-3xl lg:text-4xl font-bold mb-1`}>{value}</p>
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
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
          <p className="text-gray-600 text-xs sm:text-sm">{description}</p>
        </div>
      </div>
      {count !== undefined && count > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
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
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-residential-teal-soft text-residential-teal',
    active: 'bg-green-100 text-green-800',
  };

  const roleColors = {
    tenant: 'bg-residential-teal-soft text-residential-teal',
    landlord: 'bg-purple-100 text-purple-800',
    agent: 'bg-blue-100 text-blue-800',
    'estate-manager': 'bg-commercial-gold-soft text-commercial-gold',
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-2 sm:gap-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gradient-to-br from-residential-teal to-commercial-gold rounded-full flex items-center justify-center text-white font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
          <p className="text-gray-500 text-xs sm:text-sm truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        <span className={`${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs font-medium`}>
          {user.role}
        </span>
        <span className={`${statusColors[user.status]} px-2 py-1 rounded-full text-xs font-medium hidden sm:inline`}>
          {user.status}
        </span>
        <span className="text-gray-500 text-xs hidden sm:block">{user.registeredAt}</span>
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
  const styles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const icons = {
    warning: 'warning',
    info: 'info',
    success: 'check_circle',
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-4 flex items-center gap-3`}>
      <span className="material-symbols-outlined text-xl">{icons[type]}</span>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-residential-teal to-residential-teal-fixed text-white px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-residential-teal-soft text-sm sm:text-base">PROPATI Platform Overview & Management</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button className="bg-white text-residential-teal px-4 py-2 rounded-lg font-semibold text-sm hover:bg-residential-teal-soft transition-colors duration-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="hidden sm:inline">Export Report</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button className="bg-commercial-gold text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-commercial-gold-fixed transition-colors duration-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">settings</span>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Alert Banners */}
        <div className="mb-6 space-y-3">
          <AlertBanner type="warning" message="Pending user verifications require attention" count={stats.pendingVerifications} />
          <AlertBanner type="info" message="System maintenance scheduled for June 25, 2026 at 2:00 AM" />
        </div>

        {/* Platform Statistics */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
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
                colorClass="text-residential-teal"
                bgClass="bg-residential-teal-soft"
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
                colorClass="text-yellow-600"
                bgClass="bg-yellow-50"
              />
              <StatCard
                title="Monthly Revenue"
                value={`₦${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
                icon="payments"
                trend="+15.7% this month"
                trendUp={true}
                colorClass="text-commercial-gold"
                bgClass="bg-commercial-gold-soft"
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
                colorClass="text-green-600"
                bgClass="bg-green-50"
              />
              <StatCard
                title="Disputes Cases"
                value={stats.disputesCases}
                icon="flag"
                trend="-3.1% this month"
                trendUp={true}
                colorClass="text-red-600"
                bgClass="bg-red-50"
              />
              <StatCard
                title="Platform Fees"
                value={`₦${(stats.platformFees / 1000000).toFixed(1)}M`}
                icon="account_balance"
                trend="+11.8% this month"
                trendUp={true}
                colorClass="text-commercial-gold"
                bgClass="bg-commercial-gold-soft"
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
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
                colorClass="text-residential-teal"
                bgClass="bg-residential-teal-soft"
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
                colorClass="text-red-600"
                bgClass="bg-red-50"
              />
              <ActionCard
                title="Financial Reports"
                description="View revenue and transactions"
                icon="analytics"
                href="/dashboard/admin/reports"
                colorClass="text-commercial-gold"
                bgClass="bg-commercial-gold-soft"
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
                colorClass="text-green-600"
                bgClass="bg-green-50"
              />
            </div>
          )}
        </div>

        {/* Recent User Registrations */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent User Registrations</h2>
              <Link href="/dashboard/admin/users" className="text-residential-teal hover:text-residential-teal-fixed font-semibold text-sm flex items-center gap-1">
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
          <div className="bg-white rounded-lg shadow-card p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">API Server</span>
                <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Database</span>
                <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Payment Gateway</span>
                <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Email Service</span>
                <span className="text-yellow-600 font-semibold text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                  Degraded
                </span>
              </div>
            </div>
          </div>

          {/* Top Regions */}
          <div className="bg-white rounded-lg shadow-card p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-residential-teal">location_on</span>
              Top Regions
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 text-sm font-medium">Lagos</span>
                  <span className="text-gray-900 font-bold text-sm">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-residential-teal h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 text-sm font-medium">Abuja</span>
                  <span className="text-gray-900 font-bold text-sm">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-commercial-gold h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 text-sm font-medium">Port Harcourt</span>
                  <span className="text-gray-900 font-bold text-sm">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-700 text-sm font-medium">Other</span>
                  <span className="text-gray-900 font-bold text-sm">12%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Metrics */}
          <div className="bg-white rounded-lg shadow-card p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-commercial-gold">trending_up</span>
              Growth Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600 text-sm">User Growth</span>
                  <span className="text-green-600 font-bold text-sm">+12.5%</span>
                </div>
                <p className="text-gray-900 text-2xl font-bold">1,604</p>
                <p className="text-gray-500 text-xs">New users this month</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600 text-sm">Revenue Growth</span>
                  <span className="text-green-600 font-bold text-sm">+15.7%</span>
                </div>
                <p className="text-gray-900 text-2xl font-bold">₦8.45M</p>
                <p className="text-gray-500 text-xs">Revenue this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
