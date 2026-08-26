'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, CheckCircle2, XCircle, Info, Megaphone, ShieldAlert, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FailureState } from '@/components/feedback/FailureState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────
export type NotificationType =
  | 'payment_received'
  | 'agreement_signed'
  | 'rent_due'
  | 'maintenance_update'
  | 'listing_update'
  | 'system'
  | 'dispute_alert'
  | 'verification_update';

type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: { detail?: string; actionUrl?: string };
  read: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  success: boolean;
  data: Notification[];
  pagination: { page: number; total: number; totalPages: number };
};

// ─── Status config ────────────────────────────────────────────────────────────
const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: 'green' | 'amber' | 'red' | 'blue' | 'slate'; label: string }
> = {
  payment_received: { icon: CreditCard, color: 'green', label: 'Payment' },
  agreement_signed: { icon: CheckCircle2, color: 'blue', label: 'Agreement' },
  rent_due: { icon: AlertTriangle, color: 'red', label: 'Rent Due' },
  maintenance_update: { icon: Info, color: 'amber', label: 'Maintenance' },
  listing_update: { icon: Megaphone, color: 'blue', label: 'Listing' },
  system: { icon: Bell, color: 'slate', label: 'System' },
  dispute_alert: { icon: ShieldAlert, color: 'red', label: 'Dispute' },
  verification_update: { icon: CheckCircle2, color: 'green', label: 'Verification' },
};

const colorMap: Record<string, string> = {
  green: 'bg-success/10 text-[#00ff66] border-[#00ff66]/20',
  amber: 'bg-warning/10 text-warning border-warning/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
  blue: 'bg-zinc-900 text-zinc-300 border-white/[0.08]',
  slate: 'bg-slate-500/10 text-slate-700 border-slate-200',
};

// ─── Skeleton helpers ────────────────────────────────────────────────────────
const SkeletonStatCard = () => (
  <div className="glass-card p-5">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-10" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <div className="card">
    <div className="p-5 flex items-start gap-4">
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  </div>
);

// ─── Stat Card component ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'green' | 'amber' | 'red' | 'blue' | 'slate';
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>
          <p className="text-2xl text-white text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="glass-card p-12 text-center">
      <Bell className="w-12 h-12 text-zinc-500" style={{ opacity: 0.4 }} />
      <h3 className="font-headline-sm text-white mb-2 text-white">
        {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
      </h3>
      <p  className="text-zinc-500">
        {filter === 'unread' ? "You're all caught up!" : 'You will see alerts here when there is activity on your account.'}
      </p>
    </div>
  );
}

// ─── Notification Row ─────────────────────────────────────────────────────────
function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string, read: boolean) => void;
}) {
  const cfg = typeConfig[notification.type] || typeConfig.system;
  const Icon = cfg.icon;
  const timeStr = new Date(notification.createdAt).toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClick = async () => {
    if (!notification.read) {
      onMarkRead(notification.id, true);
    }
    const url = notification.data?.actionUrl;
    if (url) window.location.href = url;
  };

  return (
    <div
      className={`card cursor-pointer transition-colors ${!notification.read ? 'border-l-[3px] border-l-accent' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="p-5 flex items-start gap-4">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[cfg.color]}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm text-white">
              {notification.title}
            </p>
            <span className="text-xs flex-shrink-0 text-zinc-500">
              {timeStr}
            </span>
          </div>
          <p className="text-sm line-clamp-2 text-zinc-500">
            {notification.body}
          </p>

          {!notification.read && (
            <div className="mt-2 flex items-center justify-between">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                New
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(notification.id, true);
                }}
              >
                Mark read
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Client Page Component ────────────────────────────────────────────────────
export default function TenantNotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notifRes, countRes] = await Promise.all([
        api.get<NotificationsResponse>('/api/notifications?limit=50&page=1'),
        api.get<{ count: number }>('/api/notifications/unread-count'),
      ]);
      const notifData = notifRes.data as unknown as NotificationsResponse;
      if (!notifData?.success || !Array.isArray(notifData.data)) {
        throw new Error('Invalid notification response');
      }
      setNotifications(notifData.data);
      const countData = (countRes as unknown).count;
      const unreadCountFromApi = typeof countData === 'number' ? countData : undefined;
      setUnreadCount(unreadCountFromApi ?? notifData.data.filter((n) => !n.read).length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, retryCount]);

  const handleMarkRead = async (id: string, read: boolean) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read } : n))
    );
    try {
      await api.patch(`/api/notifications/${id}/read`, { read });
      setUnreadCount((c) => Math.max(0, c + (read ? -1 : 1)));
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !read } : n)));
    }
  };

  const handleRetry = () => setRetryCount((c) => c + 1);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const total = notifications.length;
  const readCount = notifications.filter((n) => n.read).length;
  const todayStr = new Date().toLocaleDateString('en-NG');
  const readToday = notifications.filter((n) => {
    if (!n.read) return false;
    return new Date(n.createdAt).toLocaleDateString('en-NG') === todayStr;
  }).length;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total" value={0} icon={Bell} color="slate" />
          <StatCard label="Unread" value={0} icon={AlertTriangle} color="amber" />
          <StatCard label="Read" value={0} icon={CheckCircle2} color="green" />
        </div>
        <FailureState
          title="Unable to load notifications"
          description={error.message}
          onRetry={handleRetry}
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader />
      <StatsRow
        loading={loading}
        total={total}
        unreadCount={unreadCount}
        readCount={readCount}
      />

      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cnBtn(filter, f)}
            >
              {f === 'all' ? 'All' : 'Unread'}
              {f === 'unread' && unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs px-1.5 py-0 min-w-[20px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">
          {total} notification{total !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Skeleton list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="font-heading font-semibold" style={{ fontSize: 'var(--text-page-title)' }}>
          Notifications
        </h1>
        <p className="text-zinc-500" style={{ marginTop: 'var(--space-vs)' }}>
          Stay updated with your rental activity
        </p>
      </div>
    </div>
  );
}

interface StatsProps {
  loading: boolean;
  total: number;
  unreadCount: number;
  readCount: number;
}

function StatsRow({ loading, total, unreadCount, readCount }: StatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard label="Total" value={total} icon={Bell} color="slate" />
      <StatCard label="Unread" value={unreadCount} icon={AlertTriangle} color="amber" />
      <StatCard label="Read Today" value={readCount} icon={CheckCircle2} color="green" />
    </div>
  );
}

// ─── Tiny button-style helper ─────────────────────────────────────────────────
function cnBtn(active: string, val: string) {
  const base =
    'px-3 py-1.5 rounded-md text-sm font-medium border transition-all';
  if (active === val) {
    return `${base} bg-accent/10 text-accent border-accent/30`;
  }
  return `${base} border-transparent hover:bg-muted/50`;
}
