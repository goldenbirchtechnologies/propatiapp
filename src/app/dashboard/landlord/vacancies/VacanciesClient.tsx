'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardSection } from '@/components/layout/DashboardShell';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Home as HomeIcon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Building2,
  Users,
} from 'lucide-react';

type VacancyStatus = 'open' | 'filled' | 'closed' | 'draft';
type PropertyType = 'apartment' | 'duplex' | 'flat' | 'office' | 'shop';

interface Vacancy {
  id: string;
  property: string;
  propertyId: string;
  type: PropertyType;
  status: VacancyStatus;
  location: string;
  rent: string;
  listedDate: string;
  daysListed: number;
  views: number;
  applicants: number;
  tenant?: string;
}

export default function VacanciesClient({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | VacancyStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock fetch - replace with real API endpoint
      await new Promise((resolve) => setTimeout(resolve, 800));
      const data: Vacancy[] = [
        {
          id: '1',
          property: 'Lekki Phase 1 Duplex',
          propertyId: 'prop-1',
          type: 'duplex',
          status: 'open',
          location: 'Lekki Phase 1, Lagos',
          rent: '₦3,500,000/yr',
          listedDate: '2025-05-20',
          daysListed: 5,
          views: 124,
          applicants: 8,
        },
        {
          id: '2',
          property: 'Victoria Island Apartment',
          propertyId: 'prop-2',
          type: 'apartment',
          status: 'open',
          location: 'Victoria Island, Lagos',
          rent: '₦4,200,000/yr',
          listedDate: '2025-05-18',
          daysListed: 7,
          views: 98,
          applicants: 5,
        },
        {
          id: '3',
          property: 'Ikeja GRA Flat',
          propertyId: 'prop-3',
          type: 'flat',
          status: 'filled',
          location: 'Ikeja GRA, Lagos',
          rent: '₦2,800,000/yr',
          listedDate: '2025-04-01',
          daysListed: 52,
          views: 245,
          applicants: 12,
          tenant: 'Chinedu Okafor',
        },
        {
          id: '4',
          property: 'Banana Island Office',
          propertyId: 'prop-4',
          type: 'office',
          status: 'draft',
          location: 'Banana Island, Lagos',
          rent: '₦8,000,000/yr',
          listedDate: '2025-05-25',
          daysListed: 0,
          views: 0,
          applicants: 0,
        },
        {
          id: '5',
          property: 'Ajah Shop Space',
          propertyId: 'prop-5',
          type: 'shop',
          status: 'closed',
          location: 'Ajah, Lagos',
          rent: '₦1,500,000/yr',
          listedDate: '2025-03-10',
          daysListed: 76,
          views: 312,
          applicants: 0,
        },
      ];
      setVacancies(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredVacancies = vacancies.filter((v) => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      v.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const totalVacancies = vacancies.length;
  const openVacancies = vacancies.filter((v) => v.status === 'open').length;
  const filledVacancies = vacancies.filter((v) => v.status === 'filled').length;
  const activeListings = vacancies.filter((v) => v.status === 'open').length;
  const totalApplicants = vacancies.reduce((sum, v) => sum + v.applicants, 0);

  function StatusBadge({ status }: { status: VacancyStatus }) {
    const config: Record<VacancyStatus, string> = {
      open: 'bg-success/10 text-[#00ff66] border-success/20',
      filled: 'bg-[#262626] text-white border-primary/20',
      closed: 'bg-zinc-900/30 text-neutral-400 border-muted/50',
      draft: 'bg-warning/10 text-warning border-warning/20',
    };
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <span className={`tag ${config[status]}`}>{label}</span>;
  }

  function VacancyTableSkeleton() {
    return (
      <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-[#262626]">
              <th className="text-neutral-400">
                Property
              </th>
              <th className="text-neutral-400">
                Type
              </th>
              <th className="text-neutral-400">
                Status
              </th>
              <th className="text-neutral-400">
                Rent
              </th>
              <th className="text-neutral-400">
                Applicants
              </th>
              <th className="text-neutral-400">
                Listed
              </th>
              <th className="text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-[#262626]">
                <td className="p-4">
                  <Skeleton className="h-5 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="p-4">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="p-4 text-right">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading font-bold font-headline-sm text-headline-sm text-white">
            Vacancies
          </h1>
          <p className="text-neutral-400">
            Track active vacancies, applicants count, and listing performance
          </p>
        </div>
        <Link href="/dashboard/landlord/listing/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          List to Marketplace
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Vacancies"
          value={String(openVacancies)}
          icon={<HomeIcon className="h-5 w-5" />}
          trend="Active listings"
          trendPositive={openVacancies > 0}
        />
        <StatCard
          label="Total Applicants"
          value={String(totalApplicants)}
          icon={<Users className="h-5 w-5" />}
          trend="Pending review"
          trendPositive={totalApplicants > 0}
        />
        <StatCard
          label="Filled"
          value={String(filledVacancies)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="Tenant matched"
          trendPositive
        />
        <StatCard
          label="Total Listings"
          value={String(totalVacancies)}
          icon={<Building2 className="h-5 w-5" />}
          trend="All properties"
          trendPositive
        />
      </div>

      {/* Filters */}
      <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="text-neutral-400" />
            <input
              type="text"
              placeholder="Search property or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="inp-field"
              style={{ maxWidth: '180px' }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="filled">Filled</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button onClick={load} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Vacancies Table */}
      <DashboardSection
        loading={loading}
        error={error}
        onRetry={load}
        skeleton={<VacancyTableSkeleton />}
      >
        {filteredVacancies.length === 0 ? (
          <div className="bg-obsidian-800/30 rounded-xl border border-[#262626]-body text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-neutral-400" style={{ opacity: 0.5 }} />
            <h3 className="text-white">
              No vacancies found
            </h3>
            <p className="text-neutral-400">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Vacancies will appear here once you list your properties.'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link href="/dashboard/landlord/listing/new" className="btn btn-primary mt-4">
                <Plus className="w-4 h-4 mr-2" />
                List to Marketplace
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-[#262626]">
                    <th className="text-neutral-400">
                      Property
                    </th>
                    <th className="text-neutral-400">
                      Type
                    </th>
                    <th className="text-neutral-400">
                      Status
                    </th>
                    <th className="text-neutral-400">
                      Rent
                    </th>
                    <th className="text-neutral-400">
                      Applicants
                    </th>
                    <th className="text-neutral-400">
                      Days Listed
                    </th>
                    <th className="text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacancies.map((vacancy) => (
                    <tr key={vacancy.id} className="border-[#262626]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="bg-[#262626] text-white"
                          >
                            <HomeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/landlord/properties/${vacancy.propertyId}`}
                              className="text-white"
                            >
                              {vacancy.property}
                            </Link>
                            <p className="text-neutral-400">
                              {vacancy.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-900 text-neutral-400 border border-[#262626]">{vacancy.type}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={vacancy.status} />
                      </td>
                      <td className="text-white">
                        {vacancy.rent}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="text-neutral-400" />
                          <span className="text-white">{vacancy.applicants}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="flex items-center gap-1"
                          className={vacancy.daysListed > 30 ? 'text-red-500' : 'text-white'}
                        >
                          <Clock className="h-3 w-3" />
                          {vacancy.daysListed} days
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/landlord/applications?propertyId=${vacancy.propertyId}`}
                            className="btn btn-ghost btn-sm"
                            title="View Applicants"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/landlord/properties/${vacancy.propertyId}`}
                            className="btn btn-primary btn-sm"
                          >
                            Manage
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DashboardSection>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}) {
  return (
    <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-400">
            {label}
          </p>
          <p className="text-white">
            {value}
          </p>
        </div>
        <div className="bg-[#262626] text-white">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={`text-xs font-medium ${trendPositive ? 'text-[#00ff66]' : 'text-red-500'}`}>
            {trendPositive ? '↑' : '↓'}
          </span>
          <span className={`text-xs ${trendPositive ? 'text-[#00ff66]' : 'text-red-500'}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
