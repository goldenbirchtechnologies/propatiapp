import { useState, useEffect } from 'react';

/** Types for billing information */
export interface BillingPeriod {
  start: string; // ISO date
  end: string;   // ISO date
}
export interface BillingItem {
  description: string;
  amountCents: number;
  currency: string;
  period: BillingPeriod;
}
export interface BillingData {
  organizationId: string;
  currentPlan: string;
  nextBillingDate: string; // ISO date
  items: BillingItem[];
}

/**
 * Mock fetch - replace with real API call later.
 */
async function fetchBilling(organizationId: string): Promise<BillingData> {
  await new Promise(r => setTimeout(r, 500)); // simulated latency
  return {
    organizationId,
    currentPlan: 'Pro',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        description: 'Monthly subscription',
        amountCents: 1999,
        currency: 'USD',
        period: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    ],
  } as BillingData;
}

/**
 * useOrganizationBilling – fetches billing data for the provided organization ID.
 *
 * @param organizationId The organization whose billing info should be retrieved.
 * @returns { data?, isLoading, error? }
 */
export function useOrganizationBilling(organizationId: string) {
  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setError(new Error('No organization ID provided'));
      return;
    }
    setLoading(true);
    fetchBilling(organizationId)
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(err => setError(err as Error))
      .finally(() => setLoading(false));
  }, [organizationId]);

  return { data, isLoading, error };
}

