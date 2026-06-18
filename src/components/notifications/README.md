# Notifications System - PROPATI Phase H

Complete notification center implementation with in-app notifications, real-time polling, and user preferences.

## Components

### 1. NotificationsBell
Location: `src/components/notifications/notifications-bell.tsx`

Bell icon component that displays in the header with unread count badge.

**Features:**
- Real-time unread count badge
- Polling every 30 seconds when page visible
- Stops polling when tab hidden (Page Visibility API)
- Badge animation on new notifications
- Optional notification sound
- Opens NotificationsDropdown on click

**Props:**
```typescript
{
  position?: 'left' | 'right'; // Dropdown alignment
  userRole?: string;           // User role for navigation
  enableSound?: boolean;       // Enable notification sound
}
```

**Usage:**
```tsx
import { NotificationsBell } from '@/components/notifications/notifications-bell';

<NotificationsBell position="right" userRole="tenant" />
```

### 2. NotificationsDropdown
Location: `src/components/notifications/notifications-dropdown.tsx`

Dropdown panel showing last 10 notifications.

**Features:**
- Shows last 10 notifications
- Each notification has icon, title, message preview, timestamp
- Unread indicator (blue dot)
- Click notification to mark as read and navigate
- "Mark All Read" button
- "View All" link to full notifications page
- Empty state
- Click outside or ESC to close

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  userRole?: string;
}
```

### 3. NotificationCard
Location: `src/components/notifications/notification-card.tsx`

Individual notification card component.

**Features:**
- Icon based on notification type
- Title and body text
- Timestamp (relative)
- Unread indicator
- Mark as read/unread toggle
- Action button if actionUrl exists
- Different styling for read/unread

**Props:**
```typescript
{
  notification: Notification;
  onClick?: (notification: Notification) => void;
  onMarkRead?: (notificationId: string, read: boolean) => Promise<void>;
  compact?: boolean;
}
```

### 4. Notification Type
```typescript
interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date | string;
  actionUrl?: string;
}
```

## Pages

### 1. Notifications Page
Location: `src/app/dashboard/[role]/notifications/page.tsx`

Full notifications page with pagination.

**Features:**
- Filter tabs: All, Unread
- Unread count badge
- "Mark All Read" button
- Paginated list (20 per page)
- "Load More" button
- Empty state
- Click notification to navigate

**Route:** `/dashboard/{role}/notifications`

### 2. Notification Settings Page
Location: `src/app/dashboard/[role]/settings/notifications/page.tsx`

User notification preferences management.

**Features:**
- Toggle notification channels:
  - In-App Notifications
  - Email Notifications
  - SMS Notifications
  - WhatsApp Notifications
- Toggle notification types:
  - Verification Updates
  - Agreements
  - Payments
  - Messages
  - Rent Due Reminders
  - Maintenance Tickets
  - Screening Updates
  - System Announcements
- Save button with loading state
- Success message

**Route:** `/dashboard/{role}/settings/notifications`

## API Routes

### 1. GET /api/notifications
Get user's notifications with pagination.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)
- `unreadOnly` (default: false)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 2. GET /api/notifications/unread-count
Get count of unread notifications.

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

### 3. POST /api/notifications/mark-all-read
Mark all user's notifications as read.

**Response:**
```json
{
  "success": true,
  "updatedCount": 5
}
```

### 4. PATCH /api/notifications/:id/read
Mark single notification as read/unread.

**Body:**
```json
{
  "read": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {...}
}
```

### 5. GET /api/users/notification-preferences
Get user's notification preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "email": true,
    "sms": true,
    "whatsapp": false,
    "inapp": true,
    "types": {
      "verification": true,
      "agreement": true,
      ...
    }
  }
}
```

### 6. PATCH /api/users/notification-preferences
Update user's notification preferences.

**Body:**
```json
{
  "email": true,
  "sms": false,
  "types": {
    "verification": true,
    "payment": false
  }
}
```

## Utilities

### 1. Notification Icons
Location: `src/lib/notification-icons.ts`

Functions to get icon, color, and background color based on notification type.

**Functions:**
- `getNotificationIcon(type: string)` - Returns Lucide icon component
- `getNotificationColor(type: string)` - Returns Tailwind color class
- `getNotificationBgColor(type: string)` - Returns Tailwind background class

**Supported Types:**
- verification_submitted, verification_approved, verification_rejected
- agreement_created, agreement_signed, agreement_pending
- payment_received, payment_pending, payment_failed
- rent_due, rent_overdue
- inspection_scheduled, inspection_completed
- message_received
- listing_flagged, listing_approved, listing_rejected
- maintenance_ticket_created, maintenance_ticket_resolved
- screening_completed, screening_pending
- system_alert, system_update

### 2. Notification Utils
Location: `src/lib/notification-utils.ts`

Helper functions for notification formatting.

**Functions:**
- `formatNotificationTime(date)` - Format as "2m ago", "3h ago", "5d ago"
- `formatNotificationTimeRelative(date)` - Format as "2 minutes ago"
- `truncateNotification(message, maxLength)` - Truncate long messages
- `getNotificationActionText(type)` - Get action button text
- `createNotificationSound()` - Create notification sound player

## Database Schema

### User Model Update
Added `notificationPreferences` field to User model:

```prisma
model User {
  // ... existing fields
  
  notificationPreferences Json? @default("{\"email\":true,\"sms\":true,\"whatsapp\":false,\"inapp\":true,\"types\":{...}}") @map("notification_preferences")
  
  // ... relations
  notifications Notification[]
}
```

### Notification Model
Already exists in schema:

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
  
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, read])
  @@map("notifications")
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

## Integration

### DashboardShell
The NotificationsBell has been integrated into the DashboardShell component:

```tsx
import { NotificationsBell } from '@/components/notifications/notifications-bell';

// In header
<NotificationsBell position="right" userRole={userRole} />
```

## Features Implemented

✅ Bell icon component with unread badge
✅ Notifications dropdown panel
✅ Full notifications page with pagination
✅ Notification settings page
✅ API routes for notifications CRUD
✅ API routes for preferences
✅ Real-time polling (30s interval)
✅ Page Visibility API integration
✅ Mark as read functionality
✅ Mark all as read functionality
✅ Filter by unread
✅ Click to navigate
✅ Empty states
✅ Loading states
✅ Mobile responsive
✅ Keyboard navigation (ESC to close)
✅ Click outside to close
✅ Badge animation on new notifications
✅ Optional notification sound
✅ Notification type icons and colors
✅ Timestamp formatting
✅ Database schema updated

## Not Implemented (As Per Requirements)

❌ Push notifications
❌ Browser notifications
❌ Notification sound settings UI
❌ Notification digest/batching

## Usage Example

### Creating Notifications (Backend)
Notifications should be created by the backend when events occur:

```typescript
// Example: Create verification notification
await prisma.notification.create({
  data: {
    userId: user.id,
    type: 'verification',
    title: 'Verification Approved',
    body: 'Your property verification has been approved!',
    data: {
      actionUrl: `/dashboard/landlord/listings/${listingId}`,
      verificationId: verification.id,
    },
  },
});
```

### Frontend Integration
The NotificationsBell component is already integrated in DashboardShell and will automatically:
1. Poll for new notifications every 30 seconds
2. Update the unread count badge
3. Show animations when new notifications arrive
4. Allow users to view and manage notifications

## Testing Checklist

- [ ] Bell icon shows correct unread count
- [ ] Polling works correctly (check every 30s)
- [ ] Polling stops when tab hidden
- [ ] Polling resumes when tab visible
- [ ] Dropdown opens/closes correctly
- [ ] Click outside closes dropdown
- [ ] ESC key closes dropdown
- [ ] Notifications display correctly in dropdown
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Navigation to action URL works
- [ ] Full notifications page loads
- [ ] Filter tabs work (All/Unread)
- [ ] Pagination/Load More works
- [ ] Empty states display correctly
- [ ] Settings page loads preferences
- [ ] Settings page saves preferences
- [ ] Mobile responsive design works
- [ ] Badge animation on new notifications

## Next Steps (Future Enhancements)

1. **Backend Integration**: Implement notification creation in other system events:
   - Verification status changes
   - Agreement creation/signing
   - Payment received
   - Rent due reminders
   - Inspection scheduling
   - Message received
   - Maintenance ticket updates

2. **Email/SMS Integration**: Implement actual email and SMS sending based on user preferences

3. **WhatsApp Integration**: Implement WhatsApp Business API for notifications

4. **Push Notifications**: Add web push notifications support

5. **Notification Grouping**: Group similar notifications together

6. **Notification Actions**: Add quick actions in dropdown (e.g., "Approve", "Reject")
