'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { NotificationCard, type Notification } from '@/components/notifications/notification-card';
import { Loader2 } from 'lucide-react';

type FilterTab = 'all' | 'unread';

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async (pageNum: number, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const unreadOnly = filter === 'unread';
      const response = await fetch(
        `/api/notifications?page=${pageNum}&limit=20&unreadOnly=${unreadOnly}`
      );

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      const newNotifications = data.data || [];

      if (append) {
        setNotifications((prev) => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchNotifications(1, false);
  }, [filter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleMarkRead = async (notificationId: string, read: boolean) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      });

      if (!response.ok) throw new Error('Failed to update notification');

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkRead(notification.id, true);
    }

    // Navigate to action URL if exists
    const actionUrl = notification.data?.actionUrl || notification.actionUrl;
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleDealConfirm = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    const transactionId = notification?.data?.transactionId as string | undefined;
    if (!transactionId) return;
    await fetch(`/api/transactions/${transactionId}/confirm`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const handleDealDispute = async (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId);
    const transactionId = notification?.data?.transactionId as string | undefined;
    if (!transactionId) return;
    const reason = prompt('Brief reason for dispute');
    if (!reason) return;
    await fetch(`/api/transactions/${transactionId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, notificationId }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-neutral-400">Stay updated with your property activities</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-obsidian-800/30 text-neutral-400 hover:bg-obsidian-800-high'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-primary text-white'
                : 'bg-obsidian-800/30 text-neutral-400 hover:bg-obsidian-800-high'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-obsidian-800/30 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-4 py-2 text-sm font-medium text-white hover:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 bg-obsidian-800/30 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-neutral-400"
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
          <h3 className="text-lg font-semibold text-white mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="text-neutral-400">
            {filter === 'unread'
              ? "You're all caught up!"
              : 'Notifications will appear here when you have activity'}
          </p>
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
              onMarkRead={handleMarkRead}
              onConfirm={handleDealConfirm}
              onDispute={handleDealDispute}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-obsidian-800/30 hover:bg-obsidian-800-high text-neutral-400 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
