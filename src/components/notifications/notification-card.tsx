'use client';

import { useCallback } from 'react';
import { formatNotificationTime } from '@/lib/notification-utils';
import { getNotificationIcon, getNotificationColor, getNotificationBgColor } from '@/lib/notification-icons';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date | string;
  actionUrl?: string;
}

interface NotificationCardProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  onMarkRead?: (notificationId: string, read: boolean) => Promise<void>;
  compact?: boolean;
  onConfirm?: (notificationId: string) => Promise<void>;
  onDispute?: (notificationId: string) => Promise<void>;
}

export function NotificationCard({
  notification,
  onClick,
  onMarkRead,
  compact = false,
  onConfirm,
  onDispute,
}: NotificationCardProps) {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const bgColor = getNotificationBgColor(notification.type);

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const handleMarkReadToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead) {
      await onMarkRead(notification.id, !notification.read);
    }
  };

  const actionUrl = notification.data?.actionUrl || notification.actionUrl;
  const canConfirm = !!onConfirm;
  const canDispute = !!onDispute;

  const doConfirm = useCallback(async () => {
    if (onConfirm) {
      await onConfirm(notification.id);
    }
  }, [onConfirm, notification.id]);

  const doDispute = useCallback(async () => {
    if (onDispute) {
      await onDispute(notification.id);
    }
  }, [onDispute, notification.id]);

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all cursor-pointer',
        notification.read
          ? 'bg-surface-elevated border-border'
          : 'bg-blue-50/50 border-blue-200 hover:border-blue-300',
        compact && 'p-3'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            notification.read ? 'bg-gray-100' : bgColor
          )}
        >
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                'text-sm',
                notification.read ? 'font-medium text-gray-900' : 'font-semibold text-gray-900'
              )}
            >
              {notification.title}
            </h4>
          </div>

          <p
            className={cn(
              'text-sm mb-2',
              notification.read ? 'text-gray-600' : 'text-gray-700'
            )}
          >
            {notification.body}
          </p>

           <div className="flex items-center justify-between gap-3">
             <span className="text-xs text-gray-500">
               {formatNotificationTime(notification.createdAt)}
             </span>

             <div className="flex items-center gap-2">
               {(canConfirm || canDispute) && (
                 <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                   {canConfirm && (
                     <button
                       onClick={(e) => { e.stopPropagation(); doConfirm(); }}
                       className="text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full transition"
                     >
                       Confirm payment
                     </button>
                   )}
                   {canDispute && (
                     <button
                       onClick={(e) => { e.stopPropagation(); doDispute(); }}
                       className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition"
                     >
                       Dispute
                     </button>
                   )}
                 </div>
               )}

               {/* Mark as read/unread button */}
               {onMarkRead && (
                 <button
                   onClick={handleMarkReadToggle}
                   className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                   aria-label={notification.read ? 'Mark as unread' : 'Mark as read'}
                 >
                   {notification.read ? 'Mark unread' : 'Mark read'}
                 </button>
               )}

               {/* Action button */}
               {actionUrl && (
                 <button
                   className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                   onClick={(e) => {
                     e.stopPropagation();
                     window.location.href = actionUrl;
                   }}
                 >
                   View Details →
                 </button>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
