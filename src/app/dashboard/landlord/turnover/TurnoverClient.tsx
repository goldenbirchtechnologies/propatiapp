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

export type TaskRow = {
  id: string;
  listing?: { title: string; address?: string };
  priority: TurnoverPriority;
  status: TurnoverStatus;
  scheduledStart?: string;
};

interface TurnoverClientProps {
  initialTasks: TaskRow[];
}

export default function TurnoverClient({ initialTasks }: TurnoverClientProps) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    setTasks(initialTasks);
    setLoading(false);
  }, [initialTasks, statusFilter]);

  const filtered = statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turnover Tasks</h1>
          <p className="text-zinc-500">Cleaning and maintenance for your properties</p>
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

      <div className="glass-card">
        <div className="p-6 p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Wrench className="h-8 w-8 mb-2" />
              <p className="text-sm">No turnover tasks found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white shrink-0">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {task.listing?.title || 'Unassigned property'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {task.listing && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {task.listing.address || '—'}
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
                    <Badge variant={PRIORITY_CONFIG[task.priority]?.variant || 'default'}>
                      {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                    </Badge>
                    <Badge variant={STATUS_CONFIG[task.status]?.variant || 'default'}>
                      {STATUS_CONFIG[task.status]?.label || task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
