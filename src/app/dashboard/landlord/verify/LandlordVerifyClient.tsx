'use client'

import AppIcon from '@/components/icons/app-icon';

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
    in_progress: { class: 'bg-[#262626] text-white border-primary/20', label: 'In Progress', icon: <Clock className="w-3 h-3 mr-1" /> },
    certified: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Verified ✓', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
    rejected: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected', icon: <Clock className="w-3 h-3 mr-1" /> },
    pending: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending Review', icon: <Clock className="w-3 h-3 mr-1" /> },
    approved: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Approved', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold font-headline-sm text-headline-sm text-white">
          Verifications
        </h1>
        <p className="text-neutral-400">
          Track 5-layer property verification and tier status.
        </p>
      </div>

      <DashboardSection loading={false} error={null}>
        {initialVerifications.length === 0 ? (
          <div className="bg-obsidian-800/30 rounded-xl border border-[#262626]-body text-center py-16">
            <Shield className="w-16 h-16 mx-auto mb-4 text-neutral-400" style={{ opacity: 0.5 }} />
            <h3 className="text-white">
              No verifications
            </h3>
            <p className="text-neutral-400">
              Start a verification for your listings to earn the Certified badge.
            </p>
            <Link href="/dashboard/landlord/properties/new" className="btn btn-primary mt-4">
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
                <div key={v.id} className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="bg-[#262626] text-white"
                      >
                        <BuildingIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white">
                          {v.listing?.title || 'Unknown'}
                        </h3>
                        <p className="text-neutral-400">
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
                    <div className="text-neutral-400">
                      <AppIcon name="Progress" className="lucide" />
                      <AppIcon name="{progress}%" className="lucide" />
                    </div>
                    <div className="h-2 rounded-full bg-muted/30">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-gradient-to-br from-primary to-accent"
                        style={{ width: `${progress}%` }}
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
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isCurrent ? 'bg-[#262626] border border-primary' : 'border border-[#262626] bg-transparent'
                          } ${
                            isApproved
                              ? 'bg-[#00ff66]/10 text-[#00ff66]'
                              : isCurrent
                                ? 'bg-[#262626] text-white'
                                : 'bg-outline-variant text-neutral-400'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                            isApproved
                              ? 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20'
                              : isCurrent
                                ? 'bg-[#262626] text-white border-primary/20'
                                : 'bg-outline-variant text-neutral-400 border-[#262626]'
                          }`}>
                            {isApproved ? <CheckCircle className="w-4 h-4" /> : <AppIcon name={index + 1} className="lucide" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white">
                              {layer.label}
                            </p>
                            <p className="text-neutral-400">
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
                  <div className="border-[#262626] flex items-center gap-2">
                    <Link
                      href={`/dashboard/landlord/properties/${v.listingId}`}
                      className="btn btn-secondary w-full justify-center"
                    >
                      Edit Property
                    </Link>
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
