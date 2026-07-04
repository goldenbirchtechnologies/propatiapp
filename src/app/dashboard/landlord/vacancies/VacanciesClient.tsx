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
      open: 'tag-green',
      filled: 'tag-blue',
      closed: 'tag-gray',
      draft: 'tag-amber',
    };
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return <span className={`tag ${config[status]}`}>{label}</span>;
  }

  function VacancyTableSkeleton() {
    return (
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Property
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Type
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Rent
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Applicants
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Listed
              </th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
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
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            Vacancies
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Track active vacancies, applicants count, and listing performance
          </p>
        </div>
        <Link href="/dashboard/landlord/listing/new" className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          List Property
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
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search property or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: 'var(--muted)' }} />
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
          <div className="card-body text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>
              No vacancies found
            </h3>
            <p style={{ color: 'var(--muted)' }}>
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Vacancies will appear here once you list your properties.'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link href="/dashboard/landlord/listing/new" className="btn btn-primary mt-4">
                <Plus className="w-4 h-4 mr-2" />
                List Your First Property
              </Link>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Property
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Type
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Rent
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Applicants
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Days Listed
                    </th>
                    <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacancies.map((vacancy) => (
                    <tr key={vacancy.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                          >
                            <HomeIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/landlord/properties/${vacancy.propertyId}`}
                              className="font-medium hover:underline"
                              style={{ color: 'var(--text)' }}
                            >
                              {vacancy.property}
                            </Link>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {vacancy.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="tag tag-blue">{vacancy.type}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={vacancy.status} />
                      </td>
                      <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>
                        {vacancy.rent}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                          <span style={{ color: 'var(--text)' }}>{vacancy.applicants}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="flex items-center gap-1"
                          style={{ color: vacancy.daysListed > 30 ? 'var(--red)' : 'var(--text)' }}
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
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
            {label}
          </p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
            {value}
          </p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
            {trendPositive ? '↑' : '↓'}
          </span>
          <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
