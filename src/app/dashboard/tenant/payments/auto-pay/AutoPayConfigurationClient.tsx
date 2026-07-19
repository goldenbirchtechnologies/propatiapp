'use client'

import AppIcon from '@/components/icons/app-icon';

import { useState } from 'react';
import Link from 'next/link';
import {

  ChevronRight, CreditCard, Shield, Zap, Home, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

const paymentMethods = [
  {
    id: 'visa',
    label: 'Visa Card •••• 4242',
    sub: 'Expires 08/25',
    badge: 'VISA',
    selected: true,
  },
  {
    id: 'gtb',
    label: 'GTBank Account •••• 0192',
    sub: 'A. Olumide',
    badge: 'GTB',
    selected: false,
  },
];

const timingOptions = [
  { label: 'On due date', active: false },
  { label: '3 days before', active: true },
  { label: '5 days before', active: false },
];

const categories = [
  { id: 'rent', label: 'Monthly Rent', icon: Home, active: true },
  { id: 'utilities', label: 'Utilities', icon: Zap, active: true },
  { id: 'service', label: 'Service Charge', icon: Sparkles, active: false },
];

export default function AutoPayConfigurationClient() {
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [maxLimit, setMaxLimit] = useState('1,500,000');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/tenant/payments" className="font-mono text-muted-foreground hover:text-primary transition-colors">
          PAYMENTS
        </Link>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-primary font-semibold">AUTO-PAY SETTINGS</span>
      </nav>

      {/* Header */}
      <div className="space-y-xs">
        <h2 className="font-heading text-headline-lg text-primary">Manage Automated Payments</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Automate your monthly payments to avoid late fees and maintain your{' '}
          <span className="text-on-tertiary-container font-semibold">Perfect Payer status</span>.
        </p>
      </div>

      {/* Master Toggle Card */}
      <Card className="border-border">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-bright text-on-tertiary-fixed flex items-center justify-center">
              <Zap className="w-6 h-6" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
            <div>
              <h3 className="font-heading text-headline-sm">Global Auto-Pay Status</h3>
              <p className="text-body-sm text-on-surface-variant">
                Enable to allow the system to process scheduled charges automatically.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md bg-[#009e6f]/10 text-on-tertiary-container px-3 py-1 rounded-full flex items-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-[#009e6f]"></span>
              ACTIVE
            </span>
            <Switch checked={globalEnabled} onCheckedChange={setGlobalEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payment & Timing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-heading text-lg">Payment Method</CardTitle>
              <button className="text-primary font-label-md label-md hover:underline flex items-center gap-xs">
                <AppIcon name="add_circle" className="lucide" />
                Add
              </button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Auto-pay method will appear here once configured.</p>
            </CardContent>
          </Card>

          {/* Automation Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Automation Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timing */}
              <div className="space-y-3">
                <p className="font-label-md text-label-md text-on-surface-variant">PAYMENT TIMING</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {timingOptions.map((opt) => (
                    <button
                      key={opt.label}
                      className={`p-3 rounded-lg text-body-sm font-semibold transition-all border ${
                        opt.active
                          ? 'border-2 border-[#0a2540] bg-surface-container-low text-primary'
                          : 'border border-border hover:border-primary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limit */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-label-md text-label-md text-on-surface-variant">
                    MAXIMUM PAYMENT LIMIT (OPTIONAL)
                  </p>
                  <span className="lucide text-on-surface-variant cursor-help" title="Security measure: Transactions above this amount will require manual approval.">
                    info
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">₦</span>
                  <Input
                    type="text"
                    value={maxLimit}
                    onChange={(e) => setMaxLimit(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-surface-container-low border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-heading-sm text-headline-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Categories & Summary */}
        <div className="space-y-6">
          {/* Category Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Active Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AppIcon name={
                      cat.id === 'rent' ? 'home' : cat.id === 'utilities' ? 'bolt' : 'cleaning_services'
                    } className="lucide" />
                    <span className="font-body-md font-medium">{cat.label}</span>
                  </div>
                  <Switch checked={cat.active} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary & Security */}
          <Card className=" text-foreground border-none shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#feae2c]/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <CardContent className="p-5 space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="lucide text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <span className="font-label-sm label-sm tracking-widest text-primary-foreground uppercase">
                  Secure Automation
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-body-sm text-primary-foreground">Next scheduled payment</p>
                <p className="font-headline-md headline-md">₦450,000.00</p>
                <p className="text-secondary-container font-bold text-body-md">September 27, 2023</p>
              </div>
              <div className="pt-3 border-t border-on-primary-container/20">
                <p className="text-body-sm text-primary-foreground italic">
                  Payments are processed at 09:00 AM WAT. Ensure sufficient funds are available.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full py-3 bg-primary text-foreground rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95">
              Save Configuration
            </Button>
            <Button variant="outline" className="w-full py-3 border border-outline text-on-surface-variant rounded-xl font-bold hover:bg-surface-variant transition-all">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <footer className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <AppIcon name="lock" className="lucide" />
            <span className="text-body-sm text-on-surface-variant">Bank-grade Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <AppIcon name="verified" className="lucide" />
            <span className="text-body-sm text-on-surface-variant">Central Bank Licensed</span>
          </div>
        </div>
        <p className="text-body-sm text-on-surface-variant">© 2024 PROPATI Nigerian Real Estate Fintech. All rights reserved.</p>
      </footer>
    </div>
  );
}
