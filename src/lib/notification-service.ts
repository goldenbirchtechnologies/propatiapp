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
  message: string; // Maps to 'body' in Prisma
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
  to: string; // Phone number: 234XXXXXXXXXX
  message: string;
}

export interface WhatsAppParams {
  to: string; // Phone with country code: +234XXXXXXXXXX
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
  /**
   * Create an in-app notification
   */
  async create(params: NotificationParams) {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.message, // 'message' param maps to 'body' field in DB
        data: params.metadata || null,
        read: false,
      },
    });

    return notification;
  }

  /**
   * Send email notification
   */
  async sendEmail(params: EmailParams): Promise<void> {
    await sendEmail(params);
  }

  /**
   * Send SMS notification
   */
  async sendSMS(params: SMSParams): Promise<void> {
    await sendSMS(params);
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsApp(params: WhatsAppParams): Promise<void> {
    await sendWhatsApp(params);
  }

  /**
   * Send notification via multiple channels
   */
  async notify(params: MultiChannelNotificationParams): Promise<void> {
    const promises: Promise<any>[] = [];

    // Always create in-app notification if channel is included
    if (params.channels.includes('inapp')) {
      promises.push(this.create(params));
    }

    // Send email if channel is included
    if (params.channels.includes('email') && params.email) {
      promises.push(this.sendEmail(params.email));
    }

    // Send SMS if channel is included
    if (params.channels.includes('sms') && params.sms) {
      promises.push(this.sendSMS(params.sms));
    }

    // Send WhatsApp if channel is included
    if (params.channels.includes('whatsapp') && params.whatsapp) {
      promises.push(this.sendWhatsApp(params.whatsapp));
    }

    // Execute all notifications in parallel
    await Promise.allSettled(promises);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        read: true,
      },
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(params: {
    userId: string;
    read?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { userId, read, page = 1, limit = 20 } = params;

    const where: any = { userId };
    if (read !== undefined) {
      where.read = read;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
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

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}

// ===========================================================================
// SINGLETON EXPORT
// ===========================================================================

export const notificationService = new NotificationService();
