# PROPATI — Next.js 14 Build Plan (Production Rewrite)

**Version:** 1.0  \
**Target Stack:** Next.js 14 (App Router), Prisma/PostgreSQL, Clerk Auth, Paystack, Tailwind CSS, TypeScript  \
**Current Phase:** Phase 10 — Launch Preparation  \
**Estimated Remaining:** 14–18 working days to full readiness (per earlier estimate); high-priority gap fill (~2–3 days) before launch gate  \
**Codebase Completeness:** ~85% (134 API routes · 95 pages · 70 components · 49 lib files · 1,436-line Prisma schema)

---

## Remaining Work Status

| Area | Status | Notes |
|------|--------|-------|
| Core Infrastructure (Phase 1–2) | ✅ Done | App Router, Prisma, Clerk, Paystack, Notifications, Verification all functional |
| Agent Listings Screen (Phase 3) | ⚠️ Partial | Agent pipeline screens exist; realtor buy/sell pages missing |
|| Admin Console (Phase 4) | ✅ Done | Most admin pages wired; `admin/agreements` page present |
| PDF Reports & Agreements (Phase 5) | ✅ Done | AgreementPDF, ReceiptPDF, EM monthly reports implemented |
| Notifications System (Phase 6) | ✅ Done | Bell, email/SMS, cron jobs active |
| Prembly NIN Production (Phase 7) | ⚠️ Needs Credentials | Code ready; production keys must be set in Railway env |
| Tenant Application Flow (Phase 8) | ✅ Done | Apply → landlord review → agreement draft functional |
| Performance & Polish (Phase 9) | ⚠️ Partial | Skeletons, SEO, error boundaries in place; Lighthouse audit pending |
| **Test Infrastructure** | ✅ Done | Vitest configured; 2 test files / 9 passing |
| **CI/CD Pipeline** | ✅ Done | GitHub Actions workflow `.github/workflows/ci.yml` in place |
| **Missing Migrations** | ✅ Done | Schema drift fixed in `20260623_schema_drift_fix`; `prisma generate` clean |
| **Realtor Dashboard Pages** | ✅ Done | buy/sell pipelines, listings, profile, messages implemented |
| **Database Schema Expansion** | ✅ Done | 8 new models (DocumentVersion, DocumentAccessLog, EvidenceExhibit, EvidenceCustodyEntry, Engagement, ConflictCheck, LawyerProfile, LawyerDocument); migration `20260624_schema_expansion` applied |
| **Legal Design: Agreement** | ✅ Done | 8 new fields; wired in schema + API |
| **Legal Design: StampDuty** | ✅ Done | 3 new fields; migration `20260624_stamp_duty_expansion` |
| **Screening-Calls API** | ✅ Done | `/api/screening-calls` + `/[id]` (GET/POST/PATCH/DELETE) implemented |
| **Launch Gate (Phase 10)** | 🔄 In Progress | CAC, domain, SSL, monitoring, smoke test, env secrets |

---

## Legend

## Legend
| Symbol | Meaning |
|--------|---------|
| ✅ Done | Implemented and functional |
| ⚠️ Partial / Needs X | Code present but requires credentials, audit, or missing sub-component |
| ❌ Missing | Not built; explicit blocker |
| 🔄 In Progress | Active current phase

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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[REPLA...OKABLE]
CLERK_SECRET_KEY=***                          # never commit real value
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

PAYSTACK_SECRET_KEY=***                       # NEVER commit real value
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
│   └── request-inspection/route.ts
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
│   └── notifications/route.ts     # GET, PATCH read
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
├── admin/
│   ├── verification-queue/route.ts
│   ├── flagged-listings/route.ts
│   ├── flagged-listings/[id]/route.ts
│   ├── listings/[id]/suspend/route.ts
│   ├── users/route.ts
│   ├── users/[id]/route.ts
│   └── stats/route.ts
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
| Schema expansion | Agreement: `riskTier`, `jurisdictionState`, `governingStatute`, `headTenantVerified`, `pdfContentHash`, `finalizedAt`, `lockStatus`, `integrityChainHash`. StampDuty: `agreementPdfHash`, `certificateHash`, `linkageHash`. — Migration `20260624_legal_redesign` |
| Preview | HTML template with `template_vars` → `/api/agreements/[id]/preview` |
| E-Signature | `POST /api/agreements/[id]/sign` + consent → audit trail (IP, UA, checksum) |
| State Machine | draft → pending_landlord → pending_tenant → tenant_signed/landlord_signed → fully_signed |
| finalizedAt | Set when both signatures captured; feeds `integrityChainHash` |
| integrityChainHash | SHA-256 over `pdfUrl + pdfContentHash + signatures` — tamper-evident chain |
| lockStatus | `editable | pending_approval | locked | expired_locked` — gate PDF overwrites |
| riskTier | `standard | elevated | high` — governs review queue routing |
| jurisdictionState | Nigerian state binding agreement — routes to local counsel |
| governingStatute | Cite state enabling legislation — compliance cross-check |
| headTenantVerified | Boolean — head-of-household confirmed via NIN/BVN/JAMB |
| pdfContentHash | SHA-256 of generated PDF bytes — re-derivable for integrity re-check |
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
| StampDuty hooks | `stamp_duty` fields set on `fully_signed` → Remita certification | Payment confirmation + legal audit |

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

| Screen | Data Source | Actions | File References |
|--------|-------------|---------|-----------------|
| Overview | `/api/admin/stats` | GMV, users, listings, revenue charts | `src/app/admin/page.tsx` |
| Verification Queue | `/api/admin/verification-queue` | Per-layer approve/reject | `src/app/admin/verifications/page.tsx` |
| Flags | `/api/admin/flagged-listings` | Dismiss, suspend, ban user | `src/app/admin/flagged-listings/page.tsx` |
| Law-Firms | `/api/admin/law-firms` | Review, approve, manage network | `src/app/admin/business/law-firms/page.tsx` |
| Law-Firm Cases | `/api/admin/law-firm-cases` | Route, monitor | `src/app/admin/business/law-firm-cases/page.tsx` |
| Subscriptions | `/api/admin/subscription-plans` | Create/edit plans | `src/app/admin/business/subscriptions/page.tsx` |
| Disputes | `/api/disputes` | Mediate, rule, close | `src/app/admin/disputes/page.tsx` |
| Users | `/api/admin/users` | Suspend, approve agent, change role, ban | `src/app/admin/users/[id]/page.tsx` |
| Revenue | `/api/admin/revenue` | Daily/weekly/monthly, export | `src/app/admin/revenue/page.tsx` |
| Audit Logs | `/api/admin/audit-logs` | View, filter | `src/app/admin/audit-logs/page.tsx` |

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
│   ├── short-let/
│   │   ├── page.tsx             # Short-let browse
│   │   └── [id]/page.tsx        # Short-let detail
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── onboarding/page.tsx      # Role-specific
├── (dashboard)/
│   ├── layout.tsx               # Dashboard shell + auth guard
│   ├── dashboard/
│   │   └── [role]/
│   │       ├── layout.tsx       # Role sidebar + header
│   │       ├── page.tsx         # Role-specific home
│   │       ├── properties/page.tsx
│   │       ├── rent/page.tsx
│   │       ├── verification/page.tsx
│   │       ├── agreements/page.tsx
│   │       ├── messages/page.tsx
│   │       └── profile/page.tsx
│   ├── tenant/
│   │   └── [role]/
│   │       ├── page.tsx         # Purpose switcher
│   │       ├── search/page.tsx
│   │       ├── payments/page.tsx
│   │       ├── agreements/page.tsx
│   │       ├── maintenance/page.tsx
│   │       ├── screening/page.tsx
│   │       └── profile/page.tsx
│   ├── agent/
│   │   └── [role]/
│   │       ├── page.tsx
│   │       ├── pipeline/page.tsx
│   │       ├── listings/page.tsx
│   │       ├── inspections/page.tsx
│   │       ├── commissions/page.tsx
│   │       ├── clients/page.tsx
│   │       ├── reputation/page.tsx
│   │       └── profile/page.tsx
│   ├── admin/                   # Admin-specific routes (no role segment)
│   │   ├── page.tsx             # Overview (GMV, users, listings, revenue)
│   │   ├── verifications/page.tsx
│   │   ├── flagged-listings/page.tsx
│   │   ├── users/[id]/page.tsx  # Individual user management
│   │   ├── revenue/page.tsx
│   │   ├── payments/page.tsx    # Escrow transactions
│   │   ├── disputes/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   ├── agreements/page.tsx
│   │   └── business/            # Law-firms, subscriptions, docs
│   │       ├── page.tsx
│   │       ├── law-firms/page.tsx
│   │       ├── law-firm-cases/page.tsx
│   │       ├── documents/page.tsx
│   │       └── subscriptions/page.tsx
│   └── estate-manager/
│       └── [role]/
│           ├── page.tsx
│           ├── portfolio/page.tsx
│           ├── ledger/page.tsx
│           ├── maintenance/page.tsx
│           ├── bulk-import/page.tsx
│           ├── agreements/page.tsx
│           ├── team/page.tsx
│           ├── billing/page.tsx
│           └── reports/page.tsx
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
| ESLint flat config broken | High | High | Complete migration to flat config or pin ESLint 8; blocking CI |
| Build times out / fails | High | High | Investigate bundle size, prune unused routes/components, disable heavy pages in build |
| Worktree metadata in docs | Medium | Low | Clean untracked/doc files before commit; add to .gitignore if needed |
| Short-let engine | Done | Done | Schema, API routes, public + landlord UI |
| Law-firm network | Done | High | Schema + API routes; UI pending |
| Commercial billing | Done | High | Schema + API routes; UI pending |
| Realtor role | Planned | Medium | Post-law-firm |
| Subscription revenue | Planned | Medium | Post-launch |
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

## 12. OS Expansion Gaps (Post-Launch / Phase I+)

The following areas from `docs/PROPTECH.md` are not yet implemented:

| OS Layer | Current State | Gap |
|----------|---------------|-----|
| **Actors** | landlord, tenant, agent, admin, estate_manager | Missing `realtor` role (buy/sell pipeline) and `law_firm` network partners |
| **Short-let Operations** | `short_let` exists as a `ListingType` | Missing booking engine, availability calendar, dynamic pricing, instant booking, check-in/out workflow, damage deposit, cleaning/turnover scheduling, revenue split |
| **Commercial / Office / Industrial** | `commercial`, `office`, `shop`, `warehouse` as `PropertyType` | Missing service-charge billing, utility allocation, business verification (CAC), workspace configuration, logistics/compliance metadata |
| **Legal Network** | Stamp duty (Remita) + basic disputes | Missing law-firm review/certification workflow, multi-firm routing, arbitration records, court-ready evidence packs |
| **Revenue Model** | Rent/booking fees + org subscriptions | Missing per-user subscriptions, legal marketplace fees, document-generation fees, service add-ons |
| **Evidence Layer** | Basic audit logs + disputes table | Missing structured legal evidence collection, exportable court packs |

### 12.1 Realtor Role & Buy/Sell Pipeline

**Priority:** Medium | **Effort:** 3 days | **Phase:** I+

**Goal:** Enable Realtor role users to manage buy/sell transactions end-to-end: sourcing listings, matching buyers/sellers, guiding through viewing/offer/agreement stages, and tracking commissions.

#### New Role

| Attribute | Detail |
|-----------|--------|
| Role slug | `realtor` |
| Navigation | `src/lib/navigation.tsx` → `REALTOR_NAVIGATION` |
| Dashboard path | `src/app/dashboard/realtor/` |

#### Realtor Navigation (proposed)

| Label | Path | Icon |
|-------|------|------|
| Dashboard | `/dashboard/realtor` | Home |
| My Listings | `/dashboard/realtor/listings` | Building2 |
| Buyer Pipeline | `/dashboard/realtor/buyers` | Users |
| Seller Pipeline | `/dashboard/realtor/sellers` | Users |
| Deals | `/dashboard/realtor/deals` | BarChart2 |
| Commissions | `/dashboard/realtor/commissions` | DollarSign |
| Inspections | `/dashboard/realtor/inspections` | Eye |
| My Profile | `/dashboard/realtor/profile` | User |
| Messages | `/dashboard/realtor/messages` | MessageSquare |

#### New / Updated API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `src/app/api/realtor/route.ts` | GET | List realtor's active deals / assignments |
| `src/app/api/realtor/listings/route.ts` | GET, POST | Realtor-assigned sale/rent listings |
| `src/app/api/realtor/buyers/route.ts` | GET, POST | Buyer profiles + preferences |
| `src/app/api/realtor/sellers/route.ts` | GET, POST | Seller profiles + property details |
| `src/app/api/realtor/deals/route.ts` | GET, POST | Deal records with buyer_id, seller_id, listing_id |
| `src/app/api/realtor/deals/[id]/route.ts` | GET, PATCH | Update deal stage, notes |
| `src/app/api/realtor/commissions/route.ts` | GET | Commission ledger for realtor |
| `src/app/api/realtor/inspections/route.ts` | GET, POST | Inspection scheduling + results |

#### Buy/Sell Pipeline Stages

| Stage | Description |
|-------|-------------|
| `sourcing` | Realtor identifies seller + verifies property |
| `listing` | Listing created under `sale` type with realtor_id |
| `buyer_match` | Buyer registered, matched to listing |
| `viewing` | Viewing scheduled, agent attends |
| `offer` | Buyer submits offer, realtor negotiates |
| `agreement` | Agreement initiated (existing flow reused) |
| `closing` | Paystack sale escrow (new flow) |
| `completed` | Commission released, deal closed |

#### Schema Changes (Prisma)

```prisma
enum ListingType { rent sale short_let share commercial }
// sale already exists — add realtor_id foreign key if not present
model RealtorProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  licenseNumber  String?
  agencyName     String?
  commissionRate Float    @default(0)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Deal {
  id           String    @id @default(cuid())
  realtorId    String
  listingId    String
  buyerId      String
  sellerId     String
  status       String    @default("sourcing") // sourcing → listing → buyer_match → viewing → offer → agreement → closing → completed
  stageNotes   String?
  offerAmount  Float?
  finalAmount  Float?
  closedAt     DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

#### Integration Points

- **Listings:** `sale` listing type gets `realtorId` column; realtor-only listings visible to buyers
- **Agreements:** Existing e-signature + PDF flow reused (no new agreement model)
- **Payments:** New sale escrow flow (`charge.success` → `sale_in_escrow` → admin/admin release or auto-redirect)
- **Notifications:** `agreement_created`, `offer_accepted`, `deal_completed` templates added to `src/lib/email.ts`
- **Commissions:** Mirrors Agent commission model; tied to `Deal.finalAmount × realtor.commissionRate`

#### Dependencies

- Phase 3 (Agent pipelines) provides Kanban/deal-stage UI pattern
- Phase 2 (Paystack) provides escrow infrastructure; sale escrow reuses same webhook with `transaction.metadata.type = 'sale'`
- Phase 5 (Agreements) reused with minimal new endpoints

---
