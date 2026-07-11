// ===========================================================================
// PROPATI — Notification Service
// Phase H: Multi-channel notification delivery (in-app, email, SMS, WhatsApp)
// ===========================================================================

import { prisma } from './prisma';
import { sendEmail } from './email/email-service';
import { sendSMS } from './sms/termii';
import { sendWhatsApp } from './whatsapp/twilio';
import { NotificationType } from '@prisma/client';

// ===========================================================================
// TYPES
// ===========================================================================

export interface NotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
}

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SMSParams {
  to: string;
  message: string;
}

export interface WhatsAppParams {
  to: string;
  message: string;
}

export type NotificationChannel = 'inapp' | 'email' | 'sms' | 'whatsapp';

export interface MultiChannelNotificationParams extends NotificationParams {
  channels: NotificationChannel[];
  email?: EmailParams;
  sms?: SMSParams;
  whatsapp?: WhatsAppParams;
}

// ===========================================================================
// NOTIFICATION SERVICE CLASS
// ===========================================================================

class NotificationService {
  async create(params: NotificationParams) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.message,
        data: params.metadata || null,
        read: false,
      },
    });

    return notification;
  }

  async sendEmail(params: EmailParams): Promise<void> {
    await sendEmail(params);
  }

  async sendSMS(params: SMSParams): Promise<void> {
    await sendSMS(params);
  }

  async sendWhatsApp(params: WhatsAppParams): Promise<void> {
    await sendWhatsApp(params);
  }

  async notify(params: MultiChannelNotificationParams): Promise<void> {
    const promises: Promise<any>[] = [];

    if (params.channels.includes('inapp')) {
      promises.push(this.create(params));
    }

    if (params.channels.includes('email') && params.email) {
      promises.push(this.sendEmail(params.email));
    }

    if (params.channels.includes('sms') && params.sms) {
      promises.push(this.sendSMS(params.sms));
    }

    if (params.channels.includes('whatsapp') && params.whatsapp) {
      promises.push(this.sendWhatsApp(params.whatsapp));
    }

    await Promise.allSettled(promises);
  }

  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUserNotifications(params: { userId: string; read?: boolean; page?: number; limit?: number }) {
    const { userId, read, page = 1, limit = 20 } = params;
    const where: any = { userId };
    if (read !== undefined) where.read = read;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({ where: { userId, read: false } });
  }

  // ===========================================================================
  // ORCHESTRATION HELPERS
  // ===========================================================================

  async getUserPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });

    const defaultPreferences = {
      inapp: true,
      email: false,
      sms: false,
      whatsapp: false,
      types: {
        verification: true,
        agreement: true,
        payment: true,
        message: true,
        rent_due: true,
        maintenance: true,
        screening: true,
        system: true,
      },
    };

    const preferences = user?.notificationPreferences
      ? typeof user.notificationPreferences === 'string'
        ? JSON.parse(user.notificationPreferences)
        : user.notificationPreferences
      : defaultPreferences;

    return { ...defaultPreferences, ...preferences, types: { ...defaultPreferences.types, ...(preferences?.types || {}) } };
  }

  async shouldNotifyUser(userId: string, type: string, channel: NotificationChannel): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    if (!preferences[channel]) return false;
    if (!preferences.types[type]) return false;
    return true;
  }

  async notifyUsersForEvent(params: {
    userIds: string[];
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: any;
    channels?: NotificationChannel[];
  }) {
    const { userIds, type, title, message, actionUrl, metadata, channels = ['inapp'] } = params;

    const targets = await prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { id: true, fullName: true, email: true, phone: true },
    });

    const results = await Promise.allSettled(
      targets.map(async (user) => {
        const allowedChannels: NotificationChannel[] = [];

        for (const ch of channels) {
          if (await this.shouldNotifyUser(user.id, type, ch)) {
            allowedChannels.push(ch);
          }
        }

        if (allowedChannels.length === 0) return null;

        const request: MultiChannelNotificationParams = {
          userId: user.id,
          type,
          title,
          message,
          actionUrl,
          metadata,
          channels: allowedChannels,
          email: allowedChannels.includes('email') ? { to: user.email || '', subject: title, html: `<p>${message}</p>` } : undefined,
          sms: allowedChannels.includes('sms') ? { to: user.phone || '', message } : undefined,
          whatsapp: allowedChannels.includes('whatsapp') ? { to: user.phone || '', message } : undefined,
        };

        return this.notify(request);
      })
    );

    return results;
  }
}

// ===========================================================================
// SINGLETON EXPORT
// ===========================================================================

export const notificationService = new NotificationService();
