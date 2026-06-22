'use client';

import { useQuery } from '@tanstack/react-query';

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: Record<string, unknown>;
};

export default function AdminSubscriptions() {
  const plans = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: async () => {
      const res = await fetch('/api/admin/subscription-plans');
      if (!res.ok) throw new Error('Failed to load plans');
      return (await res.json()) as { plans: SubscriptionPlan[] };
    },
  });

  return (
    <div className="space-y-4">
      {plans.isLoading ? <p>Loading...</p> : null}
      {plans.isError ? <p className="text-red-600">Failed to load plans.</p> : null}
      {plans.data?.plans.map((plan) => (
        <div key={plan.id} className="rounded border p-3">
          <div className="font-semibold">{plan.name}</div>
          <div className="text-sm text-gray-500">
            {plan.price} {plan.currency} / {plan.interval}
          </div>
          <div className="text-xs text-gray-400">Features: {JSON.stringify(plan.features)}</div>
        </div>
      ))}
    </div>
  );
}
