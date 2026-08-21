'use client';

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Scenario {
  name: string;
  occupancyRate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface ScenarioBuilderClientProps {
  scenarios: Scenario[];
  hasRealData: boolean;
  orgName?: string | null;
}

export default function ScenarioBuilderClient({ scenarios, hasRealData, orgName }: ScenarioBuilderClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold" className="text-white">Financial Scenario Builder</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>
            {hasRealData ? `Projected outcomes for ${orgName || 'your organization'}` : 'Optimistic projections (no organization data available)'}
          </p>
        </div>
        {!hasRealData && (
          <Badge className="bg-amber-500/10 text-neutral-300 border border-amber-500/20 px-3 py-1 text-[10px]">
            Demo Mode
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const net = scenario.monthlyIncome - scenario.monthlyExpenses;
          const margin = scenario.monthlyIncome > 0 ? ((net / scenario.monthlyIncome) * 100).toFixed(1) : '0.0';
          const isPositive = net >= 0;
          return (
            <Card key={scenario.name} className="p-4 border-[#262626] bg-obsidian-800/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline-sm font-bold text-white text-sm">{scenario.name}</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#262626]/10 text-neutral-400 border border-[#262626]">
                  {scenario.occupancyRate.toFixed(0)}% Occ.
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00ff66]" />
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">Monthly Income</p>
                  </div>
                  <p className="text-xl font-bold text-[#00ff66] font-mono">₦{(scenario.monthlyIncome / 1e6).toFixed(2)}M</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">Monthly Expenses</p>
                  </div>
                  <p className="text-xl font-bold text-red-500 font-mono">₦{(scenario.monthlyExpenses / 1e6).toFixed(2)}M</p>
                </div>
                <div className="pt-2 border-t border-[#262626]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">Net Monthly</p>
                    <span className={`text-sm font-bold font-mono ${isPositive ? 'text-[#00ff66]' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}₦{(net / 1e6).toFixed(2)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400">Margin</p>
                    <span className="text-xs font-mono text-neutral-300">{margin}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6 border-[#262626] bg-obsidian-800/30">
        <h3 className="font-headline-sm font-bold text-white mb-4">Scenario Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left p-2 text-[10px] uppercase tracking-wider text-neutral-400">Scenario</th>
                <th className="text-right p-2 text-[10px] uppercase tracking-wider text-neutral-400">Occupancy</th>
                <th className="text-right p-2 text-[10px] uppercase tracking-wider text-neutral-400">Income</th>
                <th className="text-right p-2 text-[10px] uppercase tracking-wider text-neutral-400">Expenses</th>
                <th className="text-right p-2 text-[10px] uppercase tracking-wider text-neutral-400">Net</th>
                <th className="text-right p-2 text-[10px] uppercase tracking-wider text-neutral-400">Margin</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario) => {
                const net = scenario.monthlyIncome - scenario.monthlyExpenses;
                return (
                  <tr key={scenario.name} className="border-b border-[#262626] transition-colors hover:bg-obsidian-800-lowestest">
                    <td className="p-2 text-white font-medium">{scenario.name}</td>
                    <td className="p-2 text-right text-neutral-300 font-mono">{scenario.occupancyRate.toFixed(1)}%</td>
                    <td className="p-2 text-right text-[#00ff66] font-mono">₦{scenario.monthlyIncome.toLocaleString()}</td>
                    <td className="p-2 text-right text-red-500 font-mono">₦{scenario.monthlyExpenses.toLocaleString()}</td>
                    <td className={`p-2 text-right font-mono ${net >= 0 ? 'text-[#00ff66]' : 'text-red-500'}`}>
                      {net >= 0 ? '+' : ''}₦{net.toLocaleString()}
                    </td>
                    <td className="p-2 text-right text-neutral-300 font-mono">
                      {scenario.monthlyIncome > 0 ? ((net / scenario.monthlyIncome) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
