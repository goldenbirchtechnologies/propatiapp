'use client';

import { useQuery } from '@tanstack/react-query';

type Subscription = {
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: string;
};

export default function Subscriptions() {
  const subscriptions = useQuery({
    queryKey: ['subscriptions-user'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error('Failed to load subscriptions');
      return (await res.json()) as { subscriptions: Subscription[] };
    },
  });

  return (
    <div className="space-y-4">
      {subscriptions.isLoading ? <p>Loading...</p> : null}
      {subscriptions.isError ? <p className="text-red-600">Failed to load subscriptions.</p> : null}
      {subscriptions.data?.subscriptions.map((sub) => (
        <div key={sub.id} className="rounded border p-3">
          <div className="font-semibold">Plan ID: {sub.planId}</div>
          <div className="text-sm text-gray-500">Status: {sub.status}</div>
          <div className="text-sm text-gray-500">Renewal: {new Date(sub.currentPeriodEnd).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}
