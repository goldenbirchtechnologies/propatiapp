export type NotificationChannel = 'inapp' | 'email' | 'sms' | 'whatsapp';

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  html?: string;
  channel: NotificationChannel;
  metadata?: Record<string, unknown>;
}

export interface Notifier {
  send(payload: NotificationPayload): Promise<boolean>;
  getSupportedChannels(): NotificationChannel[];
  isAvailable(): boolean;
}
