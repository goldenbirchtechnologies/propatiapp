# PROPATI - Clerk Authentication Integration

This document describes the Clerk authentication layer implementation for the PROPATI Next.js application.

## Overview

The authentication layer consists of:

1. **Middleware** (`src/middleware.ts`) - Route protection and role-based access control
2. **Auth Helpers** (`src/lib/auth.ts`) - Server-side utilities for user management
3. **Webhook Handler** (`src/app/api/webhook/clerk/route.ts`) - Clerk → Prisma user sync
4. **Clerk Provider** (`src/components/providers/ClerkProviderWrapper.tsx`) - Client-side Clerk initialization
5. **API Auth Utilities** (`src/lib/api-auth.ts`) - Role-based API protection

## Features

### Middleware Protection

The middleware (`src/middleware.ts`) provides:

- **Public routes**: Landing page, auth pages, webhooks, property listings
- **Protected routes**: All dashboard routes require authentication
- **Role-based access**:
  - `/admin/*` → ADMIN only
  - `/agent/*` → AGENT, ADMIN
  - `/estate-manager/*` → ESTATE_MANAGER, ADMIN
  - `/dashboard/landlord/*` → LANDLORD, ADMIN
  - `/dashboard/tenant/*` → TENANT, ADMIN

### Auth Helpers (`src/lib/auth.ts`)

```typescript
// Get current Clerk user
const user = await getCurrentUser();

// Get current user with full Prisma profile
const userWithProfile = await getCurrentUserWithProfile();

// Get current user role
const role = await getCurrentUserRole();

// Require specific role (throws if not authorized)
const user = await requireRole(['ADMIN', 'AGENT']);

// Shortcut helpers
await requireAdmin();
await requireAgent();
await requireEstateManager();
await requireLandlord();

// Check roles without throwing
const isAdmin = await hasRole('ADMIN');
const isAgentOrAdmin = await hasAnyRole(['AGENT', 'ADMIN']);

// Sync Clerk user to Prisma (used in webhook)
await syncClerkUserToPrisma(clerkUser);
```

### Webhook Handler

The Clerk webhook (`src/app/api/webhook/clerk/route.ts`) handles:

- `user.created` → Creates user in Prisma with Clerk metadata
- `user.updated` → Updates user in Prisma (role, verification status, etc.)
- `user.deleted` → Soft deletes user (marks inactive, preserves data integrity)

**Required Environment Variable:**
```
CLERK_WEBHOOK_SECRET=whsec_...
```

Configure in Clerk Dashboard → Webhooks → Add endpoint: `https://your-domain.com/api/webhook/clerk`

### Role Management

Roles are stored in Clerk's `public_metadata.role` and synced to Prisma:

```typescript
// In Clerk Dashboard or via API:
{
  "public_metadata": {
    "role": "LANDLORD", // or TENANT, AGENT, ADMIN, ESTATE_MANAGER
    "ninVerified": false,
    "phoneVerified": false,
    "idVerified": false,
    "profileCompleted": false,
    "agentTier": "STANDARD",
    "agentApproved": false
  }
}
```

### API Protection (`src/lib/api-auth.ts`)

```typescript
import { withAuth, requireAdmin, successResponse, errorResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['ADMIN', 'AGENT']);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Returns 401/403 response
  }
  
  const { user } = authResult;
  // user.id, user.clerkId, user.email, user.role, user.fullName
  
  return successResponse({ message: 'Hello ' + user.fullName });
}
```

## Database Sync

The Prisma `User` model includes a `clerkId` field for linking:

```prisma
model User {
  id        String  @id @default(cuid())
  clerkId   String? @unique @map("clerk_id")
  email     String  @unique
  role      Role    @default(TENANT)
  // ... other fields
}
```

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## User Flow

1. **New User Signs Up** → Clerk creates user → Webhook creates Prisma user → Redirect to `/onboarding`
2. **Onboarding** → User completes profile → `profileCompleted` = true → Redirect to role dashboard
3. **Returning User** → Middleware checks auth → Redirects to appropriate dashboard based on role
4. **Role Change** → Admin updates Clerk `public_metadata.role` → Webhook syncs to Prisma

## Dashboard Routes

| Role | Dashboard Route | Navigation Config |
|------|-----------------|-------------------|
| LANDLORD | `/dashboard/landlord` | `LANDLORD_NAVIGATION` |
| TENANT | `/dashboard/tenant` | `TENANT_NAVIGATION` |
| AGENT | `/dashboard/agent` | `AGENT_NAVIGATION` |
| ADMIN | `/admin` | `ADMIN_NAVIGATION` |
| ESTATE_MANAGER | `/estate-manager` | `ESTATE_MANAGER_NAVIGATION` |

## Customization

### Adding New Public Routes

Edit `src/middleware.ts`:

```typescript
publicRoutes: [
  '/',
  '/api/webhook/clerk',
  '/your-new-route', // Add here
],
```

### Adding Role Checks

In middleware `afterAuth`:

```typescript
if (userId && path.startsWith('/your-role-route')) {
  const role = sessionClaims?.metadata?.role;
  if (role !== 'YOUR_ROLE') {
    return Response.redirect(new URL('/dashboard', req.url));
  }
}
```

### Extending User Profile

Add fields to Prisma schema and update `syncClerkUserToPrisma` in `src/lib/auth.ts`.

## Testing

```bash
# Run development server
npm run dev

# Test webhook locally with Clerk CLI
clerk webhook forward --url http://localhost:3000/api/webhook/clerk
```
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
