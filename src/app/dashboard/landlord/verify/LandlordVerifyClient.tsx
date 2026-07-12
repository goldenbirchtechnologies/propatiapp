'use client';

import { Shield, FileText, CheckCircle, Clock, ArrowRight as ArrowRightIcon, Building2 as BuildingIcon } from 'lucide-react';
import Link from 'next/link';
import { DashboardSection } from '@/components/layout/DashboardShell';

type Verification = {
  id: string;
  listingId: string;
  listing: { title: string; address: string };
  currentLayer: number;
  overallStatus: string;
  l1Status: string;
  l2Status: string;
  l3Status: string;
  l4Status: string;
  l5Status: string;
};

export default function LandlordVerifyClient({ initialVerifications }: { initialVerifications: Verification[] }) {
  const layerLabels = [
    { key: 'l1Status', label: 'Layer 1: Documents', desc: 'Title deed, survey plan, tax receipts, utility bills' },
    { key: 'l2Status', label: 'Layer 2: Identity', desc: 'NIN/BVN match with document owner' },
    { key: 'l3Status', label: 'Layer 3: Live Video', desc: 'Record video at property with QR code' },
    { key: 'l4Status', label: 'Layer 4: Inspection', desc: 'Agent physical inspection' },
    { key: 'l5Status', label: 'Layer 5: Certified', desc: 'Final approval & badge' },
  ];

  const statusColors: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
    not_started: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Not Started', icon: <Clock className="w-3 h-3 mr-1" /> },
    in_progress: { class: 'bg-accent/10 text-accent border-accent/20', label: 'In Progress', icon: <Clock className="w-3 h-3 mr-1" /> },
    certified: { class: 'bg-success/10 text-success border-success/20', label: 'Verified ✓', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    rejected: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Rejected', icon: <Clock className="w-3 h-3 mr-1" /> },
    pending: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending Review', icon: <Clock className="w-3 h-3 mr-1" /> },
    approved: { class: 'bg-success/10 text-success border-success/20', label: 'Approved', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="font-heading font-bold"
          style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
        >
          Verifications
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Track 5-layer property verification and tier status.
        </p>
      </div>

      <DashboardSection loading={false} error={null}>
        {initialVerifications.length === 0 ? (
          <div className="card-body text-center py-16">
            <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" className="text-primary">
              No verifications
            </h3>
            <p className="text-muted-foreground">
              Start a verification for your listings to earn the Certified badge.
            </p>
            <Link href="/dashboard/landlord/listing/new" className="btn btn-primary mt-4">
              Add Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialVerifications.map((v) => {
              const overallStatus = v.overallStatus || 'not_started';
              const currentLayer = v.currentLayer;
              const overallConfig = statusColors[overallStatus] || statusColors.not_started;

              const approvedCount = [v.l1Status, v.l2Status, v.l3Status, v.l4Status, v.l5Status || 'pending'].filter(
                (s) => s === 'approved'
              ).length;
              const progress = Math.round((approvedCount / 5) * 100);

              return (
                <div key={v.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        className="bg-accent/10 text-accent"
                      >
                        <BuildingIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold" className="text-primary">
                          {v.listing?.title || 'Unknown'}
                        </h3>
                        <p className="text-sm" className="text-muted-foreground">
                          {v.listing?.address}
                        </p>
                      </div>
                    </div>
                    <span className={`tag ${overallConfig.class} flex items-center gap-1`}>
                      {overallConfig.icon}
                      {overallConfig.label}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" className="text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full" className="bg-muted/30">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progress}%`,
                          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                        }}
                      />
                    </div>
                  </div>

                  {/* Tier Indicator */}
                  <div className="space-y-2">
                    {layerLabels.map((layer, index) => {
                      const layerStatus = v[layer.key as keyof Verification] as string || 'pending';
                      const isApproved = layerStatus === 'approved';
                      const isCurrent = index + 1 === currentLayer && overallStatus === 'in_progress';
                      const config = statusColors[layerStatus] || statusColors.pending;

                      return (
                        <div
                          key={layer.key}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{
                            background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                            border: isCurrent ? '1px solid var(--accent)' : '1px solid var(--border)',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: isApproved ? 'var(--green-bg)' : isCurrent ? 'var(--accent-bg)' : 'var(--border)',
                              color: isApproved ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--muted)',
                            }}
                          >
                            {isApproved ? <CheckCircle className="w-4 h-4" /> : <span>{index + 1}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" className="text-primary">
                              {layer.label}
                            </p>
                            <p className="text-xs truncate" className="text-muted-foreground">
                              {layer.desc}
                            </p>
                          </div>
                          <span className={`tag ${config.class} flex items-center gap-1 whitespace-nowrap`}>
                            {config.icon}
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t" className="border-border">
                    {overallStatus === 'certified' ? (
                      <Link
                        href={`/dashboard/landlord/properties/${v.listingId}`}
                        className="btn btn-ghost w-full justify-center"
                      >
                        <BuildingIcon className="w-4 h-4 mr-2" />
                        Manage Property
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/landlord/verify?listingId=${v.listingId}`}
                        className="btn btn-primary w-full justify-center"
                      >
                        {overallStatus === 'not_started' ? 'Start Verification' : 'Continue Verification'}
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardSection>
    </div>
  );
}
