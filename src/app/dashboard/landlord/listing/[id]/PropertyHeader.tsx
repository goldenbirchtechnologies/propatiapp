'use client';

import { MapPin } from 'lucide-react';

type Props = {
  title: string;
  location: string;
  status: string;
  verification: { overallStatus: string; currentLayer: number } | null;
  listingType: string;
  propertyType: string | null;
  attributes: string[];
};

function VerificationBadge({ verification }: { verification: Props['verification'] }) {
  if (!verification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-zinc-400 border border-zinc-800">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-[#262626]">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-bold text-white border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-white dark:border-emerald-500/30">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          LAYER {verification.currentLayer}
        </span>
      );
    case 'certified':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40">
          Certified
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/20 dark:bg-red-950/40 dark:text-red-500 dark:border-red-800">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-[#262626]">
          {verification.overallStatus}
        </span>
      );
  }
}

export default function PropertyHeader({
  title,
  location,
  status,
  verification,
  listingType,
  propertyType,
  attributes,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="flex items-center gap-1 mt-1 text-neutral-400">
            <MapPin className="h-4 w-4" />
            {location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag capitalize">{status}</span>
          <VerificationBadge verification={verification} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {attributes.map((attr) => (
          <span key={attr} className="tag">
            {attr}
          </span>
        ))}
      </div>
    </div>
  );
}
