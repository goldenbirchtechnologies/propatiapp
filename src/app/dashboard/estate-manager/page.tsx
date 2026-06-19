'use client';

import { useState } from 'react';

// TypeScript interfaces
interface StatCard {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

interface Property {
  id: string;
  name: string;
  type: string;
  units: number;
  occupied: number;
  revenue: string;
  status: 'verified' | 'pending' | 'flagged';
}

interface RentEntry {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface Task {
  id: string;
  title: string;
  property: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
}

interface LeaseExpiration {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  expiryDate: string;
  daysLeft: number;
}

// Skeleton Components
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-card animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
      <div className="h-6 w-16 bg-gray-200 rounded"></div>
    </div>
    <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-32 bg-gray-200 rounded"></div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    <td className="py-4 px-4">
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 w-16 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
    </td>
    <td className="py-4 px-4">
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </td>
  </tr>
);

export default function EstateManagerDashboard() {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API calls
  const stats: StatCard[] = [
    {
      id: '1',
      label: 'Total Properties',
      value: 24,
      change: '+2 this month',
      trend: 'up',
      icon: 'domain',
      color: 'text-residential-teal'
    },
    {
      id: '2',
      label: 'Total Units',
      value: 486,
      change: '+12 this month',
      trend: 'up',
      icon: 'insights',
      color: 'text-commercial-gold'
    },
    {
      id: '3',
      label: 'Occupancy Rate',
      value: '94.2%',
      change: '+2.4% from last month',
      trend: 'up',
      icon: 'trending_up',
      color: 'text-residential-teal'
    },
    {
      id: '4',
      label: 'Monthly Revenue',
      value: '₦42.8M',
      change: '+8.2% from last month',
      trend: 'up',
      icon: 'priority_high',
      color: 'text-commercial-gold'
    }
  ];

  const properties: Property[] = [
    {
      id: '1',
      name: 'Lekki Gardens Phase 2',
      type: 'Residential',
      units: 48,
      occupied: 46,
      revenue: '₦4.2M',
      status: 'verified'
    },
    {
      id: '2',
      name: 'Victoria Island Plaza',
      type: 'Commercial',
      units: 24,
      occupied: 22,
      revenue: '₦8.5M',
      status: 'verified'
    },
    {
      id: '3',
      name: 'Ikeja Shopping Complex',
      type: 'Commercial',
      units: 36,
      occupied: 34,
      revenue: '₦6.8M',
      status: 'verified'
    },
    {
      id: '4',
      name: 'Banana Island Towers',
      type: 'Residential',
      units: 72,
      occupied: 68,
      revenue: '₦12.4M',
      status: 'verified'
    },
    {
      id: '5',
      name: 'Ajah Estate',
      type: 'Residential',
      units: 32,
      occupied: 28,
      revenue: '₦2.8M',
      status: 'pending'
    }
  ];

  const rentEntries: RentEntry[] = [
    {
      id: '1',
      tenant: 'Adewale Johnson',
      property: 'Lekki Gardens Phase 2',
      unit: 'A-203',
      amount: '₦450,000',
      dueDate: '2026-06-25',
      status: 'paid'
    },
    {
      id: '2',
      tenant: 'Chioma Okonkwo',
      property: 'Victoria Island Plaza',
      unit: 'B-105',
      amount: '₦1,200,000',
      dueDate: '2026-06-28',
      status: 'pending'
    },
    {
      id: '3',
      tenant: 'Ibrahim Hassan',
      property: 'Banana Island Towers',
      unit: 'C-401',
      amount: '₦850,000',
      dueDate: '2026-06-15',
      status: 'overdue'
    },
    {
      id: '4',
      tenant: 'Funmi Akintola',
      property: 'Ikeja Shopping Complex',
      unit: 'D-102',
      amount: '₦680,000',
      dueDate: '2026-06-30',
      status: 'pending'
    }
  ];

  const urgentTasks: Task[] = [
    {
      id: '1',
      title: 'Plumbing repair needed',
      property: 'Lekki Gardens Phase 2',
      priority: 'high',
      dueDate: '2026-06-20'
    },
    {
      id: '2',
      title: 'Annual safety inspection',
      property: 'Victoria Island Plaza',
      priority: 'medium',
      dueDate: '2026-06-22'
    },
    {
      id: '3',
      title: 'HVAC maintenance',
      property: 'Banana Island Towers',
      priority: 'high',
      dueDate: '2026-06-19'
    }
  ];

  const leaseExpirations: LeaseExpiration[] = [
    {
      id: '1',
      tenant: 'Emeka Nwankwo',
      property: 'Lekki Gardens Phase 2',
      unit: 'A-305',
      expiryDate: '2026-07-15',
      daysLeft: 26
    },
    {
      id: '2',
      tenant: 'Yemi Adeyemi',
      property: 'Ajah Estate',
      unit: 'B-201',
      expiryDate: '2026-07-28',
      daysLeft: 39
    },
    {
      id: '3',
      tenant: 'Ngozi Obi',
      property: 'Ikeja Shopping Complex',
      unit: 'C-108',
      expiryDate: '2026-08-05',
      daysLeft: 47
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'paid':
        return 'bg-residential-teal/20 text-residential-teal';
      case 'pending':
        return 'bg-commercial-gold/20 text-commercial-gold';
      case 'overdue':
      case 'flagged':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-600';
      case 'medium':
        return 'bg-commercial-gold/20 text-commercial-gold';
      case 'low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search properties, tenants, or tasks..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-residential-teal focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-gray-600">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-gray-600">person</span>
                <span className="hidden md:block text-sm font-medium text-gray-700">Estate Manager</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Estate Manager Dashboard</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your property portfolio, track rent, and monitor operations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-gray-50 ${stat.color}`}>
                      <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-2">{stat.change}</div>
                </div>
              ))
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Portfolio Overview & Rent Ledger */}
            <div className="xl:col-span-2 space-y-6 md:space-y-8">
              {/* Portfolio Overview */}
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Portfolio Overview</h2>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Your managed properties</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-residential-teal text-white rounded-lg hover:bg-residential-teal/90 transition-colors text-sm">
                      <span className="material-symbols-outlined text-lg">domain</span>
                      <span className="hidden md:inline">Add Property</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Units</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Occupancy</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                        <>
                          <TableRowSkeleton />
                          <TableRowSkeleton />
                          <TableRowSkeleton />
                        </>
                      ) : (
                        properties.map((property) => (
                          <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900 text-sm">{property.name}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs md:text-sm text-gray-600">{property.type}</span>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                              <span className="text-sm text-gray-900">{property.units}</span>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-residential-teal rounded-full transition-all duration-300"
                                    style={{ width: `${(property.occupied / property.units) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {property.occupied}/{property.units}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-gray-900 text-sm">{property.revenue}</span>
                                {property.status === 'verified' && (
                                  <span className="material-symbols-outlined text-residential-teal text-sm">verified_user</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                {property.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-gray-400 text-xl">more_vert</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rent Ledger */}
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900">Rent Ledger</h2>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Recent rent payments and due dates</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <span className="material-symbols-outlined text-lg">event_note</span>
                      <span className="hidden md:inline">View All</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tenant</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Property</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Unit</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                        <>
                          <TableRowSkeleton />
                          <TableRowSkeleton />
                          <TableRowSkeleton />
                        </>
                      ) : (
                        rentEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900 text-sm">{entry.tenant}</div>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                              <span className="text-sm text-gray-600">{entry.property}</span>
                            </td>
                            <td className="py-4 px-4 hidden sm:table-cell">
                              <span className="text-sm text-gray-600">{entry.unit}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-gray-900 text-sm">{entry.amount}</span>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                              <span className="text-sm text-gray-600">{entry.dueDate}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Urgent Tasks & Lease Expirations */}
            <div className="space-y-6 md:space-y-8">
              {/* Urgent Tasks */}
              <div className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300">
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Urgent Tasks</h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">High-priority items requiring attention</p>
                </div>
                <div className="p-4 md:p-6 space-y-4">
                  {isLoading ? (
                    <>
                      <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                    </>
                  ) : (
                    urgentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-residential-teal hover:shadow-sm transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{task.property}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="material-symbols-outlined text-sm">event_note</span>
                          <span>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lease Expirations */}
              <div className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300">
                <div className="p-4 md:p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-commercial-gold text-xl">event_note</span>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Lease Expirations</h2>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">Upcoming lease renewals</p>
                </div>
                <div className="p-4 md:p-6 space-y-4">
                  {isLoading ? (
                    <>
                      <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    </>
                  ) : (
                    leaseExpirations.map((lease) => (
                      <div
                        key={lease.id}
                        className="p-4 bg-commercial-gold/10 border border-commercial-gold/30 rounded-lg hover:bg-commercial-gold/20 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{lease.tenant}</h3>
                            <p className="text-xs text-gray-600 mt-1">{lease.property} - {lease.unit}</p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 bg-white rounded-full text-xs font-semibold text-commercial-gold">
                            {lease.daysLeft}d
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500">Expires: {lease.expiryDate}</span>
                          <button className="text-xs font-semibold text-commercial-gold hover:underline">
                            Renew
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Premium Security Verification Card */}
              <div className="bg-gradient-to-br from-residential-teal to-residential-teal/80 rounded-xl shadow-card overflow-hidden hover:shadow-card-hover hover:scale-105 transition-all duration-300">
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <span className="material-symbols-outlined text-white text-3xl">shield</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Security Verified</h3>
                      <p className="text-xs text-white/80 mt-0.5">All properties compliance-checked</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 mb-6 leading-relaxed">
                    Your portfolio is fully verified and meets all Nigerian property compliance standards.
                  </p>
                  <button className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80 transition-colors group">
                    <span>Learn More</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
