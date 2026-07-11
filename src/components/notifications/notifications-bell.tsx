'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsDropdown } from './notifications-dropdown';
import { cn } from '@/lib/utils';
import { createNotificationSound } from '@/lib/notification-utils';

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
  const previousUnreadCount = useRef(0);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const notificationSound = useRef(createNotificationSound());

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count');
      if (!response.ok) return;

      const data = await response.json();
      const newCount = data.count || 0;

      // Check if there are new notifications
      if (newCount > previousUnreadCount.current && previousUnreadCount.current > 0) {
        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);

        // Play sound if enabled
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

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Setup polling with Page Visibility API
  useEffect(() => {
    const startPolling = () => {
      // Clear any existing interval
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }

      // Poll every 30 seconds
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

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchUnreadCount(); // Fetch immediately when tab becomes visible
        startPolling();
      }
    };

    // Start polling if page is visible
    if (!document.hidden) {
      startPolling();
    }

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen to dropdown custom events
    const handleDropdownToggle = (event: Event) => {
      const detail = (event as CustomEvent<{ isOpen: boolean }>).detail;
      if (detail?.isOpen === false) {
        void fetchUnreadCount();
      }
    };
    window.addEventListener('notifications:dropdown:toggled', handleDropdownToggle);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('notifications:dropdown:toggled', handleDropdownToggle);
    };
  }, [fetchUnreadCount]);

  // Refresh count when dropdown closes
  const handleClose = () => {
    setIsOpen(false);
    fetchUnreadCount();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-all',
          'bg-white hover:bg-gray-50 text-gray-700',
          'border border-gray-200 hover:border-gray-300',
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
              'absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full',
              'flex items-center justify-center',
              'animate-in fade-in zoom-in duration-200'
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for new notifications */}
        {isAnimating && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping" />
        )}
      </button>

      <NotificationsDropdown
        isOpen={isOpen}
        onClose={handleClose}
        position={position}
        userRole={userRole}
      />
    </div>
  );
}
