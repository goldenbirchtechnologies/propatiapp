'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Pen, Download, Eye, AlertCircle, CheckCircle, Clock, Home, Shield } from 'lucide-react';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  area: string | null;
  state: string | null;
  images: { url: string; isCover: boolean }[];
};

type Landlord = {
  id: string;
  fullName: string | null;
};

type Tenant = {
  id: string;
  fullName: string | null;
};

type Signature = {
  userId: string;
  user: { fullName: string | null };
  signedAt: string;
};

type Agreement = {
  id: string;
  listing: Listing;
  landlord: Landlord | null;
  tenant: Tenant | null;
  type: string;
  status: string;
  rentAmount: number;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  signatures: Signature[];
};

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

export default function TenantAgreementsClient({ initialAgreements }: { initialAgreements: Agreement[] }) {
  const [activeTab, setActiveTab] = useState('all');

  const agreements = initialAgreements;

  const statusTabs = [
    { value: 'all', label: 'All', count: agreements.length },
    { value: 'active', label: 'Active', count: agreements.filter((a) => ['fully_signed', 'tenant_signed', 'landlord_signed'].includes(a.status)).length },
    { value: 'pending', label: 'Pending', count: agreements.filter((a) => ['pending_landlord', 'pending_tenant'].includes(a.status)).length },
    { value: 'expired', label: 'Expired', count: agreements.filter((a) => a.status === 'expired').length },
  ];

  const filteredAgreements = activeTab === 'all'
    ? agreements
    : agreements.filter((a) =>
        (activeTab === 'active' && ['fully_signed', 'tenant_signed', 'landlord_signed'].includes(a.status)) ||
        (activeTab === 'pending' && ['pending_landlord', 'pending_tenant'].includes(a.status)) ||
        (activeTab === 'expired' && a.status === 'expired')
      );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>My Agreements</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>View and manage your rental agreements</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={agreements.length} icon={<FileText />} />
        <StatCard label="Active" value={agreements.filter((a) => a.status === 'fully_signed').length} icon={<CheckCircle />} trendPositive />
        <StatCard label="Pending" value={agreements.filter((a) => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length} icon={<Clock />} />
        <StatCard label="Expired" value={agreements.filter((a) => a.status === 'expired').length} icon={<AlertCircle />} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
              activeTab === tab.value ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'
            )}
          >
            <span>{tab.label}</span>
            <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAgreements.map((agreement) => (
          <AgreementCard key={agreement.id} agreement={agreement} />
        ))}
        {filteredAgreements.length === 0 && (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No agreements found</h3>
            <p style={{ color: 'var(--muted)' }}>{activeTab === 'all' ? "You don't have any agreements yet." : `No ${activeTab} agreements.`}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AgreementCard({ agreement }: { agreement: Agreement }) {
  const coverImage = agreement.listing.images.find((img) => img.isCover) || agreement.listing.images[0];
  const cfg = statusConfig[agreement.status] || statusConfig.draft;
  const isSignable = ['pending_tenant', 'tenant_signed', 'landlord_signed'].includes(agreement.status);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: 'var(--border)' }}>
            {coverImage ? (
              <img src={coverImage.url} alt={agreement.listing.title} className="w-full h-full object-cover" />
            ) : (
              <Home className="w-8 h-8 mx-auto my-auto" style={{ color: 'var(--muted)' }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>{agreement.listing?.title || 'Unknown Property'}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {agreement.listing?.area}{agreement.listing?.state ? `, ${agreement.listing.state}` : ''}
                </p>
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
                <p className="font-medium" style={{ color: 'var(--text)' }}>₦{Number(agreement.rentAmount || 0).toLocaleString()}/{agreement.rentPeriod || 'period'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--muted)' }}>Period</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—'} -
                  {agreement.endDate ? new Date(agreement.endDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }) : '—'}
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

          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Link href={`/dashboard/tenant/agreements/${agreement.id}`} className="btn btn-ghost btn-sm" title="View Details">
              <Eye className="w-4 h-4" />
            </Link>
            {agreement.status === 'fully_signed' && (
              <Link href={`/api/agreements/${agreement.id}/pdf`} className="btn btn-ghost btn-sm" title="Download PDF">
                <Download className="w-4 h-4" />
              </Link>
            )}
            {isSignable && (
              <Link href={`/dashboard/tenant/agreements/${agreement.id}/sign`} className="btn btn-primary btn-sm">
                <Pen className="w-4 h-4 mr-1" /> Sign Now
              </Link>
            )}
          </div>
        </div>

        {agreement.signatures && agreement.signatures.length > 0 && (
          <div className="border-t px-4 py-4 sm:px-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--muted)' }}>Signatures:</span>
              {['landlord', 'tenant'].map((role) => {
                const sig = agreement.signatures.find((s) => s.userId === role);
                return (
                  <div key={role} className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold', sig ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground')}>
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
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trendPositive?: boolean }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{Icon}</div>
      </div>
    </div>
  );
}
