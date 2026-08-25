import type { Notifier, NotificationPayload } from '../../interfaces';

export const notifier: Notifier = {
  async send(payload) {
    console.log(`[BJ Notifier] Sending via ${payload.channel} to ${payload.to}`);
    return true;
  },
  getSupportedChannels() {
    return ['inapp', 'email'];
  },
  isAvailable() {
    return true;
  },
};
