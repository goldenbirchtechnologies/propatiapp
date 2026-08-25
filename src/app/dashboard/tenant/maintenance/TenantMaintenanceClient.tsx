'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader, StatCard, StatusBadge } from '@/components/ui';

type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  property: {
    id: string;
    title: string;
    address: string;
  };
  landlord: {
    fullName: string;
  };
  images: { url: string }[];
  timeline: Array<{
    status: string;
    date: string;
    note: string;
  }>;
}

interface Props {
  tickets: MaintenanceTicket[];
}

export default function TenantMaintenanceClient({ tickets }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filtered = tickets.filter((ticket) => {
    const matchesSearch =
      !searchQuery ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'in_progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'closed': return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'cancelled': return 'bg-zinc-900 text-zinc-400 border-zinc-800';
      default: return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  const priorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-amber-400" />;
      case 'low':
        return <Clock className="h-4 w-4 text-zinc-500" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Maintenance Requests"
        description="Track and manage your maintenance requests"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open" value={String(openCount)} icon={<AlertCircle className="w-5 h-5" />} />
        <StatCard label="In Progress" value={String(inProgressCount)} icon={<Loader2 className="w-5 h-5" />} />
        <StatCard label="Resolved" value={String(resolvedCount)} icon={<CheckCircle2 className="w-5 h-5" />} />
        <StatCard label="Total" value={String(tickets.length)} icon={<Clock className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-zinc-950 border-zinc-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px] bg-zinc-950 border-zinc-800 text-white">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Link href="/dashboard/tenant/maintenance/new">
              <Plus className="h-4 w-4 mr-2" /> New Request
            </Link>
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-semibold text-white mb-2">No maintenance requests</h3>
            <p className="text-zinc-400 mb-4">You haven't submitted any maintenance requests yet.</p>
            <Button asChild>
              <Link href="/dashboard/tenant/maintenance/new">Submit a Request</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ticket) => {
            const image = ticket.images[0]?.url || '/placeholder-property.png';

            return (
              <Card key={ticket.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {priorityIcon(ticket.priority)}
                      <CardTitle className="text-sm font-semibold text-white line-clamp-1">{ticket.title}</CardTitle>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusBadgeClass(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-zinc-500 line-clamp-1">
                    {ticket.property.title} · {ticket.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
                    <img src={image} alt={ticket.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Created {formatDate(ticket.createdAt)}</span>
                    <span className="capitalize">{ticket.priority} priority</span>
                  </div>
                  <Link href={`/dashboard/tenant/maintenance/${ticket.id}`} className="block w-full">
                    <Button variant="outline" size="sm" className="w-full border-zinc-800 text-zinc-400 hover:text-white">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
