import type { Notifier, NotificationPayload } from '../../interfaces';

export const notifier: Notifier = {
  async send(payload: NotificationPayload) {
    console.log();
    return true;
  },
  getSupportedChannels() {
    return ['inapp', 'email', 'sms', 'whatsapp'];
  },
  isAvailable() {
    return true;
  },
};
