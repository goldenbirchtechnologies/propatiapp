'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Bell, Info, CheckCircle2 } from 'lucide-react';

type NotificationStatus = 'unread' | 'read';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  status: NotificationStatus;
  type: 'payment' | 'maintenance' | 'listing' | 'system';
}

export default function LandlordNotificationsPage() {
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Rent payment received', message: 'Adebayo Ogundimu paid ₦350,000 for Lekki Phase 1.', time: '2 hours ago', status: 'unread', type: 'payment' },
    { id: '2', title: 'New maintenance request', message: 'Plumbing issue reported at Victoria Island Apartment.', time: '5 hours ago', status: 'unread', type: 'maintenance' },
    { id: '3', title: 'Listing viewed 24 times', message: 'Your Ikeja GRA Flat listing is trending this week.', time: '1 day ago', status: 'read', type: 'listing' },
    { id: '4', title: 'Lease expiry reminder', message: 'Fatima Bello’s lease expires in 14 days.', time: '1 day ago', status: 'unread', type: 'system' },
    { id: '5', title: 'New tenant application', message: 'Chinedu Okafor applied for 3-bedroom in Lekki.', time: '2 days ago', status: 'read', type: 'listing' },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
  };

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on payments, maintenance, and listing activity.</p>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">Unable to load page</p>
            <p className="text-destructive text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive"
            >
              Retry
            </button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;
  const staffActionCount = notifications.filter((n) => n.type === 'maintenance').length;
  const resolvedLast30 = 24; // static resolved count demo

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on payments, maintenance, and listing activity.</p>
          </div>
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success"
          >
            Mark all read
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Unread"
            value={String(unreadCount)}
            icon={<Bell className="h-5 w-5" />}
            trend="Needs attention"
            trendPositive={unreadCount === 0}
          />
          <StatCard
            label="Requires Action"
            value={String(staffActionCount)}
            icon={<Info className="h-5 w-5" />}
            trend="Open tickets"
            trendPositive={false}
          />
          <StatCard
            label="Resolved"
            value={String(resolvedLast30)}
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend="Last 30 days"
            trendPositive
          />
        </div>

        {/* Loading Skeleton (hidden when data ready) */}
        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card divide-y hidden" className="border-border">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-muted/30" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted/30" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted/30" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-muted/30" />
            </div>
          ))}
        </div>

        {/* Empty State (hidden when notifications exist) */}
        <div className="hidden rounded-lg border border-border bg-surface-container-lowest p-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-primary">No notifications yet</h3>
          <p className="mt-1 text-on-surface-variant">You&apos;ll see important updates here when they happen.</p>
        </div>

        {/* Notifications List */}
        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card divide-y" className="border-border">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-on-surface-variant">No notifications to display.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 ${n.status === 'unread' ? 'bg-accent/10/50' : ''}`}
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
                  style={{ background: n.status === 'unread' ? 'var(--accent-bg)' : 'var(--border)', color: n.status === 'unread' ? 'var(--accent)' : 'var(--muted)' }}
                >
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${n.status === 'unread' ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="tag bg-accent/10 text-accent border-accent/20">{n.type}</span>
                    {n.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-container-lowest border hover:bg-surface-container-low"
                        style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

function StatCard({ label, value, icon, trend, trendPositive = true }: { label: string; value: string; icon: React.ReactNode; trend: string; trendPositive?: boolean }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" className="text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading font-bold" className="text-primary">{value}</p>
        </div>
        <div className="rounded-xl p-3" className="bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1">
        <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
          {trend}
        </span>
      </div>
    </div>
  );
}
