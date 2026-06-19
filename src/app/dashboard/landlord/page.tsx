'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// TypeScript Interfaces
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: string;
  colorClass: string;
}

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  colorClass: string;
}

interface ActivityItemProps {
  type: 'listing' | 'application' | 'payment' | 'maintenance';
  title: string;
  time: string;
  status?: string;
}

interface PropertyPerformanceProps {
  name: string;
  type: string;
  revenue: string;
  occupancy: string;
  trend: 'up' | 'down';
}

// Skeleton Components
const StatCardSkeleton = () => (
  <div className="bg-surface rounded-lg shadow-card p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="h-4 bg-surface-container-low rounded w-24 mb-3"></div>
        <div className="h-8 bg-surface-container-low rounded w-32 mb-2"></div>
        <div className="h-3 bg-surface-container-low rounded w-20"></div>
      </div>
      <div className="w-12 h-12 bg-surface-container-low rounded-full"></div>
    </div>
  </div>
);

const ActionCardSkeleton = () => (
  <div className="bg-surface rounded-lg shadow-card p-6 border border-outline-variant animate-pulse">
    <div className="w-10 h-10 bg-surface-container-low rounded-full mb-4"></div>
    <div className="h-5 bg-surface-container-low rounded w-32 mb-2"></div>
    <div className="h-4 bg-surface-container-low rounded w-full"></div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, label, value, change, colorClass }: StatCardProps) => (
  <div className="bg-surface rounded-lg shadow-card hover:shadow-card-hover p-4 sm:p-6 transition-all duration-200 ease-in-out hover:scale-[1.02]">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-on-surface-variant mb-2">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-on-surface mb-1">{value}</p>
        {change && (
          <p className={`text-xs sm:text-sm font-medium ${change.startsWith('+') ? 'text-residential-teal' : 'text-commercial-gold'}`}>
            {change}
          </p>
        )}
      </div>
      <div className={`${colorClass} p-2 sm:p-3 rounded-full`}>
        <span className="material-symbols-outlined text-xl sm:text-2xl text-on-surface">
          {icon}
        </span>
      </div>
    </div>
  </div>
);

// Action Card Component
const ActionCard = ({ icon, title, description, href, colorClass }: ActionCardProps) => (
  <Link href={href}>
    <div className={`bg-surface rounded-lg shadow-card hover:shadow-card-hover p-4 sm:p-6 border border-outline-variant hover:border-${colorClass} transition-all duration-200 ease-in-out hover:scale-[1.02] cursor-pointer h-full`}>
      <div className={`${colorClass} p-2 rounded-full inline-flex mb-3 sm:mb-4`}>
        <span className="material-symbols-outlined text-xl text-on-surface">
          {icon}
        </span>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-on-surface mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-on-surface-variant">{description}</p>
    </div>
  </Link>
);

// Activity Item Component
const ActivityItem = ({ type, title, time, status }: ActivityItemProps) => {
  const iconMap = {
    listing: { icon: 'home', color: 'bg-residential-teal-soft text-residential-teal' },
    application: { icon: 'description', color: 'bg-commercial-gold-soft text-commercial-gold' },
    payment: { icon: 'payments', color: 'bg-residential-teal-soft text-residential-teal' },
    maintenance: { icon: 'build', color: 'bg-commercial-gold-soft text-commercial-gold' }
  };

  const { icon, color } = iconMap[type];

  return (
    <div className="flex items-start gap-3 sm:gap-4 py-3 border-b border-outline-variant last:border-0">
      <div className={`${color} p-2 rounded-full flex-shrink-0`}>
        <span className="material-symbols-outlined text-base sm:text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base text-on-surface font-medium truncate">{title}</p>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">{time}</p>
      </div>
      {status && (
        <span className="text-xs sm:text-sm font-medium text-residential-teal flex-shrink-0">{status}</span>
      )}
    </div>
  );
};

// Property Performance Component
const PropertyPerformanceCard = ({ name, type, revenue, occupancy, trend }: PropertyPerformanceProps) => (
  <div className="bg-surface rounded-lg shadow-card hover:shadow-card-hover p-4 sm:p-5 transition-all duration-200 ease-in-out hover:scale-[1.02]">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base font-semibold text-on-surface truncate">{name}</h4>
        <p className="text-xs sm:text-sm text-on-surface-variant">{type}</p>
      </div>
      <span className={`material-symbols-outlined text-lg sm:text-xl ${trend === 'up' ? 'text-residential-teal' : 'text-commercial-gold'}`}>
        {trend === 'up' ? 'trending_up' : 'trending_down'}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div>
        <p className="text-xs text-on-surface-variant mb-1">Revenue</p>
        <p className="text-base sm:text-lg font-bold text-on-surface">{revenue}</p>
      </div>
      <div>
        <p className="text-xs text-on-surface-variant mb-1">Occupancy</p>
        <p className="text-base sm:text-lg font-bold text-on-surface">{occupancy}</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component
export default function LandlordDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setDashboardData({
        stats: {
          totalProperties: 12,
          activeListings: 8,
          monthlyRevenue: '₦2,450,000',
          pendingPayments: 3
        },
        recentActivity: [
          { type: 'payment' as const, title: 'Payment received from Tenant - Flat 3B', time: '2 hours ago', status: 'Completed' },
          { type: 'application' as const, title: 'New application for Lekki Apartment', time: '5 hours ago', status: 'Pending' },
          { type: 'maintenance' as const, title: 'Maintenance request - Plumbing Issue', time: '1 day ago' },
          { type: 'listing' as const, title: 'Property listed: Victoria Island Duplex', time: '2 days ago', status: 'Active' }
        ],
        topPerforming: [
          { name: 'Lekki Phase 1 Apartment', type: 'Residential', revenue: '₦450K', occupancy: '100%', trend: 'up' as const },
          { name: 'VI Commercial Plaza', type: 'Commercial', revenue: '₦820K', occupancy: '95%', trend: 'up' as const }
        ],
        needsAttention: [
          { name: 'Ikeja GRA Flat', type: 'Residential', revenue: '₦180K', occupancy: '60%', trend: 'down' as const },
          { name: 'Yaba Office Space', type: 'Commercial', revenue: '₦220K', occupancy: '50%', trend: 'down' as const }
        ]
      });
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Header */}
      <div className="bg-gradient-to-r from-residential-teal to-residential-teal-soft border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Landlord Dashboard</h1>
              <p className="text-sm sm:text-base text-white/80 mt-1">Manage your properties and tenants</p>
            </div>
            <Link href="/properties/new">
              <button className="bg-white text-residential-teal px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-surface transition-all duration-200 ease-in-out hover:scale-[1.02] shadow-md inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">add_circle</span>
                <span className="hidden sm:inline">Add Property</span>
                <span className="sm:hidden">Add</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                icon="apartment"
                label="Total Properties"
                value={dashboardData.stats.totalProperties}
                change="+2 this month"
                colorClass="bg-residential-teal-soft"
              />
              <StatCard
                icon="home"
                label="Active Listings"
                value={dashboardData.stats.activeListings}
                change="+3 this week"
                colorClass="bg-residential-teal-soft"
              />
              <StatCard
                icon="payments"
                label="Monthly Revenue"
                value={dashboardData.stats.monthlyRevenue}
                change="+12% vs last month"
                colorClass="bg-commercial-gold-soft"
              />
              <StatCard
                icon="schedule"
                label="Pending Payments"
                value={dashboardData.stats.pendingPayments}
                colorClass="bg-commercial-gold-soft"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-4">Quick Actions</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ActionCardSkeleton />
              <ActionCardSkeleton />
              <ActionCardSkeleton />
              <ActionCardSkeleton />
              <ActionCardSkeleton />
              <ActionCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ActionCard
                icon="add_home"
                title="List New Property"
                description="Add a property to your portfolio"
                href="/properties/new"
                colorClass="bg-residential-teal-soft"
              />
              <ActionCard
                icon="real_estate_agent"
                title="Manage Listings"
                description="View and update active listings"
                href="/properties/listings"
                colorClass="bg-residential-teal-soft"
              />
              <ActionCard
                icon="group"
                title="View Tenants"
                description="Manage tenant information"
                href="/tenants"
                colorClass="bg-residential-teal-soft"
              />
              <ActionCard
                icon="receipt_long"
                title="Payment History"
                description="Track rent and payment records"
                href="/payments"
                colorClass="bg-commercial-gold-soft"
              />
              <ActionCard
                icon="verified_user"
                title="Verify Applications"
                description="Review pending tenant applications"
                href="/applications"
                colorClass="bg-commercial-gold-soft"
              />
              <ActionCard
                icon="analytics"
                title="View Reports"
                description="Property performance analytics"
                href="/reports"
                colorClass="bg-commercial-gold-soft"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg shadow-card p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-4">Recent Activity</h2>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4 py-3">
                      <div className="w-10 h-10 bg-surface-container-low rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-surface-container-low rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-surface-container-low rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {dashboardData.recentActivity.map((activity: ActivityItemProps, index: number) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Property Performance */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg shadow-card p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-4">Property Performance</h2>

              {loading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ActionCardSkeleton />
                    <ActionCardSkeleton />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-residential-teal mb-3">Top Performing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.topPerforming.map((property: PropertyPerformanceProps, index: number) => (
                        <PropertyPerformanceCard key={index} {...property} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-commercial-gold mb-3">Needs Attention</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardData.needsAttention.map((property: PropertyPerformanceProps, index: number) => (
                        <PropertyPerformanceCard key={index} {...property} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
