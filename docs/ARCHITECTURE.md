# PROPATI — System Architecture

**Version:** 1.0  
**Status:** Production Reference  
**Stack:** Next.js 14 App Router · Prisma · Clerk · Supabase · Vercel

---

## Table of Contents

1. [Architecture Principles](#1-architecture-principles)
2. [System Topology](#2-system-topology)
3. [Next.js App Router Architecture](#3-nextjs-app-router-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Authentication Architecture](#5-authentication-architecture)
6. [Component Architecture](#6-component-architecture)
7. [State Management](#7-state-management)
8. [API Layer Design](#8-api-layer-design)
9. [Caching Strategy](#9-caching-strategy)
10. [File & Media Architecture](#10-file--media-architecture)
11. [Background Processing](#11-background-processing)
12. [Error Handling Architecture](#12-error-handling-architecture)
13. [Multi-Tenancy (B2B)](#13-multi-tenancy-b2b)
14. [Scalability Considerations](#14-scalability-considerations)

---

## 1. Architecture Principles

**1. Server-First.** Use React Server Components (RSC) by default. Only add `'use client'` when browser APIs, event handlers, or client-side state are genuinely needed. This keeps JavaScript bundle sizes small and data fetching close to the database.

**2. Type-Safe Everywhere.** TypeScript strict mode, Zod validation at system boundaries, Prisma for type-safe database access. Runtime errors should be impossible to introduce via malformed data.

**3. Security-by-Default.** Clerk middleware runs on every request before any route handler. Role checks happen inside API routes, not just in the UI. PII is encrypted at rest.

**4. Fail Gracefully.** Third-party integrations (Paystack, Prembly, Termii) all have mock modes and graceful error paths. A Prembly outage should not block identity verification UI — it should return a user-friendly error.

**5. Audit Everything.** Financial transactions, e-signatures, and identity verifications all generate immutable audit records. Nothing is silently deleted.

---

## 2. System Topology

```
┌──────────────────────────────────────────────────────────────────┐
│ USER'S BROWSER                                                    │
│                                                                   │
│  React 18 — RSC + Client Components                              │
│  TanStack Query (client state/cache) · Zustand (UI state)        │
│  Clerk.js (session tokens, sign-in UI)                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTPS (TLS 1.3)
┌────────────────────────▼─────────────────────────────────────────┐
│ VERCEL EDGE NETWORK                                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ clerkMiddleware() — validates JWT, RBAC route guards      │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│  ┌─────────────────────────▼──────────────────────────────┐     │
│  │ Next.js 14 App (Node.js runtime)                        │     │
│  │                                                          │     │
│  │  React Server Components → HTML/streaming               │     │
│  │  API Routes (/api/**) → JSON                            │     │
│  │  Server Actions → typed mutations                        │     │
│  └──────┬────────────────────────┬───────────────────────┘     │
│         │                        │                               │
│  ┌──────▼──────┐        ┌────────▼──────────┐                  │
│  │ Vercel CDN  │        │  Vercel Cron       │                  │
│  │ Static/ISR  │        │  (rent reminders,  │                  │
│  │ pages       │        │   flag sweep, OTP  │                  │
│  └─────────────┘        │   cleanup)         │                  │
│                         └───────────────────┘                   │
└────────────────────────────────────────────────────────────────┘
         │                    │                    │
┌────────▼──────┐   ┌─────────▼──────┐   ┌───────▼──────────────┐
│   SUPABASE    │   │     CLERK       │   │  THIRD-PARTY SERVICES │
│               │   │                 │   │                        │
│ PostgreSQL 15 │   │ Auth / JWKS     │   │ Paystack (payments)   │
│ PgBouncer     │   │ User sync       │   │ Prembly (identity)    │
│ Connection    │   │ Webhooks        │   │ Cloudinary (media)    │
│ Pooling       │   │                 │   │ Termii (SMS)          │
│               │   │                 │   │ Nodemailer (email)    │
└───────────────┘   └─────────────────┘   └───────────────────────┘
```

### 2.1 Network Boundaries

| Boundary | Protocol | Auth Mechanism |
|----------|----------|----------------|
| Browser → Vercel | HTTPS | Clerk session cookie / Bearer token |
| Vercel → Supabase | PostgreSQL over TLS | `DATABASE_URL` (PgBouncer) |
| Vercel → Clerk | HTTPS | `CLERK_SECRET_KEY` |
| Vercel → Paystack | HTTPS | `Authorization: Bearer` |
| Vercel → Prembly | HTTPS | API key header |
| Vercel → Cloudinary | HTTPS | API key + secret (signed) |
| Paystack → Vercel (webhook) | HTTPS | HMAC-SHA512 signature |
| Clerk → Vercel (webhook) | HTTPS | svix HMAC signature |

---

## 3. Next.js App Router Architecture

### 3.1 Route Group Strategy

```
src/app/
├── (public)/          ← No auth required; public layout (landing, listings, auth)
├── (dashboard)/       ← Auth required; DashboardShell layout (sidebar + topbar)
├── admin/             ← Admin-only; separate layout
├── estate-manager/    ← Estate manager + admin; EM-themed layout
└── api/               ← REST API routes; no layout
```

**Why route groups?** Route groups `(public)` and `(dashboard)` let us share separate `layout.tsx` files without the group name appearing in the URL. A landlord at `/dashboard/landlord` and a tenant at `/dashboard/tenant` both use the `(dashboard)` layout's auth guard and shell.

### 3.2 Server vs Client Components

```
Page (Server Component)
├── Fetches data directly from Prisma (no HTTP round-trip)
├── Passes serialisable data as props to Client Components
│
├── ClientDataTable (Client Component — 'use client')
│   ├── Receives initial data as props from Server Component
│   ├── Uses TanStack Query with initialData for optimistic updates
│   └── Handles user interactions (sort, filter, pagination)
│
├── StaticContent (Server Component)
│   └── Renders without client JS
│
└── VerificationWizard (Client Component — 'use client')
    ├── Multi-step form state with React Hook Form
    └── Calls API routes via axios for mutations
```

**Rule of thumb:** Server Components for read/display, Client Components for interactive forms, realtime polling, and drag-and-drop.

### 3.3 Layouts

| Layout | Path | Responsibilities |
|--------|------|-----------------|
| Root layout | `app/layout.tsx` | `<html>`, `<ClerkProvider>`, `<QueryClientProvider>`, font loading |
| Public layout | `app/(public)/layout.tsx` | Marketing topbar, footer |
| Dashboard layout | `app/(dashboard)/layout.tsx` | Auth guard (`requireAuth()`), `<DashboardShell>`, role-based redirect |
| Admin layout | `app/admin/layout.tsx` | `requireAdmin()`, admin shell |
| EM layout | `app/estate-manager/layout.tsx` | `requireEstateManager()`, EM-themed shell |

### 3.4 Server Actions

Used for mutations where full API routes would be over-engineered:

```typescript
// app/dashboard/landlord/properties/actions.ts
'use server'
import { requireLandlord } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function activateListing(listingId: string) {
  const user = await requireLandlord();
  await prisma.listing.update({
    where: { id: listingId, ownerId: user.id }, // ownership check
    data: { status: 'active' },
  });
  revalidatePath('/dashboard/landlord/properties');
}
```

Server Actions are used for **simple, page-local mutations**. Complex flows (payment initiation, verification submission) use API routes for better testability and explicit status codes.

---

## 4. Data Architecture

### 4.1 Prisma Client Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why singleton?** Next.js hot-reload in development would otherwise create hundreds of Prisma clients, exhausting the PgBouncer connection pool. The singleton pattern prevents this.

### 4.2 Supabase Connection Pooling

Two connection strings are required:
- `DATABASE_URL` — PgBouncer transaction-mode pooler (port 6543) — used for runtime queries
- `DIRECT_URL` — Direct connection (port 5432) — used by `prisma migrate deploy` only

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

PgBouncer in transaction mode does not support prepared statements or `BEGIN/COMMIT` wrappers. Prisma uses `pgbouncer=true` in the URL to disable these automatically.

### 4.3 Query Patterns

**Always select only needed fields:**
```typescript
// Good — explicit select
const listing = await prisma.listing.findUnique({
  where: { id },
  select: {
    id: true, title: true, price: true, area: true, verificationTier: true,
    owner: { select: { fullName: true, avatarUrl: true } },
    images: { where: { isCover: true }, select: { url: true } },
  },
});

// Avoid — returns all 25 fields + all relations
const listing = await prisma.listing.findUnique({ where: { id }, include: { owner: true } });
```

**Avoid N+1 in list queries:**
```typescript
// Good — single query with nested include
const listings = await prisma.listing.findMany({
  include: {
    images: { where: { isCover: true }, take: 1 },
    _count: { select: { savedBy: true } },
  },
});

// Bad — N+1
const listings = await prisma.listing.findMany();
for (const l of listings) {
  l.coverImage = await prisma.listingImage.findFirst({ where: { listingId: l.id, isCover: true } });
}
```

### 4.4 Transaction Usage

Use Prisma `$transaction` when multiple writes must succeed or fail together:

```typescript
// Agreement signing — must update agreement + create signature atomically
await prisma.$transaction([
  prisma.agreement.update({
    where: { id: agreementId },
    data: { tenantSignedAt: now, status: 'fully_signed' },
  }),
  prisma.agreementSignature.create({
    data: { agreementId, signerId, role: 'tenant', ipAddress, checksum },
  }),
]);
```

---

## 5. Authentication Architecture

### 5.1 Auth Flow

```
1. User visits propati.ng (any page)
2. clerkMiddleware() checks JWT in cookie/Authorization header
3. Public route → pass through
4. Protected route → verify JWT via Clerk JWKS endpoint
5. Role-based route → check publicMetadata.role in JWT claims
6. Unauthorized → redirect to /sign-in with returnUrl
```

### 5.2 Dual-Storage Pattern

```
Clerk User (source of truth for auth)      Prisma User (source of truth for app data)
├── userId (Clerk ID)                       ├── id (CUID)
├── email                                   ├── clerkId = Clerk userId
├── publicMetadata.role                     ├── role (enum)
├── publicMetadata.ninVerified              ├── ninVerified
└── JWT (15 min expiry, auto-refreshed)     └── all profile data
                     │
                     │ synced via webhook
                     ▼
            clerk-webhook handler
```

**Why dual storage?** Clerk is the authoritative source for authentication tokens. Prisma is the authoritative source for application data. The webhook keeps them in sync. API routes query Prisma, not Clerk's API, to avoid latency.

### 5.3 Auth State in Client Components

```typescript
// Client components use Clerk hooks
import { useUser } from '@clerk/nextjs';

export function TopBar() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as UserRole;
  // ...
}
```

```typescript
// Server components use Clerk server functions
import { auth, currentUser } from '@clerk/nextjs/server';

export async function LandlordPage() {
  const { userId } = auth();
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });
  // ...
}
```

---

## 6. Component Architecture

### 6.1 Component Tree

```
App Root (layout.tsx)
├── ClerkProviderWrapper
│   └── QueryClientProvider (TanStack Query)
│       ├── (public) layout
│       │   ├── LandingPage
│       │   │   ├── HeroSearch
│       │   │   └── ListingGrid
│       │   │       └── ListingCard[]
│       │   └── ListingDetailPage
│       │       ├── ImageGallery (Client)
│       │       ├── VerificationBadge
│       │       └── CTAPanel (Client)
│       │
│       └── (dashboard) layout
│           └── DashboardShell
│               ├── Sidebar (Client — nav state)
│               ├── Topbar (Client — notifications, avatar)
│               └── <children> (role-specific page)
│                   ├── LandlordHomePage
│                   ├── VerificationWizard (Client — multi-step)
│                   ├── MessagesPage (Client — polling)
│                   └── ...
```

### 6.2 Component Directory

```
src/components/
├── ui/                    # Base shadcn/ui primitives (never modified after init)
│   ├── button.tsx         # Radix + CVA variants
│   ├── card.tsx
│   ├── badge.tsx          # 4 verification tiers + 8 status variants
│   ├── input.tsx
│   ├── dialog.tsx         # Desktop modal + mobile bottom sheet
│   ├── data-table.tsx     # Generic sortable, paginated table
│   └── ...
│
├── layout/                # Page-level shells
│   ├── DashboardShell.tsx # Sidebar + topbar + content area
│   ├── sidebar.tsx        # Role-aware nav config
│   └── topbar.tsx         # Bell, avatar, purpose switcher
│
├── listings/              # Listing-specific components
│   ├── listing-card.tsx   # Grid + list variants
│   ├── search-filters.tsx # Type, area, price, tier filters
│   └── listing-form.tsx   # Multi-step add/edit form (Client)
│
├── verification/          # 5-layer verification wizard
│   └── wizard.tsx         # Stepper, layer status, doc upload (Client)
│
├── agreements/            # Agreement components
│   ├── preview.tsx        # HTML renderer + sign CTA
│   └── signature-modal.tsx
│
├── orgs/                  # Estate manager B2B components
│   ├── onboarding-wizard.tsx
│   ├── portfolio-grid.tsx
│   └── maintenance-kanban.tsx
│
└── providers/
    └── ClerkProviderWrapper.tsx  # Clerk + Query combined provider
```

### 6.3 Design System

All UI is built on **Tailwind CSS** + **Radix UI** (via shadcn/ui). Five role-specific themes are implemented as Tailwind `data-theme` attribute variants or CSS custom properties.

| Theme Token | Landing | Landlord | Tenant | Agent | Admin | Estate Mgr |
|-------------|---------|----------|--------|-------|-------|------------|
| Background | sand `#f5f3ee` | dark `#0f0f0f` | light `#f7f5f0` | navy `#060d18` | dark `#0c0e12` | navy `#080E18` |
| Accent | gold `#c9952a` | rust `#d4622a` | teal `#0e7c6a` | gold `#c9952a` | cyan `#00d4c8` | blue `#6EA8FE` |

See `UI_UX_BRIEF.md` for full token reference.

---

## 7. State Management

### 7.1 State Layers

```
┌─────────────────────────────────────┐
│  SERVER STATE (TanStack Query)       │
│  API data: listings, agreements,     │
│  transactions, notifications         │
│  Cache: 5min stale, background sync  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│  AUTH STATE (Clerk)                  │
│  useUser(), useAuth()                │
│  Session, role, verification flags  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│  UI STATE (Zustand)                  │
│  Sidebar open/closed                 │
│  Active modal                        │
│  Toast queue                         │
│  Active conversation ID              │
│  Tenant purpose (rent/buy/etc.)      │
└─────────────────────────────────────┘
```

### 7.2 TanStack Query Conventions

```typescript
// hooks/useListings.ts
export function useListings(filters: ListingFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => api.get<Listing[]>('/api/listings', { params: filters }),
    staleTime: 60_000,   // 1 minute — listings change infrequently
  });
}

// Optimistic update for save/unsave
export function useSaveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => api.post(`/api/listings/${listingId}/save`),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: ['listings'] });
      // Toggle saved state optimistically
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(['listings'], context?.previous);
    },
  });
}
```

### 7.3 Zustand Store

```typescript
// lib/store.ts
interface UIStore {
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  tenantPurpose: 'rent' | 'buy' | 'short_let' | 'share';
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Toast) => void;
  setTenantPurpose: (purpose: UIStore['tenantPurpose']) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      tenantPurpose: 'rent',
      // ...
    }),
    { name: 'propati-ui', partialize: (s) => ({ tenantPurpose: s.tenantPurpose }) },
  )
);
```

`tenantPurpose` is the only UI state that persists across reloads (via `localStorage`). Everything else is session-only.

---

## 8. API Layer Design

### 8.1 Request Lifecycle

```
Next.js API Route Handler
  │
  ├─ 1. Parse request (url params, query, body)
  ├─ 2. Authenticate: withAuth() → { user } | NextResponse(401)
  ├─ 3. Authorize: check user.role against allowed roles → NextResponse(403)
  ├─ 4. Validate body: Zod schema.parse() → ZodError → NextResponse(422)
  ├─ 5. Business logic: Prisma queries, third-party calls
  ├─ 6. Return: NextResponse.json({ data }) | NextResponse.json({ error })
  └─ 7. Error boundary: try/catch → log to Sentry + return 500
```

### 8.2 API Route Template

```typescript
// src/app/api/listings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateListingSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  price: z.number().positive().optional(),
  status: z.enum(['draft', 'active']).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(req, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const body = await req.json();
  const parsed = UpdateListingSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 422, parsed.error.flatten());
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return errorResponse('NOT_FOUND', 404);
  if (listing.ownerId !== user.id && user.role !== 'admin') {
    return errorResponse('FORBIDDEN', 403);
  }

  const updated = await prisma.listing.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return successResponse(updated);
}
```

### 8.3 Idempotency

Conversation creation is the canonical example — creating the same conversation twice should return the existing one:

```typescript
const conversation = await prisma.conversation.upsert({
  where: { landlordId_tenantId_listingId: { landlordId, tenantId, listingId } },
  create: { landlordId, tenantId, listingId },
  update: {}, // no-op if exists
});
```

Paystack transactions use Paystack's `reference` field for idempotency — store it in `Transaction.reference` and check before re-processing webhooks.

---

## 9. Caching Strategy

### 9.1 Cache Layers

```
Browser (TanStack Query)
├── Listings: stale 60s, revalidate on focus
├── Notifications: stale 30s, refetch interval 30s
├── Messages: stale 0s, refetch interval 4s (active conversation)
├── User profile: stale 5min
└── Agreement list: stale 2min

Vercel CDN (Next.js Cache)
├── / (landing): static, CDN cache indefinite, revalidate on deploy
├── /listings: ISR 60s
├── /listings/[id]: ISR 30s
└── /api/* : no cache (dynamic)

Database (Prisma)
└── No application-level cache — rely on PostgreSQL query planner
    and connection pooling (PgBouncer)
```

### 9.2 Cache Invalidation

```typescript
// Server-side: revalidate ISR pages after mutation
import { revalidatePath, revalidateTag } from 'next/cache';

// After listing update
revalidatePath('/listings');
revalidatePath(`/listings/${listingId}`);

// After verification certified
revalidateTag(`listing-${listingId}`);
```

```typescript
// Client-side: invalidate TanStack Query cache after mutation
queryClient.invalidateQueries({ queryKey: ['listings'] });
queryClient.invalidateQueries({ queryKey: ['verification', listingId] });
```

---

## 10. File & Media Architecture

### 10.1 Upload Flow

```
Client                    API Route                  Cloudinary
  │                           │                          │
  │── POST /api/listings/     │                          │
  │   [id]/images (multipart) │                          │
  │                           │── signed upload ─────────▶│
  │                           │   (server-side)           │
  │                           │◀─ { secureUrl, publicId } │
  │                           │                          │
  │                           │── prisma.listingImage.create()
  │                           │   { url: secureUrl, publicId }
  │◀─ { images[] } ───────────│
```

**Never expose Cloudinary API secret to the browser.** All uploads go through the API route which generates signed upload parameters.

### 10.2 Media Folder Structure

```
Cloudinary account: propati
├── propati/images/       ← Listing photos (transformed: f_auto,q_auto,w_800)
├── propati/documents/    ← Verification documents (no public access)
├── propati/videos/       ← Layer 3 verification videos
└── propati/avatars/      ← User profile photos
```

### 10.3 File Constraints

| Type | Max Size | Formats | Transformation |
|------|----------|---------|----------------|
| Listing images | 10MB each, 10 max | JPEG, PNG, WebP | `f_auto,q_auto,w_800` |
| Verification docs | 20MB | PDF, JPEG, PNG | None (stored as-is) |
| Video proof | 100MB | MP4, MOV | Cloudinary video transcoding |
| Avatar | 5MB | JPEG, PNG, WebP | `f_auto,q_auto,w_200,h_200,c_fill` |

---

## 11. Background Processing

### 11.1 Vercel Cron Jobs

Implemented as protected API routes called by Vercel Cron on schedule:

```typescript
// src/app/api/cron/rent-reminders/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Verify cron secret (prevents unauthorized invocation)
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const in7Days = addDays(today, 7);
  const in3Days = addDays(today, 3);
  const in1Day = addDays(today, 1);

  // Find rent schedules due in 7/3/1 days, send reminders
  // ...
}
```

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/rent-reminders", "schedule": "0 7 * * *" },
    { "path": "/api/cron/cleanup-tokens",  "schedule": "0 2 * * *" }
  ]
}
```

### 11.2 Webhook Processing

Webhooks from Paystack and Clerk are processed synchronously in API routes. For reliability:
- Verify signature **before** any processing
- Return HTTP 200 immediately after signature check
- Perform idempotency check (was this `reference` already processed?)
- Write to database inside `$transaction`
- Enqueue email/SMS (fire-and-forget, don't block response)

---

## 12. Error Handling Architecture

### 12.1 Error Hierarchy

```
ApplicationError (base)
├── AuthenticationError  → HTTP 401
├── AuthorizationError   → HTTP 403
├── NotFoundError        → HTTP 404
├── ValidationError      → HTTP 422 (with ZodIssue[] details)
├── ConflictError        → HTTP 409
├── RateLimitError       → HTTP 429
└── ExternalServiceError → HTTP 502 (Paystack/Prembly failure)
```

### 12.2 Client Error Boundaries

```tsx
// app/(dashboard)/layout.tsx
import { ErrorBoundary } from 'react-error-boundary';

export default function DashboardLayout({ children }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <DashboardErrorState error={error} onRetry={resetErrorBoundary} />
      )}
      onError={(error) => Sentry.captureException(error)}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 12.3 API Error Responses

```typescript
// All API routes use these helpers
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(code: string, status: number, details?: unknown) {
  return NextResponse.json({ error: ERROR_MESSAGES[code] ?? code, code, details }, { status });
}
```

---

## 13. Multi-Tenancy (B2B)

### 13.1 Organisation Scoping

Estate managers operate within an `Organisation` scope. All B2B data is scoped via `orgId`:

```typescript
// Every org-scoped API route verifies membership
async function requireOrgMember(userId: string, orgId: string, allowedRoles?: OrgMemberRole[]) {
  const member = await prisma.orgMember.findFirst({
    where: { orgId, userId, status: 'active' },
  });
  if (!member) throw new AuthorizationError();
  if (allowedRoles && !allowedRoles.includes(member.role)) throw new AuthorizationError();
  return member;
}
```

### 13.2 Org Plan Enforcement

```typescript
// Check unit limit before adding listing to org
const org = await prisma.organisation.findUnique({
  where: { id: orgId },
  include: { _count: { select: { listings: true } } },
});
if (org._count.listings >= org.maxUnits) {
  throw new ConflictError('Unit limit reached for your plan. Upgrade to add more.');
}
```

| Plan | `maxUnits` | `maxSeats` | Monthly |
|------|------------|------------|---------|
| starter | 20 | 1 | ₦25,000 |
| growth | 100 | 5 | ₦60,000 |
| enterprise | Unlimited | Unlimited | ₦150,000 |

---

## 14. Scalability Considerations

### 14.1 Current Bottlenecks (v1)

| Bottleneck | Impact | Mitigation |
|------------|--------|------------|
| Message polling (4s) | High DB read load at scale | WebSockets in v1.1 |
| Notification polling (30s) | Moderate | Server-Sent Events in v1.1 |
| PgBouncer max 20 connections | Connection exhaustion at ~200 concurrent users | Increase pool; Supabase auto-scaling |
| Cloudinary upload via API route | Adds server processing per upload | Pre-signed URLs (direct browser upload) in v1.1 |

### 14.2 Scaling Path

| Users | Action |
|-------|--------|
| 0–1,000 MAU | Current architecture is sufficient |
| 1,000–10,000 MAU | Enable ISR more aggressively; add Redis for notification counts |
| 10,000–50,000 MAU | Migrate messaging to WebSockets; add Supabase read replica |
| 50,000+ MAU | Edge API (Fly.io Lagos); Supabase horizontal sharding |

### 14.3 Database Connection Management

```
Vercel serverless functions → PgBouncer (transaction mode) → PostgreSQL
                              max_pool_size = 20
                              reserve_pool_size = 5
                              pool_mode = transaction

Prisma pool config (via DATABASE_URL):
  ?connection_limit=1        (per serverless function instance)
  &pool_timeout=10           (fail fast if no connection available)
  &pgbouncer=true            (disable prepared statements)
```

Each Vercel serverless function invocation creates at most 1 connection. PgBouncer multiplexes these across 20 PostgreSQL connections, supporting ~200 concurrent function invocations.

---

*This architecture document describes the production Next.js 14 system. The previous vanilla JS/Express architecture is documented in `oldpropati/` for historical reference only.*
