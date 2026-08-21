import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sliders } from 'lucide-react';

export default function FinancialScenarioBuilderClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Scenario Builder</h1>
        <p className="text-muted-foreground mt-1">Model rent, occupancy, and revenue outcomes under different assumptions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assumptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Average Rent</p>
              <p className="text-xl font-semibold">₦420,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy Target</p>
              <p className="text-xl font-semibold">95%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lease Cycle</p>
              <p className="text-xl font-semibold">12 Months</p>
            </div>
          </div>
        </CardContent>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Scenarios</CardTitle>
          <Button variant="outline" className="gap-2">
            <Sliders className="h-4 w-4" />
            New Scenario
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Use the Scenario Builder to configure and save custom models.</p>
        </CardContent>
      </div>
    </div>
  );
}
