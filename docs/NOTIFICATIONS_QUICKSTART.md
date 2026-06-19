# Notifications System - Quick Start Guide

## 🚀 Getting Started

### 1. Run Database Migration

First, apply the schema changes to add notification preferences:

```bash
# Generate and apply migration
npx prisma migrate dev --name add_notification_preferences

# Verify migration
npx prisma migrate status

# Regenerate Prisma Client (if needed)
npx prisma generate
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Notification System

#### View Notifications Bell
1. Log in to your dashboard
2. Look at the top-right corner of the header
3. You should see a bell icon (🔔)
4. If there are unread notifications, a red badge will show the count

#### Create Test Notifications

Since the notification system is now live, you can create test notifications using Prisma Studio or directly in the database:

**Option A: Using Prisma Studio**
```bash
npx prisma studio
```

Then:
1. Open `Notification` table
2. Click "Add record"
3. Fill in:
   - `userId`: Your user ID (get from User table)
   - `type`: "verification" (or any valid type)
   - `title`: "Test Notification"
   - `body`: "This is a test notification message"
   - `read`: false
   - Leave `data` empty or add: `{"actionUrl": "/dashboard"}`
4. Save

**Option B: Using API Route (Admin Only)**
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "usr_xxxxxxxxxxxxx",
    "type": "verification",
    "title": "Property Verified",
    "body": "Your property has been successfully verified!",
    "data": {
      "actionUrl": "/dashboard/landlord/listings/lst_xxxxx"
    }
  }'
```

**Option C: Using Prisma Client (Recommended for Testing)**

Create a test script: `scripts/create-test-notification.ts`

```typescript
import { prisma } from '../src/lib/prisma';

async function createTestNotification(userId: string) {
  const notification = await prisma.notification.create({
    data: {
      userId: userId,
      type: 'verification',
      title: 'Property Verified',
      body: 'Your property at 123 Main Street has been verified and is now live!',
      read: false,
      data: {
        actionUrl: '/dashboard/landlord/listings',
        listingId: 'test_listing_id',
      },
    },
  });

  console.log('✅ Test notification created:', notification.id);
  return notification;
}

// Replace with a real user ID from your database
const userId = 'usr_xxxxxxxxxxxxx';

createTestNotification(userId)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```bash
npx ts-node scripts/create-test-notification.ts
```

### 4. Test Notification Features

#### A. Bell Icon & Badge
- [ ] Bell icon appears in header
- [ ] Unread count badge shows correct number
- [ ] Badge is red with white text
- [ ] Badge animates when new notification arrives

#### B. Notifications Dropdown
1. Click the bell icon
2. Dropdown should open
3. Check:
   - [ ] Last 10 notifications display
   - [ ] Unread notifications have blue dot
   - [ ] Icons match notification types
   - [ ] Timestamps show relative time (2m ago, 3h ago)
   - [ ] "Mark all read" button appears if unread exist
   - [ ] "View all" link appears
4. Click a notification:
   - [ ] Notification marks as read
   - [ ] Navigates to action URL (if exists)
   - [ ] Dropdown closes

#### C. Full Notifications Page
1. Navigate to: `/dashboard/{role}/notifications`
2. Check:
   - [ ] All notifications display
   - [ ] Filter tabs work (All/Unread)
   - [ ] Unread count shows in tab badge
   - [ ] Can mark individual as read/unread
   - [ ] "Mark all read" button works
   - [ ] "Load More" button appears if more than 20
   - [ ] Pagination works
   - [ ] Empty state shows when no notifications

#### D. Settings Page
1. Navigate to: `/dashboard/{role}/settings/notifications`
2. Check:
   - [ ] Page loads preferences
   - [ ] Toggle switches work
   - [ ] Can toggle channels (Email, SMS, WhatsApp, In-App)
   - [ ] Can toggle notification types
   - [ ] "Save Changes" button works
   - [ ] Success message appears after save
   - [ ] Preferences persist after reload

#### E. Real-time Polling
1. Keep browser tab open
2. Create a new notification (using Prisma Studio or script)
3. Wait up to 30 seconds
4. Check:
   - [ ] Badge count updates automatically
   - [ ] No page refresh needed
5. Hide browser tab (minimize or switch tabs)
6. Wait 1 minute
7. Switch back to tab
8. Check:
   - [ ] Polling resumes immediately
   - [ ] Badge updates

#### F. Mobile Responsive
1. Open on mobile device or resize browser
2. Check:
   - [ ] Bell icon responsive
   - [ ] Dropdown full-screen on mobile
   - [ ] Notifications page scrolls properly
   - [ ] Settings page touch-friendly
   - [ ] Toggle switches easy to tap

#### G. Keyboard Navigation
1. Tab to bell icon
2. Press Enter
3. Check:
   - [ ] Dropdown opens
4. Press Escape
5. Check:
   - [ ] Dropdown closes

## 🧪 Testing Different Notification Types

Create notifications with different types to test icons and colors:

```typescript
const notificationTypes = [
  {
    type: 'verification_approved',
    title: 'Verification Approved',
    body: 'Your property verification has been approved!',
  },
  {
    type: 'payment_received',
    title: 'Payment Received',
    body: 'You received a payment of ₦500,000',
  },
  {
    type: 'rent_due',
    title: 'Rent Due Soon',
    body: 'Your rent is due in 5 days',
  },
  {
    type: 'message_received',
    title: 'New Message',
    body: 'John Doe sent you a message',
  },
  {
    type: 'agreement_signed',
    title: 'Agreement Signed',
    body: 'Your rental agreement has been signed',
  },
];

// Create one of each
for (const notif of notificationTypes) {
  await prisma.notification.create({
    data: {
      userId: userId,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      read: false,
    },
  });
}
```

## 🔍 Debugging

### Check API Endpoints

#### Get Notifications
```bash
curl http://localhost:3000/api/notifications?page=1&limit=10
```

#### Get Unread Count
```bash
curl http://localhost:3000/api/notifications/unread-count
```

#### Mark as Read
```bash
curl -X PATCH http://localhost:3000/api/notifications/not_xxxxx/read \
  -H "Content-Type: application/json" \
  -d '{"read": true}'
```

#### Mark All as Read
```bash
curl -X POST http://localhost:3000/api/notifications/mark-all-read
```

#### Get Preferences
```bash
curl http://localhost:3000/api/users/notification-preferences
```

#### Update Preferences
```bash
curl -X PATCH http://localhost:3000/api/users/notification-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "email": false,
    "types": {
      "verification": true,
      "payment": false
    }
  }'
```

### Common Issues

#### Issue: Bell Icon Not Showing
**Check:**
1. DashboardShell component imported NotificationsBell?
2. Any console errors?
3. User authenticated?

#### Issue: Badge Count Not Updating
**Check:**
1. Browser console for errors
2. Network tab - is API being called every 30s?
3. Is Page Visibility API working? (Check tab visibility)

#### Issue: Notifications Not Loading
**Check:**
1. Database has notifications for the logged-in user
2. API endpoint returns data (test with curl)
3. Browser console for errors

#### Issue: Dropdown Not Opening
**Check:**
1. Click handler working?
2. z-index issues?
3. Console errors?

#### Issue: Mark as Read Not Working
**Check:**
1. API endpoint accessible
2. User owns the notification
3. Network tab shows request

#### Issue: Settings Not Saving
**Check:**
1. User model has notificationPreferences field
2. Migration applied
3. API endpoint accessible

### Inspect Database

```bash
# Open Prisma Studio
npx prisma studio

# Check User's notification preferences
# Navigate to User table → Find your user → Check notification_preferences column

# Check Notifications
# Navigate to Notification table → See all notifications
```

### Console Logs

Add these to debug:

```typescript
// In NotificationsBell
console.log('Unread count:', unreadCount);

// In NotificationsDropdown
console.log('Notifications loaded:', notifications);

// In NotificationCard
console.log('Notification clicked:', notification);
```

## 🎯 Success Checklist

Before considering the notification system complete, verify:

- [ ] Bell icon appears in header
- [ ] Unread badge shows correct count
- [ ] Badge animates on new notifications
- [ ] Dropdown opens and closes
- [ ] Notifications display with correct icons
- [ ] Timestamps format correctly
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Notifications page loads
- [ ] Filter tabs work
- [ ] Pagination works
- [ ] Settings page loads
- [ ] Settings save correctly
- [ ] Polling works (30s interval)
- [ ] Polling stops when tab hidden
- [ ] Polling resumes when tab visible
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Click outside closes dropdown
- [ ] ESC key closes dropdown
- [ ] No console errors
- [ ] API endpoints work
- [ ] Database migration successful

## 📱 Demo Scenario

**Complete User Flow:**

1. **Setup:**
   - User logs in as landlord
   - Has 3 properties listed

2. **Event:** Admin approves property verification
   ```typescript
   await prisma.notification.create({
     data: {
       userId: landlordUserId,
       type: 'verification_approved',
       title: 'Property Verified',
       body: 'Your property at 123 Main St has been verified!',
       data: {
         actionUrl: '/dashboard/landlord/listings/lst_abc123',
       },
     },
   });
   ```

3. **User Experience:**
   - User sees badge count increase (1)
   - Badge pulses/animates
   - User clicks bell icon
   - Dropdown shows new notification
   - User clicks notification
   - Marks as read
   - Navigates to property listing
   - User verifies property is verified

4. **Settings:**
   - User goes to settings
   - Disables SMS notifications
   - Keeps email notifications
   - Disables rent reminders
   - Saves preferences
   - Preferences persist

## 🚢 Production Deployment

Before deploying to production:

1. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

2. **Environment Variables**
   No new env vars needed!

3. **Test in Staging**
   - Create test notifications
   - Verify all features work
   - Check mobile devices
   - Monitor performance

4. **Monitor**
   - Database queries performance
   - API response times
   - Frontend polling impact
   - User engagement

## 📊 Analytics (Future)

Track these metrics:
- Notification click-through rate
- Time to read notification
- Most engaged notification types
- User preference patterns
- Notification volume per user

## 🎉 You're Done!

The notification system is now fully functional. Users can:
- Receive in-app notifications
- View notifications in dropdown
- View all notifications on dedicated page
- Manage notification preferences
- Get real-time updates without refreshing

Next steps: Integrate notification creation into other system events (verifications, payments, agreements, etc.)
