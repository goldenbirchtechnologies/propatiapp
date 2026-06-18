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
      <div className="space-y-6">
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
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No organization found</p>
      </div>
    );
  }

  const tickets = ticketsData?.data || [];

  // Filter tickets
  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesPriority =
      priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === 'all' || ticket.assignedTo === assigneeFilter;
    return matchesPriority && matchesAssignee;
  });

  // Group tickets by status
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

  const columns: { status: TicketStatus; label: string; color: string }[] = [
    { status: 'open', label: 'Open', color: 'bg-red-100 border-red-200' },
    { status: 'assigned', label: 'Assigned', color: 'bg-blue-100 border-blue-200' },
    { status: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 border-yellow-200' },
    { status: 'resolved', label: 'Resolved', color: 'bg-green-100 border-green-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Tickets</h1>
          <p className="text-muted-foreground">
            Track and manage maintenance requests
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Maintenance Ticket</DialogTitle>
              <DialogDescription>
                Report a new maintenance issue
              </DialogDescription>
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
            <div className="flex-1 text-sm text-muted-foreground flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              {filteredTickets.length} tickets
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map(({ status, label, color }) => (
          <Card key={status} className={`${color}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>{label}</span>
                <Badge variant="secondary">
                  {ticketsByStatus[status].length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticketsByStatus[status].length > 0 ? (
                ticketsByStatus[status].map((ticket: any) => (
                  <Card key={ticket.id} className="bg-white">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {ticket.title}
                        </h4>
                        <Badge
                          variant={
                            priorityConfig[
                              ticket.priority as keyof typeof priorityConfig
                            ]?.variant || 'default'
                          }
                          className="ml-2 shrink-0"
                        >
                          {ticket.priority}
                        </Badge>
                      </div>

                      {ticket.listing && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {ticket.listing.title}
                        </p>
                      )}

                      {ticket.assignedToUser && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.assignedToUser.fullName}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>

                      <Select
                        value={ticket.status}
                        onValueChange={(value) =>
                          handleStatusChange(ticket.id, value as TicketStatus)
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
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
