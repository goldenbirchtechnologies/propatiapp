'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wrench, Calendar, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TurnoverStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
type TurnoverPriority = 'low' | 'medium' | 'high' | 'urgent';

const STATUS_CONFIG: Record<
  TurnoverStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'destructive' },
  assigned: { label: 'Assigned', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
};

const PRIORITY_CONFIG: Record<TurnoverPriority, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  low: { label: 'Low', variant: 'outline' },
  medium: { label: 'Medium', variant: 'default' },
  high: { label: 'High', variant: 'secondary' },
  urgent: { label: 'Urgent', variant: 'destructive' },
};

export default function LandlordTurnoverPage() {
  const [tasks, setTasks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/turnover-tasks', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      const res = await fetch(url.toString());
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
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turnover Tasks</h1>
          <p className="text-muted-foreground">Cleaning and maintenance for your properties</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wrench className="h-8 w-8 mb-2" />
              <p className="text-sm">No turnover tasks found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task: unknown) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.listing?.title || 'Unassigned property'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {task.listing && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {task.listing.address}
                          </span>
                        )}
                        {task.scheduledStart && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.scheduledStart).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={PRIORITY_CONFIG[task.priority as TurnoverPriority]?.variant || 'default'}>
                      {PRIORITY_CONFIG[task.priority as TurnoverPriority]?.label || task.priority}
                    </Badge>
                    <Badge variant={STATUS_CONFIG[task.status as TurnoverStatus]?.variant || 'default'}>
                      {STATUS_CONFIG[task.status as TurnoverStatus]?.label || task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
