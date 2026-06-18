import { Metadata } from 'next';
import { Tool, Plus, Filter, Search, MoreHorizontal, Edit, Trash2, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export const metadata: Metadata = {
  title: 'Maintenance | PROPATI Estate Manager',
  description: 'Manage maintenance tickets for your properties',
};

const mockTickets = [
  { id: '1', title: 'Leaking pipe in Unit 3B', property: 'Palm Grove Estate', unit: '3B', tenant: 'John Adebayo', category: 'plumbing', priority: 'high', status: 'in_progress', assignedTo: 'Mike Okonkwo', createdAt: '2024-01-15', photoUrls: ['/images/leak1.jpg'] },
  { id: '2', title: 'AC not cooling in Unit 12A', property: 'Victoria Court', unit: '12A', tenant: 'Sarah Okafor', category: 'electrical', priority: 'urgent', status: 'open', assignedTo: null, createdAt: '2024-01-18', photoUrls: [] },
  { id: '3', title: 'Broken window in lobby', property: 'Ikeja Heights', unit: 'Lobby', tenant: 'N/A', category: 'structural', priority: 'medium', status: 'resolved', assignedTo: 'James Peter', createdAt: '2024-01-10', photoUrls: ['/images/window1.jpg'] },
  { id: '4', title: 'Security camera offline', property: 'Lekki Gardens Phase 2', unit: 'Main Gate', tenant: 'N/A', category: 'security', priority: 'high', status: 'assigned', assignedTo: 'Team Lead', createdAt: '2024-01-20', photoUrls: [] },
  { id: '5', title: 'Deep cleaning required', property: 'Adeniyi Jones Plaza', unit: 'Unit 5', tenant: 'Corporate Co.', category: 'cleaning', priority: 'low', status: 'closed', assignedTo: 'Cleaning Crew', createdAt: '2024-01-05', photoUrls: [] },
];

const statusConfig = {
  open: { label: 'Open', variant: 'destructive' as const, icon: AlertCircle },
  assigned: { label: 'Assigned', variant: 'secondary' as const, icon: Clock },
  in_progress: { label: 'In Progress', variant: 'default' as const, icon: Tool },
  resolved: { label: 'Resolved', variant: 'default' as const, icon: CheckCircle },
  closed: { label: 'Closed', variant: 'outline' as const, icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'text-green-600 bg-green-100' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-100' },
};

const categoryLabels: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  structural: 'Structural',
  security: 'Security',
  cleaning: 'Cleaning',
  other: 'Other',
};

export default function EstateManagerMaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground">Track and manage maintenance tickets across your portfolio</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Open" value="12" color="destructive" icon={AlertCircle} />
        <StatCard title="Assigned" value="8" color="secondary" icon={Clock} />
        <StatCard title="In Progress" value="5" color="default" icon={Tool} />
        <StatCard title="Resolved" value="24" color="default" icon={CheckCircle} />
        <StatCard title="This Month" value="3" color="primary" icon={Plus} />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="palm-grove">Palm Grove Estate</SelectItem>
              <SelectItem value="victoria-court">Victoria Court</SelectItem>
              <SelectItem value="ikeja-heights">Ikeja Heights</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Search tickets..." className="w-64" />
          <div className="flex-1" />
          <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ticket</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Property / Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assigned To</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockTickets.map((ticket) => {
                  const status = statusConfig[ticket.status as keyof typeof statusConfig];
                  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={ticket.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground">#{ticket.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{ticket.property}</div>
                        <div className="text-sm text-muted-foreground">Unit {ticket.unit}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{ticket.tenant}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{categoryLabels[ticket.category]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{ticket.assignedTo || '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{ticket.createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon: Icon }: { 
  title: string; 
  value: string; 
  color: 'default' | 'destructive' | 'secondary' | 'primary';
  icon: React.ComponentType<{ className?: string }>;
}) {
  const colors = {
    default: 'bg-muted text-foreground',
    destructive: 'bg-destructive/10 text-destructive',
    secondary: 'bg-secondary/10 text-secondary-foreground',
    primary: 'bg-primary/10 text-primary',
  };
  
  return (
    <div className={`card p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-6 w-6 opacity-60" />
      </div>
    </div>
  );
}