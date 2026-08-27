'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
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

  const dropdownRef = useRef<HTMLDivElement>(null);

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
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 rounded-lg transition-all',
          'bg-zinc-900 hover:bg-zinc-900 text-white',
          'border border-zinc-800',
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

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 z-50',
            position === 'right' ? 'right-0' : 'left-0'
          )}
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between p-3 border-b border-zinc-800">
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded-full">
                {unreadCount} new
              </span>
            ) : null}
            <button
              onClick={fetchNotifications}
              disabled={loading || markingAll}
              className="p-1 hover:bg-zinc-900 rounded transition-colors ml-auto"
              aria-label="Refresh notifications"
            >
              <svg
                className={cn('w-4 h-4 text-zinc-400', loading && 'animate-spin')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.005A7.5 7.5 0 0119 10.5v.006a7.005 7.005 0 01.527 2.93M4 4v5h.005A7.5 7.5 0 0119 15v.005a7.005 7.005 0 01.527 2.93M19 4v5h-.005A7.5 7.5 0 014 15V14.995"
                />
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

          {notifications.length > 0 && (
            <div className="flex items-center justify-between p-3 border-t border-zinc-800 bg-zinc-900/30">
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="text-sm font-medium text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingAll ? 'Marking...' : 'Mark all read'}
                </button>
              ) : null}
              <Link
                href={`/dashboard/${userRole}/notifications`}
                onClick={handleClose}
                className="text-sm font-medium text-accent hover:text-accent/80"
              >
                View all &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
