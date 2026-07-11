'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sliders } from 'lucide-react';

const scenarios = [
  { name: 'Baseline', rent: '₦5.2M', occupancy: '92%', vacancy: '4 units' },
  { name: 'Growth Plan', rent: '₦5.8M', occupancy: '95%', vacancy: '2 units' },
  { name: 'Stress Test', rent: '₦4.6M', occupancy: '85%', vacancy: '12 units' },
];

export default function LandlordScenarioBuilderPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Landlord'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Scenario Builder</h1>
          <p className="text-muted-foreground mt-1">
            Model rent, occupancy, and revenue outcomes under different assumptions.
          </p>
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
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scenarios</CardTitle>
            <Button variant="outline" className="gap-2">
              <Sliders className="h-4 w-4" />
              New Scenario
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {scenarios.map((s) => (
                <Card key={s.name}>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">{s.name}</p>
                      <Badge variant="secondary">{s.occupancy}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">{s.rent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vacancy</p>
                      <p className="text-sm">{s.vacancy}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
