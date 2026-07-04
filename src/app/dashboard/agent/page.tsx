'use client';

import React, { useState, useEffect } from 'react';

// Type definitions
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
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
  <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-muted rounded w-24 mb-3"></div>
        <div className="h-8 bg-muted rounded w-16 mb-2"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
      <div className="w-12 h-12 bg-muted rounded-xl"></div>
    </div>
  </div>
);

const SkeletonPipelineColumn = () => (
  <div className="bg-muted rounded-xl p-4 animate-pulse">
    <div className="h-5 bg-muted rounded w-24 mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-lg p-3 border border-border">
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
);

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color }) => {
  const colorClasses = {
    teal: 'text-residential-teal hover:border-residential-teal',
    gold: 'text-commercial-gold hover:border-commercial-gold'
  };

  return (
    <div className={`bg-card rounded-xl border border-border p-6 transition-all duration-300 ease-in-out
      hover:scale-105 hover:shadow-card-hover ${colorClasses[color]} cursor-pointer group`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2 font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`material-symbols-outlined text-sm ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
          color === 'teal' ? 'from-residential-teal/10 to-residential-teal/20' : 'from-commercial-gold/10 to-commercial-gold/20'
        } flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
          <span className={`material-symbols-outlined text-2xl ${colorClasses[color]}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

// Pipeline Column Component
const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, count, deals }) => (
  <div className="bg-muted rounded-xl p-4 min-h-[300px] transition-all duration-300 hover:bg-surface-container">
    <div className="flex items-center justify-between mb-4">
      <h4 className="font-semibold text-foreground">{stage}</h4>
      <span className="bg-residential-teal text-white text-xs font-bold px-2 py-1 rounded-full">{count}</span>
    </div>
    <div className="space-y-3">
      {deals.length > 0 ? (
        deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-card rounded-xl p-3 border border-border shadow-sm cursor-grab
              transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:border-residential-teal"
          >
            <h5 className="font-medium text-foreground text-sm mb-1 truncate">{deal.property}</h5>
            <p className="text-xs text-muted-foreground mb-2 truncate">{deal.client}</p>
            <p className="text-sm font-bold text-residential-teal">{deal.value}</p>
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
    className="bg-card rounded-xl border border-border p-6 text-left w-full
      transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:border-residential-teal group"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-residential-teal/10 to-residential-teal/20
        flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
        <span className="material-symbols-outlined text-2xl text-residential-teal">{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-1 group-hover:text-residential-teal transition-colors duration-300">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </button>
);

// Main Agent Dashboard Component
export default function AgentDashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const stats = [
    {
      icon: 'person_raised_hand',
      label: 'Active Listings',
      value: 12,
      trend: { value: '+2 this week', isPositive: true },
      color: 'teal' as const
    },
    {
      icon: 'visibility',
      label: 'Property Views',
      value: '1,247',
      trend: { value: '+18% vs last month', isPositive: true },
      color: 'teal' as const
    },
    {
      icon: 'handshake',
      label: 'Active Deals',
      value: 8,
      trend: { value: '+3 this month', isPositive: true },
      color: 'teal' as const
    },
    {
      icon: 'verified',
      label: 'Closed Deals',
      value: 23,
      trend: { value: '+5 vs last quarter', isPositive: true },
      color: 'gold' as const
    }
  ];

  const pipelineStages = [
    {
      stage: 'Lead',
      count: 5,
      deals: [
        { id: '1', property: '4BR Duplex - Lekki Phase 1', client: 'Mr. Adebayo Okon', value: '₦45,000,000' },
        { id: '2', property: '3BR Apartment - Victoria Island', client: 'Mrs. Chioma Nwankwo', value: '₦32,500,000' }
      ]
    },
    {
      stage: 'Viewing',
      count: 3,
      deals: [
        { id: '3', property: '5BR Estate Home -Ikoyi', client: 'Dr. Emeka Obi', value: '₦125,000,000' }
      ]
    },
    {
      stage: 'Offer',
      count: 2,
      deals: [
        { id: '4', property: 'Commercial Plot - Abuja CBD', client: 'Zenith Investments Ltd', value: '₦250,000,000' }
      ]
    },
    {
      stage: 'Negotiation',
      count: 1,
      deals: [
        { id: '5', property: '2BR Condo - Banana Island', client: 'Ms. Aisha Bello', value: '₦55,000,000' }
      ]
    },
    {
      stage: 'Closing',
      count: 1,
      deals: [
        { id: '6', property: 'Office Space - Lagos Island', client: 'TechHub Nigeria', value: '₦180,000,000' }
      ]
    }
  ];

  const quickActions = [
    {
      icon: 'calendar_add_on',
      title: 'Schedule Property Viewing',
      description: 'Book appointments with clients for property tours'
    },
    {
      icon: 'view_kanban',
      title: 'Update Deal Stage',
      description: 'Move deals through your sales pipeline'
    },
    {
      icon: 'payments',
      title: 'Request Commission',
      description: 'Submit commission requests for closed deals'
    },
    {
      icon: 'add_circle',
      title: 'Add New Property',
      description: 'List a new property on the marketplace'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-residential-teal to-residential-teal/90 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Agent Dashboard</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Welcome back! Here&apos;s your performance overview
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
          <h2 className="text-xl font-bold text-foreground mb-4">Performance Metrics</h2>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
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
                <p className="text-2xl font-bold">₦12,450,000</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Pending Payment</p>
                <p className="text-2xl font-bold">₦3,200,000</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-white/80 text-sm mb-1">Next Payment</p>
                <p className="text-2xl font-bold">Jun 30, 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Deal Pipeline */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Sales Pipeline</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => <SkeletonPipelineColumn key={i} />)}
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
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
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
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-muted-foreground mb-3 block">history</span>
            <p className="text-muted-foreground mb-1 font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground">Your activity feed will appear here</p>
          </div>
        </section>
      </div>
    </div>
  );
}
