'use client';

import { useState } from 'react';
import { useAgreements } from '@/hooks/useAgreements';
import { useAgreementStatus } from '@/hooks/useAgreements';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Pen, Download, Eye, AlertCircle, CheckCircle, Clock, Home, Shield } from 'lucide-react';
import Link from 'next/link';

const mockAgreements = [
  {
    id: 'agr_abc123',
    listing: { title: 'Modern Apartment in Lekki Phase 1', area: 'Lekki', images: [{ url: 'https://example.com/img1.jpg', isCover: true }] },
    tenant: { fullName: 'John Doe', email: 'john@example.com' },
    type: 'rental',
    status: 'fully_signed',
    rentAmount: 2500000,
    rentPeriod: 'yearly',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    createdAt: '2025-12-15',
    signatures: [
      { userId: 'landlord', user: { fullName: 'Jane Smith' }, signedAt: '2025-12-15' },
      { userId: 'tenant', user: { fullName: 'John Doe' }, signedAt: '2025-12-16' },
    ],
  },
  {
    id: 'agr_def456',
    listing: { title: '2 Bedroom Flat in Ikeja GRA', area: 'Ikeja', images: [] },
    tenant: { fullName: 'Mary Johnson', email: 'mary@example.com' },
    type: 'rental',
    status: 'pending_tenant',
    rentAmount: 1800000,
    rentPeriod: 'yearly',
    startDate: '2026-02-01',
    endDate: '2027-01-31',
    createdAt: '2026-01-20',
    signatures: [
      { userId: 'landlord', user: { fullName: 'Jane Smith' }, signedAt: '2026-01-20' },
    ],
  },
  {
    id: 'agr_ghi789',
    listing: { title: 'Duplex in Victoria Island', area: 'Victoria Island', images: [] },
    tenant: { fullName: 'Peter Okonkwo', email: 'peter@example.com' },
    type: 'rental',
    status: 'draft',
    rentAmount: 5000000,
    rentPeriod: 'yearly',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    createdAt: '2026-02-10',
    signatures: [],
  },
];

export default function TenantAgreementsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: agreementsData } = useAgreements({ limit: 20 });
  const agreements = agreementsData?.data || mockAgreements;

  const statusTabs = [
    { value: 'all', label: 'All', count: agreements.length },
    { value: 'active', label: 'Active', count: agreements.filter(a => ['fully_signed', 'tenant_signed', 'landlord_signed'].includes(a.status)).length },
    { value: 'pending', label: 'Pending', count: agreements.filter(a => ['pending_landlord', 'pending_tenant'].includes(a.status)).length },
    { value: 'expired', label: 'Expired', count: agreements.filter(a => a.status === 'expired').length },
  ];

  const filteredAgreements = activeTab === 'all'
    ? agreements
    : agreements.filter(a =>
        (activeTab === 'active' && ['fully_signed', 'tenant_signed', 'landlord_signed'].includes(a.status)) ||
        (activeTab === 'pending' && ['pending_landlord', 'pending_tenant'].includes(a.status)) ||
        (activeTab === 'expired' && a.status === 'expired')
      );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            My Agreements
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            View and manage your rental agreements
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={agreements.length} icon={<FileText />} />
        <StatCard label="Active" value={agreements.filter(a => a.status === 'fully_signed').length} icon={<CheckCircle />} trendPositive />
        <StatCard label="Pending" value={agreements.filter(a => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length} icon={<Clock />} />
        <StatCard label="Expired" value={agreements.filter(a => a.status === 'expired').length} icon={<AlertCircle />} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'flex items-center gap-2',
              activeTab === tab.value && 'bg-accent/10 text-accent'
            )}
            onClick={() => setActiveTab(tab.value)}
          >
            <span className="font-medium">{tab.label}</span>
            <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
          </TabsTrigger>
        ))}
      </div>

      {/* Agreements List */}
      <div className="space-y-4">
        {filteredAgreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
        {filteredAgreements.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No agreements found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>
              {activeTab === 'all' ? 'You don\'t have any agreements yet.' : `No ${activeTab} agreements.`}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function AgreementCard({ agreement }: { agreement: any }) {
  const statusInfo = useAgreementStatus(agreement);
  const coverImage = agreement.listing?.images?.find((img: any) => img.isCover) || agreement.listing?.images?.[0];

  const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
    draft: { class: 'tag-amber', label: 'Draft', icon: <FileText className="w-3 h-3 mr-1" /> },
    pending_landlord: { class: 'tag-blue', label: 'Pending Landlord', icon: <Clock className="w-3 h-3 mr-1" /> },
    pending_tenant: { class: 'tag-blue', label: 'Pending Your Signature', icon: <Pen className="w-3 h-3 mr-1" /> },
    tenant_signed: { class: 'tag-teal', label: 'You Signed', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    landlord_signed: { class: 'tag-teal', label: 'Landlord Signed', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    fully_signed: { class: 'tag-green', label: 'Fully Signed ✓', icon: <Shield className="w-3 h-3 mr-1" /> },
    terminated: { class: 'tag-red', label: 'Terminated', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
    expired: { class: 'tag-gray', label: 'Expired', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
  };

  const cfg = statusConfig[agreement.status] || statusConfig.draft;
  const isSignable = ['pending_tenant', 'tenant_signed', 'landlord_signed'].includes(agreement.status);

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Property Image */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: 'var(--border)' }}>
            {coverImage ? (
              <img src={coverImage.url} alt={agreement.listing?.title} className="w-full h-full object-cover" />
            ) : (
              <Home className="w-8 h-8 mx-auto my-auto" style={{ color: 'var(--muted)' }} />
            )}
          </div>

          {/* Agreement Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>{agreement.listing?.title || 'Unknown Property'}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{agreement.listing?.area}, {agreement.listing?.state}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  ID: {agreement.id.slice(-8).toUpperCase()} • Created {new Date(agreement.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <Badge variant={cfg.class.replace('tag-', '') as any} className="flex items-center gap-1 whitespace-nowrap">
                {cfg.icon}
                {cfg.label}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p style={{ color: 'var(--muted)' }}>Rent</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  ₦{Number(agreement.rentAmount || 0).toLocaleString()}/{agreement.rentPeriod}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Period</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {new Date(agreement.startDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })} -{' '}
                  {new Date(agreement.endDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Type</p>
                <p className="font-medium capitalize" style={{ color: 'var(--text)' }}>{agreement.type}</p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Landlord</p>
                <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{agreement.landlord?.fullName || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Link
              href={`/dashboard/tenant/agreements/${agreement.id}`}
              className="btn btn-ghost btn-sm"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {agreement.status === 'fully_signed' && (
              <Link
                href={`/api/agreements/${agreement.id}/pdf`}
                className="btn btn-ghost btn-sm"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </Link>
            )}
            {isSignable && (
              <Link
                href={`/dashboard/tenant/agreements/${agreement.id}/sign`}
                className="btn btn-primary btn-sm"
              >
                <Pen className="w-4 h-4 mr-1" /> Sign Now
              </Link>
            )}
          </div>
        </div>

        {/* Signatures Progress */}
        {agreement.signatures && agreement.signatures.length > 0 && (
          <div className="border-t px-4 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Signatures:</span>
              {['landlord', 'tenant'].map((role) => {
                const sig = agreement.signatures.find((s: any) => s.userId === role);
                return (
                  <div key={role} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${sig ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {sig ? <CheckCircle className="w-4 h-4" /> : role.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text)' }}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                    {sig && <span className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(sig.signedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trendPositive?: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            {Icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileTextIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}
function CheckCircleIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
function ClockIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function AlertCircleIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function ShieldIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function HomeIcon() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function FileText() { return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }