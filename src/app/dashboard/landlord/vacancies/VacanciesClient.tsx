'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardSection } from '@/components/layout/DashboardShell';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import {
  Home as HomeIcon,
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

export default function VacanciesClient({ userId: _userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | VacancyStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/landlord/vacancies');
      if (!res.ok) throw new Error('Failed to load vacancies');
      const json = await res.json();
const rows = Array.isArray(json?.data) ? json.data : [];
const data: Vacancy[] = rows.map((l: { id: string; title: string; status: string; propertyType: string; area?: string; state?: string; address?: string; price?: number; pricePeriod?: string; createdAt: string; viewsCount?: number }) => {
        const listed = new Date(l.createdAt);
        const daysListed = Math.max(0, Math.floor((Date.now() - listed.getTime()) / 86400000));
        const status: VacancyStatus =
          l.status === 'PUBLISHED' ? 'open' :
          l.status === 'RENTED' ? 'filled' :
          l.status === 'DRAFT' ? 'draft' : 'closed';
        return {
          id: l.id,
          property: l.title,
          propertyId: l.id,
          type: (l.propertyType || 'apartment').toLowerCase(),
          status,
          location: [l.area, l.state].filter(Boolean).join(', ') || l.address || '',
          rent: `₦${Number(l.price || 0).toLocaleString()}/${l.pricePeriod === 'monthly' ? 'mo' : 'yr'}`,
          listedDate: listed.toISOString().slice(0, 10),
          daysListed,
          views: l.viewsCount || 0,
          applicants: 0,
        };
      });
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
  const totalApplicants = vacancies.reduce((sum, v) => sum + v.applicants, 0);

  function StatusBadge({ status }: { status: VacancyStatus }) {
    const config: Record<VacancyStatus, string> = {
      open: 'bg-success/10 text-[#10b981] border-success/20',
      filled: 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08]/20',
      closed: 'bg-white dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400 border-muted/50',
      draft: 'bg-warning/10 text-warning border-warning/20',
    };
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <span className={`tag ${config[status]}`}>{label}</span>;
  }

  function VacancyTableSkeleton() {
    return (
      <div className="bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-zinc-200 dark:border-white/[0.08]">
              <th className="text-zinc-600 dark:text-zinc-400">
                Property
              </th>
              <th className="text-zinc-600 dark:text-zinc-400">
                Type
              </th>
              <th className="text-zinc-600 dark:text-zinc-400">
                Status
              </th>
              <th className="text-zinc-600 dark:text-zinc-400">
                Rent
              </th>
              <th className="text-zinc-600 dark:text-zinc-400">
                Applicants
              </th>
              <th className="text-zinc-600 dark:text-zinc-400">
                Listed
              </th>
              <th className="text-zinc-600 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-zinc-200 dark:border-white/[0.08]">
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
          <h1 className="font-heading font-bold font-headline-sm text-zinc-900 dark:text-white text-zinc-900 dark:text-white">
            Vacancies
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
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
          icon={HomeIcon}
          trend="Active listings"
        />
        <StatCard
          label="Total Applicants"
          value={String(totalApplicants)}
          icon={Users}
          trend="Pending review"
        />
        <StatCard
          label="Filled"
          value={String(filledVacancies)}
          icon={CheckCircle2}
          trend="Tenant matched"
          trendDirection="up"
        />
        <StatCard
          label="Total Listings"
          value={String(totalVacancies)}
          icon={Building2}
          trend="All properties"
          trendDirection="up"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/[0.08] p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="text-zinc-600 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search property or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-zinc-600 dark:text-zinc-400" />
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
          <div className="bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/[0.08]-body text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-zinc-600 dark:text-zinc-400" style={{ opacity: 0.5 }} />
            <h3 className="text-zinc-900 dark:text-white">
              No vacancies found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
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
          <div className="bg-white dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-zinc-200 dark:border-white/[0.08]">
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Property
                    </th>
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Type
                    </th>
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Rent
                    </th>
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Applicants
                    </th>
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Days Listed
                    </th>
                    <th className="text-zinc-600 dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacancies.map((vacancy) => (
                    <tr key={vacancy.id} className="border-zinc-200 dark:border-white/[0.08]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                          >
                            <HomeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/landlord/properties/${vacancy.propertyId}`}
                              className="text-zinc-900 dark:text-white"
                            >
                              {vacancy.property}
                            </Link>
                            <p className="text-zinc-600 dark:text-zinc-400">
                              {vacancy.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-50 dark:bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">{vacancy.type}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={vacancy.status} />
                      </td>
                      <td className="text-zinc-900 dark:text-white">
                        {vacancy.rent}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="text-zinc-600 dark:text-zinc-400" />
                          <span className="text-zinc-900 dark:text-white">{vacancy.applicants}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`flex items-center gap-1 ${vacancy.daysListed > 30 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}
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
