'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface PersonRecord {
  id: string;
  name: string;
  email: string | null;
  role: string;
  avatarUrl: string | null;
  verified: boolean | null;
  joinedAt: string | null;
}

interface PeopleClientProps {
  initialPeople: PersonRecord[];
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'agent', label: 'Agent' },
  { value: 'agent', label: 'Agent' },
  { value: 'estate_manager', label: 'Estate Manager' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'service_provider', label: 'Service Provider' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function roleBadge(role: string) {
  const cls: Record<string, string> = {
    admin: 'tag-red',
    landlord: 'tag-green',
    tenant: 'tag-blue',
    agent: 'tag-purple',
    agent: 'tag-amber',
    estate_manager: 'tag-cyan',
    lawyer: 'tag-gray',
    service_provider: 'tag-amber',
  };
  return <Badge className={cls[role] ?? 'tag-gray'}>{role.replace(/_/g, ' ')}</Badge>;
}

function initials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function avatarBg(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function PeopleClient({ initialPeople }: PeopleClientProps) {
  const [people, setPeople] = useState<PersonRecord[]>(initialPeople);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Summary counts
  const counts = useMemo(() => {
    const uniqueRoles = new Set(people.map((p) => p.role));
    const verifiedPeople = people.filter((p) => p.verified).length;
    return {
      total: people.length,
      roles: uniqueRoles.size,
      verified: verifiedPeople,
      unverified: people.length - verifiedPeople,
    };
  }, [people]);

  // Filtered records
  const filtered = useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      const matchesVerified =
        verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' && p.verified) ||
        (verifiedFilter === 'unverified' && !p.verified);
      return matchesSearch && matchesRole && matchesVerified;
    });
  }, [people, searchTerm, roleFilter, verifiedFilter]);

  const handleReset = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setVerifiedFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            People Directory
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Browse and search all registered platform users.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div
        className="grid gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .people-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .people-summary-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="people-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Total Users</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{counts.total}</p>
        </div>
        <div className="people-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Distinct Roles</p>
          <p className="text-2xl font-bold mt-1 tag-blue">{counts.roles}</p>
        </div>
        <div className="people-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Verified</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold tag-green">{counts.verified}</p>
            <CheckCircle2 className="h-5 w-5 tag-green" />
          </div>
        </div>
        <div className="people-summary-grid card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Unverified</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold tag-red">{counts.unverified}</p>
            <AlertCircle className="h-5 w-5 tag-red" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--muted)' }}
            />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* People list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 card">
          <Users className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
          <p className="text-lg font-medium mt-4" style={{ color: 'var(--muted)' }}>
            {searchTerm || roleFilter !== 'all' || verifiedFilter !== 'all'
              ? 'No people match your filters'
              : 'No people found'}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            {searchTerm || roleFilter !== 'all' || verifiedFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'There are no registered users yet.'}
          </p>
          {(searchTerm || roleFilter !== 'all' || verifiedFilter !== 'all') && (
            <Button variant="outline" className="mt-4" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  User
                </th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  Role
                </th>
                <th className="text-left p-4 text-sm font-medium hidden sm:table-cell" style={{ color: 'var(--muted)' }}>
                  Verified
                </th>
                <th className="text-left p-4 text-sm font-medium hidden md:table-cell" style={{ color: 'var(--muted)' }}>
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((person) => (
                <tr
                  key={person.id}
                  className="border-b hover:bg-[var(--surface-hover)] cursor-pointer"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: avatarBg(person.name) }}
                      >
                        {initials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/users`}
                          className="font-medium truncate block hover:underline"
                          style={{ color: 'var(--text)' }}
                        >
                          {person.name}
                        </Link>
                        <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                          {person.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{roleBadge(person.role)}</td>
                  <td className="p-4 hidden sm:table-cell">
                    {person.verified ? (
                      <span className="flex items-center gap-1 text-sm tag-green">
                        <CheckCircle2 className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm tag-gray">
                        <AlertCircle className="h-4 w-4" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm hidden md:table-cell" style={{ color: 'var(--muted)' }}>
                    {person.joinedAt
                      ? new Date(person.joinedAt).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
