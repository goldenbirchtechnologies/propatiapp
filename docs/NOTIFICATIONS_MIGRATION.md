# Notifications System Migration Guide

## Overview
This guide covers the database migration needed for the Notifications System (Phase H).

## Database Changes

### 1. User Model - Added Field
A new field has been added to the `User` model:

```prisma
notificationPreferences Json? @default("{\"email\":true,\"sms\":true,\"whatsapp\":false,\"inapp\":true,\"types\":{\"verification\":true,\"agreement\":true,\"payment\":true,\"message\":true,\"rent_due\":true,\"maintenance\":true,\"screening\":true,\"system\":true}}") @map("notification_preferences")
```

### 2. Notification Model
The `Notification` model already exists in the schema. No changes needed.

## Migration Steps

### Step 1: Generate Migration
Run the following command to generate a new Prisma migration:

```bash
npx prisma migrate dev --name add_notification_preferences
```

This will:
1. Generate a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Regenerate the Prisma Client

### Step 2: Verify Migration
Check that the migration was successful:

```bash
npx prisma migrate status
```

### Step 3: Push to Database (Production)
When deploying to production, run:

```bash
npx prisma migrate deploy
```

## Testing the Migration

### 1. Check Default Values
After migration, new users should automatically have the default notification preferences:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { notificationPreferences: true }
});

console.log(user.notificationPreferences);
// Should output: { email: true, sms: true, whatsapp: false, inapp: true, types: {...} }
```

### 2. Test Existing Users
Existing users will have `null` for `notificationPreferences`. The API will handle this by returning default preferences:

```typescript
// API will automatically use defaults if null
GET /api/users/notification-preferences
// Returns default preferences for users with null values
```

### 3. Test Updates
Test updating preferences:

```typescript
PATCH /api/users/notification-preferences
{
  "email": false,
  "types": {
    "verification": true
  }
}
```

## Rollback Plan

If you need to rollback the migration:

```bash
# View migration history
npx prisma migrate status

# Rollback (requires manual SQL)
npx prisma db execute --file=./rollback.sql
```

Create `rollback.sql`:
```sql
-- Remove notification_preferences column
ALTER TABLE users DROP COLUMN IF EXISTS notification_preferences;
```

## Data Migration (Optional)

If you want to set default preferences for all existing users:

```typescript
// scripts/migrate-notification-preferences.ts
import { prisma } from '../src/lib/prisma';

async function migrateNotificationPreferences() {
  const defaultPreferences = {
    email: true,
    sms: true,
    whatsapp: false,
    inapp: true,
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

  // Update all users with null preferences
  const result = await prisma.user.updateMany({
    where: {
      notificationPreferences: null,
    },
    data: {
      notificationPreferences: defaultPreferences,
    },
  });

  console.log(`Updated ${result.count} users with default notification preferences`);
}

migrateNotificationPreferences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the script:
```bash
npx ts-node scripts/migrate-notification-preferences.ts
```

## Post-Migration Checklist

- [ ] Migration applied successfully
- [ ] Prisma Client regenerated
- [ ] Default preferences set for new users
- [ ] Existing users can access notification settings
- [ ] API endpoints working correctly
- [ ] Frontend components rendering properly
- [ ] No console errors in browser
- [ ] Notification preferences save correctly
- [ ] Notification preferences load correctly

## Notes

1. The `notificationPreferences` field uses `Json` type, which stores preferences as JSON
2. Default value is set at the database level for new users
3. Existing users with `null` values will get defaults from the API layer
4. The field is nullable to allow for flexibility
5. Consider running the data migration script if you want all users to have explicit preferences

## Troubleshooting

### Issue: Migration Fails
**Solution:** Check database connection and permissions

### Issue: Default Value Not Applied
**Solution:** Verify Prisma version supports complex default JSON values. If not, use the data migration script.

### Issue: Existing Users Show Null
**Solution:** This is expected. The API handles null by returning defaults. Use data migration script if you want explicit values.

### Issue: JSON Parse Errors
**Solution:** Ensure the JSON in the default value is properly escaped and valid.

## Environment Variables

No new environment variables are needed for this migration.

## Dependencies

No new dependencies are needed. The notification system uses existing packages:
- `@prisma/client` - Already installed
- `date-fns` - Already installed (v4.4.0)
- `lucide-react` - Already installed

## Performance Considerations

1. **Indexes**: The `notifications` table already has an index on `[userId, read]`
2. **Polling**: Frontend polls every 30 seconds (stops when tab hidden)
3. **Pagination**: Notifications page loads 20 at a time
4. **Dropdown**: Only fetches last 10 notifications

## Security Considerations

1. All API routes use `withAuth` middleware
2. Users can only access their own notifications
3. Users can only modify their own preferences
4. Notification creation requires admin role (for manual creation)
5. System should create notifications automatically on events

## Next Steps After Migration

1. Test notification creation in development
2. Verify polling behavior
3. Test on mobile devices
4. Set up automated notification creation for system events
5. Monitor database performance
6. Set up notification retention policy (optional)
