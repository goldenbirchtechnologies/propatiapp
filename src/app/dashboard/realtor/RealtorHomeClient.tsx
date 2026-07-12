'use client';

import React, { useState, useEffect } from 'react';

// Types
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: { value: string; isPositive: boolean };
  color: 'teal' | 'gold';
}

interface PipelineColumnProps {
  stage: string;
  count: number;
  deals: Array<{
    id: string;
    property: string;
    client: string;
    value: string;
    type: 'buy' | 'sell';
  }>;
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

// Skeleton loading components
const SkeletonCard = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-surface-container rounded w-24 mb-3"></div>
        <div className="h-8 bg-surface-container rounded w-16 mb-2"></div>
        <div className="h-3 bg-surface-container rounded w-20"></div>
      </div>
      <div className="w-12 h-12 bg-surface-container rounded-xl"></div>
    </div>
  </div>
);

const SkeletonPipelineColumn = () => (
  <div className="bg-surface-container-low rounded-xl p-4 animate-pulse">
    <div className="h-5 bg-surface-container rounded w-24 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-sm">
          <div className="h-4 bg-surface-container rounded w-full mb-2"></div>
          <div className="h-3 bg-surface-container rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-surface-container rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color }) => {
  const colorClasses = {
    teal: 'text-emerald-600 hover:border-emerald-600',
    gold: 'text-amber-600 hover:border-amber-600',
  };

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm transition-all duration-300 ease-in-out
        hover:scale-105 hover:shadow-card-hover ${colorClasses[color]} cursor-pointer group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-on-surface-variant mb-2 font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-primary mb-1">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`material-symbols-outlined text-sm ${
                  trend.isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-success' : 'text-destructive'
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
            color === 'teal'
              ? 'from-emerald-100/80 to-emerald-200/60'
              : 'from-amber-100/80 to-amber-200/60'
          } flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
        >
          <span className={`material-symbols-outlined text-2xl ${colorClasses[color]}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
};

// Pipeline Column Component
const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, count, deals }) => (
  <div className="bg-surface-container-low rounded-xl p-4 min-h-[260px] transition-all duration-300 hover:bg-surface-container">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-primary">{stage}</h4>
      <span className="bg-residential-teal text-white text-xs font-bold px-2 py-1 rounded-full">
        {count}
      </span>
    </div>
    <div className="space-y-3">
      {deals.length > 0 ? (
        deals.map((deal) => (
          <div
            key={deal.id}
            className={`bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-sm cursor-grab
              transition-all duration-300 hover:scale-105 hover:shadow-card-hover ${
                deal.type === 'buy'
                  ? 'hover:border-blue-500'
                  : 'hover:border-emerald-600'
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  deal.type === 'buy'
                    ? 'bg-surface-container-high/20 text-primary'
                    : 'bg-surface-container-high/20 text-primary'
                }`}
              >
                {deal.type}
              </span>
              <h5 className="font-medium text-primary text-sm truncate">{deal.property}</h5>
            </div>
            <p className="text-xs text-on-surface-variant mb-2 truncate">{deal.client}</p>
            <p
              className={`text-sm font-bold ${
                deal.type === 'buy' ? 'text-primary' : 'text-emerald-600'
              }`}
            >
              {deal.value}
            </p>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <span className="material-symbols-outlined text-3xl mb-2 block">inbox</span>
          <p className="text-xs">No deals in this stage</p>
        </div>
      )}
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 text-left w-full shadow-sm
      transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:border-emerald-600 group"
  >
    <div className="flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100/80 to-emerald-200/60
        flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
      >
        <span className="material-symbols-outlined text-2xl text-emerald-600">{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-primary mb-1 group-hover:text-emerald-600 transition-colors duration-300">
          {title}
        </h4>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
    </div>
  </button>
);

// Realtor Home Client Component
export default function RealtorHomeClient() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      icon: 'domain',
      label: 'Active Listings',
      value: 14,
      trend: { value: '+3 this week', isPositive: true },
      color: 'teal' as const,
    },
    {
      icon: 'visibility',
      label: 'Listing Views',
      value: '3,891',
      trend: { value: '+22% vs last month', isPositive: true },
      color: 'teal' as const,
    },
    {
      icon: 'shopping_bag',
      label: 'Buy Deals',
      value: 7,
      trend: { value: '+2 this week', isPositive: true },
      color: 'teal' as const,
    },
    {
      icon: 'sell',
      label: 'Sell Deals',
      value: 5,
      trend: { value: '+1 this month', isPositive: true },
      color: 'gold' as const,
    },
  ];

  const pipelineStages = [
    {
      stage: 'Lead',
      count: 6,
      deals: [
        { id: '1', property: '3BR - Lekki Phase 1', client: 'Mr. Adebayo', value: '₦28,000,000', type: 'buy' as const },
        { id: '2', property: '4BR - Victoria Island', client: 'Mrs. Chioma', value: '₦45,000,000', type: 'sell' as const },
        { id: '3', property: '2BR - Ikeja GRA', client: 'Mr. Okonkwo', value: '₦18,500,000', type: 'buy' as const },
      ],
    },
    {
      stage: 'Viewing',
      count: 4,
      deals: [
        { id: '4', property: '5BR - Ikoyi', client: 'Dr. Emeka', value: '₦95,000,000', type: 'buy' as const },
        { id: '5', property: 'Duplex - Banana Island', client: 'Ms. Aisha', value: '₦120,000,000', type: 'sell' as const },
      ],
    },
    {
      stage: 'Offer',
      count: 3,
      deals: [
        { id: '6', property: 'Office - Lagos Island', client: 'TechHub NG', value: '₦180,000,000', type: 'buy' as const },
        { id: '7', property: 'Plot - Abuja CBD', client: 'Zenith Inv', value: '₦250,000,000', type: 'sell' as const },
        { id: '8', property: 'Studio - Yaba', client: 'Ms. Folake', value: '₦12,000,000', type: 'buy' as const },
      ],
    },
    {
      stage: 'Negotiation',
      count: 2,
      deals: [
        { id: '9', property: 'Mansion - Chevron', client: 'Mr. Okafor', value: '₦175,000,000', type: 'sell' as const },
      ],
    },
    {
      stage: 'Closing',
      count: 1,
      deals: [
        { id: '10', property: 'Penthouse - Eko Atlantic', client: 'Mrs. Bello', value: '₦210,000,000', type: 'sell' as const },
      ],
    },
  ];

  const quickActions = [
    {
      icon: 'add_home',
      title: 'Add New Listing',
      description: 'Create a new property listing for sale',
    },
    {
      icon: 'calendar_add_on',
      title: 'Schedule Viewing',
      description: 'Arrange property tours for clients',
    },
    {
      icon: 'request_quote',
      title: 'Update Deal Stage',
      description: 'Progress deals through your pipeline',
    },
    {
      icon: 'receipt_long',
      title: 'Commission Summary',
      description: 'View pending and earned commissions',
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-residential-teal to-residential-teal/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Realtor Dashboard</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Welcome back! Here&apos;s your buy and sell performance overview
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl">real_estate_agent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">Performance Metrics</h2>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          )}
        </section>

        {/* Commission Summary */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-commercial-gold to-commercial-gold/90 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Commission Summary</h2>
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Earned (YTD)</p>
                <p className="text-2xl font-bold">₦18,750,000</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Pending Payment</p>
                <p className="text-2xl font-bold">₦4,500,000</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-white/80 text-sm mb-1">Next Payment</p>
                <p className="text-2xl font-bold">Jul 15, 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Deal Pipeline */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">Sales Pipeline</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonPipelineColumn key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
              {pipelineStages.map((stage, index) => (
                <PipelineColumn key={index} {...stage} />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                {...action}
                onClick={() => console.log(`Action clicked: ${action.title}`)}
              />
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-primary mb-4">Recent Activity</h2>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3 block">
              history
            </span>
            <p className="text-on-surface-variant mb-1 font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground">Your activity feed will appear here</p>
          </div>
        </section>
      </div>
      </>
  );
}