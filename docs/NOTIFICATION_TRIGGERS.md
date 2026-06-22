# PROPATI Notification Triggers

This document describes when and how to send notifications throughout the PROPATI platform.

## Overview

The notification system supports 4 channels:
- **In-App**: Bell icon notifications (always created)
- **Email**: SMTP via Nodemailer
- **SMS**: Via Termii API
- **WhatsApp**: Via Twilio API

## Implementation

Use the `notificationService` from `@/lib/notification-service`:

```typescript
import { notificationService } from '@/lib/notification-service';
import { renderWelcomeEmail } from '@/lib/email/templates';

// Example: Send multi-channel notification
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

---

## Trigger Events

### 1. User Registration (Welcome)
**When:** User completes sign-up via Clerk webhook  
**File:** `src/app/api/webhook/route.ts`  
**Channels:** Email, In-App

```typescript
import { renderWelcomeEmail } from '@/lib/email/templates';

await notificationService.notify({
  userId: user.id,
  type: 'system',
  title: 'Welcome to PROPATI',
  message: `Welcome ${user.fullName}! Start exploring verified properties.`,
  actionUrl: '/dashboard',
  channels: ['inapp', 'email'],
  email: {
    to: user.email,
    ...renderWelcomeEmail({ name: user.fullName, role: user.role }),
  },
});
```

---

### 2. Verification Submitted
**When:** User submits Layer 1 documents  
**File:** `src/app/api/verification/submit-layer1/route.ts`  
**Channels:** Email, In-App

```typescript
import { renderVerificationSubmittedEmail } from '@/lib/email/templates';

await notificationService.notify({
  userId: listing.ownerId,
  type: 'verification',
  title: 'Verification Submitted',
  message: 'Your property verification is under review',
  actionUrl: `/verification/${listingId}`,
  channels: ['inapp', 'email'],
  email: {
    to: owner.email,
    ...renderVerificationSubmittedEmail({
      name: owner.fullName,
      listingTitle: listing.title,
      listingId: listing.id,
    }),
  },
});
```

---

### 3. Verification Approved
**When:** Admin approves verification (Layer 5)  
**File:** `src/app/api/verification/admin-review/route.ts`  
**Channels:** Email, SMS, In-App

```typescript
import { renderVerificationApprovedEmail } from '@/lib/email/templates';

await notificationService.notify({
  userId: listing.ownerId,
  type: 'verification',
  title: 'Verification Approved',
  message: `Your property "${listing.title}" is now verified!`,
  actionUrl: `/listings/${listing.id}`,
  channels: ['inapp', 'email', 'sms'],
  email: {
    to: owner.email,
    ...renderVerificationApprovedEmail({
      name: owner.fullName,
      listingTitle: listing.title,
      listingId: listing.id,
      tier: listing.verificationTier,
    }),
  },
  sms: {
    to: owner.phone,
    message: `PROPATI: Your property "${listing.title}" is now verified!`,
  },
});
```

---

### 4. Verification Rejected
**When:** Admin rejects verification  
**File:** `src/app/api/verification/admin-review/route.ts`  
**Channels:** Email, In-App

```typescript
import { renderVerificationRejectedEmail } from '@/lib/email/templates';

await notificationService.notify({
  userId: listing.ownerId,
  type: 'verification',
  title: 'Verification Update Required',
  message: 'Additional information needed for verification',
  actionUrl: `/verification/${listing.id}`,
  channels: ['inapp', 'email'],
  email: {
    to: owner.email,
    ...renderVerificationRejectedEmail({
      name: owner.fullName,
      listingTitle: listing.title,
      listingId: listing.id,
      reason: verification.adminNotes || 'Please update your documents',
    }),
  },
});
```

---

### 5. Agreement Created
**When:** Landlord/tenant creates rental agreement  
**File:** `src/app/api/agreements/route.ts`  
**Channels:** Email, In-App (both parties)

```typescript
import { renderAgreementCreatedEmail } from '@/lib/email/templates';
import { format } from 'date-fns';

// Notify landlord
await notificationService.notify({
  userId: agreement.landlordId,
  type: 'agreement',
  title: 'New Agreement Created',
  message: `Agreement created with ${tenant.fullName}`,
  actionUrl: `/agreements/${agreement.id}`,
  channels: ['inapp', 'email'],
  email: {
    to: landlord.email,
    ...renderAgreementCreatedEmail({
      recipientName: landlord.fullName,
      recipientRole: 'landlord',
      otherPartyName: tenant.fullName,
      propertyTitle: listing.title,
      agreementId: agreement.id,
      startDate: format(agreement.startDate, 'MMM dd, yyyy'),
      endDate: format(agreement.endDate, 'MMM dd, yyyy'),
      rentAmount: agreement.rentAmount.toString(),
    }),
  },
});

// Notify tenant (similar logic)
```

---

### 6. Agreement Signed
**When:** User signs agreement  
**File:** `src/app/api/agreements/[id]/sign/route.ts`  
**Channels:** Email, In-App

```typescript
import { renderAgreementSignedEmail } from '@/lib/email/templates';

const fullySignedNow = agreement.status === 'fully_signed';

// Notify the other party
await notificationService.notify({
  userId: otherPartyId,
  type: 'agreement',
  title: fullySignedNow ? 'Agreement Active' : 'Agreement Signed',
  message: fullySignedNow
    ? 'Both parties have signed. Agreement is active.'
    : `${signer.fullName} has signed the agreement`,
  actionUrl: `/agreements/${agreement.id}`,
  channels: ['inapp', 'email'],
  email: {
    to: otherParty.email,
    ...renderAgreementSignedEmail({
      recipientName: otherParty.fullName,
      signerName: signer.fullName,
      propertyTitle: listing.title,
      agreementId: agreement.id,
      fullySignedNow,
    }),
  },
});
```

---

### 7. Payment Received
**When:** Paystack webhook confirms payment  
**File:** `src/app/api/webhook/paystack/route.ts`  
**Channels:** Email, SMS, In-App

```typescript
import { renderPaymentReceivedEmail } from '@/lib/email/templates';

await notificationService.notify({
  userId: transaction.payeeId,
  type: 'payment',
  title: 'Payment Received',
  message: `₦${(transaction.amount / 100).toLocaleString()} received`,
  actionUrl: `/transactions/${transaction.id}`,
  channels: ['inapp', 'email', 'sms'],
  email: {
    to: payee.email,
    ...renderPaymentReceivedEmail({
      recipientName: payee.fullName,
      amount: (transaction.amount / 100).toLocaleString(),
      payerName: payer.fullName,
      propertyTitle: listing?.title || 'N/A',
      transactionId: transaction.id,
      paymentType: transaction.type,
    }),
  },
  sms: {
    to: payee.phone,
    message: `PROPATI: Payment of ₦${(transaction.amount / 100).toLocaleString()} received!`,
  },
});
```

---

### 8. Rent Due Reminder
**When:** Scheduled job (7/3/1 days before due date)  
**File:** Create `src/lib/cron/rent-reminders.ts`  
**Channels:** Email, SMS

```typescript
import { renderRentReminderEmail } from '@/lib/email/templates';
import { format } from 'date-fns';

// Run daily cron job
const upcomingRents = await prisma.rentSchedule.findMany({
  where: {
    status: 'upcoming',
    dueDate: {
      in: [
        format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      ],
    },
  },
  include: { agreement: { include: { tenant: true, listing: true } } },
});

for (const rent of upcomingRents) {
  const daysUntilDue = differenceInDays(parseISO(rent.dueDate), new Date());
  
  await notificationService.notify({
    userId: rent.agreement.tenantId,
    type: 'rent_due',
    title: `Rent Due in ${daysUntilDue} Days`,
    message: `₦${rent.amount.toLocaleString()} due on ${rent.dueDate}`,
    actionUrl: `/agreements/${rent.agreementId}/pay`,
    channels: ['inapp', 'email', 'sms'],
    email: {
      to: rent.agreement.tenant.email,
      ...renderRentReminderEmail({
        tenantName: rent.agreement.tenant.fullName,
        propertyTitle: rent.agreement.listing.title,
        amount: rent.amount.toLocaleString(),
        dueDate: format(parseISO(rent.dueDate), 'MMM dd, yyyy'),
        daysUntilDue,
        agreementId: rent.agreementId,
      }),
    },
    sms: {
      to: rent.agreement.tenant.phone,
      message: `PROPATI: Rent of ₦${rent.amount.toLocaleString()} due in ${daysUntilDue} days`,
    },
  });
}
```

---

### 9. Inspection Scheduled
**When:** Admin schedules physical inspection (Layer 4)  
**File:** `src/app/api/verification/request-inspection/route.ts`  
**Channels:** Email, SMS, In-App

```typescript
import { renderInspectionScheduledEmail } from '@/lib/email/templates';
import { format } from 'date-fns';

await notificationService.notify({
  userId: listing.ownerId,
  type: 'verification',
  title: 'Inspection Scheduled',
  message: `Inspection scheduled for ${format(scheduledAt, 'MMM dd')}`,
  actionUrl: `/verification/${listing.id}`,
  channels: ['inapp', 'email', 'sms'],
  email: {
    to: owner.email,
    ...renderInspectionScheduledEmail({
      recipientName: owner.fullName,
      propertyTitle: listing.title,
      inspectionDate: format(scheduledAt, 'MMMM dd, yyyy'),
      inspectionTime: format(scheduledAt, 'h:mm a'),
      propertyAddress: listing.address,
      agentName: agent?.fullName,
      agentPhone: agent?.phone,
    }),
  },
  sms: {
    to: owner.phone,
    message: `PROPATI: Inspection scheduled for ${format(scheduledAt, 'MMM dd, h:mm a')}`,
  },
});
```

---

### 10. New Message Received
**When:** User sends message (after 1 hour if unread)  
**File:** `src/app/api/messages/route.ts`  
**Channels:** In-App immediately, Email after 1 hour

```typescript
import { renderMessageReceivedEmail } from '@/lib/email/templates';

// Immediately: In-app notification
await notificationService.create({
  userId: recipientId,
  type: 'message',
  title: `New message from ${sender.fullName}`,
  message: message.content.substring(0, 100),
  actionUrl: `/messages/${conversationId}`,
});

// After 1 hour: Check if unread, send email
setTimeout(async () => {
  const msg = await prisma.message.findUnique({ where: { id: message.id } });
  if (!msg?.isRead) {
    await notificationService.sendEmail({
      to: recipient.email,
      ...renderMessageReceivedEmail({
        recipientName: recipient.fullName,
        senderName: sender.fullName,
        messagePreview: message.content.substring(0, 150),
        propertyTitle: listing?.title,
        conversationId,
      }),
    });
  }
}, 3600000); // 1 hour
```

---

### 11. Listing Flagged (Admin)
**When:** User flags listing for review  
**File:** `src/app/api/listings/[id]/flag/route.ts`  
**Channels:** In-App (admin only)

```typescript
// Notify all admins
const admins = await prisma.user.findMany({ where: { role: 'admin' } });

for (const admin of admins) {
  await notificationService.create({
    userId: admin.id,
    type: 'system',
    title: 'Listing Flagged for Review',
    message: `${flag.type}: ${listing.title}`,
    actionUrl: `/admin/flags/${flag.id}`,
  });
}
```

---

### 12. Maintenance Ticket Created
**When:** Tenant creates maintenance ticket  
**File:** `src/app/api/orgs/[id]/tickets/route.ts`  
**Channels:** In-App, Email (landlord/org members)

```typescript
await notificationService.notify({
  userId: landlordId,
  type: 'maintenance',
  title: 'New Maintenance Ticket',
  message: `${ticket.title} — ${ticket.priority} priority`,
  actionUrl: `/maintenance/${ticket.id}`,
  channels: ['inapp', 'email'],
  email: {
    to: landlord.email,
    subject: `New Maintenance Request: ${ticket.title}`,
    html: `<p>A new maintenance ticket has been created for ${listing.title}</p>`,
    text: `New maintenance ticket: ${ticket.title}`,
  },
});
```

---

## Mock Mode

When credentials are not configured, services automatically enter mock mode:

- **Email**: Logs to console instead of sending
- **SMS**: Logs to console
- **WhatsApp**: Logs to console
- **In-App**: Always created (uses database)

Check `.env.example` for required environment variables:
- `SMTP_USER`, `SMTP_PASS` — Email
- `TERMII_API_KEY` — SMS
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` — WhatsApp

---

## Testing

```typescript
// Test multi-channel notification
import { notificationService } from '@/lib/notification-service';

await notificationService.notify({
  userId: 'test_user_id',
  type: 'system',
  title: 'Test Notification',
  message: 'This is a test',
  channels: ['inapp', 'email', 'sms', 'whatsapp'],
  email: {
    to: 'test@example.com',
    subject: 'Test',
    html: '<p>Test email</p>',
    text: 'Test email',
  },
  sms: {
    to: '2348012345678',
    message: 'Test SMS',
  },
  whatsapp: {
    to: '+2348012345678',
    message: 'Test WhatsApp',
  },
});
```

---

## Next Steps

1. **Integrate notifications** into existing API routes (verification, agreements, payments, etc.)
2. **Create cron jobs** for rent reminders (use Vercel Cron or Next.js API routes)
3. **Add user preferences** to control notification channels (Phase I)
4. **Implement push notifications** for mobile (Phase I)

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
