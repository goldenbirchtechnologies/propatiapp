'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Drawer } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { createNotificationSound } from '@/lib/notification-utils';
import { NotificationsPanel } from './notifications-dropdown';
import type { Notification } from './notification-card';

interface NotificationsBellProps {
  position?: 'left' | 'right';
  userRole?: string;
  enableSound?: boolean;
}

export function NotificationsBell({
  position = 'right',
  userRole,
  enableSound = false,
}: NotificationsBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const previousUnreadCount = useRef(0);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const notificationSound = useRef(createNotificationSound());
  const router = useRouter();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) return;

      const data = await response.json();
      const newCount = data.count || 0;

      if (newCount > previousUnreadCount.current && previousUnreadCount.current > 0) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);

        if (enableSound && notificationSound.current) {
          notificationSound.current.play().catch(() => {
            // Ignore errors (e.g., user hasn't interacted with page yet)
          });
        }
      }

      previousUnreadCount.current = newCount;
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [enableSound]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=10&unreadOnly=false');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    const startPolling = () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
      pollInterval.current = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
    };

    const stopPolling = () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchUnreadCount();
        startPolling();
      }
    };

    if (!document.hidden) {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUnreadCount]);

  const handleClose = () => {
    setIsOpen(false);
    fetchUnreadCount();
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    const actionUrl = (notification.data?.actionUrl || notification.actionUrl) as string | undefined;
    if (actionUrl) {
      router.push(actionUrl);
    }

    handleClose();
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-all',
          'bg-surface-elevated hover:bg-muted text-foreground',
          'border border-border',
          isAnimating && 'animate-bounce'
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-full',
              'flex items-center justify-center',
              'animate-in fade-in zoom-in duration-200'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for new notifications */}
        {isAnimating && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full animate-ping" />
        )}
      </button>

      <Drawer
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose();
          else setIsOpen(true);
        }}
        title="Notifications"
        size="md"
        footer={
          notifications.length > 0 && (
            <div className="flex items-center justify-between w-full">
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="text-sm font-medium text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingAll ? 'Marking...' : 'Mark all read'}
                </button>
              ) : (
                <div />
              )}
              <Link
                href={`/dashboard/${userRole}/notifications`}
                onClick={handleClose}
                className="text-sm font-medium text-accent hover:text-accent/80"
              >
                View all →
              </Link>
            </div>
          )
        }
        footerClassName="justify-between"
      >
        <div className="flex items-center justify-between p-3">
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded-full">
              {unreadCount} new
            </span>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading || markingAll}
            className="p-1 hover:bg-muted rounded transition-colors ml-auto"
            aria-label="Refresh notifications"
          >
            <svg className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.005A7.5 7.5 0 0119 10.5v.006a7.005 7.005 0 01.527 2.93M4 4v5h.005A7.5 7.5 0 0119 15v.005a7.005 7.005 0 01.527 2.93M19 4v5h-.005A7.5 7.5 0 014 15V14.995" />
            </svg>
          </button>
        </div>

        <NotificationsPanel
          notifications={notifications}
          loading={loading}
          markingAll={markingAll}
          unreadCount={unreadCount}
          onRefresh={fetchNotifications}
          onMarkAllRead={handleMarkAllRead}
          onNotificationClick={handleNotificationClick}
          onViewAll={() => {
            router.push(`/dashboard/${userRole}/notifications`);
            handleClose();
          }}
        />
      </Drawer>
    </>
  );
}
