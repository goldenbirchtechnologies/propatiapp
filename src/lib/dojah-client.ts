'use client';

import { useEffect, useState } from 'react';

export type KycStatus = 'not_started' | 'in_progress' | 'approved' | 'rejected' | 'requires_review';

export interface KycStatusRecord {
  status: KycStatus;
  level: number;
  dojahRef?: string | null;
  verifiedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  metadata?: Record<string, unknown>;
  dojahData?: Record<string, unknown>;
}

export function useKycStatus() {
  const [data, setData] = useState<KycStatusRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/verification/dojah/status', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load verification status');
      const json = await res.json();
      const record = json?.data || {};
      setData({
        status: record.status || 'not_started',
        level: record.level || 1,
        dojahRef: record.dojahRef || null,
        verifiedAt: record.verifiedAt || null,
        rejectedAt: record.rejectedAt || null,
        rejectionReason: record.rejectionReason || null,
        metadata: record.metadata || {},
        dojahData: record.dojahData || {},
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}
