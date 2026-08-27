'use client';

import { useCallback } from 'react';
import { formatNotificationTime } from '@/lib/notification-utils';
import { getNotificationIcon, getNotificationColor, getNotificationBgColor } from '@/lib/notification-icons';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Button } from '@/components/ui';

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
    <Card
      className={cn(
        'cursor-pointer transition-colors',
        compact && 'p-3',
        notification.read
          ? 'bg-background'
          : 'bg-accent/5',
        !compact && 'p-4'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              notification.read ? 'bg-muted' : bgColor
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
                  notification.read ? 'font-medium' : 'font-semibold'
                )}
              >
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
              )}
            </div>

            <p className={cn('text-sm mb-2', notification.read ? 'text-muted-foreground' : 'text-foreground')}>
              {notification.body}
            </p>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {formatNotificationTime(notification.createdAt)}
              </span>

              <div className="flex items-center gap-2">
                {(canConfirm || canDispute) && (
                  <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                    {canConfirm && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); doConfirm(); }}
                        className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10 hover:bg-emerald-400/20"
                      >
                        Confirm payment
                      </Button>
                    )}
                    {canDispute && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); doDispute(); }}
                        className="text-red-400 border-red-400/20 bg-red-400/10 hover:bg-red-400/20"
                      >
                        Dispute
                      </Button>
                    )}
                  </div>
                )}

                {/* Mark as read/unread button */}
                {onMarkRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMarkReadToggle}
                    className="text-xs"
                  >
                    {notification.read ? 'Mark unread' : 'Mark read'}
                  </Button>
                )}

                {/* Action button */}
                {actionUrl && (
                  <Button
                    size="sm"
                    variant="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = actionUrl as string;
                    }}
                    className="text-xs"
                  >
                    View Details →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
