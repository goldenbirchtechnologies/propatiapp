'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  CreditCard,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Mail,
  FileText,
  Users,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
type SubStatus = 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  maxListings: number;
  maxUsers: number;
  maxProperties: number;
  supportLevel: string | null;
  isActive: boolean;
}

interface Subscription {
  id: string;
  orgId: string;
  orgName: string;
  orgBillingEmail: string | null;
  plan: string;
  status: SubStatus;
  amountKobo: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  paystackSubId: string | null;
  createdAt: string;
}

interface Summary {
  totalMRR: number;
  pastDue: number;
  cancelled: number;
}

interface BillingSettingsClientProps {
  initialPlans: SubscriptionPlan[];
  initialSubscriptions: Subscription[];
  summary: Summary;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNGN(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function subStatusBadge(status: SubStatus) {
  switch (status) {
    case 'active':
      return <Badge className="tag-green">Active</Badge>;
    case 'trialing':
      return <Badge className="tag-blue">Trialing</Badge>;
    case 'past_due':
      return <Badge className="tag-amber">Past Due</Badge>;
    case 'cancelled':
      return <Badge className="tag-red">Cancelled</Badge>;
    case 'paused':
      return <Badge className="tag-gray">Paused</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BillingSettingsClient({
  initialPlans,
  initialSubscriptions,
  summary,
}: BillingSettingsClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const plans = initialPlans;
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch =
        s.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.paystackSubId ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const [billingEmailOrgId, setBillingEmailOrgId] = useState<string | null>(null);
  const [billingEmailValue, setBillingEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const openBillingEmailEditor = (sub: Subscription) => {
    setBillingEmailOrgId(sub.orgId);
    setBillingEmailValue(sub.orgBillingEmail ?? '');
  };

  const saveBillingEmail = async () => {
    if (!billingEmailOrgId) return;
    setSavingEmail(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.orgId === billingEmailOrgId ? { ...s, orgBillingEmail: billingEmailValue } : s,
        ),
      );
      toast({
        title: 'Billing email updated',
        description: `Billing email set to ${billingEmailValue}.`,
        className: 'bg-green-50 border-green-200 text-green-800',
      });
      setBillingEmailOrgId(null);
    } catch {
      toast({
        title: 'Update failed',
        description: 'Could not update billing email.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    router.refresh();
  };

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing Settings</h1>
            <p className="text-muted-foreground mt-1">Manage subscription plans and billing.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Unable to load billing data</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
          Billing Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Manage subscription plans, organisation billing, and platform revenue.
        </p>
      </div>

      {/* Summary cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        <style>{`
          @media (max-width: 768px) {
            .billing-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 480px) {
            .billing-summary-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <div className="billing-summary-grid card p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Platform MRR</p>
          </div>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
            {formatNGN(summary.totalMRR)}
          </p>
        </div>
        <div className="billing-summary-grid card p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Total Subscriptions</p>
          </div>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
            {subscriptions.length}
          </p>
        </div>
        <div className="billing-summary-grid card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 tag-amber" />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Past Due</p>
          </div>
          <p className="text-2xl font-bold mt-1 tag-amber">{summary.pastDue}</p>
        </div>
        <div className="billing-summary-grid card p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 tag-red" />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Cancelled/Paused</p>
          </div>
          <p className="text-2xl font-bold mt-1 tag-red">{summary.cancelled}</p>
        </div>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="w-full grid grid-cols-2 max-w-md">
          <TabsTrigger value="subscriptions">Organisation Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="mt-6 space-y-4">
          <div className="card p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: 'var(--muted)' }}
                />
                <Input
                  placeholder="Search by org, plan, or Paystack ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {filteredSubs.length === 0 ? (
            <div className="text-center py-16 card">
              <CreditCard className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
              <p className="text-lg font-medium mt-4" style={{ color: 'var(--muted)' }}>
                No subscriptions found
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'No organisation subscriptions on record yet.'}
              </p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Organisation
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Plan
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Status
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Amount
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Next Billing
                    </th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Billing Email
                    </th>
                    <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((s) => (
                    <tr key={s.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-md flex-shrink-0 flex items-center justify-center"
                            style={{
                              width: 36,
                              height: 36,
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <Building2 className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                              {s.orgName}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {s.paystackSubId ? `Paystack: ${s.paystackSubId}` : 'No Paystack ID'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {s.plan}
                        </span>
                      </td>
                      <td className="p-4">{subStatusBadge(s.status)}</td>
                      <td className="p-4 text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {formatNGN(s.amountKobo)}
                      </td>
                      <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                        {new Date(s.nextBillingDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {s.orgBillingEmail ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" style={{ color: 'var(--muted)' }} />
                            <span
                              className="text-xs truncate"
                              style={{ color: 'var(--text)', maxWidth: 160 }}
                            >
                              {s.orgBillingEmail}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Dialog
                          open={billingEmailOrgId === s.orgId}
                          onOpenChange={(open) => !open && setBillingEmailOrgId(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openBillingEmailEditor(s)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              {s.orgBillingEmail ? 'Edit' : 'Set'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Set Billing Email</DialogTitle>
                              <DialogDescription>
                                Update the billing email for <strong>{s.orgName}</strong>.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                              <div className="space-y-2">
                                <Label htmlFor="billingEmail">Billing Email</Label>
                                <Input
                                  id="billingEmail"
                                  type="email"
                                  placeholder="billing@org.com"
                                  value={billingEmailValue}
                                  onChange={(e) => setBillingEmailValue(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setBillingEmailOrgId(null)}
                                disabled={savingEmail}
                              >
                                Cancel
                              </Button>
                              <Button onClick={saveBillingEmail} disabled={savingEmail}>
                                {savingEmail ? 'Saving...' : 'Save'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-6 space-y-4">
          {plans.length === 0 ? (
            <div className="text-center py-16 card">
              <FileText className="mx-auto h-12 w-12" style={{ color: 'var(--muted)' }} />
              <p className="text-lg font-medium mt-4" style={{ color: 'var(--muted)' }}>
                No subscription plans configured
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                Subscription plans will appear here once defined.
              </p>
            </div>
          ) : (
            <div
              className="grid gap-4 sm:gap-6"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}
            >
              {plans.map((plan) => (
                <div key={plan.id} className="card p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>
                        {plan.name}
                      </h3>
                      {plan.supportLevel && (
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          Support: {plan.supportLevel}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {plan.description && (
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {plan.description}
                    </p>
                  )}

                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Monthly</p>
                      <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                        {formatNGN(plan.priceMonthly * 100)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Yearly</p>
                      <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                        {formatNGN(plan.priceYearly * 100)}
                      </p>
                    </div>
                  </div>

                  {plan.features.length > 0 && (
                    <div className="space-y-1">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 tag-green flex-shrink-0" />
                          <span className="text-xs" style={{ color: 'var(--text)' }}>
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className="flex flex-wrap gap-3 text-xs"
                    style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 12 }}
                  >
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {plan.maxListings > 0 ? `${plan.maxListings} listings max` : 'Unlimited listings'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.maxUsers} user{plan.maxUsers !== 1 ? 's' : ''}
                    </span>
                    {plan.maxProperties > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {plan.maxProperties} properties
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
