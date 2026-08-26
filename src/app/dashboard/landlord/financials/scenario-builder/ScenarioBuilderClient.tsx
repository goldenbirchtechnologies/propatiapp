import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders } from 'lucide-react';

export default function FinancialScenarioBuilderClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Scenario Builder</h1>
        <p className="text-zinc-500 mt-1">Model rent, occupancy, and revenue outcomes under different assumptions.</p>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Assumptions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-zinc-500">Average Rent</p>
              <p className="text-xl font-semibold">₦420,000</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Occupancy Target</p>
              <p className="text-xl font-semibold">95%</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Lease Cycle</p>
              <p className="text-xl font-semibold">12 Months</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08] flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Scenarios</h3>
          <Button variant="outline" className="gap-2">
            <Sliders className="h-4 w-4" />
            New Scenario
          </Button>
        </div>
        <div className="p-6">
          <p className="text-sm text-zinc-500">Use the Scenario Builder to configure and save custom models.</p>
        </div>
      </div>
    </div>
  );
}
