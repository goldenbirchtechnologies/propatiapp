'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Subscription = {
  id: string;
  planId: string;
  plan: {
    id: string;
    name: string;
    description?: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    features: Record<string, unknown>;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export default function Subscriptions() {
  const { toast } = useToast();

  const subscription = useQuery<{ success: boolean; data: { subscription: Subscription | null } }>({
    queryKey: ['subscriptions-user'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions');
      if (!res.ok) throw new Error('Failed to load subscriptions');
      return (await res.json()) as { success: boolean; data: { subscription: Subscription | null } };
    },
  });

  const handleCancel = async () => {
    if (!(subscription as unknown).data?.subscription) return;
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (!res.ok) throw new Error('Failed to cancel subscription');
      toast({ title: 'Success', description: 'Subscription cancelled' });
      subscription.refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel subscription', variant: 'destructive' });
    }
  };

  const sub = (subscription as unknown).data?.subscription;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
          My Subscription
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          View and manage your current plan.
        </p>
      </div>

      {subscription.isLoading && (
        <p style={{ color: 'var(--muted)' }}>Loading subscription...</p>
      )}
      {subscription.isError && (
        <p style={{ color: 'var(--accent)' }} className="text-red-600">Failed to load subscription.</p>
      )}
      {sub ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {sub.plan.name}
              </CardTitle>
              <CardDescription>
                {sub.plan.description || 'No description provided'}
              </CardDescription>
            </div>
            <Badge
              className={
                sub.status === 'active'
                  ? 'tag-green'
                  : sub.status === 'trialing'
                  ? 'tag-blue'
                  : sub.status === 'past_due'
                  ? 'tag-yellow'
                  : 'tag-red'
              }
            >
              {sub.status.replace('_', ' ')}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Monthly</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {sub.plan.currency} {Number(sub.plan.priceMonthly).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Yearly</p>
                <p className="font-medium" style={{ color: 'var(--text)' }}>
                  {sub.plan.currency} {Number(sub.plan.priceYearly).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Current Period</p>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>
                    {new Date(sub.currentPeriodStart).toLocaleDateString()} –{' '}
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {sub.cancelAtPeriodEnd && (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm" style={{ color: 'var(--text)' }}>Cancels at period end</p>
                </div>
              )}
            </div>
            {sub.plan.features && Object.keys(sub.plan.features).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Plan Features</p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--muted)' }}>
                  {Object.entries(sub.plan.features).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className="tag-green text-[10px]">INCLUDED</span>
                      {key}: {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {sub.status === 'active' && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>No active subscription</p>
            <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
              You don’t have an active subscription. Contact support to upgrade.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
