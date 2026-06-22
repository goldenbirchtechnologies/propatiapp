'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Wrench, Calendar, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TurnoverStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
type TurnoverPriority = 'low' | 'medium' | 'high' | 'urgent';

const STATUS_CONFIG: Record<
  TurnoverStatus,
  { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', color: 'bg-red-50 border-red-200', variant: 'destructive' },
  assigned: { label: 'Assigned', color: 'bg-blue-50 border-blue-200', variant: 'default' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-50 border-yellow-200', variant: 'secondary' },
  completed: { label: 'Completed', color: 'bg-green-50 border-green-200', variant: 'default' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-50 border-gray-200', variant: 'outline' },
};

const PRIORITY_CONFIG: Record<TurnoverPriority, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Low', variant: 'outline' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'secondary' },
  urgent: { label: 'Urgent', variant: 'destructive' },
};

const COLUMNS: { status: TurnoverStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'assigned', label: 'Assigned' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
  { status: 'cancelled', label: 'Cancelled' },
];

export default function TurnoverPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/turnover-tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const json = await res.json();
      setTasks(json.tasks || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load turnover tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TurnoverStatus) => {
    try {
      const res = await fetch(`/api/turnover-tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      toast({ title: 'Success', description: 'Task updated' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {
      notes: (formData.get('notes') as string) || '',
      priority: (formData.get('priority') as TurnoverPriority) || 'medium',
      scheduledStart: (formData.get('scheduledStart') as string) || undefined,
      scheduledEnd: (formData.get('scheduledEnd') as string) || undefined,
    };
    const listingId = formData.get('listingId') as string;
    const propertyId = formData.get('propertyId') as string;
    const bookingId = formData.get('bookingId') as string | undefined;
    if (listingId) data.listingId = listingId;
    if (propertyId) data.propertyId = propertyId;
    if (bookingId) data.bookingId = bookingId;

    try {
      const res = await fetch('/api/turnover-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create');
      }
      const json = await res.json();
      setTasks((prev) => [json.task, ...prev]);
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: 'Success', description: 'Task created' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turnover Tasks</h1>
          <p className="text-muted-foreground">Cleaning and maintenance scheduling</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Turnover Task</DialogTitle>
              <DialogDescription>Log a new turnover or maintenance task</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Listing ID (optional)</Label>
                <Input name="listingId" placeholder="e.g. lst_..." />
              </div>
              <div>
                <Label>Property ID (optional)</Label>
                <Input name="propertyId" placeholder="e.g. prop_..." />
              </div>
              <div>
                <Label>Booking ID (optional)</Label>
                <Input name="bookingId" placeholder="e.g. bkg_..." />
              </div>
              <div>
                <Label>Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scheduled Start</Label>
                  <Input name="scheduledStart" type="datetime-local" />
                </div>
                <div>
                  <Label>Scheduled End</Label>
                  <Input name="scheduledEnd" type="datetime-local" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea name="notes" placeholder="Task details..." />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {COLUMNS.map(({ status, label }) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <Card key={status} className={cn('flex flex-col', STATUS_CONFIG[status].color)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>{label}</span>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task: any) => (
                    <Card key={task.id} className="bg-white">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-muted-foreground uppercase font-medium">Task</p>
                          <Badge
                            variant={
                              PRIORITY_CONFIG[task.priority as TurnoverPriority]?.variant || 'default'
                            }
                            className="ml-2 shrink-0"
                          >
                            {PRIORITY_CONFIG[task.priority as TurnoverPriority]?.label || task.priority}
                          </Badge>
                        </div>
                        {task.listing && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {task.listing.title}
                          </p>
                        )}
                        {task.assignedToUser && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignedToUser.fullName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.scheduledStart
                            ? new Date(task.scheduledStart).toLocaleDateString()
                            : 'No date'}
                        </p>
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            handleStatusChange(task.id, value as TurnoverStatus)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLUMNS.map((col) => (
                              <SelectItem key={col.status} value={col.status}>
                                {col.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center py-4 text-xs text-muted-foreground">No tasks</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
