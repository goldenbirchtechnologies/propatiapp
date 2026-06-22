# PROPATI — Implementation Plan

**Version:** 2.0  **Source:** `docs/IMPLEMENTATION_PLAN.md v1.0`, `docs/TECH_STACK.md`, current codebase audit  **Status:** 10 Phases — ~14-18 Days to Launch

---

## Architecture Note (2026-06-22 Update)

The codebase is now **Next.js 14 (App Router) + TypeScript + Clerk Auth**. All references to `src/routes/*.js`, `index.html`, `src/db/migrate*.js`, and `src/app.js` in this document are stale. The updated references below map to the actual file paths used today.

| Old Reference | Current Reference |
|---|---|
| `src/routes/[feature].js` | `src/app/api/[feature]/route.ts` |
| `src/services/[feature].js` | `src/lib/[feature].ts` |
| `index.html` + inline JS | `src/app/dashboard/[role]/page.tsx` + client components under `src/components/` |
| `src/db/migrate_v3.js` | `prisma/migrations/` (managed by Prisma) + `prisma/schema.prisma` |
| `src/app.js` (Express) | Next.js Server Components / `src/app/layout.tsx` |
| `renderXScreen()` | `/dashboard/[role]/page.tsx` and `src/components/` |
| `loadEmOrg()` infinite-loop risk | `async/await` in Server Components + TanStack Query hydration |
| `src/services/pdf.js` | `src/lib/pdf.ts` |
| `src/services/paystack.js` | `src/lib/paystack.ts` |
| `src/services/verification.js` | `src/lib/verification.ts` |
| `src/services/cron.js` | `src/lib/cron.ts` |
| `src/services/notifications.js` | `src/lib/email.ts` + `src/lib/termii.ts` |
| Path params `/route/:id` | Next.js dynamic segments `/api/[path]/[id]/route.ts` |
| Raw body middleware | `src/app/api/payments/webhook/route.ts` — `headers({'content-type': 'application/json'})` guard |

---

## 1. Phase Overview

| Phase | Title | Duration | Priority | Dependencies |
|-------|-------|----------|----------|--------------|
| 1 | Critical Bugs & Stability | 1-2 days | **Critical** | — |
| 2 | Paystack Rent Collection | 2-3 days | **High** | Phase 1 |
| 3 | Agent Listings Screen | 1 day | **High** | Phase 1 |
| 4 | Admin Console Real Data | 2 days | **High** | Phase 1 |
| 5 | PDF Reports & Agreements | 2 days | **Medium** | Phase 2 |
| 6 | Notifications System | 1 day | **Medium** | Phase 1 |
| 7 | Prembly NIN Production | 0.5 days | **High** | Phase 1 |
| 8 | Tenant Application Flow | 2 days | **Medium** | Phase 2, 3 |
| 9 | Performance & Polish | 2 days | **Medium** | Phase 1-5 |
| 10 | Launch Preparation | 2-3 days | **Critical** | All |

**Critical Path:** Phase 1 → Phase 2 → Phase 10

---

## 2. Detailed Phase Breakdown

### PHASE 1 — Critical Bugs & Stability (1–2 days)
*Goal: Zero console errors, all nav works, mobile responsive*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 1.1 | Fix 404: `GET /api/listings/my` → `/api/listings?owner_id=me` | ☐ | `src/app/api/listings/route.ts` | Backend |
| 1.2 | Verify all nav items load without console errors | ☐ | `src/app/(dashboard)/layout.tsx`, `src/lib/navigation.tsx` | Frontend |
| 1.3 | Test each role dashboard (5 roles) | ☐ | `src/app/dashboard/[role]/layout.tsx`, `src/app/dashboard/[role]/page.tsx` | QA |
| 1.4 | Fix infinite-load risk — add loading guard to data fetches | ☐ | `src/app/dashboard/[role]/page.tsx` + any client `useEffect` without cleanup | Frontend |
| 1.5 | Add `isLoading` / `skeleton` guard to ALL async data loads | ☐ | `src/app/dashboard/[role]/page.tsx`, `src/components/` | Frontend |
| 1.6 | Console error audit — fix `'role is not defined'` / undefined references | ☐ | `src/app/dashboard/landlord/page.tsx`, client components | Frontend |
| 1.7 | Fix undefined variable references (grep `is not defined`) | ☐ | `src/app/**/*.tsx`, `src/components/**/*.tsx`, `src/app/api/**/*.ts` | Frontend/Backend |
| 1.8 | Mobile audit: iPhone Safari, Android Chrome | ☐ | `src/app/(dashboard)/layout.tsx` @ 375px, 414px | QA |
| 1.9 | Hamburger sidebar toggles correctly | ☐ | `src/components/layout/sidebar.tsx` — open/close state | Frontend |
| 1.10 | Modals render as bottom sheets (≤768px) | ☐ | `src/components/ui/modal.tsx` — Tailwind responsive classes | Frontend |
| 1.11 | Touch targets ≥ 44px on all interactive elements | ☐ | `src/components/ui/` — buttons, nav items | Frontend |
| 1.12 | Grid collapse: 3-col → 2-col @ 768px, 1-col @ 480px | ☐ | `src/components/listings/listing-card.tsx` — `grid` / `grid-cols-*` | Frontend |

**Definition of Done:**
- [ ] Zero console errors on all 5 role dashboards
- [ ] All sidebar nav items functional
- [ ] Mobile: sidebar drawer, bottom sheets, grids responsive
- [ ] No infinite loops (add `isLoading` / cleanup guards)

---

### PHASE 2 — Paystack Rent Collection (2–3 days)
*Goal: Tenant pays rent → escrow → admin releases → payee paid*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 2.1 | Backend: `POST /api/payments/initiate` — create transaction, return Paystack `authorization_url` | ☐ | `src/app/api/payments/initiate/route.ts` | Backend |
| 2.2 | Frontend: "Pay Rent" button → calls initiate → `window.location = authorization_url` | ☐ | `src/app/dashboard/tenant/payments/page.tsx` | Frontend |
| 2.3 | Backend: Paystack webhook `POST /api/payments/webhook` — raw body guard + HMAC-SHA512 | ☐ | `src/app/api/webhook/paystack/route.ts` | Backend |
| 2.4 | Handle `charge.success` → update transaction `status = 'in_escrow'` | ☐ | `src/app/api/webhook/paystack/route.ts`, `prisma/schema.prisma` + migrations | Backend |
| 2.5 | Handle `charge.failed` → update transaction `status = 'failed'` | ☐ | `src/app/api/webhook/paystack/route.ts` | Backend |
| 2.6 | Escrow release: Admin UI button → `POST /api/payments/release-escrow/[id]` | ☐ | `src/app/api/payments/release-escrow/[id]/route.ts` | Backend |
| 2.7 | Paystack Transfer API → transfer to `payee_id` bank account | ☐ | `src/lib/paystack.ts` | Backend |
| 2.8 | On transfer success → `transaction.status = 'released'`, `paid_at = NOW()` | ☐ | `src/app/api/payments/release-escrow/[id]/route.ts` | Backend |
| 2.9 | Receipt generation + email (`payment_confirmed` template) | ☐ | `src/lib/email.ts`, `src/lib/termii.ts` | Backend |
| 2.10 | Frontend: Transaction history shows status badges (pending/escrow/released) | ☐ | `src/app/dashboard/tenant/payments/page.tsx`, `src/app/dashboard/landlord/rent/page.tsx` | Frontend |
| 2.11 | Test full flow: test card → webhook → escrow → release → transfer | ☐ | Paystack test keys | QA |

**Definition of Done:**
- [ ] Tenant can pay rent via Paystack checkout
- [ ] Webhook verified (HMAC-SHA512) and updates DB
- [ ] Admin can release escrow → Paystack Transfer → payee paid
- [ ] Receipts emailed + visible in history

---

### PHASE 3 — Agent Listings Screen (1 day)
*Goal: Agent sees managed listings with commission data*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 3.1 | Backend: `GET /api/listings?agent_id=:uid` filter + commission join | ☐ | `src/app/api/listings/route.ts` | Backend |
| 3.2 | Frontend: Agent dashboard "Managed Listings" screen | ☐ | `src/app/dashboard/agent/listings/page.tsx` | Frontend |
| 3.3 | Agent deal pipeline: Kanban (Enquiry → Viewing → Offer → Agreement → Completed) | ☐ | `src/app/api/agreements/route.ts`, `src/app/dashboard/agent/pipeline/page.tsx` | Full-stack |
| 3.4 | Backend: `GET /api/agreements?agent_id=:uid` filter | ☐ | `src/app/api/agreements/route.ts` | Backend |
| 3.5 | Commission calculation display (platform_fee × agent_rate) | ☐ | `src/app/dashboard/agent/commissions/page.tsx` | Frontend |

**Definition of Done:**
- [ ] Agent sees only assigned listings
- [ ] Pipeline kanban functional with drag/click advance
- [ ] Commission amounts correct per transaction type

---

### PHASE 4 — Admin Console Real Data (2 days)
*Goal: Admin sees live platform data, can manage users/verifications*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 4.1 | Wire `GET /api/admin/stats` → Overview screen KPIs | ☐ | `src/app/api/admin/stats/route.ts`, `src/app/admin/page.tsx` | Full-stack |
| 4.2 | Create admin activity feed endpoint (`GET /api/admin/audit-logs`) | ☐ | `src/app/api/admin/audit-logs/route.ts` | Backend |
| 4.3 | Admin Users screen: `GET /api/admin/users` with pagination | ☐ | `src/app/api/admin/users/route.ts`, `src/app/admin/users/[id]/page.tsx` | Full-stack |
| 4.4 | Suspend/unsuspend: `POST /api/admin/users/[id]/suspend` | ☐ | `src/app/api/admin/users/[id]/suspend/route.ts` | Backend |
| 4.5 | Approve/change role: `POST /api/admin/users/[id]/change-role` | ☐ | `src/app/api/admin/users/[id]/change-role/route.ts` | Backend |
| 4.6 | Disputes UI: list + ruling (refund/mediate/close) | ☐ | `src/app/api/disputes/route.ts`, `src/app/admin/disputes/page.tsx` | Full-stack |
| 4.7 | Verification queue already wired — verify all 5 layer actions work | ☐ | `src/app/admin/verifications/page.tsx`, `src/app/api/admin/verification-queue/route.ts` | QA |

**Definition of Done:**
- [ ] Overview shows real GMV, users, listings, revenue
- [ ] User management: suspend, approve agent
- [ ] Dispute resolution workflow functional

---

### PHASE 5 — PDF Reports & Agreements (2 days)
*Goal: Generate PDFs for agreements, receipts, EM reports*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 5.1 | Lease PDF generation (`src/lib/pdf.ts`) — PDFKit template | ☐ | `src/lib/pdf.ts`, `src/app/api/agreements/[id]/route.ts` | Backend |
| 5.2 | Upload PDF to Cloudinary, store in `agreements.pdf_url` | ☐ | `src/lib/pdf.ts`, `prisma/schema.prisma` + migrations | Backend |
| 5.3 | Serve via `GET /api/agreements/[id]/pdf` (stream from Cloudinary) | ☐ | `src/app/api/agreements/[id]/pdf/route.ts` | Backend |
| 5.4 | Frontend: "Download PDF" on agreement preview/sign screens | ☐ | `src/app/dashboard/landlord/agreement/page.tsx`, `src/app/dashboard/tenant/agreements/page.tsx` | Frontend |
| 5.5 | Estate Manager monthly PDF reports (`GET /api/orgs/[id]/reports/[month]`) | ☐ | `src/app/api/orgs/[id]/reports/route.ts`, `src/lib/pdf.ts` | Backend |
| 5.6 | Payment receipt PDF + email attachment (`payment_confirmed`) | ☐ | `src/lib/pdf.ts`, `src/lib/email.ts` | Backend |
| 5.7 | Add `pdf_url` column to `agreements` table | ☐ | `prisma/schema.prisma` + `prisma/migrations/` | Backend |

**Definition of Done:**
- [ ] Agreement PDF generates with correct data, downloads
- [ ] EM monthly report PDF generates
- [ ] Receipt PDF attached to payment confirmation email

---

### PHASE 6 — Notifications System (1 day)
*Goal: Real-time notification bell, email/SMS reminders*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 6.1 | Notification bell dropdown (topbar) | ☐ | `src/components/layout/topbar.tsx` | Frontend |
| 6.2 | `GET /api/notifications` + `PATCH /notifications/[id]/read` + unread count | ☐ | `src/app/api/notifications/route.ts`, `src/app/api/notifications/[id]/read/route.ts`, `src/app/api/notifications/unread-count/route.ts` | Full-stack |
| 6.3 | Unread count badge + real-time poll (30s) | ☐ | `src/components/layout/topbar.tsx`, `src/app/api/messages/route.ts` | Frontend |
| 6.4 | Email template review & SMTP setup (env vars) | ☐ | `src/lib/email.ts`, Railway env vars | Backend |
| 6.5 | SMS rent reminders cron (07:00 UTC) + Termii integration | ☐ | `src/lib/cron.ts`, `src/lib/termii.ts` | Backend |
| 6.6 | In-app notification types: rent_due, payment, message, verification, agreement, org_invite | ☐ | `src/lib/email.ts` / `src/lib/notifications.ts` — notification service | Backend |

**Definition of Done:**
- [ ] Bell icon shows unread count, dropdown loads notifications
- [ ] Mark-as-read works, badge updates
- [ ] Rent reminders sent via email + SMS at 7/3/1 days
- [ ] All templates tested

---

### PHASE 7 — Prembly NIN Verification Production (0.5 days)
*Goal: Real identity verification in production*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 7.1 | Sign up on identitypass.prembly.com, get credentials | ☐ | Railway env vars | Owner |
| 7.2 | Set `PREMBLY_API_KEY`, `PREMBLY_APP_ID` in Railway | ☐ | Railway dashboard | Backend |
| 7.3 | Test with real NIN in staging | ☐ | `src/lib/verification.ts`, `src/app/api/verification/verify-identity/route.ts` | QA |
| 7.4 | Error handling: NIN not found, mismatch, timeout, rate limit | ☐ | `src/lib/verification.ts` | Backend |
| 7.5 | Retry logic for 5xx + audit logging | ☐ | `src/lib/verification.ts` | Backend |
| 7.6 | Verify mock mode still works when key unset | ☐ | `src/lib/verification.ts` | QA |

**Definition of Done:**
- [ ] Real NIN/BVN verification works in staging
- [ ] Errors handled gracefully with user-facing messages
- [ ] Audit logs capture all verification attempts

---

### PHASE 8 — Tenant Application Flow (2 days)
*Goal: Structured applications with landlord review*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 8.1 | Create `applications` table via Prisma migration | ☐ | `prisma/schema.prisma` + `prisma/migrations/` | Backend |
| 8.2 | `POST /api/applications` on "Apply & Message" | ☐ | `src/app/api/applications/route.ts`, `src/app/dashboard/tenant/page.tsx` | Full-stack |
| 8.3 | Landlord applications review screen | ☐ | `src/app/dashboard/landlord/page.tsx` | Frontend |
| 8.4 | Tenant "My Applications" screen + notifications | ☐ | `src/app/dashboard/tenant/page.tsx` | Frontend |
| 8.5 | Application status: pending → reviewed → accepted/rejected | ☐ | `src/app/api/applications/[id]/route.ts` | Backend |
| 8.6 | Accepted application → auto-create conversation + agreement draft | ☐ | `src/app/api/applications/[id]/route.ts`, `src/app/api/conversations/route.ts` | Backend |

**`applications` Table Schema:**
```sql
CREATE TABLE applications (
  id              TEXT PRIMARY KEY,        -- 'app_' + 12 chars
  listing_id      TEXT REFERENCES listings(id),
  tenant_id       TEXT REFERENCES users(id),
  landlord_id     TEXT REFERENCES users(id),
  status          TEXT DEFAULT 'pending' CHECK IN ('pending','under_review','accepted','rejected','withdrawn'),
  message         TEXT,                    -- initial message from tenant
  landlord_notes  TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_applications_landlord ON applications(landlord_id);
CREATE INDEX idx_applications_tenant ON applications(tenant_id);
CREATE INDEX idx_applications_listing ON applications(listing_id);
```

**Definition of Done:**
- [ ] Tenant applies from listing card → creates application + conversation
- [ ] Landlord sees applications with tenant profile preview
- [ ] Accept → agreement draft created automatically

---

### PHASE 9 — Performance & Polish (2 days)
*Goal: Production-grade UX, SEO, security hardening*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 9.1 | Cloudinary transformations: `f_auto,q_auto,w_800` on upload | ☐ | `src/app/api/listings/[id]/images/route.ts`, Cloudinary config | Backend |
| 9.2 | Skeleton loading states (CSS-only) for cards, tables, lists | ☐ | Tailwind `animate-pulse` in `src/components/` | Frontend |
| 9.3 | CORS tighten: `origin: [process.env.FRONTEND_URL]` | ☐ | `next.config.js` or per-route CORS headers in API `route.ts` files | Backend |
| 9.4 | Error boundary wrapping segments — catch + toast + log | ☐ | `src/app/error.tsx`, `src/components/ui/toast.tsx` | Frontend |
| 9.5 | SEO: dynamic `<title>`, meta description, Open Graph per screen | ☐ | `src/app/(public)/layout.tsx`, `src/app/listings/[id]/page.tsx`, etc. | Frontend |
| 9.6 | Add `loading="lazy"` to all listing images | ☐ | `src/components/listings/listing-card.tsx` | Frontend |
| 9.7 | Console.log cleanup — remove debug statements | ☐ | `src/app/**/*.tsx`, `src/components/**/*.tsx` | Frontend/Backend |
| 9.8 | Add `X-Content-Type-Options: nosniff` via headers | ☐ | `next.config.js` or per-route headers in `route.ts` | Backend |
| 9.9 | Rate limit headers exposed to frontend for retry UI | ☐ | API `route.ts` files + frontend retry hooks | Full-stack |

**Definition of Done:**
- [ ] Lighthouse score > 90 (Performance, SEO, Accessibility)
- [ ] No console errors/warnings in production
- [ ] CORS restricted to frontend domain
- [ ] Skeletons show during data loads

---

### PHASE 10 — Launch Preparation (2–3 days)
*Goal: Go live on propati.ng*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 10.1 | CAC Registration: PROPATI Technologies Ltd | ☐ | Legal/offline | Owner |
| 10.2 | Paystack live mode activation — `sk_live_...` in env | ☐ | Railway / Vercel env vars | Owner |
| 10.3 | Custom domain: `propati.ng` → Vercel, `api.propati.ng` → Railway | ☐ | Vercel/Railway config, `FRONTEND_URL`, CORS | Owner |
| 10.4 | SSL certificates (auto via Vercel/Railway) | ☐ | Vercel/Railway | Owner |
| 10.5 | Monitoring: Railway alerts, Sentry (frontend + backend), Supabase monitoring | ☐ | External services | Backend |
| 10.6 | Production data seeding: admin user, 10-20 listings, 5 agents | ☐ | `prisma/seed.ts` | Backend |
| 10.7 | Smoke test: full user journeys on production URLs | ☐ | All journeys | QA |
| 10.8 | Backup verification: Supabase PITR test restore | ☐ | Supabase dashboard | Backend |
| 10.9 | Documentation freeze: TRD, Journeys, UI/UX, Schema, this Plan | ☐ | All `.md` files | Owner |
| 10.10 | Launch announcement prep: email, social, press | ☐ | Marketing | Owner |

**Definition of Done:**
- [ ] `propati.ng` loads, HTTPS, custom domain
- [ ] `api.propati.ng` responds, CORS correct
- [ ] Paystack live transactions work
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented

---

## 3. File Change Reference Map

When building features, these are the files most likely touched:

| Change Type | Files |
|-------------|-------|
| New API endpoint | `src/app/api/[path]/route.ts` |
| New DB column/table | `prisma/schema.prisma` + `prisma/migrations/[timestamp]_[name]/` |
| New frontend screen | `src/app/dashboard/[role]/page.tsx` and/or `src/app/admin/[section]/page.tsx` |
| New nav item | `src/lib/navigation.tsx` — role-specific `NAVIGATION` arrays |
| New action handler | React `onClick` / `onSubmit` in Client Components |
| New data load | Server Component `async/await` + `await prisma...` or TanStack Query hooks in client |
| Admin page | `src/app/admin/[section]/page.tsx` |
| Email template | `src/lib/email.ts` — template functions |
| SMS message | `src/lib/termii.ts` — send functions |
| PDF template | `src/lib/pdf.ts` |
| Verification logic | `src/lib/verification.ts` + `src/app/api/verification/*/route.ts` |
| Paystack logic | `src/lib/paystack.ts` + `src/app/api/payments/*/route.ts`, `src/app/api/webhook/paystack/route.ts` |
| Shared UI component | `src/components/ui/[name].tsx` |
| Listing component | `src/components/listings/[name].tsx` |
| Validation | `src/lib/validators.ts`, `src/lib/validators.commercial.ts`, `src/lib/validators.management.ts`, etc. |

---

## 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Paystack webhook fails silently | Medium | High | Idempotency keys, retry logic, dead letter queue |
| Prembly API rate limited | Medium | Medium | Exponential backoff, cache lookups |
| Cloudinary upload fails (large files) | Low | Medium | Client-side compression, chunked upload, progress UI |
| Next.js bundle too large | Medium | Medium | Dynamic imports, route-based code splitting, prune unused components |
| NIN data breach | Low | Critical | AES-256-GCM, audit logs, minimal retention |
| Supabase connection pool exhaustion | Low | High | `pg-pool` max 20, query optimization |
| Admin loses 2FA access | Low | High | Backup admin, recovery codes |

---

## 5. Parallelization Opportunities

| Can Run Parallel | Must Be Sequential |
|------------------|-------------------|
| Phase 3 (Agent) + Phase 6 (Notifications) | Phase 1 before all |
| Phase 5 (PDF) + Phase 7 (Prembly) | Phase 2 before 5, 8 |
| Phase 9 (Polish) can start after Phase 1 | Phase 10 last |

**Suggested Week 1:** Phase 1, 2, 3, 6 in parallel (after 1 done)  
**Suggested Week 2:** Phase 4, 5, 7, 8 in parallel  
**Suggested Week 3:** Phase 9, then 10

---

## 6. Resource Allocation

| Role | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 | Phase 9 | Phase 10 |
|------|---------|---------|---------|---------|---------|---------|---------|---------|---------|----------|
| Frontend | 1.0 | 0.5 | 1.0 | 0.5 | 0.5 | 1.0 | 0 | 1.0 | 1.0 | 0.5 |
| Backend | 0.5 | 1.0 | 0.5 | 1.0 | 1.0 | 0.5 | 1.0 | 1.0 | 0.5 | 0.5 |
| QA | 1.0 | 1.0 | 0.5 | 1.0 | 0.5 | 0.5 | 0.5 | 1.0 | 1.0 | 1.0 |
| DevOps | 0 | 0 | 0 | 0 | 0 | 0 | 0.5 | 0 | 0 | 1.0 |

---

## 7. Success Criteria (Launch Gate)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Console Errors** | 0 | Browser DevTools on all 5 dashboards |
| **API 500 Rate** | < 0.1% | Railway / Vercel logs / Sentry |
| **Payment Success** | > 99% | Paystack dashboard |
| **Page Load (LCP)** | < 2.5s | Lighthouse / Web Vitals |
| **Mobile Usability** | Pass | Lighthouse Mobile |
| **Security Headers** | All present | SecurityHeaders.com |
| **Test Coverage (manual)** | 100% journeys | QA sign-off |

---

## 8. Post-Launch Backlog (Priority Order)

| Feature | Effort | Priority | Phase |
|---------|--------|----------|-------|
| Paystack escrow auto-release (cron) | 1 day | High | 11 |
| Agent commission auto-payout | 2 days | High | 11 |
| Tenant-to-tenant referral | 1 day | Medium | 12 |
| Landlord bulk rent collection | 2 days | Medium | 12 |
| EM white-label (Enterprise) | 3 days | Low | 13 |
| WebSockets for messaging (replace polling) | 2 days | Low | 13 |
| Property valuation tool | 3 days | Low | 14 |
| Mortgage calculator (real) | 2 days | Low | 14 |
| React Native mobile app | 8 weeks | Future | 15 |

---

## 9. OS Expansion Backlog (Post-Launch / Phase I+)

Aligned with `docs/PROPTECH.md`. These map to schema gaps listed in `docs/DATABASE_SCHEMA.md` §8.

| Feature | Effort | Priority | Phase | Status |
|---------|--------|----------|-------|--------|
| Short-let booking engine | 0 days | High | I+ | Done |
| Availability calendar + dynamic pricing | 0 days | High | I+ | Done |
| Law firm network onboarding + review workflow | 0 days | Medium | I+ | Done |
| Service-charge billing (commercial/office) | 0 days | Medium | II | Done |
| Utility allocation (metering) | 0 days | Medium | II | Done |
| **Realtor Role + Buy/Sell Pipeline** | **3 days** | **Medium** | **I+** | **Done** |
| Business verification (CAC) | 1 day | Medium | II | Done |
|| Court-ready evidence pack export | 2 days | Low | II | Done |
| Version-controlled document engine | 3 days | Low | II | Done |
| Per-user subscription plans | 2 days | Low | III | Planned |
| Service add-ons (cleaning, inspections) | 3 weeks | Post-PMF | III | Future |
| White-label EM Enterprise | 3 weeks | Post-PMF | III | Future |

---

*This plan is the execution roadmap. Update task status daily. Phase 1 is the unblocker for all others.*
