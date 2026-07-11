import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatNotificationTime, formatNotificationTimeRelative, truncateNotification, getNotificationActionText } from '@/lib/notification-utils';

describe('notification-utils', () => {
  const fixedNow = new Date('2025-06-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatNotificationTime', () => {
    it('returns "Just now" for recent dates', () => {
      const date = new Date(fixedNow.getTime() - 30_000); // 30 seconds ago
      expect(formatNotificationTime(date)).toBe('Just now');
    });

    it('returns minutes ago', () => {
      const date = new Date(fixedNow.getTime() - 5 * 60_000); // 5 minutes ago
      expect(formatNotificationTime(date)).toBe('5m ago');
    });

    it('returns hours ago', () => {
      const date = new Date(fixedNow.getTime() - 3 * 3600_000); // 3 hours ago
      expect(formatNotificationTime(date)).toBe('3h ago');
    });

    it('returns days ago for dates within a week', () => {
      const date = new Date(fixedNow.getTime() - 2 * 86400_000); // 2 days ago
      expect(formatNotificationTime(date)).toBe('2d ago');
    });

    it('returns formatted date for older dates', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(formatNotificationTime(date)).toBe('Jan 1, 2024');
    });

    it('accepts date strings', () => {
      expect(formatNotificationTime('2025-06-14T10:00:00Z')).toBe('1d ago');
    });
  });

  describe('formatNotificationTimeRelative', () => {
    it('returns relative string using date-fns', () => {
      const date = new Date(fixedNow.getTime() - 2 * 3600_000);
      expect(formatNotificationTimeRelative(date)).toBe('about 2 hours ago');
    });
  });

  describe('truncateNotification', () => {
    it('returns original message when under limit', () => {
      expect(truncateNotification('Hello', 100)).toBe('Hello');
    });

    it('truncates with ellipsis when over limit', () => {
      const long = 'A'.repeat(50);
      expect(truncateNotification(long, 10)).toBe('AAAAAAAAAA...');
    });

    it('uses default maxLength of 100', () => {
      const long = 'B'.repeat(101);
      expect(truncateNotification(long)).toBe(long.slice(0, 100) + '...');
    });
  });

  describe('getNotificationActionText', () => {
    it('returns mapped action for known types', () => {
      expect(getNotificationActionText('verification_approved')).toBe('View Details');
      expect(getNotificationActionText('verification_rejected')).toBe('Resubmit');
      expect(getNotificationActionText('payment_received')).toBe('View Payment');
    });

    it('returns "View" for unknown types', () => {
      expect(getNotificationActionText('unknown_event')).toBe('View');
    });
  });
});
