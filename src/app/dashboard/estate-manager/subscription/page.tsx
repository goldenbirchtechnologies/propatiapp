'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Crown, Building2, Users, FileText, TrendingUp, ExternalLink } from 'lucide-react';

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  );
}

export default function SubscriptionPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['estate-manager', 'subscription'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/estate-manager/subscription');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load subscription data');
      }
      return res.json();
    },
  });

  if (isLoading) {
    return <SubscriptionSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (data?.noOrg || !data?.org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No organization found</p>
      </div>
    );
  }

  const org = data.org;
  const subscription = data.subscription;
  const planDetails = data.planDetails;
  const availablePlans = data.availablePlans || [];
  const billingHistory = data.billingHistory || [];
  const unitCount = data.unitCount ?? 0;
  const teamMemberCount = data.teamMemberCount ?? 0;

  const plans = availablePlans.map((plan) => ({
    name: plan.name,
    price: plan.price,
    period: 'month',
    maxUnits: plan.maxUnits === -1 ? 999 : plan.maxUnits,
    maxSeats: plan.maxTeamMembers === -1 ? 20 : plan.maxTeamMembers,
    features: plan.features,
    current: org.planTier === 'starter'
      ? plan.id === 'starter'
      : org.planTier === 'growth'
        ? plan.id === 'professional'
        : plan.id === 'enterprise',
    popular: plan.id === 'professional',
  }));

  const maxUnits = org.maxUnits ?? 0;
  const maxSeats = org.maxSeats ?? 0;

  const usageStats = [
    {
      label: 'Units',
      used: unitCount,
      limit: maxUnits === -1 ? 999 : maxUnits,
      percentage: maxUnits === -1 ? (unitCount > 0 ? 100 : 0) : maxUnits > 0 ? Math.min((unitCount / maxUnits) * 100, 100) : 0,
    },
    {
      label: 'Team Members',
      used: teamMemberCount,
      limit: maxSeats === -1 ? 20 : maxSeats,
      percentage: maxSeats === -1 ? (teamMemberCount > 0 ? 100 : 0) : maxSeats > 0 ? Math.min((teamMemberCount / maxSeats) * 100, 100) : 0,
    },
  ];

  const currentPlan = plans.find((p) => p.current);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the {org.planTier.toUpperCase()} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold capitalize">
                {currentPlan ? `${currentPlan.name} Plan` : `${org.planTier} Plan`}
              </h3>
              <p className="text-muted-foreground">
                {currentPlan
                  ? `₦${currentPlan.price.toLocaleString()}/month`
                  : 'Custom plan'}
              </p>
              {subscription && (
                <p className="text-xs text-muted-foreground mt-1">
                  Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
            <Badge variant="default" className="text-sm">
              Active
            </Badge>
          </div>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold">Usage</h4>
            {usageStats.map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-medium">
                    {stat.used} / {stat.limit === 999 ? 'Unlimited' : stat.limit}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full" asChild>
            <a
              href="https://paystack.com/customer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Manage Billing
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-primary border-2' : ''}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="w-fit mb-2" variant="default">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-white">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                {plan.current ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plans.findIndex((p) => p.current) <
                    plans.findIndex((p) => p.name === plan.name)
                      ? 'Upgrade'
                      : 'Downgrade'}
                  </Button>
                )}
              </CardContent>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="capitalize">{entry.plan}</TableCell>
                    <TableCell>₦{entry.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={entry.status === 'paid' || entry.status === 'released' || entry.status === 'success' ? 'success' : 'secondary'}
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.reference ? (
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={`https://dashboard.paystack.com/#/transactions/${entry.reference}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No billing history yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your first billing entry will appear here once your subscription is active.
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
