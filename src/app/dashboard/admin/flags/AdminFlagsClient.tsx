'use client';

import { useState } from 'react';

export default function AdminFlagsClient({ error: controlledError, onRetry }: { error?: string | null; onRetry?: () => void } = {}) {
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
      <div className="rounded-lg border border-border bg-white p-12 text-center shadow-card">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No flagged items</h3>
        <p className="mt-1 text-gray-500">Flagged listings and reports will appear here for review.</p>
      </div>
    </section>
  );
}
