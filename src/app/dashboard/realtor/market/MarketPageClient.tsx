'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Home, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonStatRow = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-surface-container" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-surface-container rounded w-40" />
        <div className="h-5 bg-surface-container rounded w-24" />
      </div>
    </div>
    <div className="h-2 bg-surface-container rounded w-full" />
  </div>
);

const SkeletonReportCard = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-surface-container" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-container rounded w-36" />
        <div className="h-3 bg-surface-container rounded w-24" />
      </div>
    </div>
    <div className="h-3 bg-surface-container rounded w-full mb-2" />
    <div className="h-3 bg-surface-container rounded w-4/5" />
  </div>
);

// ── KPI Stat Card ─────────────────────────────────────────────────────────────
interface MarketStat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: 'teal' | 'gold';
}

const MarketStatCard: React.FC<MarketStat> = ({ label, value, change, positive, icon, color }) => {
  const iconBg = color === 'teal'
    ? 'bg-residential-teal/10 text-residential-teal'
    : 'bg-commercial-gold/10 text-commercial-gold';

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg ${color === 'teal' ? 'hover:border-residential-teal' : 'hover:border-commercial-gold'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <MaterialIcon name={icon} className="material-symbols-outlined" />
        </div>
        <div>
          <p className="text-sm text-on-surface-variant font-medium">{label}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
          <p className={`text-xs font-medium mt-0.5 ${positive ? 'text-success' : 'text-destructive'}`}>
            {positive ? '↑' : '↓'} {change}
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Region Analysis Card ──────────────────────────────────────────────────────
interface RegionCard {
  name: string;
  avgPrice: string;
  change: string;
  positive: boolean;
  volume: string;
  hot?: boolean;
}

const RegionCardSkeleton = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-surface-container" />
      <div className="h-4 bg-surface-container rounded w-32" />
    </div>
    <div className="h-5 bg-surface-container rounded w-28 mb-2" />
    <div className="h-3 bg-surface-container rounded w-20" />
  </div>
);

function RegionAnalysisCard({ data }: { data: RegionCard }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 transition-all duration-200 hover:shadow-md hover:border-residential-teal">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-residential-teal/10 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-residential-teal" />
        </div>
        <div>
          <h4 className="font-semibold text-primary text-sm">{data.name}</h4>
          {data.hot && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/20 bg-destructive/10">Hot Market</Badge>}
        </div>
      </div>
      <p className="text-xl font-bold text-primary mb-1">{data.avgPrice}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-on-surface-variant">Avg. Price</span>
        <span className={`font-medium ${data.positive ? 'text-success' : 'text-destructive'}`}>
          {data.positive ? '↑' : '↓'} {data.change} vs last Q
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Listing Volume: <span className="font-medium text-on-surface-variant">{data.volume}</span></p>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyMarketState() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-1">Market data loading</h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
        Regional analytics and pricing trends will appear here as data is ingested from listing sources.
      </p>
      <Button variant="outline" size="sm" className="gap-2">
        <TrendingUp className="h-4 w-4" />
        View Sample Report
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RealtorMarketPageClient() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 950);
    return () => clearTimeout(timer);
  }, []);

  const stats: MarketStat[] = [
    {
      label: 'Lagos Avg Price',
      value: '₦72,000,000',
      change: '+5.2% vs last quarter',
      positive: true,
      icon: 'payments',
      color: 'teal',
    },
    {
      label: 'Abuja Avg Price',
      value: '₦48,500,000',
      change: '+2.1% vs last quarter',
      positive: true,
      icon: 'payments',
      color: 'gold',
    },
    {
      label: 'Listing Turnover',
      value: '18 days',
      change: '-3 days vs last month',
      positive: true,
      icon: 'swap_horiz',
      color: 'teal',
    },
    {
      label: 'Buyer Enquiries',
      value: '142',
      change: '+18% vs last week',
      positive: true,
      icon: 'group',
      color: 'gold',
    },
  ];

  const regions: RegionCard[] = [
    { name: 'Lekki Phase 1', avgPrice: '₦85,000,000', change: '+7.3%', positive: true, volume: '42 listings', hot: true },
    { name: 'Victoria Island', avgPrice: '₦120,000,000', change: '+3.1%', positive: true, volume: '28 listings', hot: false },
    { name: 'Ikeja GRA', avgPrice: '₦55,000,000', change: '-1.2%', positive: false, volume: '19 listings', hot: false },
    { name: 'Ikoyi', avgPrice: '₦210,000,000', change: '+4.8%', positive: true, volume: '15 listings', hot: false },
    { name: 'Banana Island', avgPrice: '₦310,000,000', change: '+1.5%', positive: true, volume: '8 listings', hot: false },
    { name: 'Abuja CBD', avgPrice: '₦62,000,000', change: '+6.0%', positive: true, volume: '34 listings', hot: true },
  ];

  const quickReports = [
    { title: 'Q2 Pricing Report', desc: 'Sector-wide median prices and YoY growth' },
    { title: 'Demand Heatmap', desc: 'Enquiry volume by locality in Lagos' },
    { title: 'Days on Market', desc: 'Average listing-to-close time by zone' },
    { title: 'New Development Pipeline', desc: 'Off-plan and upcoming project inventory' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">Market Intelligence</h1>
            <p className="text-sm text-on-surface-variant">
              Pricing trends, demand signals, and regional analysis to guide your listings and client advice
            </p>
          </div>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <section className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [1, 2, 3, 4].map((i) => <SkeletonStatRow key={i} />)
            : stats.map((s, i) => <MarketStatCard key={i} {...s} />)}
        </div>
      </section>

      {/* Regional Analysis */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-primary mb-4">Regional Overview</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <RegionCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map((r) => <RegionAnalysisCard key={r.name} data={r} />)}
          </div>
        )}
      </section>

      {/* Quick Reports */}
      <section>
        <h2 className="text-lg font-bold text-primary mb-4">Quick Reports</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonReportCard key={i} />)}
          </div>
        ) : (
          <EmptyMarketState />
        )}
      </section>
    </div>
  );
}
