import { format, formatDistanceToNow } from 'date-fns';

export function formatNotificationTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  // Less than 1 minute
  if (diff < 60000) return 'Just now';

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  // More than 7 days, show full date
  return format(dateObj, 'MMM d, yyyy');
}

export function formatNotificationTimeRelative(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function truncateNotification(message: string, maxLength = 100): string {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

export function getNotificationActionText(type: string): string {
  const actionTexts: Record<string, string> = {
    verification_submitted: 'View Verification',
    verification_approved: 'View Details',
    verification_rejected: 'Resubmit',
    agreement_created: 'View Agreement',
    agreement_signed: 'View Agreement',
    payment_received: 'View Payment',
    rent_due: 'Pay Now',
    inspection_scheduled: 'View Details',
    message_received: 'View Message',
    listing_flagged: 'Review Listing',
    maintenance_ticket_created: 'View Ticket',
  };

  return actionTexts[type] || 'View';
}

export interface NotificationSound {
  play: () => Promise<void>;
}

export function createNotificationSound(): NotificationSound | null {
  if (typeof window === 'undefined') return null;

  // Simple notification sound using Web Audio API
  return {
    play: async () => {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.error('Failed to play notification sound:', error);
      }
    },
  };
}
