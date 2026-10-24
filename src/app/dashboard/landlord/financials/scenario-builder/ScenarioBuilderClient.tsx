import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders } from 'lucide-react';

export default function FinancialScenarioBuilderClient() {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">No Organisation Linked</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">KYC REQUIREMENT: attach a verified legal entity before syndicate listings.</p>
              <div className="mt-2 flex gap-1.5">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase tracking-wider">KYC REQUIREMENT</Badge>
                <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/10 text-[10px] uppercase tracking-wider">3 Overdue</Badge>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Revenue Sources and Streams</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Total stable cash inflow: NGN 11,400,000 paid 30-day cycles.</p>
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">NGN 11,400,000</p>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Operational Expense Allocations</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Quarterly maintenance pool: NGN 28,450,000 on hold.</p>
              <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1">NGN 28,450,000</p>
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Delinquency and Arrears Recovery Desk</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">NGN 11,400,000</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Tenant flagged in LASRERA dispute escalation queue.</p>
            </div>
          </div>
        </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Scenario Builder</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Model rent, occupancy, and revenue outcomes under different assumptions.</p>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Assumptions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Average Rent</p>
              <p className="text-xl font-semibold">₦420,000</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Occupancy Target</p>
              <p className="text-xl font-semibold">95%</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Lease Cycle</p>
              <p className="text-xl font-semibold">12 Months</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08] flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Scenarios</h3>
          <Button variant="outline" className="gap-2">
            <Sliders className="h-4 w-4" />
            New Scenario
          </Button>
        </div>
        <div className="p-6">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Use the Scenario Builder to configure and save custom models.</p>
        </div>
      </div>
    </div>
  );
}