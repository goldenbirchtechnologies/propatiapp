# PROPATI Tech Stack & Implementation Analysis

Extracted from `oldpropati/TECH_STACK.md` and `oldpropati/IMPLEMENTATION_PLAN.md`

---

## 1. Deployment Topology

| Layer | Service | Region/Config | Purpose |
|-------|---------|---------------|---------|
| **Frontend Hosting** | Vercel | Auto-deploys from GitHub `propati-frontend` | Static HTML (single `index.html` ~420KB) |
| **Backend Hosting** | Railway | Node.js 22.x, auto-deploys from GitHub `propati-backend` | Express API server |
| **Database** | Supabase | UK region (West Europe), PostgreSQL 15.x | Primary data store, connection pooler at port 5432 |
| **File/CDN Storage** | Cloudinary | Folders: `propati/images`, `propati/documents` | Image & document uploads via `upload_stream` |
| **Source Control** | GitHub | Two repos: `propati-backend` + `propati-frontend` | CI/CD triggers on push |

**Live URLs (as of March 2026):**
- Frontend: `https://propati-frontend.vercel.app`
- Backend API: `https://propati-backend-production.up.railway.app`

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | — | Single file app (`index.html`) |
| Vanilla JavaScript | ES2022 | State machine, DOM rendering, API calls |
| CSS3 | — | Custom properties, Grid, Flexbox |
| Google Fonts | — | Bricolage Grotesque, Outfit, DM Serif Display, DM Mono |

**Architecture Pattern:**
```
STATE (global object) →
setState(updates) →
render() →
  switch(STATE.view):
    'landing' → renderLanding()
    'login'   → renderLogin()
    'dashboard' → switch(STATE.role):
      'landlord'        → renderDashboard() → renderLandlordScreen(page)
      'tenant'          → renderDashboard() → renderTenantScreen(page)
      'agent'           → renderDashboard() → renderAgentScreen(page)
      'admin'           → renderAdmin() → renderAdminScreen(pg)
      'estate_manager'  → renderEstateManager() → renderEstateManagerScreen(page)
→ bindEvents() (data-action delegated event handling)
```

**Key Characteristics:**
- No framework, no build step, no npm
- Entire frontend in one HTML file (~7000 lines)
- Renders by setting `innerHTML` on `#app` via central `render()`
- All state lives in a `STATE` object

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x (Railway default) | Runtime |
| Express | 4.18.2 | HTTP framework |
| pg | 8.11.3 | PostgreSQL client |
| pg-pool | 3.6.1 | Connection pooling (max 20 connections) |
| bcryptjs | 2.4.3 | Password hashing (cost 12) + OTP hashing (cost 8) |
| jsonwebtoken | 9.0.2 | JWT access (15min) + refresh (7d) tokens |
| multer | 1.4.5-lts.2 | Multipart form parsing (memory storage) |
| cloudinary | 2.0.1 | Image/document storage via upload_stream |
| nodemailer | 6.9.9 | Email sending (Gmail SMTP or custom SMTP) |
| axios | 1.6.7 | HTTP client for Termii SMS + Prembly API |
| uuid | 9.0.0 | ID generation (all IDs prefixed: `usr_`, `lst_`, `cnv_`, etc.) |
| express-validator | 7.0.1 | Request validation |
| helmet | 7.1.0 | Security headers (CSP, HSTS, noSniff, frameguard) |
| cors | 2.8.5 | Cross-origin (`origin: true` in production) |
| express-rate-limit | 7.2.0 | Global: 300/15min, Auth: 10/15min |
| express-slow-down | 1.6.0 | Progressive delay after 50 req/15min |
| express-mongo-sanitize | 2.2.0 | Strip `$` from inputs |
| hpp | 0.2.3 | HTTP Parameter Pollution protection |
| compression | 1.7.4 | Gzip responses |
| morgan | 1.10.0 | HTTP request logging to Winston |
| winston | 3.11.0 | Structured logging |
| winston-daily-rotate-file | 4.7.1 | Log rotation |
| pdfkit | 0.14.0 | PDF generation (lease agreements) |
| csv-parse | 5.5.5 | Estate manager bulk upload |
| node-cron | 3.0.3 | Daily rent reminders (07:00 UTC) |
| dotenv | 16.4.1 | Environment variable loading |

### Database
| Technology | Version | Notes |
|------------|---------|-------|
| PostgreSQL | 15.x | Hosted on Supabase |
| Supabase | — | Cloud PostgreSQL, connection pooler at port 5432 |

**Connection:** `DATABASE_URL` (pooler URL format: `aws-0-eu-west-2.pooler.supabase.com`)  
**Query Pattern:** Parameterised `$1, $2` placeholders (NOT SQLite `?`)

---

## 3. Third-Party Integrations

| Service | SDK/Method | Purpose | Mock Mode |
|---------|-----------|---------|-----------|
| **Paystack** | Direct HTTP (axios) | Payments, subscriptions | Yes — no webhook |
| **Prembly IdentityPass** | Direct HTTP (axios) | NIN, BVN, DL, Voter's Card | Yes — `PREMBLY_API_KEY=mock` or unset |
| **Termii** | Direct HTTP (axios) | Nigerian SMS (OTP, alerts) | Yes — logs to console |
| **Twilio** | Direct HTTP (axios) | WhatsApp OTP | Yes — logs to console |
| **Nodemailer** | npm package | Email (Gmail SMTP) | Yes — logs to console |

**Graceful Degradation:** All third-party services fail gracefully — if credentials not set, they log to console and return `{success: true, mock: true}`.

---

## 4. Environment Variables

```bash
# Required
NODE_ENV=production
DATABASE_URL=postgresql://postgres.xxx:***@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
JWT_SECRET=                    # 64-char hex (32 bytes)
JWT_REFRESH_SECRET=            # 64-char hex, different from JWT_SECRET
ENCRYPTION_KEY=                # 64-char hex (32 bytes for AES-256)
FRONTEND_URL=https://propati-frontend.vercel.app

# Storage
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=propati      # optional, defaults to 'propati'

# Payments
PAYSTACK_SECRET_KEY=sk_live_... # or sk_test_ for development

# Email (one of these)
GMAIL_USER=hello@propati.ng
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
# OR
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# SMS (Nigerian gateway)
TERMII_API_KEY=
TERMII_SENDER_ID=PROPATI

# WhatsApp OTP
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=+141****8886  # Twilio sandbox number

# Identity verification
PREMBLY_API_KEY=               # Get from identitypass.prembly.com
PREMBLY_APP_ID=

# Optional tuning
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=10
MAX_FILE_SIZE_MB=10
MAX_VIDEO_SIZE_MB=100
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 5. Security Configuration

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt, cost factor 12 |
| JWT access | HS256, 15-minute expiry |
| JWT refresh | HS256, 7-day expiry, stored in DB with bcrypt hash |
| NIN/BVN storage | AES-256-GCM, random IV per value, auth tag verification |
| NIN lookup | HMAC-SHA256 hash (separate from encrypted value) |
| Transport | HTTPS/TLS 1.3, HSTS with preload in production |
| Rate limiting | 300 req/15min global, 10 failed auth attempts/15min |
| Input sanitisation | express-mongo-sanitize (strips $), hpp (prevents array injection) |
| CORS | `origin: true` (open) — tighten before launch |
| Webhook verification | Paystack: HMAC-SHA512 of raw body |
| SQL injection | Parameterised queries only — no string concatenation |
| Helmet | CSP, noSniff, frameguard: deny, crossOriginResourcePolicy: cross-origin |

---

## 6. ID Format Conventions

All IDs are prefixed strings:
```
usr_  → users
lst_  → listings
cnv_  → conversations
msg_  → messages
agr_  → agreements
txn_  → transactions
org_  → organisations
tkt_  → maintenance tickets
```
Generated: `'prefix_' + uuidv4().replace(/-/g,'').slice(0,12)`

---

## 7. Logging

- **Winston** logger with levels: `error`, `warn`, `info`, `debug`, `security`, `auth`
- **Production log files:**
  - `logs/error.log` — errors only
  - `logs/combined.log` — all levels
  - Daily rotation, 14-day retention
- **Railway:** logs stream to dashboard automatically via stdout

---

## 8. Phased Implementation Plan (10 Phases)

### Phase 1 — Critical Bugs & Stability (1–2 days)
| Task | Status | File References |
|------|--------|-----------------|
| Fix remaining 404s (`GET /api/listings/my` → `/owner/mine`) | ☐ | `src/routes/listings.js` |
| Verify all nav items load without console errors | ☐ | `index.html` |
| Test each role dashboard | ☐ | `index.html` — `renderLandlordScreen`, `renderTenantScreen`, etc. |
| Fix `loadEmOrg()` infinite loop | ☐ | `index.html` — `loadEmOrg()` |
| Add `loading` guard to all load functions | ☐ | `index.html` — all `load*()` functions |
| Console error audit | ☐ | `index.html`, `src/**/*.js` |
| Fix `role is not defined` in renderLandlordScreen | ☐ | `index.html` — `renderLandlordScreen()` |
| Mobile audit (iPhone Safari, Android Chrome) | ☐ | `index.html` |

---

### Phase 2 — Paystack Rent Collection (2–3 days)
| Task | Status | File References |
|------|--------|-----------------|
| Backend: `POST /api/payments/initiate` wire frontend | ☐ | `src/routes/payments.js`, `index.html` |
| Frontend: Pay Rent button opens Paystack URL | ☐ | `index.html` — `renderTenantScreen('payments')` |
| Backend: Paystack webhook `POST /api/payments/webhook` | ☐ | `src/routes/payments.js` |
| Handle `charge.success` → update transaction to `in_escrow` | ☐ | `src/routes/payments.js`, `src/db/migrate_v3.js` |
| Escrow release: Admin UI + Paystack Transfer API | ☐ | `src/routes/payments.js`, `index.html` — admin screen |
| Receipt generation & email | ☐ | `src/services/notifications.js` — `payment_confirmed` template |

---

### Phase 3 — Agent Listings Screen (1 day)
| Task | Status | File References |
|------|--------|-----------------|
| `GET /api/listings?agent_id=:uid` filter | ☐ | `src/routes/listings.js` |
| Agent dashboard Managed Listings screen | ☐ | `index.html` — `renderAgentScreen('listings')` |
| Agent deal pipeline (enquiry → viewing → offer → agreement → completed) | ☐ | `src/routes/agreements.js`, `index.html` |
| `GET /api/agreements?agent_id=:uid` filter | ☐ | `src/routes/agreements.js` |

---

### Phase 4 — Admin Console Real Data (2 days)
| Task | Status | File References |
|------|--------|-----------------|
| Wire `GET /api/users/admin/stats` to Overview screen | ☐ | `src/routes/users.js`, `index.html` — `renderAdminScreen('overview')` |
| Create admin activity feed endpoint | ☐ | `src/routes/notifications.js` or new |
| Admin Users screen: `GET /api/users/admin/all` | ☐ | `src/routes/users.js`, `index.html` — `renderAdminScreen('users')` |
| Suspend/unsuspend: `POST /api/users/admin/:id/suspend` | ☐ | `src/routes/users.js` |
| Approve agent: `POST /api/users/admin/:id/approve-agent` | ☐ | `src/routes/users.js` |
| Disputes UI with ruling & mediation | ☐ | `src/routes/disputes.js`, `index.html` |

---

### Phase 5 — PDF Reports & Agreements (2 days)
| Task | Status | File References |
|------|--------|-----------------|
| Lease PDF generation (`src/services/pdf.js`) | ☐ | `src/services/pdf.js`, `src/routes/agreements.js` |
| Upload PDF to Cloudinary, store in `agreements.pdf_url` | ☐ | `src/services/pdf.js`, `src/db/migrate_v3.js` (add column) |
| Serve via `GET /api/agreements/:id/pdf` | ☐ | `src/routes/agreements.js` |
| Estate Manager monthly PDF reports | ☐ | `src/routes/orgs.js`, `src/services/pdf.js` |
| Payment receipt PDF + email attachment | ☐ | `src/services/pdf.js`, `src/services/notifications.js` |

---

### Phase 6 — Notifications System (1 day)
| Task | Status | File References |
|------|--------|-----------------|
| Notification bell dropdown | ☐ | `index.html` — topbar + `loadNotifications()` |
| `GET /api/users/notifications` + mark read | ☐ | `src/routes/users.js`, `index.html` |
| Unread count badge + real-time poll (30s) | ☐ | `index.html`, `src/routes/messages.js` |
| Email template review & Gmail SMTP setup | ☐ | `src/services/notifications.js`, Railway env vars |
| SMS rent reminders cron (07:00 UTC) + Termii | ☐ | `src/services/cron.js`, `src/services/notifications.js` |

---

### Phase 7 — Prembly NIN Verification Production (0.5 days)
| Task | Status | File References |
|------|--------|-----------------|
| Sign up, get credentials, set in Railway | ☐ | Railway env vars |
| Test with real NIN in staging | ☐ | `src/services/verification.js` |
| Error handling: NIN not found, mismatch, timeout | ☐ | `src/services/verification.js` |
| Retry logic for 5xx + audit logging | ☐ | `src/services/verification.js` |

---

### Phase 8 — Tenant Application Flow (2 days)
| Task | Status | File References |
|------|--------|-----------------|
| Create `applications` table | ☐ | `src/db/migrate_v4.js` (new migration) |
| `POST /api/applications` on "Apply & Message" | ☐ | `src/routes/applications.js`, `index.html` |
| Landlord applications review screen | ☐ | `index.html` — `renderLandlordScreen('applications')` |
| Tenant My Applications screen + notifications | ☐ | `index.html` — `renderTenantScreen('applications')` |

---

### Phase 9 — Performance & Polish (2 days)
| Task | Status | File References |
|------|--------|-----------------|
| Cloudinary transformations (auto quality/format) | ☐ | `src/routes/upload.js`, Cloudinary config |
| Skeleton loading states (CSS) | ☐ | `index.html` — CSS + render functions |
| CORS tighten to `[process.env.FRONTEND_URL]` | ☐ | `src/app.js` (Express CORS config) |
| Error boundary wrapping `render()` | ☐ | `index.html` — `render()` function |
| SEO: title, meta description, Open Graph | ☐ | `index.html` — `<head>` section |

---

### Phase 10 — Launch Preparation (2–3 days)
| Task | Status | File References |
|------|--------|-----------------|
| CAC Registration (PROPATI Technologies Ltd) | ☐ | Legal/offline |
| Paystack live mode activation | ☐ | Railway: `PAYSTACK_SECRET_KEY=sk_live_...` |
| Custom domain: `propati.ng` → Vercel, `api.propati.ng` → Railway | ☐ | Vercel/Railway config, `FRONTEND_URL`, CORS |
| Monitoring: Railway alerts, Sentry, Supabase monitoring | ☐ | External services |
| Production data seeding (admin, 10-20 listings, agents) | ☐ | Database scripts |

---

## 9. File Change Reference Map

When building new features, these are the files most likely to be touched:

| Change Type | Files |
|-------------|-------|
| New API endpoint | `src/routes/[relevant].js` |
| New DB column | `src/db/migrate_v3.js` (or create v4) |
| New frontend screen | `index.html` — add case to `renderScreen()` |
| New nav item | `index.html` — `NAV_CONFIG` object |
| New action handler | `index.html` — `bindEvents()` switch statement |
| New data load | `index.html` — add to `DATA` object + `loadX()` function |
| Email template | `src/services/notifications.js` — `TEMPLATES` object |
| SMS message | `src/services/notifications.js` — `sendSMS()` calls |

---

## 10. Pending Features (Post-Launch)

| Feature | Effort | Priority |
|---------|--------|----------|
| Paystack escrow auto-release | 1 day | High |
| Agent commission auto-payout | 2 days | High |
| Tenant-to-tenant referral | 1 day | Medium |
| Landlord bulk rent collection | 2 days | Medium |
| EM white-label (Enterprise) | 3 days | Low |
| WebSockets for messaging | 2 days | Low |
| Property valuation tool | 3 days | Low |
| Mortgage calculator (real) | 2 days | Low |
| iOS/Android app (React Native) | 8 weeks | Future |

---

## Summary

**Total Estimated Launch Timeline:** ~14–18 days across 10 phases

**Critical Path:** Phase 1 (stability) → Phase 2 (payments/revenue) → Phase 10 (launch prep)

**Key Technical Decisions:**
- Single-file vanilla JS frontend — simple but limits team scaling
- All third-party services have mock modes for offline development
- Parameterised queries only — strong SQL injection protection
- AES-256-GCM for sensitive PII (NIN/BVN) — compliant with Nigerian data protection
- Railway + Vercel + Supabase — fully managed, zero DevOps overhead
- ID prefixing convention enables debugging and log correlation