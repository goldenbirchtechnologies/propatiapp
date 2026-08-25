'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { formatNotificationTime, truncateNotification } from '@/lib/notification-utils';
import { getNotificationIcon, getNotificationColor } from '@/lib/notification-icons';
import { cn } from '@/lib/utils';
import type { Notification } from './notification-card';

interface NotificationsPanelProps {
  notifications: Notification[];
  loading: boolean;
  markingAll: boolean;
  unreadCount: number;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onViewAll: () => void;
}

export function NotificationsPanel({
  notifications,
  loading,
  markingAll,
  unreadCount,
  onRefresh,
  onMarkAllRead,
  onNotificationClick,
  onViewAll,
}: NotificationsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
          <svg
            className="w-8 h-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>No notifications</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => {
        const Icon = getNotificationIcon(notification.type);
        const iconColor = getNotificationColor(notification.type);

        return (
          <button
            key={notification.id}
            onClick={() => onNotificationClick(notification)}
            className={cn(
              'w-full text-left p-4 transition-colors hover:bg-zinc-900/50',
              !notification.read && 'bg-accent/5'
            )}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    notification.read ? 'bg-zinc-900' : 'bg-zinc-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4', iconColor)} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p
                    className={cn(
                      'text-sm',
                      notification.read ? 'font-medium' : 'font-semibold'
                    )}
                    style={{ color: 'var(--text)' }}
                  >
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  {truncateNotification(notification.body, 80)}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {formatNotificationTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  userRole?: string;
}

export function NotificationsDropdown({
  isOpen,
  onClose,
  position = 'right',
  userRole = 'tenant',
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifications:dropdown:toggled', { detail: { isOpen } }));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    const actionUrl = (notification.data?.actionUrl || notification.actionUrl) as string | undefined;
    if (actionUrl) {
      router.push(actionUrl);
    }
    onClose();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 z-50',
        position === 'right' ? 'right-0' : 'left-0'
      )}
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchNotifications}
            disabled={loading || markingAll}
            className="p-1 hover:bg-zinc-900 rounded transition-colors"
            aria-label="Refresh notifications"
          >
            <svg className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.005A7.5 7.5 0 0119 10.5v.006a7.005 7.005 0 01.527 2.93M4 4v5h.005A7.5 7.5 0 0119 15v.005a7.005 7.005 0 01.527 2.93M19 4v5h-.005A7.5 7.5 0 014 15V14.995" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-900 rounded transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
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
          onClose();
        }}
      />

      {notifications.length > 0 && (
        <div className="flex items-center justify-between p-3 border-t border-zinc-800 bg-zinc-900/30">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="text-sm font-medium text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAll ? 'Marking...' : 'Mark all read'}
            </button>
          )}
          {unreadCount === 0 && <div />}
          <Link
            href={`/dashboard/${userRole}/notifications`}
            onClick={onClose}
            className="text-sm font-medium text-accent hover:text-accent/80"
          >
            View all →
          </Link>
        </div>
      )}
    </div>
  );
}
