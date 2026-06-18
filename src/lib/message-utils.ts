import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format message timestamp with relative time
 * - "Just now" for < 1 minute
 * - "Xm ago" for < 1 hour
 * - "Xh ago" for < 24 hours
 * - "MMM d" for older messages
 */
export function formatMessageTime(date: Date | string): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - messageDate.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return format(messageDate, 'MMM d');
}

/**
 * Format timestamp for message bubble (hover/detail view)
 * Shows time like "3:45 PM" or "Jan 15, 3:45 PM"
 */
export function formatMessageTimestamp(date: Date | string): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const isToday = messageDate.toDateString() === now.toDateString();

  if (isToday) {
    return format(messageDate, 'h:mm a');
  }
  return format(messageDate, 'MMM d, h:mm a');
}

/**
 * Truncate message content for preview
 */
export function truncateMessage(content: string, maxLength = 50): string {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength) + '...';
}

/**
 * Get relative time distance (e.g., "2 minutes ago", "1 hour ago")
 */
export function getRelativeTime(date: Date | string): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(messageDate, { addSuffix: true });
}

/**
 * Check if message is from today
 */
export function isToday(date: Date | string): boolean {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return messageDate.toDateString() === today.toDateString();
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(messages: Array<{ createdAt: string | Date; [key: string]: any }>) {
  const groups: Record<string, typeof messages> = {};

  messages.forEach(message => {
    const date = typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt;
    const dateKey = format(date, 'yyyy-MM-dd');

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return groups;
}

/**
 * Get display name for date group
 */
export function getDateGroupLabel(dateKey: string): string {
  const date = new Date(dateKey);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM d, yyyy');
  }
}
