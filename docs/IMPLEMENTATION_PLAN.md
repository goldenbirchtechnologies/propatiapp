# PROPATI — Implementation Plan

**Version:** 1.0  
**Source:** `oldpropati/IMPLEMENTATION_PLAN.md`, `oldpropati/TECH_STACK.md`, `oldpropati/BACKEND_STRUCTURE.md`  
**Status:** 10 Phases — ~14-18 Days to Launch

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
| 1.1 | Fix 404: `GET /api/listings/my` → `/api/listings/owner/mine` | ☐ | `src/routes/listings.js` | Backend |
| 1.2 | Verify all nav items load without console errors | ☐ | `index.html` | Frontend |
| 1.3 | Test each role dashboard (5 roles) | ☐ | `index.html` — all `render*Screen()` | QA |
| 1.4 | Fix `loadEmOrg()` infinite loop — add loading guard | ☐ | `index.html` — `loadEmOrg()` | Frontend |
| 1.5 | Add `loading` guard to ALL `load*()` functions | ☐ | `index.html` — 25+ load functions | Frontend |
| 1.6 | Console error audit — fix `'role is not defined'` | ☐ | `index.html` — `renderLandlordScreen()` | Frontend |
| 1.7 | Fix undefined variable references (grep `is not defined`) | ☐ | `index.html`, `src/**/*.js` | Frontend |
| 1.8 | Mobile audit: iPhone Safari, Android Chrome | ☐ | `index.html` @ 375px, 414px | QA |
| 1.9 | Hamburger sidebar toggles correctly | ☐ | `index.html` — `.mob-menu-btn`, `.sidebar.open` | Frontend |
| 1.10 | Modals render as bottom sheets (≤768px) | ☐ | `index.html` — `.modal` CSS | Frontend |
| 1.11 | Touch targets ≥ 44px on all interactive elements | ☐ | `index.html` — `.nav-item`, buttons | Frontend |
| 1.12 | Grid collapse: 3-col → 2-col @ 768px, 1-col @ 480px | ☐ | `index.html` — `@media` queries | Frontend |

**Definition of Done:**
- [ ] Zero console errors on all 5 role dashboards
- [ ] All sidebar nav items functional
- [ ] Mobile: sidebar drawer, bottom sheets, grids responsive
- [ ] No infinite loops (add `isLoading` guards)

---

### PHASE 2 — Paystack Rent Collection (2–3 days)
*Goal: Tenant pays rent → escrow → admin releases → payee paid*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 2.1 | Backend: `POST /api/payments/initiate` — create transaction, return Paystack `authorization_url` | ☐ | `src/routes/payments.js` | Backend |
| 2.2 | Frontend: "Pay Rent" button → calls initiate → `window.location = authorization_url` | ☐ | `index.html` — `renderTenantScreen('payments')` | Frontend |
| 2.3 | Backend: Paystack webhook `POST /api/payments/webhook` — raw body middleware | ☐ | `src/routes/payments.js` | Backend |
| 2.4 | Handle `charge.success` → update transaction `status = 'in_escrow'` | ☐ | `src/routes/payments.js`, `src/db/migrate_v3.js` | Backend |
| 2.5 | Handle `charge.failed` → update transaction `status = 'failed'` | ☐ | `src/routes/payments.js` | Backend |
| 2.6 | Escrow release: Admin UI button → `POST /api/payments/release-escrow/:id` | ☐ | `src/routes/payments.js` | Backend |
| 2.7 | Paystack Transfer API → transfer to `payee_id` bank account | ☐ | `src/services/paystack.js` (new) | Backend |
| 2.8 | On transfer success → `transaction.status = 'released'`, `paid_at = NOW()` | ☐ | `src/routes/payments.js` | Backend |
| 2.9 | Receipt generation + email (`payment_confirmed` template) | ☐ | `src/services/notifications.js` | Backend |
| 2.10 | Frontend: Transaction history shows status badges (pending/escrow/released) | ☐ | `index.html` — `renderTenantScreen('payments')`, `renderLandlordScreen('rent')` | Frontend |
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
| 3.1 | Backend: `GET /api/listings?agent_id=:uid` filter + commission join | ☐ | `src/routes/listings.js` | Backend |
| 3.2 | Frontend: Agent dashboard "Managed Listings" screen | ☐ | `index.html` — `renderAgentScreen('listings')` | Frontend |
| 3.3 | Agent deal pipeline: Kanban (Enquiry → Viewing → Offer → Agreement → Completed) | ☐ | `src/routes/agreements.js`, `index.html` | Full-stack |
| 3.4 | Backend: `GET /api/agreements?agent_id=:uid` filter | ☐ | `src/routes/agreements.js` | Backend |
| 3.5 | Commission calculation display (platform_fee × agent_rate) | ☐ | `index.html` — agent commission column | Frontend |

**Definition of Done:**
- [ ] Agent sees only assigned listings
- [ ] Pipeline kanban functional with drag/click advance
- [ ] Commission amounts correct per transaction type

---

### PHASE 4 — Admin Console Real Data (2 days)
*Goal: Admin sees live platform data, can manage users/verifications*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 4.1 | Wire `GET /api/users/admin/stats` → Overview screen KPIs | ☐ | `src/routes/users.js`, `index.html` — `renderAdminScreen('overview')` | Full-stack |
| 4.2 | Create admin activity feed endpoint (`GET /api/admin/activity`) | ☐ | `src/routes/notifications.js` or new | Backend |
| 4.3 | Admin Users screen: `GET /api/users/admin/all` with pagination | ☐ | `src/routes/users.js`, `index.html` — `renderAdminScreen('users')` | Full-stack |
| 4.4 | Suspend/unsuspend: `POST /api/users/admin/:id/suspend` | ☐ | `src/routes/users.js` | Backend |
| 4.5 | Approve agent: `POST /api/users/admin/:id/approve-agent` | ☐ | `src/routes/users.js` | Backend |
| 4.6 | Disputes UI: list + ruling (refund/meditate/close) | ☐ | `src/routes/disputes.js`, `index.html` | Full-stack |
| 4.7 | Verification queue already wired — verify all 5 layer actions work | ☐ | `index.html` — `renderAdminScreen('verification')` | QA |

**Definition of Done:**
- [ ] Overview shows real GMV, users, listings, revenue
- [ ] User management: suspend, approve agent
- [ ] Dispute resolution workflow functional

---

### PHASE 5 — PDF Reports & Agreements (2 days)
*Goal: Generate PDFs for agreements, receipts, EM reports*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 5.1 | Lease PDF generation (`src/services/pdf.js`) — PDFKit template | ☐ | `src/services/pdf.js`, `src/routes/agreements.js` | Backend |
| 5.2 | Upload PDF to Cloudinary, store in `agreements.pdf_url` | ☐ | `src/services/pdf.js`, `src/db/migrate_v3.js` (add column) | Backend |
| 5.3 | Serve via `GET /api/agreements/:id/pdf` (stream from Cloudinary) | ☐ | `src/routes/agreements.js` | Backend |
| 5.4 | Frontend: "Download PDF" on agreement preview/sign screens | ☐ | `index.html` — `viewAgreementPDF(id)` | Frontend |
| 5.5 | Estate Manager monthly PDF reports (`GET /api/orgs/:id/reports/:month/pdf`) | ☐ | `src/routes/orgs.js`, `src/services/pdf.js` | Backend |
| 5.6 | Payment receipt PDF + email attachment (`payment_confirmed`) | ☐ | `src/services/pdf.js`, `src/services/notifications.js` | Backend |
| 5.7 | Add `pdf_url` column to `agreements` table | ☐ | `src/db/migrate_v3.js` (or v4) | Backend |

**Definition of Done:**
- [ ] Agreement PDF generates with correct data, downloads
- [ ] EM monthly report PDF generates
- [ ] Receipt PDF attached to payment confirmation email

---

### PHASE 6 — Notifications System (1 day)
*Goal: Real-time notification bell, email/SMS reminders*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 6.1 | Notification bell dropdown (topbar) | ☐ | `index.html` — topbar + `loadNotifications()` | Frontend |
| 6.2 | `GET /api/users/notifications` + `PATCH /read` + unread count | ☐ | `src/routes/users.js`, `index.html` | Full-stack |
| 6.3 | Unread count badge + real-time poll (30s) | ☐ | `index.html`, `src/routes/messages.js` | Frontend |
| 6.4 | Email template review & Gmail SMTP setup (Railway env vars) | ☐ | `src/services/notifications.js`, Railway | Backend |
| 6.5 | SMS rent reminders cron (07:00 UTC) + Termii integration | ☐ | `src/services/cron.js`, `src/services/notifications.js` | Backend |
| 6.6 | In-app notification types: rent_due, payment, message, verification, agreement, org_invite | ☐ | `src/services/notifications.js` — `TEMPLATES` | Backend |

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
| 7.3 | Test with real NIN in staging | ☐ | `src/services/verification.js` | QA |
| 7.4 | Error handling: NIN not found, mismatch, timeout, rate limit | ☐ | `src/services/verification.js` | Backend |
| 7.5 | Retry logic for 5xx + audit logging (Winston `security` level) | ☐ | `src/services/verification.js` | Backend |
| 7.6 | Verify mock mode still works when key unset | ☐ | `src/services/verification.js` | QA |

**Definition of Done:**
- [ ] Real NIN/BVN verification works in staging
- [ ] Errors handled gracefully with user-facing messages
- [ ] Audit logs capture all verification attempts

---

### PHASE 8 — Tenant Application Flow (2 days)
*Goal: Structured applications with landlord review*

| Task ID | Task | Status | File References | Owner |
|---------|------|--------|-----------------|-------|
| 8.1 | Create `applications` table (migration v4) | ☐ | `src/db/migrate_v4.js` | Backend |
| 8.2 | `POST /api/applications` on "Apply & Message" | ☐ | `src/routes/applications.js`, `index.html` | Full-stack |
| 8.3 | Landlord applications review screen | ☐ | `index.html` — `renderLandlordScreen('applications')` | Frontend |
| 8.4 | Tenant "My Applications" screen + notifications | ☐ | `index.html` — `renderTenantScreen('applications')` | Frontend |
| 8.5 | Application status: pending → reviewed → accepted/rejected | ☐ | `src/routes/applications.js` | Backend |
| 8.6 | Accepted application → auto-create conversation + agreement draft | ☐ | `src/routes/applications.js` | Backend |

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
| 9.1 | Cloudinary transformations: `f_auto,q_auto,w_800` on upload | ☐ | `src/routes/upload.js`, Cloudinary config | Backend |
| 9.2 | Skeleton loading states (CSS-only) for cards, tables, lists | ☐ | `index.html` — CSS + render functions | Frontend |
| 9.3 | CORS tighten: `origin: [process.env.FRONTEND_URL]` | ☐ | `src/app.js` (Express CORS config) | Backend |
| 9.4 | Error boundary wrapping `render()` — catch + toast + log | ☐ | `index.html` — `render()` function | Frontend |
| 9.5 | SEO: dynamic `<title>`, meta description, Open Graph per screen | ☐ | `index.html` — `<head>` section | Frontend |
| 9.6 | Add `loading="lazy"` to all listing images | ☐ | `index.html` — listing card template | Frontend |
| 9.7 | Console.log cleanup — remove debug statements | ☐ | `index.html`, `src/**/*.js` | Frontend/Backend |
| 9.8 | Add `X-Content-Type-Options: nosniff` via Helmet (verify) | ☐ | `src/app.js` | Backend |
| 9.9 | Rate limit headers exposed to frontend for retry UI | ☐ | `express-rate-limit` + frontend | Full-stack |

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
| 10.2 | Paystack live mode activation — `sk_live_...` in Railway | ☐ | Railway env vars | Owner |
| 10.3 | Custom domain: `propati.ng` → Vercel, `api.propati.ng` → Railway | ☐ | Vercel/Railway config, `FRONTEND_URL`, CORS | Owner |
| 10.4 | SSL certificates (auto via Vercel/Railway) | ☐ | Vercel/Railway | Owner |
| 10.5 | Monitoring: Railway alerts, Sentry (frontend), Supabase monitoring | ☐ | External services | Backend |
| 10.6 | Production data seeding: admin user, 10-20 listings, 5 agents | ☐ | Database scripts | Backend |
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
| New API endpoint | `src/routes/[relevant].js` |
| New DB column/table | `src/db/migrate_v4.js` (create new) |
| New frontend screen | `index.html` — add case to `renderScreen()` |
| New nav item | `index.html` — `NAV_CONFIG` object |
| New action handler | `index.html` — `bindEvents()` switch statement |
| New data load | `index.html` — add to `DATA` object + `loadX()` function |
| Email template | `src/services/notifications.js` — `TEMPLATES` object |
| SMS message | `src/services/notifications.js` — `sendSMS()` calls |
| PDF template | `src/services/pdf.js` |
| Verification logic | `src/services/verification.js` |
| Paystack logic | `src/services/paystack.js` (new) |

---

## 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Paystack webhook fails silently | Medium | High | Idempotency keys, retry logic, dead letter queue |
| Prembly API rate limited | Medium | Medium | Exponential backoff, cache lookups |
| Cloudinary upload fails (large files) | Low | Medium | Chunked upload, max 100MB, progress UI |
| Single-file frontend too large (>500KB) | High | Medium | Phase 9: code splitting, lazy load |
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
| **API 500 Rate** | < 0.1% | Railway logs / Sentry |
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

*This plan is the execution roadmap. Update task status daily. Phase 1 is the unblocker for all others.*