# PROPATI — Technical Requirements Document (TRD)

**Version:** 2.0  
**Status:** Production-Ready Specification  
**Stack:** Next.js 14 App Router · TypeScript · Prisma · PostgreSQL · Clerk · Paystack  
**Last Updated:** 2026-06-18

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Specification](#6-api-specification)
7. [Core Business Logic](#7-core-business-logic)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Security Implementation](#9-security-implementation)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [Performance Requirements](#11-performance-requirements)
12. [Testing Requirements](#12-testing-requirements)
13. [Environment Configuration](#13-environment-configuration)
14. [Future Extensibility](#14-future-extensibility)
15. [Cross-References](#15-cross-references)

---

## 1. System Overview

### 1.1 Product Description

PROPATI is Nigeria's first **verified property platform** — a unified marketplace combining:
- **Consumer marketplace:** rent, buy, short-let, room share, commercial listings
- **Property management:** rent collection, tenant screening, digital agreements, maintenance tracking
- **B2B SaaS:** multi-tenant estate management for property companies

### 1.2 Core Differentiator

The **5-Layer Trust Verification System** addresses Nigeria's primary property problem — fraud and misrepresentation:

### Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer

| Layer | Mechanism | Who Reviews |
|-------|-----------|-------------|
| L1 | Document upload (C of O, Deed, Survey, Gov. Consent) | Admin |
| L2 | Identity match via Prembly (NIN/BVN) | Automated + Admin |
| L3 | Live video proof with unique QR code | Admin |
| L4 | Physical agent inspection on-site | Agent + Admin |
| L5 | Final admin certification → **Certified** badge | Admin |

### 1.3 User Roles

| Role | Primary Capabilities |
|------|---------------------|
| `landlord` | List properties, screen tenants, collect rent, manage agreements, verify properties |
| `tenant` | Search listings, apply, pay rent, manage tenancy, raise maintenance requests |
| `agent` | Manage landlord listings, deal pipeline, earn commissions, schedule inspections |
| `admin` | Verification queue, dispute resolution, user management, platform analytics |
| `estate_manager` | B2B SaaS — org setup, portfolio mgmt, rent ledger, maintenance, team, billing |

### 1.4 Scale Targets (6 Months Post-Launch)

| Metric | Target |
|--------|--------|
| MAU | 10,000 |
| Certified listings | ≥ 40% of total |
| Dispute rate | < 5% of transactions |
| Payment success | > 99% |
| B2B clients | 25 (₦1.6M MRR) |

---

## 2. Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| **Framework** | Next.js | 14.2.0 | App Router, React Server Components, Server Actions |
| **Language** | TypeScript | ^5.0.0 | Strict mode |
| **Database** | PostgreSQL | 15.x | Hosted on Supabase |
| **ORM** | Prisma | ^5.0.0 | With Prisma Client, migrations, seed |
| **Authentication** | Clerk | ^5.0.0 | `clerkMiddleware`, webhooks for DB sync |
| **Payments** | Paystack | Direct HTTP | Inline checkout, webhooks, Transfer API |
| **Styling** | Tailwind CSS + Radix UI | — | shadcn/ui component library |
| **State (Server)** | TanStack Query | ^5.48.0 | Data fetching, caching, background sync |
| **State (Client)** | Zustand | — | UI state: modals, sidebar, toasts |
| **Forms** | React Hook Form + Zod | — | Type-safe validation throughout |
| **Storage** | Cloudinary | — | Images, documents, video; CDN delivery |
| **Identity Verification** | Prembly IdentityPass | Direct HTTP | NIN/BVN/DL/PVC lookup |
| **SMS** | Termii | Direct HTTP | Nigerian SMS; Twilio WhatsApp fallback |
| **Email** | Nodemailer | — | SMTP via Gmail/SendGrid |
| **Testing** | Vitest + Playwright | — | Unit, integration, E2E |
| **Linting** | ESLint + Prettier | — | Enforced in CI |

### 2.1 Dependency Inventory (Key Packages)

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@tanstack/react-query": "^5.48.0",
    "next": "14.2.0",
    "react": "^18.3.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.x",
    "zustand": "^4.x",
    "axios": "^1.7.2",
    "bcryptjs": "^3.0.3",
    "date-fns": "^4.4.0",
    "lucide-react": "^1.20.0",
    "cloudinary": "^2.x",
    "nodemailer": "^6.x"
  },
  "devDependencies": {
    "vitest": "^1.x",
    "@playwright/test": "^1.x",
    "@testing-library/react": "^14.x",
    "prisma": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 3. Architecture

### 3.1 High-Level Topology

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│   Browser / PWA (Next.js App Router — React 18)              │
│   Server Components + Client Components + Server Actions     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────────┐
│                       VERCEL EDGE                            │
│   Next.js 14 App · Clerk Middleware · Edge Functions         │
│   CDN: Static Assets, ISR pages                              │
└──────────┬───────────────────┬──────────────────────────────┘
           │                   │
    ┌──────▼──────┐   ┌────────▼────────┐
    │  Supabase   │   │    Clerk         │
    │ PostgreSQL  │   │  Auth Service    │
    │  (UK West)  │   │  (JWT / JWKS)    │
    └──────┬──────┘   └────────┬────────┘
           │                   │ Webhook
    ┌──────▼───────────────────▼────────┐
    │         NEXT.JS API ROUTES         │
    │  /api/**  — Node.js serverless     │
    │  Prisma Client ← → PostgreSQL      │
    └──────┬────────────────────────────┘
           │
    ┌──────▼────────────────────────────┐
    │       THIRD-PARTY SERVICES         │
    │  Paystack · Prembly · Termii        │
    │  Twilio · Cloudinary · Nodemailer  │
    └───────────────────────────────────┘
```

### 3.2 Next.js App Router Route Structure

```
src/app/
├── (public)/                          # Unauthenticated routes
│   ├── layout.tsx                     # Public layout (topbar, no sidebar)
│   ├── page.tsx                       # Landing page — SSG
│   ├── listings/
│   │   ├── page.tsx                   # Search results — ISR 60s
│   │   └── [id]/page.tsx              # Listing detail — ISR 30s
│   ├── sign-in/[[...sign-in]]/page.tsx
│   └── sign-up/[[...sign-up]]/page.tsx
│
├── (dashboard)/                       # Protected, role-aware shell
│   ├── layout.tsx                     # Auth guard + DashboardShell (sidebar + topbar)
│   ├── onboarding/page.tsx            # Role-specific onboarding wizard
│   ├── dashboard/
│   │   ├── landlord/
│   │   │   ├── page.tsx               # Landlord home (KPIs)
│   │   │   ├── properties/page.tsx
│   │   │   ├── rent/page.tsx
│   │   │   ├── verification/page.tsx
│   │   │   ├── agreements/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── tenant/
│   │   │   ├── page.tsx               # Tenant home + purpose switcher
│   │   │   ├── search/page.tsx
│   │   │   ├── payments/page.tsx
│   │   │   ├── agreements/page.tsx
│   │   │   ├── maintenance/page.tsx
│   │   │   └── profile/page.tsx
│   │   └── agent/
│   │       ├── page.tsx
│   │       ├── pipeline/page.tsx
│   │       ├── listings/page.tsx
│   │       ├── inspections/page.tsx
│   │       └── commissions/page.tsx
│   ├── admin/
│   │   ├── page.tsx                   # Admin overview
│   │   ├── verification/page.tsx
│   │   ├── flags/page.tsx
│   │   ├── disputes/page.tsx
│   │   ├── users/page.tsx
│   │   └── revenue/page.tsx
│   └── estate-manager/
│       ├── page.tsx                   # EM home / onboarding wizard
│       ├── portfolio/page.tsx
│       ├── ledger/page.tsx
│       ├── maintenance/page.tsx
│       ├── team/page.tsx
│       ├── billing/page.tsx
│       └── reports/page.tsx
│
└── api/                               # Next.js API routes
    ├── auth/
    │   ├── me/route.ts
    │   └── clerk-webhook/route.ts
    ├── listings/
    │   ├── route.ts                   # GET search, POST create
    │   ├── [id]/route.ts              # GET, PATCH, DELETE
    │   ├── [id]/images/route.ts
    │   ├── [id]/save/route.ts
    │   └── [id]/flag/route.ts
    ├── verification/
    │   ├── layer1/route.ts
    │   ├── layer1/review/route.ts
    │   ├── layer2/route.ts
    │   ├── layer2/confirm/route.ts
    │   ├── layer3/route.ts
    │   ├── layer3/review/route.ts
    │   ├── layer4/route.ts
    │   ├── layer4/complete/route.ts
    │   ├── layer5/route.ts
    │   ├── status/route.ts
    │   └── admin/queue/route.ts
    ├── agreements/
    │   ├── route.ts
    │   ├── [id]/route.ts
    │   ├── [id]/preview/route.ts
    │   ├── [id]/sign/route.ts
    │   └── [id]/terminate/route.ts
    ├── messages/
    │   ├── route.ts
    │   └── [conversationId]/route.ts
    ├── payments/
    │   ├── route.ts                   # POST initiate
    │   ├── [id]/route.ts
    │   ├── [id]/verify/route.ts
    │   └── [id]/release/route.ts
    ├── users/
    │   ├── route.ts
    │   ├── [id]/route.ts
    │   ├── me/profile/route.ts
    │   └── me/notifications/route.ts
    ├── orgs/
    │   ├── route.ts
    │   ├── [id]/route.ts
    │   ├── [id]/portfolio/route.ts
    │   ├── [id]/ledger/route.ts
    │   ├── [id]/listings/route.ts
    │   ├── [id]/members/route.ts
    │   ├── [id]/members/[memberId]/route.ts
    │   ├── [id]/tickets/route.ts
    │   ├── [id]/tickets/[ticketId]/route.ts
    │   ├── [id]/subscription/route.ts
    │   ├── [id]/bulk-upload/route.ts
    │   └── [id]/reports/route.ts
    └── webhook/
        ├── clerk/route.ts
        └── paystack/route.ts
```

### 3.3 Data Flow

```
HTTP Request
  → Vercel Edge
  → clerkMiddleware() — validates JWT, checks route rules
  → Next.js Route Handler
    → withAuth() / requireRole() — role guard
    → Zod schema validation on request body
    → Prisma query (parameterised, type-safe)
    → Third-party API calls (Paystack, Prembly, etc.)
    → Standardised JSON response { data } / { error }
```

### 3.4 Rendering Strategy

| Route Type | Strategy | Cache |
|------------|----------|-------|
| Landing (`/`) | Static Generation (SSG) | Infinite (CDN) |
| Listing search (`/listings`) | ISR — revalidate 60s | Vercel CDN |
| Listing detail (`/listings/[id]`) | ISR — revalidate 30s | Vercel CDN |
| Dashboard pages | Dynamic (per-request SSR) | No cache |
| API routes | Dynamic (per-request) | No cache |

---

## 4. Database Schema

### 4.1 Entity Relationship Overview

```
users ─────────────── refresh_tokens (1:N)
       ─────────────── listings (1:N as owner/agent)
       ─────────────── verifications (1:N as owner/reviewer)
       ─────────────── agreements (1:N as landlord/tenant/agent)
       ─────────────── transactions (1:N as payer/payee/agent)
       ─────────────── conversations (1:N as landlord/tenant)
       ─────────────── messages (1:N as sender)
       ─────────────── notifications (1:N)
       ─────────────── organisations (1:N as owner)
       ─────────────── org_members (1:N)
       ─────────────── maintenance_tickets (1:N as raisedBy/assignedTo)

listings ──────────── listing_images (1:N)
          ──────────── saved_listings (1:N)
          ──────────── listing_flags (1:N)
          ──────────── verifications (1:1)
          ──────────── transactions (1:N)
          ──────────── agreements (1:N)
          ──────────── conversations (1:N)
          ──────────── org_listings (1:N)

agreements ─────────── agreement_signatures (1:N)
            ─────────── rent_schedule (1:N)

organisations ──────── org_members (1:N)
               ──────── org_listings (1:N)
               ──────── maintenance_tickets (1:N)
               ──────── org_subscriptions (1:1)
```

### 4.2 Prisma Schema

The canonical schema is `prisma/schema.prisma`. Key design decisions:

**Enum definitions (lowercase, matching database values):**
```prisma
enum UserRole { landlord tenant agent admin estate_manager }
enum ListingType { rent sale short_let share commercial }
enum VerificationTier { basic verified inspected certified }
enum TransactionStatus { pending in_escrow released failed refunded }
enum AgreementStatus { draft pending_landlord pending_tenant tenant_signed landlord_signed fully_signed terminated expired }
enum OrgPlanTier { starter growth enterprise }
```

**Money storage:** All monetary amounts stored as `BigInt` in the smallest unit (kobo — 1/100 NGN). Display conversion: `kobo / 100`. Never use `Float` or `Decimal` for financial calculations.

**PII encryption:** NIN/BVN values stored encrypted (`ninEncrypted`, `bvnEncrypted`). Lookup uses HMAC (`ninHash`). See Section 9.1 for key management.

### 4.3 Index Strategy

```sql
-- Critical query patterns that need indexes:
CREATE INDEX idx_listings_area       ON listings(area);          -- location search ILIKE
CREATE INDEX idx_listings_status     ON listings(status);         -- active filter
CREATE INDEX idx_listings_owner      ON listings(owner_id);       -- my listings
CREATE INDEX idx_listings_type       ON listings(listing_type);   -- type filter
CREATE INDEX idx_messages_conv       ON messages(conversation_id, created_at); -- polling
CREATE INDEX idx_notifications_user  ON notifications(user_id, read);         -- bell count
CREATE INDEX idx_users_nin_hash      ON users(nin_hash);          -- dedup check
```

### 4.4 ID Conventions

All IDs use Prisma `@default(cuid())` which generates CUID2 format. Application-layer prefixes are optional string conventions for readability only — the database uses standard CUIDs.

| Entity | Prefix (display only) | Example |
|--------|----------------------|---------|
| User | `usr_` | `usr_clx...` |
| Listing | `lst_` | `lst_clx...` |
| Transaction | `txn_` | `txn_clx...` |
| Agreement | `agr_` | `agr_clx...` |
| Organisation | `org_` | `org_clx...` |

### 4.5 Migration Strategy

```bash
# Development — auto-generates migration + applies
npx prisma migrate dev --name describe_what_changed

# Production — apply only, no schema drift check
npx prisma migrate deploy

# Emergency schema push (staging only — skips migration file)
npx prisma db push
```

All migrations tracked in `prisma/migrations/`. Never edit a migration after it is applied. Create a new migration for corrections.

---

## 5. Authentication & Authorization

### 5.1 Clerk Integration

PROPATI uses **Clerk** as the identity provider. Clerk handles:
- Email/password signup and login
- JWT generation and rotation (RS256 with JWKS endpoint)
- Session management and token refresh
- MFA (optional, recommended for admin/estate_manager)

The Prisma `User` table mirrors Clerk users via the `clerkId` foreign key. Role data is stored in Clerk `publicMetadata.role` **and** Prisma `User.role`. The Clerk webhook keeps them in sync.

### 5.2 Middleware

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublic = createRouteMatcher([
  '/',
  '/listings(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk',
  '/api/webhook/paystack',
  '/api/health',
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublic(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

> **Note:** `authMiddleware` was the Clerk v4 API and is deprecated in v5. Use `clerkMiddleware` + `createRouteMatcher` as shown above.

### 5.3 Role-Based Access

```typescript
// src/lib/auth.ts — server-side helpers
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

// Convenience wrappers
export const requireAdmin        = () => requireRole('admin');
export const requireLandlord     = () => requireRole('landlord', 'admin');
export const requireAgent        = () => requireRole('agent', 'admin');
export const requireEstateManager = () => requireRole('estate_manager', 'admin');
```

### 5.4 API Route Auth Pattern

```typescript
// src/lib/api-auth.ts
import { withAuth, successResponse, errorResponse } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin', 'agent']);
  if (authResult instanceof NextResponse) return authResult; // 401 or 403

  const { user } = authResult;
  // user.id, user.clerkId, user.email, user.role, user.fullName
  return successResponse({ ... });
}
```

### 5.5 Clerk Webhook — User Sync

```typescript
// src/app/api/webhook/clerk/route.ts
// Events handled: user.created, user.updated, user.deleted
// Verifies signature with CLERK_WEBHOOK_SECRET via svix library
// On user.created → prisma.user.create() with clerkId + role from metadata
// On user.updated → prisma.user.update() role, name, email
// On user.deleted → soft-delete (isActive=false) to preserve foreign key integrity
```

### 5.6 Role-to-Route Mapping

| Route Pattern | Allowed Roles |
|---------------|---------------|
| `/dashboard/landlord/**` | `landlord`, `admin` |
| `/dashboard/tenant/**` | `tenant`, `admin` |
| `/dashboard/agent/**` | `agent`, `admin` |
| `/admin/**` | `admin` |
| `/estate-manager/**` | `estate_manager`, `admin` |
| `/onboarding` | Any authenticated (incomplete profile) |

### 5.7 RBAC Matrix

| Resource | landlord | tenant | agent | admin | estate_manager |
|----------|----------|--------|-------|-------|----------------|
| Own listings | CRUD | Read | Manage (assigned) | All | Org scope |
| Verification wizard | Full | — | Assist L4 | All layers | — |
| Agreements | Create + Sign | Sign | View | View all | Org scope |
| Payments | Receive | Initiate | Commission | Release escrow | Org billing |
| Messages | Party | Party | View assigned | View all | Org scope |
| Organisations | — | — | — | View all | Full CRUD |
| Users | Own profile | Own profile | Own profile | Full management | Team management |
| Admin console | — | — | — | Full | — |

---

## 6. API Specification

### 6.1 Response Format

All API routes return JSON in one of two shapes:

```typescript
// Success
{ "data": { ... } }           // HTTP 200 / 201

// Error
{ "error": "Human message", "code": "MACHINE_CODE", "details": { ... } }
// HTTP 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500
```

### 6.2 Standard Error Codes

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `BAD_REQUEST` | Malformed request body |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Authenticated but wrong role |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Idempotency conflict (e.g. duplicate conversation) |
| 422 | `VALIDATION_ERROR` | Zod schema failure — `details` contains field errors |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

### 6.3 Listings API

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/listings` | Public | — | Search with filters |
| POST | `/api/listings` | Required | landlord, estate_manager | Create listing (→ draft) |
| GET | `/api/listings/[id]` | Public | — | Get single listing |
| PATCH | `/api/listings/[id]` | Required | Owner, agent | Update listing |
| DELETE | `/api/listings/[id]` | Required | Owner | Soft-delete |
| POST | `/api/listings/[id]/images` | Required | Owner, agent | Upload images (multipart, max 10) |
| POST | `/api/listings/[id]/save` | Required | Any | Toggle save/unsave |
| POST | `/api/listings/[id]/flag` | Required | Any | Report listing |

**GET `/api/listings` query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `type` | `rent\|sale\|short_let\|share\|commercial` | Listing type |
| `propertyType` | `apartment\|house\|duplex\|land\|office\|shop\|warehouse` | Property type |
| `area` | string | ILIKE match on area field |
| `state` | string | Exact match |
| `priceMin` | number | Min price in Naira |
| `priceMax` | number | Max price in Naira |
| `bedrooms` | number | Exact bedrooms |
| `tier` | `basic\|verified\|inspected\|certified` | Verification tier |
| `sort` | `newest\|price_asc\|price_desc\|most_verified` | Sort order |
| `page` | number | Default 1 |
| `limit` | number | Default 20, max 50 |

### 6.4 Verification API

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/verification/layer1` | Required | landlord | Submit document (Cloudinary upload) |
| POST | `/api/verification/layer1/review` | Required | admin | Approve or reject Layer 1 |
| POST | `/api/verification/layer2` | Required | landlord | Prembly NIN/BVN lookup |
| POST | `/api/verification/layer2/confirm` | Required | landlord | Confirm identity match |
| POST | `/api/verification/layer3` | Required | landlord | Upload video proof |
| POST | `/api/verification/layer3/review` | Required | admin | Approve or reject Layer 3 |
| POST | `/api/verification/layer4` | Required | landlord | Request physical inspection |
| POST | `/api/verification/layer4/complete` | Required | agent, admin | Mark inspection complete |
| POST | `/api/verification/layer5` | Required | admin | Grant Certified badge |
| GET | `/api/verification/status` | Required | Owner, admin | Get current verification status |
| GET | `/api/verification/admin/queue` | Required | admin | All pending verifications |

### 6.5 Agreements API

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/agreements` | Required | landlord | Create agreement (→ draft) |
| GET | `/api/agreements` | Required | Any party | List my agreements |
| GET | `/api/agreements/[id]` | Required | Party | Get agreement details |
| PATCH | `/api/agreements/[id]` | Required | landlord | Update draft agreement |
| GET | `/api/agreements/[id]/preview` | Required | Party | HTML preview of agreement |
| POST | `/api/agreements/[id]/sign` | Required | Party | E-sign with consent text |
| POST | `/api/agreements/[id]/terminate` | Required | landlord | Terminate active agreement |

### 6.6 Messages API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages` | Required | List my conversations |
| POST | `/api/messages` | Required | Create conversation (idempotent on landlord+tenant+listing) |
| GET | `/api/messages/[conversationId]` | Required | Get messages + mark as read |
| POST | `/api/messages/[conversationId]` | Required | Send message |

**Polling:** Client polls `GET /api/messages/[id]?since=ISO_TIMESTAMP` every 4 seconds for new messages.

### 6.7 Payments API

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/payments` | Required | tenant | Initiate Paystack checkout |
| GET | `/api/payments/[id]` | Required | Party | Get transaction details |
| POST | `/api/payments/[id]/verify` | Required | Any | Verify Paystack payment status |
| POST | `/api/payments/[id]/release` | Required | admin | Release escrow → Paystack Transfer |
| POST | `/api/webhook/paystack` | Raw body | Paystack | Webhook: `charge.success`, `transfer.success` |

### 6.8 Users API

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users/me/profile` | Required | Any | Get own profile |
| PATCH | `/api/users/me/profile` | Required | Any | Update profile |
| GET | `/api/users/me/notifications` | Required | Any | List notifications |
| PATCH | `/api/users/me/notifications` | Required | Any | Mark read |
| GET | `/api/users` | Required | admin | List all users |
| GET | `/api/users/[id]` | Required | admin | Get user |
| PATCH | `/api/users/[id]` | Required | admin | Suspend, approve agent |

### 6.9 Organisations API

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/orgs` | Required | estate_manager | Create organisation |
| GET | `/api/orgs` | Required | estate_manager | Get my org |
| GET | `/api/orgs/[id]` | Required | Member, admin | Org details |
| PATCH | `/api/orgs/[id]` | Required | manager, admin | Update org |
| GET | `/api/orgs/[id]/portfolio` | Required | Member | Portfolio + units |
| GET | `/api/orgs/[id]/ledger` | Required | manager, accountant | Rent ledger |
| GET | `/api/orgs/[id]/listings` | Required | Member | Org listings |
| GET | `/api/orgs/[id]/members` | Required | manager | Team list |
| POST | `/api/orgs/[id]/members` | Required | manager | Invite member |
| PATCH | `/api/orgs/[id]/members/[memberId]` | Required | manager | Change role |
| DELETE | `/api/orgs/[id]/members/[memberId]` | Required | manager | Revoke access |
| GET | `/api/orgs/[id]/tickets` | Required | Member | Maintenance tickets |
| POST | `/api/orgs/[id]/tickets` | Required | Member | Create ticket |
| PATCH | `/api/orgs/[id]/tickets/[ticketId]` | Required | manager, maintenance | Update ticket |
| GET | `/api/orgs/[id]/subscription` | Required | manager | Subscription status |
| POST | `/api/orgs/[id]/subscription` | Required | manager | Subscribe / upgrade |
| POST | `/api/orgs/[id]/bulk-upload` | Required | manager | CSV unit import |
| GET | `/api/orgs/[id]/reports` | Required | manager, accountant | Monthly reports |

### 6.10 Rate Limiting

| Scope | Limit | Window | Implementation |
|-------|-------|--------|----------------|
| Global | 300 req | 15 min | Vercel Edge rate limit or `express-rate-limit` |
| Auth routes | 10 req | 15 min | Per IP, keyed to `/api/auth/**` |
| Verification (Prembly) | 5 req | 1 min | Per user, prevent abuse |
| File uploads | 20 req | 1 min | Per user |

Rate limit responses include `Retry-After` header.

---

## 7. Core Business Logic

### 7.1 5-Layer Verification State Machine

```
not_started
    ↓  [landlord submits L1 docs]
in_progress / l1_status=pending
    ↓  [admin approves L1]
l1_status=approved
    ↓  [landlord completes Prembly NIN lookup + confirms]
l2_status=approved  (auto if match confirmed)
    ↓  [landlord uploads video]
l3_status=pending
    ↓  [admin reviews video]
l3_status=approved
    ↓  [landlord requests inspection]
l4_status=pending
    ↓  [agent completes physical inspection]
l4_status=approved
    ↓  [admin grants Certified]
overall_status=certified → listing.verificationTier=certified
```

**Rules:**
- Each layer must be `approved` before the next layer can be submitted.
- Admin can reject at any layer with a reason — `overallStatus` stays `in_progress` (not `rejected`), and the landlord can resubmit.
- On `certified`: `listing.verificationTier` is updated to `certified`, listing owner receives email + in-app notification.

### 7.2 Agreement Signing Flow

```
draft
  ↓ landlord sends to tenant
pending_tenant
  ↓ tenant signs
tenant_signed
  ↓ landlord countersigns (or vice-versa)
fully_signed
  → rent_schedule auto-generated
  → both parties emailed PDF
```

**E-Signature Audit Record:**
Each signature records: `signerId`, `signedAt`, `ipAddress`, `userAgent`, `consentText`, `checksum = SHA256(agreementId + signerId + signedAt.toISOString())`.

### 7.3 Payment & Escrow Flow

```
1. Tenant clicks "Pay Rent"
2. POST /api/payments → { authorizationUrl, transactionId }
3. Paystack Inline Checkout opens
4. On payment success → Paystack fires webhook charge.success
5. POST /api/webhook/paystack verifies HMAC-SHA512 signature
6. transaction.status → in_escrow
7. Tenant moves in (or period begins)
8. Admin reviews and clicks "Release Escrow"
9. POST /api/payments/[id]/release
10. Paystack Transfer API → payee bank account
11. transaction.status → released
12. Receipt email sent to payer + payee
```

### 7.4 Fee Computation (`src/lib/fees.ts`)

All calculations in **kobo** (integer arithmetic — no floating point):

```typescript
function computeFees(amountKobo: bigint, type: TransactionType, agentId?: string) {
  const platformRate = type === 'rent' || type === 'short_let' ? 0.10
    : amountKobo > 2_000_000_00n ? 0.02 : 0.01; // sale: 2% >₦20M, 1% ≤₦20M
  const agentRate = type === 'rent' ? 0.10 : 0.015; // 10% of platformFee for rent, 1.5% for sale

  const platformFee = BigInt(Math.floor(Number(amountKobo) * platformRate));
  const agentCommission = agentId ? BigInt(Math.floor(Number(platformFee) * agentRate)) : 0n;
  const payeeAmount = amountKobo - platformFee - agentCommission;

  return { platformFee, agentCommission, payeeAmount };
}
```

### 7.5 Rent Schedule Generation

On `Agreement.status` transitioning to `fully_signed`:
1. Generate `RentSchedule` entries for each month from `startDate` to `endDate`
2. Amount = `rentAmount + (serviceCharge ?? 0)`
3. Status = `upcoming` for all future entries
4. Cron (07:00 UTC daily, `node-cron` or Vercel Cron):
   - Query `rent_schedule WHERE status=upcoming AND due_date <= NOW()`
   - Update overdue entries to `status=overdue`
   - Send reminders at T-7, T-3, T-1 days via email + SMS

### 7.6 Tenant Verification Score

Integer 0–4 displayed to landlords as a screening metric:

| Point | Condition |
|-------|-----------|
| +1 | `ninVerified = true` |
| +1 | `idVerified = true` |
| +1 | `incomeVerified = true` |
| +1 | `profileCompleted = true` |

### 7.7 Income Privacy

Exact `yearlyIncome` (BigInt) is stored and visible only to the user. Landlords see a **banded range** computed server-side:

| Income (NGN/yr) | Band Shown |
|-----------------|------------|
| < 1,200,000 | Below ₦1.2M |
| 1,200,000–2,999,999 | ₦1.2M–₦3M |
| 3,000,000–5,999,999 | ₦3M–₦6M |
| 6,000,000–11,999,999 | ₦6M–₦12M |
| ≥ 12,000,000 | ₦12M+ |

### 7.8 Auto-Suspend on Fraud Flags

When `listing_flags WHERE listingId = X AND status = open` count reaches **10**, automatically:
1. `listing.status → suspended`
2. Admin notification created
3. Listing removed from public search results

### 7.9 Notification Triggers

| Trigger Event | Channels | Template Key |
|---------------|----------|--------------|
| User signup | Email | `welcome` |
| Rent due (7 days) | Email + SMS | `rent_due_7` |
| Rent due (3 days) | Email + SMS | `rent_due_3` |
| Rent due (1 day) | Email + SMS | `rent_due_1` |
| Payment confirmed | Email + In-app | `payment_confirmed` |
| Agreement ready to sign | Email + In-app | `agreement_ready` |
| Verification layer update | Email + In-app | `verification_update` |
| New message (first unread) | SMS | `new_message` |
| Org team invite | Email | `org_invite` |
| Password reset | Email | `password_reset` |
| Listing certified | Email + In-app | `certified` |

---

## 8. Third-Party Integrations

### 8.1 Clerk (Authentication)

- **Package:** `@clerk/nextjs` v5
- **Configuration:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- **Webhook endpoint:** `POST /api/webhook/clerk`
- **Signature verification:** `svix` library — always verify before processing
- **Role storage:** `publicMetadata.role` in Clerk + `User.role` in Prisma (synced via webhook)

### 8.2 Paystack (Payments)

- **Integration:** Direct HTTP via `axios` (no SDK)
- **API base:** `https://api.paystack.co`
- **Authentication:** `Authorization: Bearer sk_live_...`
- **Inline checkout:** Initialize transaction → return `authorization_url` → client opens
- **Webhook:** `POST /api/webhook/paystack` — verify `x-paystack-signature` (HMAC-SHA512 of raw body)
- **Transfer API:** Release escrow to payee bank account
- **Idempotency:** Use Paystack `reference` field (store as `Transaction.reference`)
- **Environment variables:** `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`

```typescript
// Webhook signature verification (raw body REQUIRED)
const hash = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
  .update(rawBodyBuffer)
  .digest('hex');
if (hash !== req.headers['x-paystack-signature']) {
  return Response.json({ error: 'Invalid signature' }, { status: 400 });
}
```

### 8.3 Prembly IdentityPass (Identity Verification)

- **API base:** `https://api.prembly.com/identitypass`
- **Supported documents:** NIN, BVN, Driver's Licence, Voter's Card (PVC)
- **Flow:** POST document number → returns name/DOB/gender/photo → user confirms
- **Mock mode:** If `PREMBLY_API_KEY` is `mock` or unset → return synthetic data (never blocks dev)
- **Error handling:** Exponential backoff on 5xx; graceful message on 404 (not found)
- **Environment variables:** `PREMBLY_API_KEY`, `PREMBLY_APP_ID`

### 8.4 Cloudinary (Media Storage)

- **Upload:** Server-side upload stream (never expose API secret to client)
- **Folders:** `propati/images`, `propati/documents`, `propati/videos`
- **Transformations:** `f_auto,q_auto,w_800` for listing images
- **Deletion:** Use `publicId` stored in `ListingImage.publicId`
- **Environment variables:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 8.5 Termii (Nigerian SMS)

- **API base:** `https://api.ng.termii.com`
- **Sender ID:** `PROPATI`
- **Use cases:** OTP delivery, rent reminders (T-7/3/1), urgent maintenance alerts
- **Fallback:** Twilio WhatsApp for OTP if Termii fails
- **Mock mode:** If `TERMII_API_KEY` unset → `console.log('[SMS MOCK]')`
- **Environment variables:** `TERMII_API_KEY`, `TERMII_SENDER_ID`

### 8.6 Nodemailer (Email)

- **Transport:** SMTP (Gmail App Password or SendGrid SMTP relay)
- **From address:** `hello@propati.ng`
- **Templates:** HTML strings in `src/lib/email.ts`
- **Mock mode:** If SMTP credentials absent → `console.log('[EMAIL MOCK]')`
- **Logging:** All sends logged to `email_log` table (status: sent/failed/bounced)
- **Environment variables:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### 8.7 Integration Health Checks

Each integration should be verifiable via `GET /api/health` which checks:
- Database: Prisma `$queryRaw` ping
- Clerk: JWKS endpoint reachability
- Paystack: API ping (no-op request)
- Cloudinary: Signed URL generation
- Returns `{ ok: true, services: { db, clerk, paystack, cloudinary } }`

---

## 9. Security Implementation

### 9.1 Cryptography

| Data | Algorithm | Key | Notes |
|------|-----------|-----|-------|
| Passwords | bcrypt, cost 12 | — | Legacy field — Clerk handles auth |
| JWT (Clerk) | RS256 | Clerk-managed JWKS | Rotated automatically |
| NIN/BVN storage | AES-256-GCM | `ENCRYPTION_KEY` 32-byte hex | Random IV per value; IV + ciphertext + authTag stored together |
| NIN dedup lookup | HMAC-SHA256 | Separate `NIN_HMAC_KEY` | Deterministic for lookup without decrypting |
| E-signature checksum | SHA256 | — | `SHA256(agreementId + signerId + timestamp)` |
| Paystack webhook | HMAC-SHA512 | `PAYSTACK_WEBHOOK_SECRET` | Must verify raw request body |
| Clerk webhook | HMAC via svix | `CLERK_WEBHOOK_SECRET` | `svix` library handles verification |

### 9.2 Transport Security

- HTTPS/TLS 1.3 enforced by Vercel
- HSTS with preload (Vercel automatic on custom domains)
- No HTTP-to-HTTPS redirect needed — Vercel enforces
- `Content-Security-Policy` via `next.config.js` headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

### 9.3 Input Validation

- **All API inputs** validated with Zod schemas before any business logic
- Zod errors returned as `{ error: 'VALIDATION_ERROR', details: ZodIssue[] }`
- No string concatenation in Prisma queries — all parameterised by default
- File uploads: validate MIME type server-side (not just extension), enforce max size

### 9.4 Authorisation Checks

- `withAuth()` in every API route — never trust client-supplied `userId`
- Org-scoped endpoints check `OrgMember` membership before returning data
- Listing ownership verified on every mutation (`listing.ownerId === user.id`)
- Admin-only endpoints checked with `requireAdmin()` before any processing

### 9.5 NDPR Compliance (Nigerian Data Protection Regulation)

| Requirement | Implementation |
|-------------|----------------|
| Lawful basis for PII | Consent collected at signup; purpose stated |
| NIN/BVN encryption | AES-256-GCM — field is never stored in plaintext |
| Income privacy | Landlords see only income band, never exact figure |
| Data minimisation | Only verified fields stored; no raw identity document scans |
| Right to erasure | Soft delete preserves FK integrity; PII fields nulled |
| Audit trail | `email_log`, `agreement_signatures`, payment records retained 7 years |
| Data subject access | Profile page exports user's own data |

---

## 10. Infrastructure & DevOps

### 10.1 Environments

| Env | Host | URL | Database | Purpose |
|-----|------|-----|----------|---------|
| `local` | Localhost | `http://localhost:3000` | Local Docker Postgres | Development |
| `preview` | Vercel Preview | Auto-generated URL | Supabase staging branch | PR testing |
| `staging` | Vercel | `staging.propati.ng` | Supabase staging | QA + demos |
| `production` | Vercel | `propati.ng` | Supabase production | Live traffic |

### 10.2 Vercel Configuration

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": { "NODE_ENV": "production" },
  "crons": [
    {
      "path": "/api/cron/rent-reminders",
      "schedule": "0 7 * * *"
    }
  ]
}
```

### 10.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  deploy-preview:
    needs: quality
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - run: npx vercel --token=${{ secrets.VERCEL_TOKEN }}

  deploy-staging:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: npx vercel --token=${{ secrets.VERCEL_TOKEN }} --env staging
      - run: npx prisma migrate deploy
        env: { DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }} }

  deploy-production:
    needs: deploy-staging
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    steps:
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx prisma migrate deploy
        env: { DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }} }
```

### 10.4 Database Management

```bash
# Local development
docker-compose up -d postgres     # spin up local Postgres
npx prisma migrate dev            # apply + generate client
npx prisma db seed                # seed test data

# Staging
npx prisma migrate deploy         # apply pending migrations

# Production (run in CI, never manually)
npx prisma migrate deploy

# Emergency: view and manage data
npx prisma studio                 # opens web UI at localhost:5555
```

### 10.5 Monitoring Stack

| Tool | Purpose | Alert Threshold |
|------|---------|-----------------|
| Vercel Analytics | Core Web Vitals, page views | LCP > 3s → alert |
| Sentry | Frontend + API error tracking | Error rate > 0.5% → P1 |
| Supabase Dashboard | DB connections, slow queries | > 80% connection pool → alert |
| Paystack Dashboard | Payment success rates | < 98% → investigate |
| UptimeRobot | API health endpoint | Downtime > 1 min → SMS alert |

### 10.6 Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `rent-reminders` | `0 7 * * *` (07:00 UTC = 08:00 WAT) | Mark overdue rents, send T-7/3/1 reminders |
| `flag-auto-suspend` | `*/30 * * * *` | Check flag counts → auto-suspend listings at 10 |
| `cleanup-expired-otps` | `0 * * * *` | Delete expired phone OTP records |
| `cleanup-expired-tokens` | `0 2 * * *` | Delete expired refresh tokens |

Implemented as Next.js API routes (`/api/cron/*`) protected by `CRON_SECRET` header, invoked by Vercel Cron.

---

## 11. Performance Requirements

### 11.1 Core Web Vitals Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Vercel Analytics |
| INP (Interaction to Next Paint) | < 200ms | Vercel Analytics |
| CLS (Cumulative Layout Shift) | < 0.1 | Vercel Analytics |
| TTFB (Time to First Byte) | < 600ms | Vercel Analytics |

### 11.2 API Response Targets

| Endpoint Category | P50 | P95 | P99 |
|-------------------|-----|-----|-----|
| Simple reads (listing, profile) | < 80ms | < 200ms | < 500ms |
| Search with filters | < 150ms | < 400ms | < 800ms |
| Payment initiation | < 300ms | < 800ms | < 1500ms |
| File uploads | — | < 5s | < 10s |

### 11.3 Prisma Query Optimisation

- Use `select` to return only needed fields — never return full user objects to API consumers
- Use `include` over separate queries for relations
- Avoid N+1 patterns: use nested `include` or `Promise.all()`
- Enable Prisma query logging in development: `log: ['query', 'warn', 'error']`
- Connection pool: Supabase pooler (PgBouncer) — max 20 connections

### 11.4 Image Optimisation

- All listing images served through Cloudinary CDN with `f_auto,q_auto,w_800`
- Next.js `<Image>` component for all UI images (automatic WebP, lazy loading)
- Video uploads limited to 100MB; compressed on Cloudinary after upload

---

## 12. Testing Requirements

### 12.1 Test Pyramid

| Level | Tool | Target Coverage | Scope |
|-------|------|-----------------|-------|
| Unit | Vitest | 80% | `src/lib/*` — fees, validators, verification state machine |
| Integration | Vitest + test DB | 60% | API routes with real Prisma against a test database |
| E2E | Playwright | 100% of critical paths | Full user journeys (see 12.2) |

### 12.2 Critical E2E Paths

1. **Landlord:** Sign up → Onboard → Add listing → Submit verification L1 → Admin approves
2. **Tenant:** Sign up → Onboard → Search → Apply (create conversation) → Sign agreement → Pay rent
3. **Agent:** Sign up → View pipeline → Mark deal as Viewing → Complete inspection
4. **Admin:** Sign in → Review verification queue → Approve → Verify listing certified badge
5. **Estate Manager:** Sign up → Create org → Subscribe → Add units → View rent ledger

### 12.3 Test Data Strategy

`prisma/seed.ts` creates:
- 1 user per role (5 total) with known passwords
- 10 listings across different types/verification tiers
- 3 organisations with members
- Sample agreements, transactions, conversations

Playwright fixtures extend this seed data. Tests never create their own data — they use seeded identities.

### 12.4 CI Gates

All PRs must pass before merge:
- `npm run lint` — zero ESLint errors
- `npm run typecheck` — zero TypeScript errors
- `npm run test` — all Vitest tests pass
- Playwright E2E on PR preview deployment (blocking)

---

## 13. Environment Configuration

### 13.1 Complete Variable Reference

```bash
# ─── App ──────────────────────────────────────────────────
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://propati.ng
CRON_SECRET=                          # 32+ char random string for cron auth

# ─── Database ─────────────────────────────────────────────
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.supabase.com:5432/postgres
# DIRECT_URL used by Prisma migrate (bypasses PgBouncer)

# ─── Clerk ────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ─── Paystack ─────────────────────────────────────────────
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=             # Raw value from Paystack dashboard

# ─── Cloudinary ───────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=propati
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ─── Prembly ──────────────────────────────────────────────
PREMBLY_API_KEY=                      # Set to "mock" for dev without API key
PREMBLY_APP_ID=

# ─── Termii (SMS) ─────────────────────────────────────────
TERMII_API_KEY=
TERMII_SENDER_ID=PROPATI

# ─── Twilio (WhatsApp OTP fallback) ───────────────────────
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+14155238886

# ─── Email (SMTP) ─────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@propati.ng
SMTP_PASS=                            # Gmail App Password (not account password)

# ─── Encryption ───────────────────────────────────────────
ENCRYPTION_KEY=                       # 64-char hex (32 bytes) for AES-256-GCM
NIN_HMAC_KEY=                         # 64-char hex, DIFFERENT from ENCRYPTION_KEY
```

### 13.2 Environment Precedence

```
.env.local          (git-ignored — developer secrets, overrides all)
.env.production     (committed — prod non-secrets like URLs)
.env                (committed — default values, no secrets)
```

### 13.3 Secret Generation

```bash
# Generate ENCRYPTION_KEY / NIN_HMAC_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

---

## 14. Future Extensibility

### 14.1 WebSocket Migration (v1.1)

Current implementation uses 4-second polling for messages and 30-second polling for notifications. Migration path:
1. Add `USE_WS=true` feature flag
2. Implement WebSocket server via Vercel Edge or separate Fly.io instance
3. Feature-flag the client: fallback to polling if WebSocket unavailable
4. Keep polling fallback for 2 sprints, then remove

### 14.2 React Native Mobile App

The REST API layer is the shared contract. Mobile-specific considerations:
- Same Clerk auth (Clerk React Native SDK)
- Push notifications: Expo Notifications + FCM
- Offline-first: WatermelonDB sync layer over existing API
- Deep links: `propati://listings/[id]`, `propati://agreements/[id]`

### 14.3 Multi-Region

| Phase | Action |
|-------|--------|
| v1 | UK West (Supabase), Vercel global CDN |
| v2 | Add Lagos Fly.io edge API for < 50ms Nigerian users |
| v3 | Supabase read replicas in nearest region |

### 14.4 White-Label Enterprise

Designed but not yet built. Architecture decision: use **Supabase branching** (separate schema per org) rather than row-level tenancy, to enable true data isolation for Enterprise tier.

---

## 15. Cross-References

| Document | Location | Purpose |
|----------|----------|---------|
| PRD | `PRD.md` | Product features, revenue model, KPIs |
| Architecture | `ARCHITECTURE.md` | Deep-dive system design |
| Database Schema | `DATABASE_SCHEMA.md` | Full table DDL + ERD |
| API Reference | `API_REFERENCE.md` | Request/response schemas with examples |
| User Journeys | `USER_JOURNEYS.md` | Flowcharts per role |
| UI/UX Brief | `UI_UX_BRIEF.md` | Design tokens, components, screen inventory |
| Build Plan | `BUILD_PLAN.md` | Feature phases, timeline, resource allocation |
| Security | `SECURITY.md` | Threat model, incident response |
| Testing Guide | `TESTING_GUIDE.md` | Test pyramid, patterns, CI gates |
| Deployment | `DEPLOYMENT.md` | Runbook for all environments |
| Operations | `OPERATIONS.md` | Monitoring, alerting, on-call playbooks |
| Contributing | `CONTRIBUTING.md` | Git workflow, PR process, code standards |

---

*This TRD is the single source of truth for PROPATI technical implementation. It describes the **Next.js 14 App Router** stack. The previous Express/vanilla JS TRD has been superseded. Update this document when architecture decisions change.*

## 16. OS Gap Assessment (Aligned with `docs/PROPTECH.md`)

=== "Current coverage: ~75% of OS thesis"

| OS Layer | Status | Notes |
|----------|--------|-------|
| Marketplace | Partial | Residential/short-let/commercial search works; missing buy/sell pipeline |
| Financial infra | Partial | Rent + escrow built; missing booking payments, service-charge billing, split payouts |
| Legal infra | Partial | Stamp duty + law-firm network + commercial billing built; missing evidence packs |
| Identity | Complete | 5-layer verification built (L1-L5) |
| Property mgmt | Partial | Residential/pm built; missing turnover scheduling |
| Enforcement | Partial | Basic audit + disputes; missing court-ready packs, structured evidence |

### Recommended next schema migrations
1. `Booking`, `CalendarSlot`, `PricingRule` — short-let engine (`done`)
2. `LawFirm`, `LawFirmCase` — legal network (`done`)
3. `ServiceCharge`, `UtilityAllocation` — commercial ops (`done`)
4. `Document`, `EvidencePack` — evidence layer
5. `SubscriptionPlan`, `UserSubscription` — revenue model expansion
