# 02 – Information Architecture

## 1. Site Structure

```
PROPATI
├── Public
│   ├── Landing
│   ├── Listings (search)
│   │   └── Listing Detail
│   ├── Sign In
│   ├── Sign Up
│   └── Onboarding
├── Authenticated Shell
│   ├── Dashboard (role-router)
│   │   ├── Landlord
│   │   │   ├── Dashboard Home
│   │   │   ├── My Properties
│   │   │   ├── Add Listing
│   │   │   ├── Rent Collection
│   │   │   ├── Agreements
│   │   │   ├── Screening Calls
│   │   │   ├── Verify Property
│   │   │   ├── Messages
│   │   │   └── My Profile
│   │   ├── Tenant
│   │   │   ├── Dashboard Home
│   │   │   ├── Find Property
│   │   │   ├── Rent & Payments
│   │   │   ├── My Agreements
│   │   │   ├── My Applications
│   │   │   ├── Saved Listings
│   │   │   ├── Maintenance
│   │   │   ├── Screening Calls
│   │   │   ├── Receipts
│   │   │   ├── Messages
│   │   │   └── My Profile
│   │   ├── Agent
│   │   │   ├── Dashboard Home
│   │   │   ├── Deal Pipeline
│   │   │   ├── Managed Listings
│   │   │   ├── Inspections
│   │   │   ├── Commissions
│   │   │   ├── Clients
│   │   │   ├── Reputation
│   │   │   ├── Messages
│   │   │   └── My Profile
│   │   ├── Estate Manager
│   │   │   ├── Home
│   │   │   ├── Portfolio
│   │   │   ├── Rent Ledger
│   │   │   ├── Maintenance
│   │   │   ├── Bulk Import
│   │   │   ├── Agreements
│   │   │   ├── Team
│   │   │   ├── Billing
│   │   │   └── Reports
│   │   └── Admin
│   │       ├── Dashboard
│   │       ├── Verifications
│   │       ├── Flagged Listings
│   │       ├── Users
│   │       ├── Agreements
│   │       ├── Disputes
│   │       ├── Revenue
│   │       ├── Escrow
│   │       └── Audit Logs
│   └── Shared
│       ├── Conversations
│       └── Notifications
├── API
│   ├── Auth / Clerk Webhook
│   ├── Listings
│   ├── Applications
│   ├── Agreements
│   ├── Verification
│   ├── Payments
│   ├── Messages / Conversations
│   ├── Notifications
│   ├── Orgs
│   ├── Admin
│   └── Webhooks (Paystack, Remita)
└── Design System
    ├── Components
    ├── Tokens
    ├── Templates
    └── Assets
```

## 2. Primary Navigation Model

- **Public:** top nav or simple hero menu to Search, Sign In, Sign Up
- **Dashboard:** persistent sidebar with role-specific nav items
- **Secondary:** topbar with notifications, profile menu, purpose switch (tenant-specific modes)
- **Mobile:** sidebar collapses to drawer; modals render as bottom sheets at ≤768px

## 3. Role Routing

| Role | Route | Nav Config |
|------|-------|------------|
| `tenant` | `/dashboard/tenant` | `TENANT_NAVIGATION` |
| `landlord` | `/dashboard/landlord` | `LANDLORD_NAVIGATION` |
| `agent` | `/dashboard/agent` | `AGENT_NAVIGATION` |
| `estate_manager` | `/dashboard/estate-manager` | `ESTATE_MANAGER_NAVIGATION` |
| `admin` | `/admin` | `ADMIN_NAVIGATION` |

Resolved by `getRoleRedirectPath(role)` in `src/lib/auth.ts` and surfaced in `src/lib/navigation.tsx`.

## 4. Feature Groupings

### 4.1 Acquisition
- Listing search and detail
- Applications and screening
- Deal pipeline (agent)

### 4.2 Transaction
- Agreement generation and e-signing
- Payment initiation and webhooks
- Escrow hold and release
- Rent schedule and reminders
- Stamp duty and FIRS certificate

### 4.3 Trust & Safety
- 5-layer verification
- User verification status
- Flag/report listings
- Audit logs and admin controls

### 4.4 Operations
- Maintenance tickets (tenant-initiated and EM-managed)
- Bulk import and portfolio management
- Team and subscription management
- Ledger and reporting

### 4.5 Communication
- Conversations tied to listings
- In-app notifications
- Email and SMS templates
- Typing indicators and read receipts

### 4.6 Compliance
- Law firm review workflow — planned
- Dispute creation and mediation
- Evidence pack generation — planned

## 5. Information Hierarchy (Landing to Close)

### 5.1 Public Search Flow
- Home → Search filters → Listing list → Listing detail → Apply / Save / Message

### 5.2 Rental Flow
- Search → Application → Screening call → Agreement → E-sign → Payment → Move-in

### 5.3 Short-let Flow
- Search → Select dates → Booking → Payment → Check-in/out → Review

### 5.4 Purchase Flow (Planned)
- Search → Viewing → Offer → Sale agreement → Payment → Transfer

## 6. Data Architecture

### 6.1 Core Domains
- **Identity:** User, Verification, VerificationDocument
- **Inventory:** Listing, ListingImage, Unit, OrgListing
- **Transaction:** Transaction, Agreement, AgreementSignature, RentSchedule, StampDuty
- **Communication:** Conversation, Message, Notification
- **Operations:** MaintenanceTicket, Application, ScreeningCall
- **Organisation:** Organisation, OrgMember, OrgSubscription
- **Admin:** AdminAuditLog, Dispute, ListingFlag

### 6.2 Cross-cutting Concerns
- Auth is handled by Clerk; Prisma `User` stores role and metadata
- Payments are server-side only; webhooks validate raw body HMAC
- Files (images, PDFs, videos) are stored via Cloudinary
- Audit trail is explicit: `AdminAuditLog`, `AgreementSignature`, payment logs

## 7. Access Control

- Auth middleware: `src/lib/api-auth.ts` (`withAuth`, `withAuth(roles)`)
- Dashboard shell: `src/app/dashboard/[role]/layout.tsx`
- Role validation against Prisma `UserRole` enum
- Owner-only filters by `userId` or `orgId` on relevant record types

## 8. Taxonomy Decisions

| Dimension | Controlled Values | Source |
|-----------|-------------------|--------|
| User role | `landlord`, `tenant`, `agent`, `estate_manager`, `admin` | Prisma enum |
| Listing type | `rent`, `sale`, `short_let`, `share`, `commercial` | Prisma enum |
| Property type | `apartment`, `house`, `duplex`, `land`, `office`, `shop`, `warehouse` | Prisma enum |
| Verification tier | `basic`, `verified`, `inspected`, `certified` | Prisma enum |
| Maintenance status | `open`, `assigned`, `in_progress`, `resolved`, `closed` | Prisma enum |
| Agreement type | `rental`, `sale`, `short_let`, `share` | Prisma enum |

## 9. Content & Editorial Model

- Property listings: user-generated via landlord/agent forms
- Agreements: system-generated from templates in `src/lib/agreement-templates.ts`
- Notifications: server-generated via event triggers in route handlers
- Admin content: operational actions only; no CMS layer

## 10. Localization & Local Context

- Currency: Naira (kobo integer storage)
- Min/max prices and fees per Nigerian market
- Stamp duty rate: 0.78% (₦500 minimum)
- ID types: NIN, BVN, passport, driver's licence, voter's card
- SMS: Termii as primary, Twilio WhatsApp as fallback
- Email: SMTP via Gmail or equivalent
