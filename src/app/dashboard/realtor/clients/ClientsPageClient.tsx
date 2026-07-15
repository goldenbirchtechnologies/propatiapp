'use client'

import MaterialIcon from '@/components/icons/material-icon';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Phone, Mail, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonStatCard = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-lg bg-surface-container" />
      <div>
        <div className="h-3 bg-surface-container rounded w-24 mb-2" />
        <div className="h-6 bg-surface-container rounded w-12" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-surface-container" />
      <div className="flex-1">
        <div className="h-4 bg-surface-container rounded w-32 mb-2" />
        <div className="h-3 bg-surface-container rounded w-48" />
      </div>
      <div className="h-6 bg-surface-container rounded w-16" />
      <div className="h-8 bg-surface-container rounded w-24" />
    </div>
  </div>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: 'teal' | 'gold';
  trend?: { value: string; positive: boolean };
}

const StatCard: React.FC<StatItem> = ({ label, value, icon, color, trend }) => {
  const colorMap = {
    teal: {
      iconBg: 'bg-residential-teal/10 text-residential-teal',
      trendUp: 'text-success',
      trendDown: 'text-destructive',
    },
    gold: {
      iconBg: 'bg-commercial-gold/10 text-commercial-gold',
      trendUp: 'text-success',
      trendDown: 'text-destructive',
    },
  };

  const c = colorMap[color];

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg ${color === 'teal' ? 'hover:border-residential-teal' : 'hover:border-commercial-gold'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
          <MaterialIcon name={icon} className="material-symbols-outlined" />
        </div>
        <div>
          <p className="text-sm text-on-surface-variant font-medium">{label}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-0.5 ${trend.positive ? c.trendUp : c.trendDown}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyClientState() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-1">No clients yet</h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
        Your client portfolio is empty. Start by adding buyers or sellers to begin tracking deals.
      </p>
      <Button size="sm" className="gap-2">
        <UserPlus className="h-4 w-4" />
        Add First Client
      </Button>
    </div>
  );
}

// ── Placeholder Client Row ────────────────────────────────────────────────────
function ClientRowSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface-container" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-container rounded w-32" />
          <div className="h-3 bg-surface-container rounded w-48" />
        </div>
        <div className="h-6 bg-surface-container rounded-full w-20" />
        <div className="h-9 bg-surface-container rounded w-28" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const MOCK_CLIENTS = [
  { id: '1', name: 'Oluwaseun Adeyemi', email: 'oluwaseun.a@email.com', type: 'buyer', initials: 'OA' },
  { id: '2', name: 'Fatima Bello', email: 'fatima.b@email.com', type: 'seller', initials: 'FB' },
  { id: '3', name: 'Chinedu Okafor', email: 'chinedu.o@email.com', type: 'buyer', initials: 'CO' },
  { id: '4', name: 'Aisha Mohammed', email: 'aisha.m@email.com', type: 'seller', initials: 'AM' },
  { id: '5', name: 'Emeka Eze', email: 'emeka.e@email.com', type: 'buyer', initials: 'EE' },
];

export default function RealtorClientsPageClient() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const stats: StatItem[] = [
    { label: 'Total Clients', value: 24, icon: 'group', color: 'teal', trend: { value: '+4 this month', positive: true } },
    { label: 'Active Buyers', value: 14, icon: 'shopping_bag', color: 'teal' },
    { label: 'Active Sellers', value: 8, icon: 'sell', color: 'gold' },
    { label: 'New This Month', value: 3, icon: 'person_add', color: 'teal', trend: { value: '+1 vs last month', positive: true } },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">My Clients</h1>
            <p className="text-sm text-on-surface-variant">
              Manage your buyer and seller clients across active deals
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)
          ) : (
            stats.map((s, i) => <StatCard key={i} {...s} />)
          )}
        </div>
      </section>

      {/* Client List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">Client Directory</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <ClientRowSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {MOCK_CLIENTS.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/agent/clients/${client.id}`}
                className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                    {client.initials}
                  </div>
                  <div>
                    <p className="font-medium text-primary">{client.name}</p>
                    <p className="text-xs text-on-surface-variant">{client.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${client.type === 'buyer' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-outline-variant'}`}>
                  {client.type === 'buyer' ? 'Buyer' : 'Seller'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
