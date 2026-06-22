'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: Record<string, unknown>;
  isActive: boolean;
};

type Subscription = {
  id: string;
  planId: string;
  userId: string;
  status: string;
  currentPeriodEnd: string;
};

export default function adminPaymentsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', price: '', currency: 'NGN', interval: 'month', features: '{}' });

  const plansQuery = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await fetch('/api/admin/subscription-plans');
      if (!res.ok) throw new Error('Failed to load subscription plans');
      return (await res.json()) as { plans: SubscriptionPlan[] };
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const res = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      if (!res.ok) throw new Error('Failed to create plan');
      return (await res.json()) as { plan: SubscriptionPlan };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      setForm({ name: '', price: '', currency: 'NGN', interval: 'month', features: '{}' });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createPlanMutation.mutate({
      name: form.name,
      price: Number(form.price),
      currency: form.currency,
      interval: form.interval,
      features: JSON.parse(form.features || '{}'),
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Admin Payments</h1>
        <p className="text-gray-500">Manage pricing, plans, and subscription signals</p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-3 rounded border border-gray-200 p-4">
        <input
          className="rounded border p-2"
          placeholder="Plan name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
        <input
          className="rounded border p-2"
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          required
        />
        <input
          className="rounded border p-2"
          placeholder="Currency"
          value={form.currency}
          onChange={(event) => setForm({ ...form, currency: event.target.value })}
          required
        />
        <label className="text-sm font-medium">
          Interval
          <select
            className="ml-2 rounded border p-2"
            value={form.interval}
            onChange={(event) => setForm({ ...form, interval: event.target.value })}
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </label>
        <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white">
          {createPlanMutation.isPending ? 'Saving...' : 'Add Plan'}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        {plansQuery.isLoading ? (
          <p>Loading plans...</p>
        ) : plansQuery.data?.plans.length ? (
          <ul className="space-y-2">
            {plansQuery.data.plans.map((plan) => (
              <li key={plan.id} className="rounded border border-gray-200 p-3">
                <div className="font-semibold">{plan.name}</div>
                <div className="text-sm text-gray-500">
                  {plan.price} {plan.currency} / {plan.interval}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No plans yet.</p>
        )}
      </section>
    </div>
  );
}
