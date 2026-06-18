# PROPATI — Next.js 14 Build Plan (Production Rewrite)

**Version:** 1.0  
**Target Stack:** Next.js 14 (App Router), Prisma/PostgreSQL, Clerk Auth, Paystack, Tailwind CSS, TypeScript  
**Current State:** Vanilla JS/Express (single-file SPA) → **Full Rewrite**  
**Timeline:** 10-12 weeks (2-3 developers)

---

## 1. Project Initialization (Week 1)

### 1.1 Repository Setup
```bash
# Initialize Next.js 14 with TypeScript, Tailwind, ESLint, Prettier
npx create-next-app@latest propati-nextjs \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" \
  --use-npm

# Install core dependencies
npm i @prisma/client @clerk/nextjs paystack-api axios zod react-hook-form @hookform/resolvers
npm i -D prisma @types/node

# Dev tools
npm i -D @tailwindcss/forms @tailwindcss/typography
```

### 1.2 Prisma Schema (from DATABASE_SCHEMA.md)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enum definitions
enum UserRole { landlord tenant agent admin estate_manager }
enum ListingType { rent sale short_let share commercial }
enum PropertyType { apartment house duplex land office shop warehouse }
enum VerificationTier { basic verified inspected certified }
enum TransactionStatus { pending in_escrow released failed refunded }
enum AgreementStatus { draft pending_landlord pending_tenant tenant_signed landlord_signed fully_signed terminated expired }

// Models (22+ tables from DATABASE_SCHEMA.md)
// ... full schema with proper relations, indexes, enums
```

### 1.3 Clerk Configuration
```typescript
// src/middleware.ts - Clerk auth middleware
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks/(.*)", "/listings/(.*)"],
  ignoredRoutes: ["/api/webhooks/(.*)"],
});

export const config = { matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"] };
```

### 1.4 Environment Variables
```bash
# .env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_WEBHOOK_SECRET=whsec_...

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

PREMBLY_API_KEY=
PREMBLY_APP_ID=

TERMII_API_KEY=
TERMII_SENDER_ID=PROPATI
```

---

## 2. Core Infrastructure (Week 1-2)

### 2.1 Database Layer
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Complete schema with 22+ models, enums, indexes |
| `src/lib/prisma.ts` | Singleton Prisma client (edge-compatible) |
| `src/lib/db.ts` | Common queries (listings, users, transactions) |
| `prisma/seed.ts` | Development seed data (roles, test listings) |

### 2.2 API Route Structure (App Router)
```
src/app/api/
├── auth/
│   ├── clerk-webhook/route.ts     # Clerk user sync
│   └── session/route.ts           # Custom session helpers
├── listings/
│   ├── route.ts                   # GET (search), POST (create)
│   ├── [id]/route.ts              # GET, PATCH, DELETE
│   ├── [id]/images/route.ts       # POST upload
│   ├── [id]/save/route.ts         # POST toggle
│   └── [id]/flag/route.ts         # POST report
├── verification/
│   ├── upload-doc/route.ts
│   ├── submit-layer1/route.ts
│   ├── verify-identity/route.ts
│   ├── confirm-identity/route.ts
│   ├── upload-video/route.ts
│   ├── request-inspection/route.ts
│   ├── admin/queue/route.ts
│   └── admin/review/route.ts
├── agreements/
│   ├── route.ts                   # POST create, GET list
│   ├── [id]/route.ts              # GET, PATCH
│   ├── [id]/preview/route.ts      # GET HTML
│   ├── [id]/sign/route.ts         # POST e-sign
│   └── [id]/pdf/route.ts          # GET PDF
├── messages/
│   ├── conversations/route.ts     # GET list, POST create
│   └── conversations/[id]/messages/route.ts # GET poll, POST send
├── payments/
│   ├── initiate/route.ts          # POST Paystack checkout
│   ├── webhook/route.ts           # POST Paystack webhook
│   ├── transactions/route.ts      # GET history
│   └── release-escrow/[id]/route.ts # POST admin release
├── users/
│   ├── profile/route.ts           # GET, PATCH
│   ├── tenant-profile/route.ts    # GET, PATCH
│   ├── notifications/route.ts     # GET, PATCH read
│   └── admin/...
├── orgs/
│   ├── route.ts                   # POST create, GET mine
│   ├── [id]/route.ts              # GET, PATCH
│   ├── [id]/team/route.ts         # GET, POST invite
│   ├── [id]/team/[memberId]/route.ts # PATCH, DELETE
│   ├── [id]/portfolio/route.ts
│   ├── [id]/ledger/route.ts
│   ├── [id]/tickets/route.ts
│   ├── [id]/tickets/[tid]/route.ts
│   ├── [id]/agreements/route.ts
│   ├── [id]/subscribe/route.ts
│   ├── [id]/bulk-upload/route.ts
│   └── [id]/reports/[month]/route.ts
└── webhooks/
    ├── paystack/route.ts
    ├── prembly/route.ts
    └── termii/route.ts
```

### 2.3 Shared Utilities
| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | cn(), formatCurrency(), generateId(), date helpers |
| `src/lib/validators.ts` | Zod schemas for all API inputs |
| `src/lib/paystack.ts` | Paystack client (initiate, verify, transfer) |
| `src/lib/cloudinary.ts` | Upload helpers (images, documents, video) |
| `src/lib/prembly.ts` | IdentityPass client (NIN/BVN/DL/PVC) |
| `src/lib/termii.ts` | SMS client |
| `src/lib/email.ts` | Nodemailer templates |
| `src/lib/verification.ts` | 5-layer state machine logic |
| `src/lib/fees.ts` | Platform fee / agent commission calculation |

---

## 3. Authentication & Onboarding (Week 2)

### 3.1 Clerk Integration
- **Sign up flow:** Role selection → Clerk handles email/password/OAuth
- **After sign up:** Redirect to `/onboarding` for role-specific data
- **Webhook:** `clerk-webhook` syncs user to Prisma `User` table
- **Role mapping:** Clerk publicMetadata.role → Prisma User.role

### 3.2 Onboarding Flows
| Role | Steps | Data Collected |
|------|-------|----------------|
| **Landlord** | 1. Profile → 2. Identity (NIN/BVN) → 3. Phone verify | Full name, phone, NIN/BVN |
| **Tenant** | 1. Profile → 2. Purpose (Rent/Buy/Short-let/Share) → 3. Screening data | Employment, income, guarantor |
| **Agent** | 1. Profile → 2. Bio/Areas → 3. Identity | Agent bio, service areas |
| **Estate Manager** | 1. Org wizard (name, email, CAC) → 2. Plan → 3. Paystack sub | Org details, billing |

### 3.3 Route Protection
```typescript
// src/lib/auth.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    throw new Error("Unauthorized");
  }
  return user;
}
```

---

## 4. Feature Implementation Phases

### Phase A: Listings & Search (Week 3-4)
**Priority:** Critical — Core marketplace

| Task | API | Frontend | Notes |
|------|-----|----------|-------|
| Listing CRUD | `/api/listings` | Dashboard > Properties > Add/Edit | Multi-step form + image upload |
| Search & Filter | `GET /api/listings` | Landing, Find Property | ILIKE area, price range, type, verification tier |
| Listing Detail | `GET /api/listings/[id]` | `/listings/[id]` | Gallery, specs, verification layers, CTA |
| Save/Unsave | `POST /api/listings/[id]/save` | Heart icon | Optimistic UI |
| Flag Listing | `POST /api/listings/[id]/flag` | Report modal | Auto-suspend at 10+ flags |
| My Listings | `GET /api/listings?owner_id=me` | Landlord/EM dashboard | Status badges, actions |

**Components:** `ListingCard`, `ListingGrid`, `ListingForm`, `ImageUpload`, `SearchFilters`, `VerificationBadge`

### Phase B: 5-Layer Verification (Week 4-5)
**Priority:** Critical — Core differentiator

| Layer | API | Frontend | Admin |
|-------|-----|----------|-------|
| L1: Documents | `POST /upload-doc`, `POST /submit-layer1` | Wizard Step 1: 4 doc uploads | Queue: approve/reject |
| L2: Identity | `POST /verify-identity`, `POST /confirm-identity` | Wizard Step 2: Prembly lookup + confirm | Auto-approved on match |
| L3: Video | `POST /upload-video` | Wizard Step 3: Record with QR | Manual review |
| L4: Inspection | `POST /request-inspection` | Wizard Step 4: Schedule | Agent assigned |
| L5: Certified | — | Wizard Step 5: Wait | Final approve → badge |

**State Machine:** `VerificationService` handles transitions, notifications, listing.tier updates

### Phase C: Agreements & E-Signature (Week 5-6)
**Priority:** High — Revenue enabler

| Feature | Implementation |
|---------|----------------|
| Create Agreement | Landlord: select listing + tenant + terms → `POST /api/agreements` |
| Preview | HTML template with `template_vars` → `/api/agreements/[id]/preview` |
| E-Signature | `POST /api/agreements/[id]/sign` + consent → audit trail (IP, UA, checksum) |
| State Machine | draft → pending_landlord → pending_tenant → tenant_signed/landlord_signed → fully_signed |
| PDF Generation | PDFKit on server → upload to Cloudinary → serve via `/api/agreements/[id]/pdf` |
| Rent Schedule | Auto-generate on `fully_signed` → monthly entries with due dates |

### Phase D: Payments & Escrow (Week 6-7)
**Priority:** Critical — Revenue

| Flow | API | Paystack |
|------|-----|----------|
| Rent Payment | `POST /api/payments/initiate` → `authorization_url` | Inline checkout |
| Webhook | `POST /api/payments/webhook` (HMAC-SHA512) | `charge.success` → `in_escrow` |
| Escrow Release | `POST /api/payments/release-escrow/[id]` | Transfer API → payee bank |
| Receipts | Auto-generate PDF + email | `payment_confirmed` template |
| Fees | Rent 10%, Sale 1-2%, Agent 10%/1.5% | Computed server-side |

**Security:** Raw body middleware for webhook, idempotency keys, audit logging

### Phase E: Messaging (Week 7)
**Priority:** High — User engagement

| Feature | Implementation |
|---------|----------------|
| Conversations | Idempotent create (landlord+tenant+listing unique) |
| Polling | 4s interval via SWR/TanStack Query |
| Optimistic UI | Immediate render, confirm via poll |
| Unread Counts | `unread_tenant` / `unread_landlord` columns |
| Attachments | Images, documents, voice notes |

### Phase F: Estate Manager B2B (Week 8-9)
**Priority:** High — B2B Revenue

| Screen | API | Features |
|--------|-----|----------|
| Onboarding | `POST /api/orgs`, `POST /api/orgs/[id]/subscribe` | 3-step wizard + Paystack sub |
| Portfolio | `GET /api/orgs/[id]/portfolio` | Units grid, vacant/occupied |
| Rent Ledger | `GET /api/orgs/[id]/ledger` | Table, filters, export CSV |
| Maintenance | `GET/POST/PATCH /api/orgs/[id]/tickets` | Kanban: open→assigned→in_progress→resolved |
| Bulk Import | `POST /api/orgs/[id]/bulk-upload` | CSV validation, row errors |
| Team | `GET/POST/PATCH/DELETE /api/orgs/[id]/team` | Roles, seat limits per plan |
| Billing | `GET /api/orgs/[id]/subscription` | Paystack customer portal |
| Reports | `GET /api/orgs/[id]/reports/[month]` | JSON + PDF (Phase 5) |

### Phase G: Admin Console (Week 9)
**Priority:** High — Operations

| Screen | Data Source | Actions |
|--------|-------------|---------|
| Overview | `/api/users/admin/stats` | GMV, users, listings, revenue charts |
| Verification Queue | `/api/verification/admin/queue` | Per-layer approve/reject |
| Flags | `/api/listings?flagged=true` | Dismiss, suspend, ban user |
| Disputes | `/api/disputes` | Mediate, rule, close |
| Users | `/api/users/admin/all` | Suspend, approve agent |
| Revenue | `/api/admin/revenue` | Daily/weekly/monthly, export |

### Phase H: Notifications & Polish (Week 10)
**Priority:** Medium

| Feature | Implementation |
|---------|----------------|
| In-app bell | Dropdown, mark read, 30s poll |
| Email | Welcome, rent_due (7/3/1), payment, agreement, verification, org_invite |
| SMS | Termii: OTP, rent reminders, urgent maintenance |
| WhatsApp | Twilio: OTP only |
| Cron | Daily 07:00 UTC: rent reminders, overdue status |
| Skeleton loaders | CSS-only for cards, tables, lists |
| SEO | Dynamic meta tags, Open Graph, sitemap.xml |

---

## 5. Frontend Architecture (App Router)

### 5.1 Route Structure
```
src/app/
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx                 # Landing
│   ├── listings/
│   │   ├── page.tsx             # Search results
│   │   └── [id]/page.tsx        # Listing detail
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── onboarding/page.tsx      # Role-specific
├── (dashboard)/
│   ├── layout.tsx               # Sidebar shell + auth guard
│   ├── dashboard/
│   │   ├── page.tsx             # Role-specific home
│   │   ├── properties/page.tsx
│   │   ├── rent/page.tsx
│   │   ├── verification/page.tsx
│   │   ├── agreements/page.tsx
│   │   ├── messages/page.tsx
│   │   └── profile/page.tsx
│   ├── tenant/
│   │   ├── page.tsx             # Purpose switcher
│   │   ├── search/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── agreements/page.tsx
│   │   ├── maintenance/page.tsx
│   │   └── profile/page.tsx
│   ├── agent/
│   │   ├── pipeline/page.tsx
│   │   ├── listings/page.tsx
│   │   ├── inspections/page.tsx
│   │   └── commissions/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── verification/page.tsx
│   │   ├── flags/page.tsx
│   │   ├── disputes/page.tsx
│   │   ├── users/page.tsx
│   │   └── revenue/page.tsx
│   └── estate-manager/
│       ├── page.tsx
│       ├── portfolio/page.tsx
│       ├── ledger/page.tsx
│       ├── maintenance/page.tsx
│       ├── team/page.tsx
│       └── reports/page.tsx
├── api/                         # API routes (see Section 2.2)
└── components/                  # Shared UI components
```

### 5.2 Component Library (Tailwind + shadcn/ui)
| Component | Location | Variants |
|-----------|----------|----------|
| Button | `components/ui/button.tsx` | primary, secondary, outline, ghost, danger |
| Input | `components/ui/input.tsx` | default, error, success |
| Card | `components/ui/card.tsx` | default, listing, dashboard |
| Badge | `components/ui/badge.tsx` | verification (4 tiers), status (8), role (5) |
| Avatar | `components/ui/avatar.tsx` | initials, image, fallback |
| Sidebar | `components/layout/sidebar.tsx` | Role-specific nav config |
| Topbar | `components/layout/topbar.tsx` | Bell, avatar, purpose switcher |
| Modal | `components/ui/modal.tsx` | Desktop + mobile bottom sheet |
| DataTable | `components/ui/data-table.tsx` | Sortable, filterable, paginated |
| ListingCard | `components/listings/listing-card.tsx` | Grid + list view |
| VerificationWizard | `components/verification/wizard.tsx` | 5-step with progress |
| AgreementPreview | `components/agreements/preview.tsx` | HTML render + sign button |

### 5.3 State Management
- **Server State:** TanStack Query (React Query) for all API data
- **Client State:** Zustand for UI state (sidebar, modals, toasts)
- **Auth State:** Clerk's `useAuth()`, `useUser()`
- **Forms:** React Hook Form + Zod resolvers

---

## 6. Testing Strategy

### 6.1 Test Pyramid
| Level | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Vitest + React Testing Library | 80% (utils, validators, fee calc) |
| Integration | Vitest + Prisma test DB | 60% (API routes, services) |
| E2E | Playwright | 100% critical paths |

### 6.2 Critical E2E Paths
1. **Landlord:** Sign up → Onboard → Add listing → Submit verification → Get certified
2. **Tenant:** Sign up → Onboard (purpose) → Search → Apply → Sign agreement → Pay rent
3. **Agent:** Sign up → Onboard → View pipeline → Manage listings → Track commission
4. **Admin:** Sign in → Review verification → Approve → Listing gets certified badge
5. **Estate Manager:** Sign up → Create org → Subscribe → Add units → Collect rent

### 6.3 Test Data
- `prisma/seed.ts` creates: 5 test users (one per role), 10 listings, 3 orgs
- Playwright fixtures reuse seeded data

---

## 7. Deployment & DevOps

### 7.1 Environments
| Env | Purpose | URL | Database |
|-----|---------|-----|----------|
| Local | Development | `localhost:3000` | Local PostgreSQL (Docker) |
| Staging | QA / Demo | `staging.propati.ng` | Supabase staging |
| Production | Live | `propati.ng` / `api.propati.ng` | Supabase production |

### 7.2 CI/CD (GitHub Actions)
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build

  deploy-staging:
    needs: lint-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx vercel --token=${{ secrets.VERCEL_TOKEN }} --scope=propati

  deploy-production:
    needs: deploy-staging
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    steps:
      - run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: npx prisma migrate deploy
```

### 7.3 Monitoring
| Tool | Purpose |
|------|---------|
| Vercel Analytics | Web vitals, page views |
| Sentry | Error tracking (frontend + backend) |
| Supabase Dashboard | DB performance, connections |
| Paystack Dashboard | Payment success rates |
| UptimeRobot | API health checks |

---

## 8. Resource Allocation

| Role | Week 1-2 | Week 3-5 | Week 6-8 | Week 9-10 | Week 11-12 |
|------|----------|----------|----------|-----------|------------|
| **Frontend Lead** | 1.0 | 1.0 | 1.0 | 1.0 | 0.5 |
| **Backend Lead** | 1.0 | 1.0 | 1.0 | 0.5 | 0.5 |
| **Full-stack** | 0.5 | 1.0 | 1.0 | 1.0 | 1.0 |
| **QA** | 0 | 0.5 | 1.0 | 1.0 | 1.0 |
| **DevOps** | 0.5 | 0 | 0 | 0.5 | 1.0 |

---

## 9. Risk Register & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Clerk migration issues | Medium | High | Test webhook sync thoroughly; manual fallback |
| Paystack webhook failures | Medium | High | Idempotency keys, retry queue, dead letter |
| Prisma performance (N+1) | High | Medium | `include`/`select` optimization, query logging |
| Next.js 14 App Router learning curve | Medium | Medium | Pair programming, internal docs |
| Verification state machine bugs | Medium | High | Unit test every transition; integration test |
| Image upload limits (Cloudinary) | Low | Medium | Client-side compression, chunked upload |
| Nigerian SMS delivery (Termii) | Medium | Medium | Fallback to Twilio WhatsApp; status callbacks |
| SEO for SPA-like dashboard | Low | Medium | Static params for public pages; Clerk for private |

---

## 10. Definition of Done (Launch Gate)

- [ ] All 5 roles: sign up → onboard → core journey works
- [ ] Payment flow: test card → webhook → escrow → release → transfer
- [ ] Verification: 5 layers → certified badge appears on listing
- [ ] Admin: can approve verification, suspend users, view revenue
- [ ] EM: onboarding → subscription → portfolio → ledger → tickets
- [ ] Zero console errors on all pages
- [ ] Lighthouse > 90 (Perf, SEO, A11y, Best Practices)
- [ ] Playwright E2E passes on staging
- [ ] Sentry error rate < 0.1%
- [ ] Paystack live mode tested with real card
- [ ] Custom domains: `propati.ng`, `api.propati.ng`
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

---

## 11. Post-Launch (Weeks 13+)

| Feature | Effort | Priority |
|---------|--------|----------|
| Escrow auto-release cron | 1 day | High |
| Agent commission auto-payout | 2 days | High |
| Tenant referral program | 1 week | Medium |
| WebSocket messaging (replace polling) | 2 weeks | Medium |
| React Native app (Expo) | 8 weeks | Future |
| White-label EM Enterprise | 3 weeks | Post-PMF |
| Property valuation AI | 4 weeks | Innovation |

---

*This build plan is the execution roadmap for the Next.js 14 rewrite. Update weekly. Phase gates at Week 2 (infra), Week 5 (listings+verify), Week 8 (payments+agreements), Week 10 (full product).*