# 01 – Product Requirements

## 1. Product Overview

**Product Name:** PROPATI  
**Tagline:** Nigeria's first verified property operating system  
**Market:** Nigeria  
**Legal Structure:** PROPATI Technologies Ltd (to be registered with CAC)

PROPATI is a unified PropTech platform that functions as the **operating system for real estate in Nigeria**. It digitizes and standardizes how property is listed, verified, transacted, managed, and legally enforced across residential, commercial, industrial, and short-let markets.

## 2. Product Principles

1. **Trust first** — Every transaction and participant is verifiable.
2. **Role clarity** — Each actor sees only the actions relevant to their role.
3. **Evidence by default** — Agreements, payments, verifications, and disputes generate audit-ready records.
4. **Mobile-first** — 375px breakpoint is the baseline; all roles must complete core journeys on a smartphone.
5. **Escrow safety** — Funds are held until contractual or operational obligations are met.
6. **Nigeria-local** — Naira pricing, stamp duty (FIRS/Remita), Nigerian ID types, Nigerian law.

## 3. Property Classes

| Class | Description | Typical Cycle | Agreement Type |
|-------|-------------|---------------|----------------|
| Residential | Apartments, houses, duplexes | Monthly / yearly | Tenancy |
| Short-let | Daily, weekly, monthly stays | Hourly → daily | Booking |
| Commercial Retail | Shops, malls, kiosks | Monthly / yearly | Lease |
| Office Space | Private, shared, coworking | Monthly / yearly | Lease |
| Industrial / Warehouse | Storage, logistics, manufacturing | Long-term | Lease |

## 4. Management Types

- **Self-managed** — Landlord controls listing, screening, agreements, and rent collection.
- **Agent-managed** — Licensed agent operates on behalf of landlord; earns commission per transaction.
- **Company-managed** — Estate management firm manages multi-unit portfolios under one organisation.

## 5. Actors & Capabilities

### 5.1 Tenant / Guest
- Search, filter, and shortlist properties
- Complete 5-layer identity verification
- Apply for properties with structured applications
- Sign agreements digitally with audit trail
- Pay rent, booking fees, and service charges via Paystack
- Raise maintenance requests and track resolution
- View receipts, agreements, and payment history
- Participate in landlord-scheduled screening calls
- **(Short-let)** Instant booking, damage deposit, check-in/out

### 5.2 Landlord / Owner
- List properties across all classes
- Set rent, pricing, availability, and terms
- Serve service charges for commercial units
- Receive automated rent collection
- Screen tenants via applications and scheduled calls
- Generate, route, and sign agreements
- Verify property through 5-layer certification
- Manage conversations and disputes
- Track revenue and transaction history

### 5.3 Agent (Individual)
- Source and list properties on behalf of landlords
- Manage deal pipeline: Enquiry → Viewing → Offer → Agreement → Completed
- Schedule and complete inspections
- Earn commission per transaction (rent, sale, booking)
- Manage client relationships and deal flow
- Track commission statements and payout history

### 5.4 Realtor
- Focus on property acquisition and disposal (buy/sell)
- Manage buyers and sellers
- Generate sale agreements
- Track commissions and deal flow
- *(Note: realtor role is planned but not yet implemented as a distinct role.)*

### 5.5 Estate Manager / Property Company
- Multi-user organisational accounts with admin, manager, accountant, maintenance, owner-view roles
- Portfolio management across multiple buildings
- Bulk-import units via CSV
- Rent ledger with filters and CSV export
- Maintenance ticket workflows (Kanban)
- Team invitations with role-based seat limits
- Billing and Paystack subscription management
- Monthly revenue and occupancy reports

### 5.6 Law Firm (Legal Network Partner)
- Independent network partners, not embedded employees
- Review, edit, approve, or reject agreements
- Jurisdiction compliance validation
- Dispute resolution and arbitration
- Generate court-ready evidence packs
- *(Note: law-firm module is planned but not yet implemented.)*

### 5.7 Admin
- Verification queue management (all 5 layers)
- User management: suspend, ban, approve agents, change roles
- Flagged listing review and moderation
- Dispute mediation and ruling
- Revenue analytics dashboard
- Audit log review

## 6. Features by Layer

### 6.1 Marketplace
- Public listing search with filters (type, price, bedrooms, area, verification tier)
- Listing detail with gallery, specs, verification layers, and CTA
- Save/unsave listings
- Flag/report listings (auto-suspend at threshold)
- Featured listings placement
- View-count tracking

### 6.2 Financial Infrastructure
- Rent payment initiation → Paystack checkout
- Booking payments (short-let) — planned
- Escrow hold and controlled release
- Platform fee computation (rent %, sale %)
- Agent commission computation
- Paystack subscription billing for estate-manager plans
- Stamp duty calculation (0.78%) and FIRS e-Certificate via Remita
- Receipt generation (PDF) and email delivery

### 6.3 Legal Infrastructure
- Agreement generation from templates (rental, sale, short-let, share)
- E-signature with consent, IP, user-agent, checksum audit trail
- State machine: draft → pending_landlord → pending_tenant → fully_signed
- Rent schedule auto-generation on `fully_signed`
- PDF generation and Cloudinary storage
- Stamp duty integration into agreement flow
- Law firm review/certification workflow — planned
- Dispute creation, investigation, mediation, resolution
- Evidence pack export — planned

### 6.4 Identity Verification (5-Layer Trust System)
1. **Documents** — C of O, Deed, Survey, Gov. Consent upload
2. **Identity Match** — Prembly NIN/BVN lookup + confirmation
3. **Live Video** — QR-coded video proof
4. **Physical Inspection** — Agent on-site inspection with report
5. **Admin Certification** — Final review → Certified badge

Overall outcomes: `basic` → `verified` → `inspected` → `certified`

### 6.5 Property Management
- Unit-level inventory for estate managers
- Maintenance ticket creation, assignment, resolution, closure
- Tenant-initiated maintenance requests with attachment uploads
- Rent ledger with status tracking (upcoming, paid, overdue)
- Bulk CSV import for units and listings
- Portfolio summary statistics

### 6.6 Notifications
- In-app bell with unread count and mark-as-read
- Email templates: welcome, verification updates, payment confirmation, agreement signing, rent reminders (7/3/1 days), org invitations
- SMS rent reminders via Termii
- WhatsApp OTP fallback via Twilio
- Cron-driven daily reminders

### 6.7 Enforcement & Compliance
- Admin audit log for all sensitive actions
- Flagged listing queue with suspend/dismiss actions
- Ban/suspend user controls
- Dispute lifecycle tracking
- Rate limiting on public endpoints

## 7. User Roles and Permissions

| Role | Primary Domain | Auth Method | Default Post-Signup |
|------|----------------|-------------|---------------------|
| `tenant` | Rental market | Clerk | Onboarding + `/dashboard/tenant` |
| `landlord` | Supply side | Clerk | Onboarding + `/dashboard/landlord` |
| `agent` | Managed listings | Clerk | Onboarding + `/dashboard/agent` |
| `estate_manager` | B2B management | Clerk | Onboarding + `/dashboard/estate-manager` |
| `admin` | Platform operations | Clerk (manual assign) | `/admin` |

## 8. Property Types

| Type | Applicable Classes | Notes |
|------|--------------------|-------|
| `apartment` | Residential, short-let | |
| `house` | Residential, short-let | |
| `duplex` | Residential, short-let | |
| `land` | Residential, sale | |
| `office` | Office | |
| `shop` | Commercial | |
| `warehouse` | Industrial | |

## 9. Business Model

| Revenue Stream | Model | Status |
|----------------|-------|--------|
| Rent/booking transaction fee | Platform fee on rent; % on booking | **Active** |
| Sale transaction fee | %, computed server-side | Planned |
| Estate-manager subscriptions | Paystack recurring (starter, growth, enterprise) | **Active** |
| Legal marketplace fees | Per-document / per-review | Planned |
| Document generation fees | Agreements, reports | Planned |
| Service add-ons | Cleaning, inspections, insurance | Planned |

## 10. Onboarding

- Sign-up: role picker → Clerk `<SignUp>`
- Post-signup: role-specific wizard (`/onboarding`)
- Role persisted to Prisma `User.role` and Clerkm metadata
- Role redirect resolves to the appropriate dashboard route via `getRoleRedirectPath()`

## 11. Non-Functional Requirements

- **Performance:** LCP < 2.5s on mobile
- **Security:** AES-256-GCM for NIN/BVN, HMAC-SHA512 Paystack webhooks, rate limiting, audit logging
- **Compliance:** Nigerian Stamp Duties Act compliance (0.78%), NDRA-aware data handling
- **Availability:** Staging and production environments with Supabase + Vercel
- **Observability:** Sentry (errors), Vercel Analytics (web vitals), Supabase Dashboard (DB), Paystack Dashboard (payments)

## 12. Out of Scope (v1)

- React Native mobile app (future)
- Multi-region read replicas (future)
- WebSocket messaging (future; polling today)
- Property valuation AI (future)
- Mortgage calculator (future)
- Realtor role as a distinct actor (planned)

## 13. Success Metrics

| Metric | Target |
|--------|--------|
| Certified listings | ≥ 40% of total within 6 months |
| Payment success rate | > 99% |
| Dispute rate | < 5% of transactions |
| B2B clients (EM) | 25 orgs (₦1.6M MRR) within 6 months |
| Console errors | 0 on all 5 role dashboards |
| Lighthouse | > 90 (Performance, SEO, Accessibility, Best Practices) |

## 14. Source Documents

- `docs/PROPTECH.md` — OS vision and stakeholder systems
- `docs/TRD.md` — Technical requirements
- `docs/USER_JOURNEYS.md` — Role journey flows
- `docs/UI_UX_BRIEF.md` — Design intent
- `docs/DATABASE_SCHEMA.md` — Schema source of truth
- `docs/IMPLEMENTATION_PLAN.md` — Execution roadmap
- `docs/BUILD_PLAN.md` — Phase planning and risk register
