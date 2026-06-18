# PROPATI — Full Project Context for Claude Code
*Generated from full build session history — March 2026*

---

## What is PROPATI?

PROPATI is a Nigerian property platform combining a **marketplace** (buy, sell, rent, share, short-let, commercial listings) with **property management** (rent collection, tenant screening, digital agreements, maintenance). It is a live, deployed product.

---

## Live Deployment

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | https://propati-frontend.vercel.app | `index.html` on Vercel |
| Backend API | https://propati-backend-production.up.railway.app | Node/Express on Railway |
| Health check | https://propati-backend-production.up.railway.app/health | Returns `{"status":"healthy"}` |
| Database | Supabase PostgreSQL | Connected via `DATABASE_URL` env var |
| File storage | Cloudinary | Images/docs uploaded via backend |

---

## Tech Stack

### Frontend
- **Single HTML file** (`index.html` / `propati-v6.html`) — ~420KB, ~7000 lines
- Vanilla JS state machine — `STATE` object, `render()` function, `setState()` updates
- No framework, no build step — just HTML/CSS/JS
- Fonts: Bricolage Grotesque, Outfit, DM Serif Display (Google Fonts)

### Backend (`propati-backend/`)
- Node.js + Express
- PostgreSQL via `pg` (Supabase hosted)
- Multer (memory storage) + Cloudinary v2 for file uploads
- JWT authentication (access 15min + refresh 7 days)
- AES-256-GCM encryption for sensitive fields (NIN, BVN)
- Nodemailer for email, Termii for SMS, Twilio for WhatsApp OTP
- Prembly IdentityPass for NIN/BVN verification

---

## Repository Structure

```
propati-backend/
├── src/
│   ├── index.js                  ← Entry point, all routes mounted, cron jobs
│   ├── routes/
│   │   ├── auth.js               ← signup, login, forgot-password, phone OTP
│   │   ├── listings.js           ← CRUD, image upload, search/filter
│   │   ├── verification.js       ← 5-layer property verification + identity verify
│   │   ├── payments.js           ← Paystack integration, escrow, webhooks
│   │   ├── agreements.js         ← Digital leases, e-signing, PDF preview
│   │   ├── messages.js           ← Real-time messaging (polling), conversations
│   │   ├── users.js              ← Profiles, tenant employment, receipts, admin
│   │   └── orgs.js               ← Estate Manager B2B (organisations, tickets, ledger)
│   ├── services/
│   │   ├── notifications.js      ← Email (Nodemailer), SMS (Termii), in-app
│   │   ├── encryption.js         ← AES-256-GCM field encryption
│   │   ├── identity.js           ← Prembly NIN/BVN/DL/Voter's Card verification
│   │   ├── paystack.js           ← Paystack API wrapper
│   │   └── pdf.js                ← pdfkit lease generation
│   ├── middleware/
│   │   ├── auth.js               ← JWT authenticate, requireRole
│   │   └── upload.js             ← Multer + uploadToCloudinary()
│   └── db/
│       ├── index.js              ← PostgreSQL pool, query(), transaction()
│       ├── migrate.js            ← v1 schema, runs on boot
│       ├── migrate_v2.js         ← conversations, messages, orgs tables
│       ├── migrate_v3.js         ← tenant employment profile columns
│       ├── fix_schema.js         ← one-time column patches
│       └── seed.js               ← Demo accounts + test data
├── package.json
└── .env.example
```

---

## All API Endpoints

### Auth (`/api/auth`)
```
POST /signup              → create account (roles: landlord|tenant|agent|estate_manager)
POST /login               → returns access_token + refresh_token
POST /logout              → invalidates refresh tokens
GET  /me                  → get current user
POST /refresh             → rotate tokens
POST /forgot-password     → sends reset email
POST /reset-password      → sets new password
POST /send-phone-otp      → sends OTP via WhatsApp (Twilio) or SMS (Termii)
POST /verify-phone        → confirms OTP, marks phone_verified=true
```

### Listings (`/api/listings`)
```
GET    /                  → search/filter (type, area, price, bedrooms, q)
GET    /owner/mine        → landlord's own listings
GET    /:id               → single listing with images + verification
POST   /                  → create listing (draft)
PATCH  /:id               → update listing
DELETE /:id               → soft delete
POST   /:id/images        → upload photos (multipart, max 10)
POST   /:id/save          → toggle saved listing
POST   /:id/flag          → report a listing
```

### Verification (`/api/verification`)
```
GET    /:listing_id           → get verification status
POST   /upload-doc            → Layer 1: document upload
POST   /submit-layer1         → submit Layer 1
POST   /identity              → Layer 2: old flow (deprecated)
POST   /inspection            → Layer 4: schedule inspection
POST   /verify-identity       → NEW: Prembly NIN/BVN lookup
POST   /confirm-identity      → NEW: confirm Layer 2 after Prembly check
GET    /admin/queue           → admin: all pending verifications
POST   /admin/review          → admin: approve/reject a layer
```

### Agreements (`/api/agreements`)
```
POST   /                  → create lease agreement
GET    /                  → list user's agreements
GET    /:id               → single agreement
POST   /:id/sign          → e-sign (records timestamp + IP + consent)
GET    /:id/preview       → HTML preview of agreement
PATCH  /:id               → update status
```

### Messages (`/api/messages`)
```
GET    /conversations             → list user's conversations
POST   /conversations             → start or get conversation
GET    /conversations/:id         → conversation + messages
GET    /conversations/:id/messages → poll for new messages (since= param)
POST   /conversations/:id/messages → send message
PATCH  /conversations/:id/read    → mark as read
DELETE /conversations/:id         → archive
GET    /unread-count              → total unread badge count
```

### Users (`/api/users`)
```
GET    /profile                   → get own profile
PATCH  /profile                   → update name, phone, avatar
PATCH  /tenant-profile            → update employment, income, guarantor
GET    /tenant-profile/:userId    → landlord views tenant profile (income band only)
GET    /notifications             → list notifications
POST   /notifications/read-all    → mark all read
GET    /saved-listings            → tenant's saved listings
GET    /agents                    → browse approved agents
GET    /receipts                  → tenant's payment receipts
GET    /admin/all                 → admin: all users
GET    /admin/stats               → admin: platform stats
POST   /admin/:userId/suspend     → admin: ban user
POST   /admin/:userId/approve-agent → admin: approve agent
```

### Payments (`/api/payments`)
```
POST   /initiate              → start Paystack payment
POST   /webhook               → Paystack webhook (raw body)
GET    /transactions          → user's transaction history
GET    /transactions/:id      → single transaction
POST   /release-escrow/:id    → admin: release escrow
```

### Organisations/Estate Manager (`/api/orgs`)
```
POST   /                          → create organisation
GET    /mine                      → get current user's org
PATCH  /:id                       → update org details
GET    /:id/portfolio             → all properties under org
GET    /:id/team                  → org members
POST   /:id/invite                → invite team member
DELETE /:id/members/:uid          → remove member
GET    /:id/tickets               → maintenance tickets (filter: status, priority)
POST   /:id/tickets               → create ticket
PATCH  /:id/tickets/:tid          → update ticket status
GET    /:id/ledger                → rent ledger across all org properties
GET    /:id/subscription          → subscription info
POST   /:id/subscribe             → initiate Paystack subscription
POST   /:id/bulk-upload           → CSV property import
GET    /:id/reports/:month        → monthly report (YYYY-MM)
GET    /bulk-template.csv         → CSV template download
```

---

## Database Schema

### Core Tables (migrate.js — v1)
```sql
users             -- id, email, phone, password, role, full_name, avatar_url,
                  -- nin_encrypted, nin_hash, nin_verified, id_verified,
                  -- employment_status, employment_type, employer_name, job_title,
                  -- yearly_income, income_verified, profile_bio, profile_completed,
                  -- guarantor_name, guarantor_phone, guarantor_relationship,
                  -- phone_verified, is_active, is_banned, agent_tier, agent_approved,
                  -- agent_bio, agent_areas

refresh_tokens    -- id, user_id, token_hash, expires_at
password_resets   -- id, user_id, token_hash, expires_at
phone_otps        -- id, user_id, otp_hash, expires_at

listings          -- id, owner_id, agent_id, title, listing_type, property_type,
                  -- address, area, state, price, price_period, caution_deposit,
                  -- bedrooms, bathrooms, size_sqm, furnished, amenities,
                  -- status, verification_tier, is_featured, views_count

listing_images    -- id, listing_id, url, public_id, is_cover, sort_order
saved_listings    -- id, user_id, listing_id
listing_flags     -- id, listing_id, flagged_by, type, description, status

verifications     -- id, listing_id, owner_id, l1_status..l5_status,
                  -- current_layer, overall_status, l1_doc_url, l2_id_type

transactions      -- id, reference, listing_id, payer_id, payee_id, agent_id,
                  -- type, status, amount, platform_fee, agent_commission, payee_amount

agreements        -- id, listing_id, landlord_id, tenant_id, agent_id,
                  -- type, status, start_date, end_date, rent_amount, rent_period,
                  -- caution_deposit, landlord_signed_at, tenant_signed_at, special_clauses

agreement_signatures -- id, agreement_id, signer_id, role, ip_address, signed_at, checksum
rent_schedule     -- id, agreement_id, due_date, amount, status, paid_at, reminder_sent
disputes          -- id, listing_id, raised_by, type, status, description
notifications     -- id, user_id, type, title, body, data, read
screening_calls   -- id, listing_id, landlord_id, tenant_id, scheduled_at, status
```

### V2 Tables (migrate_v2.js)
```sql
conversations     -- id, listing_id, landlord_id, tenant_id, subject,
                  -- last_message, last_message_at, unread_tenant, unread_landlord,
                  -- status (active|archived|blocked)

messages          -- id, conversation_id, sender_id, content, attachment_url,
                  -- attachment_type, is_read, read_at

organisations     -- id, name, owner_id, billing_email, address, cac_number,
                  -- plan_tier, max_units, max_seats, paystack_customer_id

org_members       -- id, org_id, user_id, email, role, status, invite_token, joined_at
org_listings      -- id, org_id, listing_id

maintenance_tickets -- id, org_id, listing_id, tenant_id, raised_by, title,
                    -- description, category, priority, status, assigned_to,
                    -- resolution_note, resolved_at, closed_at

org_subscriptions -- id, org_id, plan, status, amount,
                  -- current_period_start, current_period_end, next_billing_date

email_log         -- id, to, subject, status, created_at
```

---

## Frontend Architecture

### State Machine
```javascript
const STATE = {
  view: 'landing',           // landing | login | dashboard
  role: null,                // landlord | tenant | agent | admin | estate_manager
  page: 'home',              // current nav page
  purpose: null,             // tenant: rent | buy | shortlet | share
  authMode: 'login',         // login | signup | forgot
  authStep: 1,
  authError: '',
  forgotSuccess: '',
  loginForm: { email:'', password:'', role:'landlord' },
  signupForm: { full_name:'', email:'', phone:'', password:'', confirmPassword:'', role:'landlord' },
  toastMsg: '', toastVisible: false,
  showModal: false,
  // Verification
  verifyStep: 1, verifyListingId: null,
  // Landing
  landingType: 'all', landingSort: 'newest', landingQuery: '',
  // Admin
  adminPage: 'overview',
  // Estate Manager
  emPage: 'home', emOrgSetupStep: 1,
  emOrgForm: { name:'', billing_email:'', address:'', cac_number:'' },
}
```

### Data Cache
```javascript
const DATA = {
  listings: null,
  myListings: null,
  transactions: null,
  agreements: null,
  conversations: null,
  convMessages: null,
  activeConv: null,
  receipts: null,
  tenantProfile: null,
  adminVerifQueue: null,
  // Estate Manager
  emOrg: null,        // false = checked, no org exists; null = not yet checked
  emPortfolio: null,
  emTickets: null,
  emTeam: null,
  emLedger: null,
  emSubscription: null,
  loading: {}
}
```

### Key Functions
```javascript
// Auth
doLogin()              // POST /auth/login
doSignup()             // POST /auth/signup
doForgotPassword()     // POST /auth/forgot-password
logout()               // POST /auth/logout
checkSession()         // GET /auth/me — restores session on page load
enterDashboard(user)   // transitions to correct dashboard

// Navigation
navigate(page)         // changes STATE.page, triggers data loads
setState(updates)      // merges updates into STATE, calls render()
render()               // main render function, routes to correct view

// Listings
loadListings()         // GET /listings
loadMyListings()       // GET /listings/owner/mine
submitListing()        // POST /listings then POST /listings/:id/images

// Messaging
loadConversations()    // GET /messages/conversations
startMsgPolling(id)    // polls GET /messages/conversations/:id/messages every 4s
sendMessage(convId)    // POST /messages/conversations/:id/messages

// Identity Verification
verifyIdentity()       // POST /verification/verify-identity (Prembly)
confirmIdentity(type)  // POST /verification/confirm-identity
verifyUserIdentity()   // same but for user profile (not property)

// Agreements
loadAgreements()       // GET /agreements
signAgreement(id)      // POST /agreements/:id/sign
viewAgreementPDF(id)   // opens GET /agreements/:id/preview in new tab

// Tenant Profile
loadTenantProfile()    // GET /users/profile
saveTenantProfile()    // PATCH /users/tenant-profile
loadReceipts()         // GET /users/receipts
viewTenantProfile(uid) // GET /users/tenant-profile/:userId (landlord view)

// Estate Manager
loadEmOrg()            // GET /orgs/mine
loadEmPortfolio()      // GET /orgs/:id/portfolio
loadEmTickets()        // GET /orgs/:id/tickets
renderAdminVerifQueue()// uses DATA.adminVerifQueue
adminReviewLayer(...)  // POST /verification/admin/review
```

### Auth Helpers
```javascript
Auth.save(access, refresh, user)  // persists to localStorage
Auth.clear()                       // removes all auth data
Auth.getAccess()                   // JWT access token
Auth.getRefresh()                  // JWT refresh token
Auth.getUser()                     // parsed user object
Auth.getSavedRole()                // last used role (for session restore)
Auth.isLoggedIn()                  // boolean
```

---

## Design System

| Role | Background | Accent | Theme Class |
|------|-----------|--------|------------|
| Landing | `#f5f3ee` warm sand | `#c9952a` gold | — |
| Landlord | `#0f0f0f` dark | `#d4622a` rust | `theme-landlord` |
| Tenant | `#f7f5f0` light | `#0e7c6a` teal | `theme-tenant` |
| Agent | `#0d1b2e` navy | `#c9952a` gold | `theme-agent` |
| Admin | `#0c0e12` charcoal | `#00d4c8` cyan | `theme-admin` |
| Estate Manager | `#0B1220` deep navy | `#6EA8FE` blue | `.em-*` classes |

CSS Variables:
```css
--l-bg, --l-surface, --l-surface2, --l-border, --l-text, --l-muted, --l-accent, --l-accent2
--t-bg, --t-surface, --t-border, --t-text, --t-muted, --t-accent, --t-accent2
--a-bg, --a-surface, --a-border, --a-text, --a-muted, --a-accent, --a-accent2
```

---

## Environment Variables (Railway)

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres.xxx:[password]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
JWT_SECRET=[64-char hex]
JWT_REFRESH_SECRET=[different 64-char hex]
ENCRYPTION_KEY=[64-char hex — 32 bytes]
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PAYSTACK_SECRET_KEY=sk_live_...
FRONTEND_URL=https://propati-frontend.vercel.app

# Optional — activates real services
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
TERMII_API_KEY=...                    # Nigerian SMS gateway
TERMII_SENDER_ID=PROPATI
TWILIO_ACCOUNT_SID=AC...             # WhatsApp OTP
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=+14155238886
PREMBLY_API_KEY=...                  # NIN/BVN verification
PREMBLY_APP_ID=...
```

---

## Demo Accounts (after `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@propati.ng | Admin1234! |
| Landlord | chidi@propati.ng | Chidi1234! |
| Tenant | adaeze@propati.ng | Adaeze1234! |
| Agent | akin@propati.ng | Akin1234! |
| Estate Manager | taiwo@propati.ng | Taiwo1234! |

Estate Manager org: **Cityscape Properties Ltd** — Growth plan, 3 demo properties in Ikeja GRA

---

## B2B Pricing (Estate Manager)

| Plan | Price | Units | Seats |
|------|-------|-------|-------|
| Starter | ₦25,000/mo | 20 | 1 |
| Growth | ₦60,000/mo | 100 | 5 |
| Enterprise | ₦150,000/mo | Unlimited | Unlimited |

---

## Known Issues / What's Pending

### Working ✅
- Full auth (signup/login/logout/refresh/forgot password)
- Real listing creation + Cloudinary photo upload
- Marketplace search/filter
- 5-layer property verification (admin queue live)
- Personal identity verification (Prembly, mock mode without API key)
- Real-time messaging (polling every 4s)
- Digital agreements with e-signature
- Tenant employment profile + landlord view
- Payment receipts
- Estate Manager B2B (9 screens, all API calls)
- WhatsApp/SMS OTP on signup
- Email notifications (welcome, reset password, agreement)
- Session persistence across browser refresh
- Mobile responsive layout

### Pending / To Build
- **Paystack rent collection** — tenant payments screen has UI but Pay button not wired
- **PDF report generation** — EM reports return JSON, need pdfkit rendering
- **NIN verification production** — works in mock mode, needs `PREMBLY_API_KEY`
- **Email activation** — needs `GMAIL_APP_PASSWORD` in Railway vars
- **Agent listings screen** — real data not loaded
- **Admin console** — stats are real, activity feed is mock data
- **Escrow release flow** — `POST /api/payments/release-escrow/:id` exists but not in UI
- **Tenant application flow** — "Apply & Message" works but no formal application record
- **Notifications bell** — shows dot but doesn't load real notifications dropdown

---

## How to Continue Development

### Start Claude Code in the backend:
```bash
cd propati-backend
claude
```

### Start Claude Code for the frontend:
```bash
cd propati-frontend
claude
```

### Common tasks:
```bash
# Deploy after changes
git add -A && git commit -m "description" && git push

# Run migrations after schema changes
railway run node src/db/migrate_v3.js

# Reseed database
railway run npm run seed

# Check backend is healthy
curl https://propati-backend-production.up.railway.app/health
```

---

## Key Architectural Decisions

1. **Single HTML file frontend** — no build step, no npm, instant deploy to Vercel. Trade-off: file gets large (~420KB) but loads fast and is easy to reason about.

2. **Polling instead of WebSockets for messages** — polls every 4s. Simple, works everywhere, no infra needed. Upgrade to Socket.io when you have real users.

3. **AES-256-GCM for NIN/BVN** — stored encrypted with random IV + auth tag. HMAC hash stored separately for deduplication lookups. Exact salary never exposed to landlords — income band only.

4. **`estate_manager` is a separate role** — not a landlord with extra features. Has its own dashboard, org structure, billing, and team management.

5. **Prembly IdentityPass for KYC** — Nigerian-focused, supports NIN, BVN, Driver's License, Voter's Card. Runs in mock mode when `PREMBLY_API_KEY` is not set — returns fake verified data so development works without real credentials.

6. **Two types of verification** — *Property verification* (5-layer: docs → identity → live proof → inspection → certified) is for listings. *Personal identity verification* (NIN/BVN via Prembly) is for user accounts. They are independent.
