# PROPATI — Product Requirements Document (Enterprise Production)

**Version:** 2.0
**Status:** Production-Ready Specification
**Location:** `/mnt/c/Users/USER/Documents/NEWPROPATI/PRD.md`

---

## 1. Executive Summary

### 1.1 Product Vision
PROPATI is Nigeria's first **verified property platform** combining a consumer marketplace (rent, buy, short-let, share, commercial) with property management infrastructure (rent collection, tenant screening, digital agreements, maintenance tracking) and a B2B SaaS layer for estate management companies.

### Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer

### 1.2 Core Differentiator
**5-Layer Trust Verification System** — solves Nigeria's #1 property problem: fraud and misrepresentation.
- Layer 1: Document verification (C of O, Deed, Survey, Governor's Consent)
- Layer 2: Identity match via Prembly (NIN/BVN/DL/PVC)
- Layer 3: Live video proof with unique QR code
- Layer 4: Physical agent inspection
- Layer 5: Admin certification → **Certified** badge

### 1.3 Target Market
- **Primary:** Lagos, Abuja, Port Harcourt, Ibadan, Kano (major Nigerian metros)
- **Users:** Landlords, tenants/buyers, agents, estate management companies
- **Scale Target (6 months):** 10,000 MAU, 40% listings Certified, 25 B2B clients (₦1.6M MRR)

---

## 2. User Roles & Permissions

| Role | Capabilities | Access Level |
|------|--------------|--------------|
| **Landlord** | List properties, screen tenants, collect rent, manage agreements, verify properties | Own data + tenant applications |
| **Tenant/Buyer** | Search listings, apply, pay rent, manage tenancy, maintenance requests | Own profile + conversations |
| **Agent** | Manage landlord listings, deal pipeline, earn commissions, schedule inspections | Assigned listings + clients |
| **Admin** | Verification queue, dispute resolution, user management, platform analytics | Full platform access |
| **Estate Manager** | B2B SaaS — org setup, portfolio mgmt, rent ledger, maintenance, team, billing, reports | Org-scoped data |

---

## 3. Features IN SCOPE (Production-Ready)

### 3.1 Marketplace
- Property listings: **rent, sale, short-let, room share, commercial**
- Search filters: location (ILIKE), price range, bedrooms, property type, verification tier
- Listing cards: cover photo, price, specs, trust badge (Basic/Verified/Inspected/Certified)
- Save/favourite listings (toggle)
- Flag fraudulent listings (auto-suspend at 10+ open flags)
- Sort: newest, price asc/desc, most verified

### 3.2 Authentication & Security
- Email + password signup (min 8 chars, 1 uppercase, 1 number)
- Role selected at signup: landlord \| tenant \| agent \| estate_manager
- **JWT access tokens (15 min)** + **refresh tokens (7 days, bcrypt-hashed in DB)**
- Silent token refresh on 401 (automatic retry)
- Session persistence: role/purpose in localStorage, restored on refresh
- Forgot password: email link with 1-hour bcrypt-hashed token
- Phone verification: 6-digit OTP via WhatsApp (Twilio) with Termii SMS fallback
- Rate limiting: 300 req/15min global, 10 failed auth/15min
- Helmet: CSP, HSTS, noSniff, frameguard, crossOriginResourcePolicy

### 3.3 Identity Verification (Personal — All Roles)
- **Provider:** Prembly IdentityPass API
- **Supported:** NIN, BVN, Driver's License, Voter's Card (PVC)
- **Flow:** enter number → API returns name/DOB/gender/photo → user confirms → account marked verified
- **Storage:** encrypted with AES-256-GCM, never in plaintext
- **HMAC hash** stored for deduplication lookups
- **Mock mode:** returns fake data when `PREMBLY_API_KEY` not set

### 3.4 Property Verification (5 Layers — Landlords Only)
- **Layer 1:** Document upload (C of O, Deed of Assignment, Survey Plan, Governor's Consent)
- **Layer 2:** Identity match via Prembly (NIN/BVN)
- **Layer 3:** Live video proof (landlord records video inside property with unique QR code)
- **Layer 4:** Physical agent inspection (PROPATI agent visits on-site)
- **Layer 5:** Admin final review → **Certified** badge
- Admin queue: live list of pending verifications with approve/reject per layer

### 3.5 Tenant Profile (Rich Screening Data)
- Fields: employment_status, employment_type, employer_name, job_title, yearly_income, profile_bio, guarantor_name, guarantor_phone, guarantor_relationship
- **Verification score:** 0–4 (NIN verified + ID verified + income verified + profile completed)
- **Income privacy:** exact figure stored encrypted, landlords only see band (e.g. ₦3M–₦6M/yr)
- Profile completion banner on home screen if incomplete

### 3.6 Landlord Dashboard
- Portfolio KPI overview
- Add listing: form + multi-photo upload (Cloudinary, max 10)
- Rent collection: per-tenant tracking (paid/due/overdue)
- Tenant screening calls
- Agreements management
- Property verification wizard (5 steps)
- Real-time messaging (4s polling)

### 3.7 Tenant Dashboard
- **Purpose switcher:** Rent / Buy / Short-let / Share (changes nav + context)
- Property search and apply (starts conversation with landlord)
- Agreements: view, e-sign, download PDF
- Rent & Payments history
- Maintenance requests
- Receipts (transaction history)
- Profile: employment, identity verification, phone OTP
- Screening calls

### 3.8 Agent Dashboard
- Managed listings
- Deal pipeline (Enquiry → Viewing → Offer → Agreement → Completed)
- Commissions tracker
- Client management
- Inspection calendar
- Reputation score

### 3.9 Admin Console
- Verification queue (real data from DB)
- Flagged listings review
- Dispute resolution
- User management: suspend/ban, approve agents
- Platform stats: users by role, listing counts, GMV, revenue

### 3.10 Estate Manager B2B (Multi-tenant SaaS)
- **Org setup wizard:** name + billing email + address + CAC number
- **Plan selection:** Starter/Growth/Enterprise via Paystack subscription
- **9 screens:** home, portfolio, rent ledger, maintenance, bulk-upload, agreements, team, billing, reports
- **Maintenance ticket system:** create, assign, filter by status/priority
- **Bulk CSV import** (validates columns, checks unit limits)
- **Team:** invite by email, roles (manager/accountant/maintenance/owner_view), seat limits per plan
- **Monthly reports:** JSON data (PDF rendering pending)

### 3.11 Digital Agreements
- Created by landlord with listing + tenant + financial terms
- HTML preview at `GET /api/agreements/:id/preview`
- **E-signature:** records signer_id, timestamp, IP, user-agent, consent_text, SHA256 checksum
- **Status machine:** draft → pending_landlord → pending_tenant → tenant_signed/landlord_signed → fully_signed
- Both parties get email notification when agreement is ready

### 3.12 Messaging
- Conversation per listing pair (landlord + tenant + listing)
- **Idempotent conversation creation** (prevents duplicates)
- **Polling every 4 seconds** for new messages
- Unread counts tracked per party (unread_tenant, unread_landlord columns)
- SMS notification on first unread message (not spamming)

### 3.13 Payments (Paystack)
- Paystack inline checkout
- **Escrow hold** until move-in confirmed
- **Platform fee:** 10% rent, 2% sale (>₦20M) or 1% (≤₦20M)
- **Agent commission:** 10% of platform fee (rent), 1.5% (sale)
- Webhook signature verification (raw body middleware)
- Transaction history with receipts

### 3.14 Notifications
- **In-app:** stored in notifications table, badge count
- **Email templates:** welcome, rent_due, payment_confirmed, agreement_ready, verification_update, new_message, org_invite, password_reset
- **SMS:** OTP, rent reminders (7/3/1 day before due), urgent maintenance
- **Daily cron:** rent reminders at 08:00 WAT (07:00 UTC)

---

## 4. Revenue Model

| Stream | Rate |
|--------|------|
| Platform fee — rent | 10% first payment |
| Platform fee — sale >₦20M | 2% |
| Platform fee — sale ≤₦20M | 1% |
| Agent commission — rent | 10% of platform fee |
| Agent commission — sale | 1.5% of platform fee |
| EM Starter | ₦25,000/mo (20 units, 1 seat) |
| EM Growth | ₦60,000/mo (100 units, 5 seats) |
| EM Enterprise | ₦150,000/mo (unlimited) |

---

## 5. Success Metrics (6 Months)

- Verified listings: **40% reach Certified tier**
- Dispute rate: **< 5% of transactions**
- Payment success: **> 99%**
- Application-to-approval: **< 48 hours**
- MAU: **10,000**
- B2B clients: **25 (₦1.6M MRR)**

---

## 6. Features OUT OF SCOPE (Post-Launch)

- Native mobile app (React Native planned)
- WebSockets (polling only for v1)
- CAC API integration (manual number entry)
- Credit score integration
- Property valuation AI
- Virtual tours / in-app video calling
- Foreign currency support
- Subletting / utility tracking / tenant insurance
- Mortgage origination
- Agent licensing API
- Government API (LIRS, LASAA)
- White-label (Enterprise tier — designed but not built)

---

*This PRD reflects the current production codebase. Update when features change.*
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
