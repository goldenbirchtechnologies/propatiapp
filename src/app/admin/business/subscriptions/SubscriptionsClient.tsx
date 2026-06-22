'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: Record<string, unknown>;
  maxListings: number;
  maxUsers: number;
  maxProperties: number;
  supportLevel?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { subscriptions: number };
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  endedAt?: string;
  paystackCustomerId?: string;
  paystackSubscriptionCode?: string;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface AdminSubscriptionsClientProps {
  initialPlans: SubscriptionPlan[];
  initialSubscriptions: UserSubscription[];
}

export default function AdminSubscriptionsClient({
  initialPlans,
  initialSubscriptions,
}: AdminSubscriptionsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [planSearch, setPlanSearch] = useState('');
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    priceMonthly: '',
    priceYearly: '',
    currency: 'NGN',
    features: '',
    maxListings: '0',
    maxUsers: '1',
    maxProperties: '0',
    supportLevel: '',
    isActive: 'true',
  });
  const [savingPlan, setSavingPlan] = useState(false);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(initialSubscriptions);
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState<string>('all');

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(planSearch.toLowerCase())
  );

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user.fullName.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.user.email.toLowerCase().includes(subSearch.toLowerCase()) ||
      sub.plan.name.toLowerCase().includes(subSearch.toLowerCase());
    const matchesStatus = subStatusFilter === 'all' || sub.status === subStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetPlanForm = useCallback(() => {
    setPlanForm({
      name: '',
      description: '',
      priceMonthly: '',
      priceYearly: '',
      currency: 'NGN',
      features: '',
      maxListings: '0',
      maxUsers: '1',
      maxProperties: '0',
      supportLevel: '',
      isActive: 'true',
    });
    setEditingPlan(null);
  }, []);

  const openCreatePlan = () => {
    resetPlanForm();
    setPlanModalOpen(true);
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      description: plan.description || '',
      priceMonthly: String(plan.priceMonthly),
      priceYearly: String(plan.priceYearly),
      currency: plan.currency,
      features: typeof plan.features === 'object' ? JSON.stringify(plan.features, null, 2) : '',
      maxListings: String(plan.maxListings),
      maxUsers: String(plan.maxUsers),
      maxProperties: String(plan.maxProperties),
      supportLevel: plan.supportLevel || '',
      isActive: String(plan.isActive),
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlan(true);

    try {
      const url = editingPlan ? `/api/admin/subscription-plans/${editingPlan.id}` : '/api/admin/subscription-plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      let parsedFeatures: Record<string, unknown> = {};
      try {
        parsedFeatures = planForm.features ? JSON.parse(planForm.features) : {};
      } catch {
        toast({ title: 'Invalid JSON', description: 'Features field must be valid JSON', variant: 'destructive' });
        setSavingPlan(false);
        return;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name,
          description: planForm.description || null,
          priceMonthly: parseFloat(planForm.priceMonthly),
          priceYearly: parseFloat(planForm.priceYearly),
          currency: planForm.currency,
          features: parsedFeatures,
          maxListings: parseInt(planForm.maxListings || '0'),
          maxUsers: parseInt(planForm.maxUsers || '1'),
          maxProperties: parseInt(planForm.maxProperties || '0'),
          supportLevel: planForm.supportLevel || null,
          isActive: planForm.isActive === 'true',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save plan');
      }

      const { plan } = await res.json();
      if (editingPlan) {
        setPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p)));
      } else {
        setPlans((prev) => [plan, ...prev]);
      }

      toast({ title: 'Success', description: editingPlan ? 'Plan updated' : 'Plan created' });
      setPlanModalOpen(false);
      resetPlanForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Delete this plan? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/subscription-plans/${planId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete plan');
      }
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      toast({ title: 'Success', description: 'Plan deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="tag-green">Active</Badge>;
      case 'cancelled':
        return <Badge className="tag-red">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="tag-yellow">Past Due</Badge>;
      case 'trialing':
        return <Badge className="tag-blue">Trialing</Badge>;
      default:
        return <Badge className="tag-gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
          Subscriptions
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Manage subscription plans and monitor user subscriptions.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full grid grid-cols-2 max-w-md">
          <TabsTrigger value="plans">Plans ({plans.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">User Subscriptions ({subscriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--muted)' }}
              />
              <Input
                placeholder="Search plans..."
                value={planSearch}
                onChange={(e) => setPlanSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={openCreatePlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </div>

          <div className="card overflow-hidden">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
                <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
                  No plans found
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                  Create your first subscription plan to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Name
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Price / Month
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Price / Year
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Quotas
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Subscriptions
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium" style={{ color: 'var(--text)' }}>
                              {plan.name}
                            </span>
                            {plan.description && (
                              <span className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                {plan.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4" style={{ color: 'var(--text)' }}>
                          {plan.currency} {Number(plan.priceMonthly).toLocaleString()}
                        </td>
                        <td className="p-4" style={{ color: 'var(--text)' }}>
                          {plan.currency} {Number(plan.priceYearly).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="text-xs space-y-1" style={{ color: 'var(--muted)' }}>
                            <p>{plan.maxListings} listings</p>
                            <p>{plan.maxUsers} users</p>
                            <p>{plan.maxProperties} properties</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={plan.isActive ? 'tag-green' : 'tag-gray'}>
                            {plan.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="p-4" style={{ color: 'var(--text)' }}>
                          {plan._count?.subscriptions ?? '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditPlan(plan)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[250px]">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                style={{ color: 'var(--muted)' }}
              />
              <Input
                placeholder="Search by user, email, or plan..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="card overflow-hidden">
            {filteredSubs.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--muted)' }} />
                <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
                  No subscriptions found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        User
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Plan
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Period Start
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Period End
                      </th>
                      <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                        Cancel At End
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubs.map((sub) => (
                      <tr key={sub.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <td className="p-4">
                          <div>
                            <span className="font-medium" style={{ color: 'var(--text)' }}>
                              {sub.user.fullName}
                            </span>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {sub.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-4" style={{ color: 'var(--text)' }}>
                          {sub.plan.name}
                        </td>
                        <td className="p-4">{statusBadge(sub.status)}</td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                          {new Date(sub.currentPeriodStart).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                          {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {sub.cancelAtPeriodEnd ? (
                            <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                          ) : (
                            <XCircle className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Plan Create/Edit Modal */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</CardTitle>
              <CardDescription>
                {editingPlan ? 'Update subscription plan details' : 'Create a new subscription plan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePlan} className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Name</label>
                  <Input
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Starter Plan"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Description</label>
                  <Textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of the plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Monthly Price</label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={planForm.priceMonthly}
                      onChange={(e) => setPlanForm((f) => ({ ...f, priceMonthly: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Yearly Price</label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={planForm.priceYearly}
                      onChange={(e) => setPlanForm((f) => ({ ...f, priceYearly: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Max Listings</label>
                    <Input
                      type="number"
                      value={planForm.maxListings}
                      onChange={(e) => setPlanForm((f) => ({ ...f, maxListings: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Max Users</label>
                    <Input
                      type="number"
                      value={planForm.maxUsers}
                      onChange={(e) => setPlanForm((f) => ({ ...f, maxUsers: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Max Properties</label>
                    <Input
                      type="number"
                      value={planForm.maxProperties}
                      onChange={(e) => setPlanForm((f) => ({ ...f, maxProperties: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Support Level</label>
                  <Select
                    value={planForm.supportLevel}
                    onValueChange={(value) => setPlanForm((f) => ({ ...f, supportLevel: value || '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select support level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="dedicated">Dedicated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Features (JSON)</label>
                  <Textarea
                    value={planForm.features}
                    onChange={(e) => setPlanForm((f) => ({ ...f, features: e.target.value }))}
                    placeholder='{"listings": 5, "featured": true}'
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setPlanModalOpen(false); resetPlanForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingPlan}>
                    {savingPlan ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
