import { Metadata } from 'next';
import { FileText, Download, BarChart3, Calendar, Filter, Building2, DollarSign, Wrench, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Reports | PROPATI Estate Manager',
  description: 'Generate and export reports for your portfolio',
};

const reportTypes = [
  { id: 'portfolio', name: 'Portfolio Overview', icon: Building2, description: 'Property performance, occupancy, and valuation summary' },
  { id: 'financial', name: 'Financial Report', icon: DollarSign, description: 'Income, expenses, cash flow, and profitability' },
  { id: 'maintenance', name: 'Maintenance Report', icon: Wrench, description: 'Ticket volumes, resolution times, and costs' },
  { id: 'occupancy', name: 'Occupancy Report', icon: Users, description: 'Vacancy rates, lease expirations, and tenant metrics' },
  { id: 'revenue', name: 'Revenue Analysis', icon: TrendingUp, description: 'Revenue trends, forecasts, and growth metrics' },
];

const mockReportData = {
  portfolio: {
    summary: { totalProperties: 24, totalUnits: 156, occupiedUnits: 136, occupancyRate: 87, totalValue: 2.4e9 },
    properties: [
      { name: 'Palm Grove Estate', type: 'Residential', units: 24, occupied: 22, monthlyRent: 850000, value: 450000000 },
      { name: 'Victoria Court', type: 'Commercial', units: 12, occupied: 10, monthlyRent: 2100000, value: 850000000 },
      { name: 'Ikeja Heights', type: 'Residential', units: 36, occupied: 28, monthlyRent: 650000, value: 320000000 },
      { name: 'Lekki Gardens', type: 'Residential', units: 48, occupied: 42, monthlyRent: 950000, value: 580000000 },
    ]
  },
  financial: {
    summary: { totalIncome: 12400000, totalExpenses: 3200000, netIncome: 9200000, margin: 74 },
    breakdown: [
      { category: 'Rent Income', amount: 11800000, percentage: 95 },
      { category: 'Service Charges', amount: 600000, percentage: 5 },
      { category: 'Maintenance', amount: 1800000, percentage: 56 },
      { category: 'Management Fees', amount: 900000, percentage: 28 },
      { category: 'Utilities', amount: 500000, percentage: 16 },
    ]
  }
};

export default function EstateManagerReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and export reports for your portfolio</p>
        </div>
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <ReportCard key={report.id} report={report} Icon={Icon} />
          );
        })}
      </div>

      {/* Generated Reports History */}
      <div className="card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Report</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Generated</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Format</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { name: 'Financial Report', period: 'Jan 2024', date: '2024-02-01', format: 'PDF' },
                  { name: 'Occupancy Report', period: 'Q4 2023', date: '2024-01-15', format: 'PDF' },
                  { name: 'Maintenance Report', period: 'Jan 2024', date: '2024-02-05', format: 'CSV' },
                  { name: 'Portfolio Overview', period: 'Jan 2024', date: '2024-02-10', format: 'PDF' },
                ].map((report, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{report.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{report.period}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{report.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{report.format}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </div>
    </div>
  );
}

function ReportCard({ report, Icon }: { report: typeof reportTypes[0]; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="card p-6 hover:border-primary/50 transition-colors cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{report.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Preview
            </Button>
            <Button variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}