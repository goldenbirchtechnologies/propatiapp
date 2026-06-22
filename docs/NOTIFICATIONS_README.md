# PROPATI Notifications System — Phase H Backend

## Overview

Complete backend implementation for PROPATI's multi-channel notification system:
- **In-App Notifications** (bell icon)
- **Email Notifications** via SMTP (Nodemailer)
- **SMS Notifications** via Termii API
- **WhatsApp Notifications** via Twilio API

---

## Files Created

### Core Services

1. **`src/lib/notification-service.ts`**
   - Main notification service class
   - Multi-channel delivery (`notify()` method)
   - CRUD operations for in-app notifications
   - Mark as read/unread functionality

2. **`src/lib/email/email-service.ts`**
   - SMTP email service via Nodemailer
   - Automatic mock mode when credentials not configured
   - Console logging for testing

3. **`src/lib/sms/termii.ts`**
   - SMS service via Termii API
   - Automatic mock mode when API key not configured
   - Supports Nigerian phone numbers (234XXXXXXXXXX format)

4. **`src/lib/whatsapp/twilio.ts`**
   - WhatsApp service via Twilio API
   - Automatic mock mode when credentials not configured
   - Supports international format (+234XXXXXXXXXX)

### Email Templates

All templates in `src/lib/email/templates/`:

1. **`welcome.ts`** — Welcome new users
2. **`verification-submitted.ts`** — Verification submitted for review
3. **`verification-approved.ts`** — Verification approved
4. **`verification-rejected.ts`** — Verification rejected (needs updates)
5. **`agreement-created.ts`** — New rental agreement created
6. **`agreement-signed.ts`** — Agreement signed by party
7. **`payment-received.ts`** — Payment confirmation
8. **`rent-reminder.ts`** — Rent due reminder (7/3/1 days before)
9. **`inspection-scheduled.ts`** — Physical inspection scheduled
10. **`message-received.ts`** — New message notification
11. **`index.ts`** — Export all templates

Each template exports:
```typescript
export function renderTemplateEmail(data): {
  subject: string;
  html: string;  // Styled HTML email
  text: string;  // Plain text fallback
}
```

### API Routes (Already Existed)

- `GET /api/notifications` — List user notifications (paginated)
- `POST /api/notifications` — Create notification (admin only)
- `PATCH /api/notifications/:id/read` — Mark notification as read/unread
- `POST /api/notifications/mark-all-read` — Mark all as read
- `GET /api/notifications/unread-count` — Get unread count

### React Hooks

**`src/hooks/useNotifications.ts`**

Exports:
- `useNotifications({ unreadOnly?, page?, limit? })` — Fetch notifications
- `useUnreadCount()` — Get unread count (polls every 30s)
- `useMarkNotificationRead()` — Mark as read/unread
- `useMarkAllRead()` — Mark all as read
- `useMarkAsRead()` — Shorthand helper

### Validation Schemas

Added to `src/lib/validators.ts`:
- `notificationTypeSchema`
- `createNotificationSchema`
- `notificationFiltersSchema`
- `markNotificationReadSchema`

### Documentation

- **`NOTIFICATION_TRIGGERS.md`** — Complete integration guide
  - When to send notifications
  - Code examples for each trigger
  - Cron job setup for rent reminders
  - Testing instructions

---

## Installation

Dependencies already installed:
```bash
npm install nodemailer @types/nodemailer twilio
```

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=PROPATI <noreply@propati.ng>

# SMS (Termii)
TERMII_API_KEY=your_api_key
TERMII_SENDER_ID=PROPATI

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Mock Mode

If credentials are not configured, services automatically run in **mock mode**:
- Logs to console instead of sending
- Still creates in-app notifications (uses database)
- Perfect for development and testing

---

## Usage

### Basic Example

```typescript
import { notificationService } from '@/lib/notification-service';

// In-app only
await notificationService.create({
  userId: user.id,
  type: 'system',
  title: 'Welcome',
  message: 'Welcome to PROPATI',
  actionUrl: '/dashboard',
});
```

### Multi-Channel Example

```typescript
import { notificationService } from '@/lib/notification-service';
import { renderWelcomeEmail } from '@/lib/email/templates';

await notificationService.notify({
  userId: user.id,
  type: 'verification',
  title: 'Verification Approved',
  message: 'Your property has been verified',
  actionUrl: `/listings/${listingId}`,
  channels: ['inapp', 'email', 'sms'],
  email: {
    to: user.email,
    ...renderWelcomeEmail({ name: user.fullName, role: user.role }),
  },
  sms: {
    to: user.phone, // Format: 234XXXXXXXXXX
    message: 'Your PROPATI property verification is approved!',
  },
});
```

### Using React Hooks

```typescript
'use client';

import { useNotifications, useUnreadCount, useMarkAsRead } from '@/hooks';

function NotificationBell() {
  const { data: unreadCount } = useUnreadCount();
  const { data: notificationsData } = useNotifications({ 
    unreadOnly: true, 
    limit: 5 
  });
  const { markAsRead } = useMarkAsRead();

  return (
    <div>
      <Badge>{unreadCount}</Badge>
      {notificationsData?.data.map(notif => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}
        </div>
      ))}
    </div>
  );
}
```

---

## Integration Points

See `NOTIFICATION_TRIGGERS.md` for detailed integration guide. Key triggers:

1. **User Registration** → Welcome email
2. **Verification Submitted** → Email to user
3. **Verification Approved** → Email + SMS
4. **Verification Rejected** → Email with reason
5. **Agreement Created** → Email to both parties
6. **Agreement Signed** → Email to other party
7. **Payment Received** → Email + SMS + in-app
8. **Rent Due (7/3/1 days)** → Email + SMS (via cron job)
9. **Inspection Scheduled** → Email + SMS + in-app
10. **New Message** → In-app immediately, email after 1 hour if unread
11. **Listing Flagged** → In-app to admins
12. **Maintenance Ticket** → Email + in-app to landlord

---

## Database Schema

The `Notification` model already exists in `prisma/schema.prisma`:

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  data      Json?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id])
}

enum NotificationType {
  rent_due
  payment
  message
  verification
  agreement
  maintenance
  screening
  system
}
```

**No schema changes needed** — it's already set up correctly!

---

## Testing

### Test In-App Notification

```typescript
await notificationService.create({
  userId: 'your_user_id',
  type: 'system',
  title: 'Test Notification',
  message: 'This is a test',
  actionUrl: '/dashboard',
});
```

### Test Email (Mock Mode)

```typescript
import { sendEmail } from '@/lib/email/email-service';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>Hello from PROPATI</p>',
  text: 'Hello from PROPATI',
});

// Without SMTP credentials, logs to console:
// === EMAIL (MOCK MODE) ===
// To: test@example.com
// Subject: Test Email
// ...
```

### Test SMS (Mock Mode)

```typescript
import { sendSMS } from '@/lib/sms/termii';

await sendSMS({
  to: '2348012345678',
  message: 'Test SMS from PROPATI',
});

// Without Termii API key, logs to console:
// === SMS (MOCK MODE) ===
// To: 2348012345678
// Message: Test SMS from PROPATI
```

### Test WhatsApp (Mock Mode)

```typescript
import { sendWhatsApp } from '@/lib/whatsapp/twilio';

await sendWhatsApp({
  to: '+2348012345678',
  message: 'Test WhatsApp from PROPATI',
});

// Without Twilio credentials, logs to console:
// === WHATSAPP (MOCK MODE) ===
// To: +2348012345678
// Message: Test WhatsApp from PROPATI
```

---

## API Testing

### Get Notifications

```bash
curl -X GET http://localhost:3000/api/notifications?unreadOnly=true&page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark as Read

```bash
curl -X PATCH http://localhost:3000/api/notifications/notif_id/read \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"read": true}'
```

### Mark All Read

```bash
curl -X POST http://localhost:3000/api/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Unread Count

```bash
curl -X GET http://localhost:3000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps (Not Implemented)

The following were **intentionally not implemented** per requirements:

- ❌ Frontend UI components (bell icon, notification list)
- ❌ User notification preferences (enable/disable channels)
- ❌ Push notifications (mobile/web)
- ❌ Notification batching/digest emails
- ❌ Notification categories/grouping
- ❌ Cron jobs for rent reminders (needs separate implementation)

---

## Dependencies Status

✅ **Installed:**
- `nodemailer` — Email service
- `@types/nodemailer` — TypeScript types
- `twilio` — WhatsApp service

✅ **Already Existed:**
- `@prisma/client` — Database
- `@tanstack/react-query` — React hooks
- `zod` — Validation

---

## File Structure

```
src/
├── lib/
│   ├── notification-service.ts         # Main service
│   ├── email/
│   │   ├── email-service.ts            # SMTP service
│   │   └── templates/
│   │       ├── index.ts                # Export all templates
│   │       ├── welcome.ts
│   │       ├── verification-submitted.ts
│   │       ├── verification-approved.ts
│   │       ├── verification-rejected.ts
│   │       ├── agreement-created.ts
│   │       ├── agreement-signed.ts
│   │       ├── payment-received.ts
│   │       ├── rent-reminder.ts
│   │       ├── inspection-scheduled.ts
│   │       └── message-received.ts
│   ├── sms/
│   │   └── termii.ts                   # SMS service
│   └── whatsapp/
│       └── twilio.ts                   # WhatsApp service
├── hooks/
│   ├── useNotifications.ts             # React Query hooks
│   └── index.ts                        # Export hooks
└── app/
    └── api/
        └── notifications/
            ├── route.ts                # GET/POST
            ├── [id]/
            │   └── read/
            │       └── route.ts        # PATCH
            ├── mark-all-read/
            │   └── route.ts            # POST
            └── unread-count/
                └── route.ts            # GET

NOTIFICATION_TRIGGERS.md                # Integration guide
NOTIFICATIONS_README.md                 # This file
```

---

## Mock Mode Status

Current status: **ENABLED** (default for development)

To check if services are in mock mode:
```bash
# Check .env for credentials
cat .env | grep -E "SMTP_USER|TERMII_API_KEY|TWILIO_ACCOUNT_SID"
```

If any are missing, that service runs in mock mode.

---

## Issues Encountered

✅ **None** — Implementation completed successfully!

- All services created
- All templates implemented
- API routes already existed
- React hooks created
- Validation schemas added
- Dependencies installed
- Mock mode working
- Documentation complete

---

## Quick Start

1. **Check Mock Mode:**
   ```bash
   # Services log to console when credentials not configured
   # Perfect for development!
   ```

2. **Test In-App Notification:**
   ```typescript
   import { notificationService } from '@/lib/notification-service';
   
   await notificationService.create({
     userId: 'user_id',
     type: 'system',
     title: 'Test',
     message: 'Hello!',
   });
   ```

3. **Use in Components:**
   ```typescript
   import { useNotifications, useUnreadCount } from '@/hooks';
   
   const { data } = useNotifications();
   const { data: count } = useUnreadCount();
   ```

4. **Integrate into Existing APIs:**
   - See `NOTIFICATION_TRIGGERS.md`
   - Add notification calls to verification, agreement, payment routes

---

## Support

For integration questions, refer to:
- `NOTIFICATION_TRIGGERS.md` — When and how to send notifications
- Code examples in each email template file
- React Query hooks documentation

---

**Status:** ✅ **Phase H Backend Complete**

All notification backend services, templates, and hooks are implemented and ready for integration!

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer
