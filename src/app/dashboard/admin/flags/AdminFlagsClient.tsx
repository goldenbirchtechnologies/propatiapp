'use client';

import { useState } from 'react';

export default function AdminFlagsClient({
  error: controlledError,
  onRetry,
  flags,
}: {
  error?: string | null;
  onRetry?: () => void;
  flags?: Array<{
    id: string;
    type: string;
    status: string;
    listing: { title?: string };
    flaggedByUser: { fullName?: string; email?: string };
    createdAt: Date;
  }>;
} = {}) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const error = controlledError ?? internalError;
  const setError = onRetry ? () => {} : setInternalError;

  if (error && onRetry) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Flags</h1>
        <p className="text-muted-foreground">Review flagged listings and user reports.</p>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">Unable to load page</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Flags</h1>
        <p className="text-muted-foreground">Review flagged listings and user reports.</p>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">Unable to load page</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flags</h1>
          <p className="text-muted-foreground mt-1">Review flagged listings and user reports.</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Review Flagged
        </button>
      </div>

      {!flags || flags.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface-container-lowest p-12 text-center shadow-card">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-primary">No flagged items</h3>
          <p className="mt-1 text-on-surface-variant">Flagged listings and reports will appear here for review.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">Listing</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Reported By</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => (
                  <tr key={flag.id} className="border-b border-border last:border-0 hover:bg-surface-container-low/50">
                    <td className="p-3 text-foreground">{flag.listing.title ?? '—'}</td>
                    <td className="p-3 text-foreground capitalize">{flag.type}</td>
                    <td className="p-3 text-foreground">{flag.flaggedByUser.fullName || flag.flaggedByUser.email || '—'}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-foreground capitalize">
                        {flag.status}
                      </span>
                    </td>
                    <td className="p-3 text-foreground">{new Date(flag.createdAt).toLocaleDateString('en-NG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
