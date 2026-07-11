'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download,
  MoreVertical,
} from 'lucide-react';

const projections = [
  { month: 'July 2026', projected: '₦5.2M', actual: '₦5.1M', status: 'On Track' },
  { month: 'August 2026', projected: '₦5.3M', actual: '—', status: 'Forecast' },
  { month: 'September 2026', projected: '₦5.5M', actual: '—', status: 'Forecast' },
  { month: 'October 2026', projected: '₦5.7M', actual: '—', status: 'Forecast' },
];

export default function LandlordFinancialForecastingPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Landlord'}
      userAvatar={user?.imageUrl}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Forecast</h1>
            <p className="text-muted-foreground mt-1">
              Revenue projections and payout forecasting.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Projected Annual Revenue</p>
              <p className="text-2xl font-bold mt-2">₦62.4M</p>
              <p className="text-sm text-green-600 mt-1">+4.8% YoY</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Collections to Date</p>
              <p className="text-2xl font-bold mt-2">₦21.8M</p>
              <p className="text-sm text-muted-foreground mt-1">35% of annual target</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Occupancy Impact</p>
              <p className="text-2xl font-bold mt-2">92%</p>
              <p className="text-sm text-green-600 mt-1">Above 85% threshold</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 font-medium">Month</th>
                    <th className="py-3 font-medium">Projected</th>
                    <th className="py-3 font-medium">Actual</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((row) => (
                    <tr key={row.month} className="border-b last:border-0">
                      <td className="py-3 font-medium">{row.month}</td>
                      <td className="py-3">{row.projected}</td>
                      <td className="py-3">{row.actual}</td>
                      <td className="py-3">
                        <Badge variant={row.status === 'On Track' ? 'default' : 'secondary'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
