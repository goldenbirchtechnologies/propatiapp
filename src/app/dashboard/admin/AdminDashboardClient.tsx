'use client';

import AppIcon from '@/components/icons/app-icon';
import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';
import { PageHeader, StatCard, StatusBadge, DataTable, Avatar } from '@/components/ui';
import { ArrowRight, Users, Building2, Shield, DollarSign, AlertTriangle, TrendingUp, Flag } from 'lucide-react';

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
  <div className="glass-card p-5 flex flex-col gap-3 hover:border-white/15 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{title}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`lucide text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {trendUp ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass}`}>
        <span className={`lucide text-xl ${colorClass}`}>{icon}</span>
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
    <div className="glass-card p-5 flex items-center gap-3 hover:border-white/15 transition-colors cursor-pointer relative">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgClass}`}>
        <span className={`lucide text-xl ${colorClass}`}>{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      {count !== undefined && count > 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
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
    pending: 'bg-amber-500/10 text-amber-400',
    verified: 'bg-emerald-500/10 text-emerald-400',
    active: 'bg-emerald-500/10 text-emerald-400',
  };

  const roleColors: Record<string, string> = {
    tenant: 'bg-emerald-500/10 text-emerald-400',
    landlord: 'bg-amber-500/10 text-amber-400',
    agent: 'bg-zinc-800 text-zinc-300',
    'estate-manager': 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025] transition-colors">
      <Avatar name={userItem.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium">{userItem.name}</div>
        <div className="text-zinc-600 text-xs">{userItem.email}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role] || 'bg-zinc-800 text-zinc-300'}`}>
          {userItem.role}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[userItem.status]}`}>
          {userItem.status}
        </span>
      </div>
      <div className="text-xs text-zinc-600">{userItem.registeredAt}</div>
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
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };

  return (
    <div className={`glass-card p-4 flex items-center gap-3 ${styles[type]}`}>
      <AlertTriangle size={16} />
      <p className="flex-1 text-sm font-medium">
        {message}
        {count !== undefined && <span className="ml-2 font-bold">({count})</span>}
      </p>
    </div>
  );
};

export default function AdminDashboardClient({ userName, userAvatar }: { userName: string; userAvatar?: string }) {
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

  const transactionColumns = [
    { key: 'id', label: 'Ref' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge status={String(row.status ?? '')} /> },
  ];

  const mockTransactions = [
    { id: 'TXN-001', type: 'Rent Payment', amount: '₦450,000', from: 'Adebayo Johnson', to: 'Lekki Palms Estate', date: 'Aug 24, 2026', status: 'Completed' },
    { id: 'TXN-002', type: 'Service Charge', amount: '₦120,000', from: 'Chioma Nwankwo', to: 'Victoria Heights', date: 'Aug 24, 2026', status: 'Processing' },
    { id: 'TXN-003', type: 'Commission', amount: '₦85,000', from: 'Zenith Corp', to: 'Ibrahim Hassan', date: 'Aug 23, 2026', status: 'Completed' },
    { id: 'TXN-004', type: 'Caution Deposit', amount: '₦200,000', from: 'Tunde Adeyemi', to: 'Prime Heights', date: 'Aug 23, 2026', status: 'In Escrow' },
    { id: 'TXN-005', type: 'Rent Payment', amount: '₦380,000', from: 'Blessing Okoro', to: 'Ikoyi Gardens', date: 'Aug 22, 2026', status: 'Completed' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview · August 24, 2026"
        actions={
          <div className="flex gap-2">
            <a href="/dashboard/admin/reports" className="inline-flex items-center px-4 py-2 text-sm border border-white/[0.08] text-zinc-300 rounded-lg hover:text-white hover:border-zinc-600 transition-colors">
              Export Report
            </a>
            <a href="/dashboard/admin/settings" className="inline-flex items-center px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              Settings
            </a>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} trend="up" trendValue="+290 this month" icon={Users} />
        <StatCard label="Active Listings" value={stats.activeListings.toLocaleString()} trend="up" trendValue="+1.2K" icon={Building2} />
        <StatCard label="Verification Queue" value={String(stats.pendingVerifications)} sub="Pending review" trend="flat" icon={Shield} />
        <StatCard label="Platform Revenue" value={`₦${(stats.monthlyRevenue / 1e6).toFixed(1)}M`} trend="up" trendValue="+23.4%" icon={DollarSign} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* User growth */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">User Growth</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Monthly active users · Last 12 months</p>
            </div>
            <a href="/dashboard/admin/users" className="text-xs text-emerald-400 flex items-center gap-1">
              View users <ArrowRight size={11} />
            </a>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {[820, 950, 1100, 1280, 1450, 1620, 1890, 2100, 2350, 2600, 2890, 3180].map((v, i) => {
              const max = 3180;
              const pct = (v / max) * 100;
              const isLast = i === 11;
              return (
                <div key={i} className="flex-1">
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: `${pct}%`,
                      background: isLast ? '#10b981' : 'rgba(255,255,255,0.06)',
                      minHeight: 4,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-700">
            {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold text-sm mb-4">System Alerts</h3>
          <div className="space-y-2.5">
            {[
              { severity: 'critical', msg: 'Failed payment rate 2.3% — above threshold', path: '/dashboard/admin/transactions' },
              { severity: 'warning', msg: '3 disputes unresolved > 7 days', path: '/dashboard/admin/disputes' },
              { severity: 'warning', msg: '12 verification submissions pending', path: '/dashboard/admin/verification' },
              { severity: 'info', msg: 'DB backup completed successfully', path: '#' },
              { severity: 'info', msg: 'API latency normal — p95 < 200ms', path: '#' },
            ].map((a, i) => (
              <a key={i} href={a.path} className="flex items-start gap-2.5 hover:bg-white/[0.03] p-2 rounded-lg transition-colors">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  a.severity === 'critical' ? 'bg-red-400' : a.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                }`} />
                <span className="text-xs text-zinc-400">{a.msg}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users + verification queue */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent users */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Users</h3>
            <a href="/dashboard/admin/users" className="text-xs text-emerald-400 flex items-center gap-1">
              All users <ArrowRight size={11} />
            </a>
          </div>
          <div className="space-y-2">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No users yet</p>
            ) : (
              recentUsers.map((u) => (
                <UserActivityRow key={u.id} user={u} />
              ))
            )}
          </div>
        </div>

        {/* Verification queue */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              Verification Queue
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded-full">12</span>
            </h3>
            <a href="/dashboard/admin/verification" className="text-xs text-emerald-400 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </a>
          </div>
          <div className="space-y-2">
            {[
              { id: '1', property: 'Lekki Phase 1 Duplex', owner: 'Adebayo Johnson', type: 'Property', status: 'Pending Review', submitted: '2 hours ago' },
              { id: '2', property: 'VI Waterfront Apartment', owner: 'Chioma Nwankwo', type: 'Property', status: 'Under Review', submitted: '5 hours ago' },
              { id: '3', property: 'Ikeja GRA Office Space', owner: 'Zenith Corp', type: 'Commercial', status: 'Pending Review', submitted: '1 day ago' },
            ].map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-950/60">
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium">{v.property}</div>
                  <div className="text-zinc-600 text-xs">{v.owner} · {v.type}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={v.status} />
                  <div className="text-zinc-700 text-[10px] mt-0.5">{v.submitted}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Recent Transactions</h3>
          <a href="/dashboard/admin/transactions" className="text-xs text-emerald-400 flex items-center gap-1">
            All transactions <ArrowRight size={11} />
          </a>
        </div>
        <DataTable
          columns={transactionColumns}
          data={mockTransactions}
        />
      </div>
    </div>
  );
}
