'use client';

import { useState } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import {
  useOrganizationTickets,
  useUpdateOrganizationTicket,
  useTicketStatusConfig,
  useTicketPriorityConfig,
} from '@/hooks/useOrganizationTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Filter, Calendar, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export default function MaintenancePage() {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: ticketsData, isLoading: ticketsLoading } = useOrganizationTickets(
    orgId || '',
    { limit: 100 },
    !!orgId
  );

  const updateTicket = useUpdateOrganizationTicket();
  const statusConfig = useTicketStatusConfig();
  const priorityConfig = useTicketPriorityConfig();

  if (orgsLoading || ticketsLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="h-16 w-16 text-on-surface-variant mb-4" />
        <p className="text-on-surface-variant">No organization found</p>
      </div>
    );
  }

  const tickets = ticketsData?.data || [];

  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || ticket.assignedTo === assigneeFilter;
    return matchesPriority && matchesAssignee;
  });

  const ticketsByStatus: Record<TicketStatus, any[]> = {
    open: [],
    assigned: [],
    in_progress: [],
    resolved: [],
    closed: [],
  };

  filteredTickets.forEach((ticket: any) => {
    const status = ticket.status as TicketStatus;
    if (ticketsByStatus[status]) {
      ticketsByStatus[status].push(ticket);
    }
  });

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await updateTicket.mutateAsync({
        orgId: orgId!,
        ticketId,
        status: newStatus,
      });
      toast({
        title: 'Success',
        description: 'Ticket status updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      });
    }
  };

  const columns: { status: TicketStatus; label: string }[] = [
    { status: 'open', label: 'Open' },
    { status: 'assigned', label: 'Assigned' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Maintenance Tickets</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Track and manage maintenance requests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Create Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Ticket</DialogTitle>
              <DialogDescription>Report a new maintenance issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input placeholder="Brief description" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Detailed description" />
              </div>
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Create Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 text-xs font-label-md uppercase tracking-wider flex items-center" style={{ color: 'text-on-surface-variant' }}>
              <Filter className="h-4 w-4 mr-2" />
              {filteredTickets.length} tickets
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map(({ status, label }) => (
          <Card key={status} className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 animate-fadeIn">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{label}</span>
                <Badge variant="secondary">{ticketsByStatus[status].length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticketsByStatus[status].length > 0 ? (
                ticketsByStatus[status].map((ticket: any) => (
                  <Card key={ticket.id} className="bg-surface-container-lowest">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{ticket.title}</h4>
                        <Badge variant={priorityConfig[ticket.priority as keyof typeof priorityConfig]?.variant || 'default'} className="ml-2 shrink-0">
                          {ticket.priority}
                        </Badge>
                      </div>
                      {ticket.listing && (
                        <p className="text-xs font-label-md uppercase tracking-wider flex items-center gap-1" style={{ color: 'text-on-surface-variant' }}>
                          <Building2 className="h-3 w-3" /> {ticket.listing.title}
                        </p>
                      )}
                      {ticket.assignedToUser && (
                        <p className="text-xs font-label-md uppercase tracking-wider flex items-center gap-1" style={{ color: 'text-on-surface-variant' }}>
                          <User className="h-3 w-3" /> {ticket.assignedToUser.fullName}
                        </p>
                      )}
                      <p className="text-xs font-label-md uppercase tracking-wider flex items-center gap-1" style={{ color: 'text-on-surface-variant' }}>
                        <Calendar className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>
                  No tickets
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
