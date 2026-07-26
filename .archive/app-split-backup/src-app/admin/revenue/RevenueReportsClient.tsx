'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/admin/stats-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, TrendingUp, Users, BarChart3, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RevenueReportsClientProps {
  initialData: {
    revenueData: {
      totalRevenue: number;
      platformFees: number;
      agentCommissions: number;
      transactionCount: number;
      averageTransaction: number;
    };
    revenueByType: {
      type: string;
      _sum: {
        amount: number | null;
        platformFee: number | null;
      };
      _count: number;
    }[];
    topListings: {
      id: string;
      title: string;
      propertyType: string;
      transactions: {
        amount: number;
        platformFee: number;
      }[];
    }[];
  };
  dateRange: {
    from: Date;
    to: Date;
  };
}

export default function RevenueReportsClient({
  initialData,
  dateRange: initialDateRange,
}: RevenueReportsClientProps) {
  const { toast } = useToast();
  const [datePreset, setDatePreset] = useState('this-month');
  const [data, setData] = useState(initialData);

  const handleDatePresetChange = async (preset: string) => {
    setDatePreset(preset);
    // In a real implementation, you would fetch new data based on the date range
    toast({ title: 'Info', description: 'Date range filter will be implemented' });
  };

  const handleExportCSV = () => {
    // Generate CSV data
    const csvData = [
      ['Transaction Type', 'Count', 'Total Amount', 'Platform Fee'],
      ...data.revenueByType.map((item) => [
        item.type,
        item._count,
        ((item._sum.amount || 0) / 100).toFixed(2),
        ((item._sum.platformFee || 0) / 100).toFixed(2),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue-report-${datePreset}.csv`;
    link.click();

    toast({ title: 'Success', description: 'Revenue report exported' });
  };

  const topListingsWithRevenue = data.topListings.map((listing) => {
    const totalRevenue = listing.transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalPlatformFee = listing.transactions.reduce((sum, t) => sum + t.platformFee, 0);
    return {
      ...listing,
      totalRevenue,
      totalPlatformFee,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            Revenue Reports
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Platform revenue analytics and financial reports.
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={datePreset} onValueChange={handleDatePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`₦${(data.revenueData.totalRevenue / 100).toLocaleString()}`}
          icon={DollarSign}
          trendPositive={true}
        />
        <StatsCard
          title="Platform Fees"
          value={`₦${(data.revenueData.platformFees / 100).toLocaleString()}`}
          icon={TrendingUp}
          trendPositive={true}
        />
        <StatsCard
          title="Agent Commissions"
          value={`₦${(data.revenueData.agentCommissions / 100).toLocaleString()}`}
          icon={Users}
          trendPositive={true}
        />
        <StatsCard
          title="Transaction Count"
          value={data.revenueData.transactionCount}
          icon={BarChart3}
          trendPositive={true}
        />
        <StatsCard
          title="Avg Transaction"
          value={`₦${(data.revenueData.averageTransaction / 100).toLocaleString()}`}
          icon={DollarSign}
          trendPositive={true}
        />
      </div>

      {/* Revenue by Transaction Type */}
      <div className="card p-6">
        <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
          Revenue Breakdown by Transaction Type
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Transaction Type
                </th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Count
                </th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Total Amount
                </th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Platform Fee
                </th>
              </tr>
            </thead>
            <tbody>
              {data.revenueByType.map((item) => (
                <tr key={item.type} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>
                    {item.type.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="p-4 text-right" style={{ color: 'var(--text)' }}>
                    {item._count}
                  </td>
                  <td className="p-4 text-right font-medium" style={{ color: 'var(--text)' }}>
                    ₦{((item._sum.amount || 0) / 100).toLocaleString()}
                  </td>
                  <td className="p-4 text-right font-medium" style={{ color: 'var(--green)' }}>
                    ₦{((item._sum.platformFee || 0) / 100).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2" style={{ borderColor: 'var(--border)' }}>
                <td className="p-4 font-bold" style={{ color: 'var(--text)' }}>
                  TOTAL
                </td>
                <td className="p-4 text-right font-bold" style={{ color: 'var(--text)' }}>
                  {data.revenueData.transactionCount}
                </td>
                <td className="p-4 text-right font-bold" style={{ color: 'var(--text)' }}>
                  ₦{(data.revenueData.totalRevenue / 100).toLocaleString()}
                </td>
                <td className="p-4 text-right font-bold" style={{ color: 'var(--green)' }}>
                  ₦{(data.revenueData.platformFees / 100).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Earning Listings */}
      <div className="card p-6">
        <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
          Top Earning Listings
        </h3>
        {topListingsWithRevenue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Listing
                  </th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Property Type
                  </th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Transactions
                  </th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Total Revenue
                  </th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                    Platform Fee
                  </th>
                </tr>
              </thead>
              <tbody>
                {topListingsWithRevenue.map((listing, index) => (
                  <tr key={listing.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            background: 'var(--accent-bg)',
                            color: 'var(--accent)',
                          }}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium" style={{ color: 'var(--text)' }}>
                          {listing.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4" style={{ color: 'var(--text)' }}>
                      {listing.propertyType}
                    </td>
                    <td className="p-4 text-right" style={{ color: 'var(--text)' }}>
                      {listing.transactions.length}
                    </td>
                    <td className="p-4 text-right font-medium" style={{ color: 'var(--text)' }}>
                      ₦{(listing.totalRevenue / 100).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-medium" style={{ color: 'var(--green)' }}>
                      ₦{(listing.totalPlatformFee / 100).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
            No transaction data available for this period
          </p>
        )}
      </div>
    </div>
  );
}
