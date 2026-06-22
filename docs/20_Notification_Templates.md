# 20 – Notification Templates

## Implementation

Notification types are defined in Prisma enum `NotificationType` and created server-side in route handlers.

### Current Types

| Type | Trigger | UI Icon |
|------|---------|---------|
| `rent_due` | Rent schedule upcoming | DollarSign |
| `payment` | Payment confirmed | CheckCircle |
| `message` | New message in conversation | MessageSquare |
| `verification` | Layer update | Shield |
| `agreement` | Agreement signed / status change | FileText |
| `maintenance` | Ticket update | Wrench |
| `screening` | New application / screening scheduled | Phone |
| `system` | Platform announcements | Info |

### Delivery Channels

- **In-app:** Notification bell dropdown in topbar
- **Email:** Via `src/lib/email/templates/` (see `19_Email_Templates.md`)
- **SMS:** Via Termii for urgent reminders (rent due, maintenance urgent)
- **WhatsApp:** Twilio fallback for OTP only

### Notification Bell

- Unread count badge
- Dropdown with last 20 notifications
- Mark as read (single + mark all)
- 30-second polling via `GET /api/notifications/unread-count`

### Template Variables

Notifications support structured `data` JSON for routing:
```ts
{
  applicationId: string;
  listingId: string;
  conversationId: string;
  paymentId: string;
}
```

### Planned

- Browser push notifications
- SMS templates for all notification types
- WhatsApp templates for payment and agreement alerts
- User-configurable quiet hours
