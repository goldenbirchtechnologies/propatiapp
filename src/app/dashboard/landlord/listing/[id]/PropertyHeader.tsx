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
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-outline-variant">
        Not Started
      </span>
    );
  }

  switch (verification.overallStatus) {
    case 'not_started':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-outline-variant">
          Not Started
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:border-primary/30">
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
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-600 border border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/40">
          Certified
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive border border-destructive/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground border border-outline-variant">
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
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">{title}</h1>
          <p className="flex items-center gap-1 mt-1 text-on-surface-variant">
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
