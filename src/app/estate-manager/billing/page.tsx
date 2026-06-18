import { Metadata } from 'next';
import { CreditCard, DollarSign, Receipt, ArrowUpRight, Settings, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata: Metadata = {
  title: 'Billing | PROPATI Estate Manager',
  description: 'Manage your subscription and billing',
};

const currentPlan = 'growth';
const billingEmail = 'billing@company.com';
const nextBillingDate = '2024-02-15';
const subscriptionStatus = 'active';

const plans = [
  { 
    id: 'starter', 
    name: 'Starter', 
    price: 25000, 
    period: 'month', 
    seats: 1, 
    units: 20, 
    features: ['Portfolio management', 'Rent ledger', 'Basic maintenance', '1 team seat', 'Email support'],
    popular: false 
  },
  { 
    id: 'growth', 
    name: 'Growth', 
    price: 60000, 
    period: 'month', 
    seats: 5, 
    units: 100, 
    features: ['Everything in Starter', 'Advanced maintenance', 'Team management (5 seats)', 'Bulk import', 'Priority support', 'Monthly reports'],
    popular: true 
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise', 
    price: 150000, 
    period: 'month', 
    seats: -1, 
    units: -1, 
    features: ['Everything in Growth', 'Unlimited seats & units', 'White-label option', 'Custom domain', 'Dedicated support', 'API access', 'SSO'],
    popular: false 
  },
];

const mockInvoices = [
  { id: 'inv_001', date: '2024-01-15', amount: 60000, status: 'paid', plan: 'Growth' },
  { id: 'inv_002', date: '2023-12-15', amount: 60000, status: 'paid', plan: 'Growth' },
  { id: 'inv_003', date: '2023-11-15', amount: 25000, status: 'paid', plan: 'Starter' },
  { id: 'inv_004', date: '2023-10-15', amount: 25000, status: 'paid', plan: 'Starter' },
];

export default function EstateManagerBillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription, payment method, and invoices</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <p className="text-muted-foreground">Your active subscription</p>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                    {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next billing</p>
                  <p className="font-medium">{nextBillingDate}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Billing email</p>
                  <p className="font-medium">{billingEmail}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
            <div className="border-l pl-6 md:border-l-0 md:pl-0 md:border-t md:pt-6">
              <p className="text-sm text-muted-foreground mb-2">Current monthly cost</p>
              <div className="text-3xl font-bold text-foreground">
                ₦{plans.find(p => p.id === currentPlan)?.price.toLocaleString()}/{plans.find(p => p.id === currentPlan)?.period}
              </div>
              <p className="text-sm text-muted-foreground">
                {plans.find(p => p.id === currentPlan)?.seats === -1 
                  ? 'Unlimited seats & units' 
                  : `${plans.find(p => p.id === currentPlan)?.seats} seats • ${plans.find(p => p.id === currentPlan)?.units} units`}
              </p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Plan Selection */}
      <div className="card">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} isCurrent={plan.id === currentPlan} />
            ))}
          </div>
        </CardContent>
      </div>

      {/* Invoices */}
      <Tabs defaultValue="invoices">
        <TabsList className="w-full">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment-method">Payment Method</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <div className="card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice History</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Invoice</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-sm">{invoice.id}</td>
                        <td className="px-4 py-3 text-sm">{invoice.date}</td>
                        <td className="px-4 py-3 text-sm">{invoice.plan}</td>
                        <td className="px-4 py-3 font-mono">₦{invoice.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm">Download</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="payment-method" className="mt-4">
          <div className="card">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlanCard({ plan, isCurrent }: { plan: typeof plans[0]; isCurrent: boolean }) {
  return (
    <div className={`relative p-6 rounded-xl border-2 transition-all ${isCurrent ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
      {plan.popular && !isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default" className="text-xs">Most Popular</Badge>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-3xl font-bold">₦{plan.price.toLocaleString()}</span>
          <span className="text-muted-foreground">/{plan.period}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{plan.seats === -1 ? 'Unlimited seats' : `${plan.seats} team seat${plan.seats > 1 ? 's' : ''}`}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{plan.units === -1 ? 'Unlimited units' : `${plan.units} units`}</span>
        </div>
      </div>

      <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Button 
        className="w-full" 
        variant={isCurrent ? 'outline' : 'default'} 
        disabled={isCurrent}
      >
        {isCurrent ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : `Upgrade to ${plan.name}`}
      </Button>
    </div>
  );
}

import { Users, Building2, Check } from 'lucide-react';