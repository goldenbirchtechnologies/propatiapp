# PropatiBox — Complete Role-Based Onboarding Spec (Prompt Style)

> **Build prompt** — paste this entire file to any code agent (Cursor / Lovable / Claude Code) to generate the role-aware onboarding wizard, dashboard gate, and persistence layer exactly as specified. Every field lists its prompt, type, validation, storage column, and API route. Designed for Next.js 14 App Router + Prisma + Clerk.

---

## 0. GLOBAL RULES (Applies to ALL Roles)

```md
You are building PropatiBox's onboarding intake. Requirements:

- Auth: Clerk with `routing="path"` inside `[[...sign-in]]` / `[[...sign-up]]` catch-alls. The flat `/sign-in/page.tsx` pattern is forbidden — it breaks `/factor-one` (MFA) and `/verify-email-address` / `/sso-callback`. Sign-up role picker writes `unsafeMetadata.role` → webhook `POST /api/auth/clerk-webhook` reads `publicMetadata.role` → writes `users.role`. Fallback: `ensurePrismaUserFromClerk()`.

- Every new user must be mappable to `Country.code` + `Jurisdiction{countryId, level=state, code}` + free-text `city` + `addressLine1/2` + E.164 `phone` + government ID. Jurisdiction is server-validated against `GET /api/onboarding/location/options` on every `POST /api/onboarding/location` — never trust client. Feeds stamp-duty routing (Remita/FIRS), agreement templates, and legal engine (`src/lib/countries/*`).

- Gate: soft-block. Dashboard renders blurred (`opacity-85, blur[1.5px]`), fixed centered modal (`src/components/onboarding/OnboardingGate.tsx`, `fixed inset-0 z-50 backdrop-blur-sm`) mounted once in `TenantRailShell` → `DashboardShell` covers all roles. Reads `GET /api/onboarding/status` → shows only when `required:true && status!="completed"`. Existing rows `onboardingRequired=false` → never gated. Fails OPEN on 500/network.

- Progress is derived from booleans, not stored percent:
  location: countryId && jurisdictionId && city
  contact: phone && phoneVerified
  identity: idType && idNumberEnc && idVerified
  employment: employmentStatus && employerName && jobTitle && yearlyIncome != null (tenant only)
  guarantor: guarantorName && guarantorPhone && guarantorRelationship (tenant only)

- Crypto: OTP hashed `hashOtp(code,userId)` + `timingSafeEqual`; ID AES-256-GCM via `src/lib/encryption.ts` (`ENCRYPTION_KEY` ≥32 chars) + `id_number_hash` @unique. BigInt money as string via `serializeBigInt`.

- DB: Supabase `DATABASE_URL` pooled `:6543?pgbouncer=true` + `DIRECT_URL` direct `db.<ref>.supabase.co:5432?sslmode=require`. Migration `20261027150000_add_user_onboarding_and_jurisdiction` must be applied (columns `onboarding_required`, `onboarding_status`, tables `user_onboardings`, `rental_application_dossiers`).

- Styling: HTML reference uses `primary #006c49 / primary-container #10b981 / surface #fbf8fc / tertiary #bf0715`, Inter + Material Symbols Outlined. Reconcile with shipped dark bichrome `#09090b / #10b981 / zinc` — pick one. Wizard must match `src/app/sign-up` stepper aesthetic.
```

---

## 1. ROLE MATRIX — Step Count & Titles

| Role | Steps | Pill Label | Wizard Completes To |
|------|-------|-----------|---------------------|
| **Tenant** | **7** | `Tenant (7 Steps)` | `/dashboard/tenant` |
| **Landlord** | **5** | `Landlord (5 Steps)` | `/dashboard/landlord` |
| **Agent** | **7** | `Agent (7 Steps)` | `/dashboard/agent` → 5-layer Verification |
| **Estate Manager** | **6** | `Estate Manager (6 Steps)` | `/dashboard/estate-manager` |
| **Admin** | **0** | exempt | `/dashboard/admin` (never gated) |

---

## 2. STEP 1 — JURISDICTION & LOCATION (ALL ROLES — Required)

> Prompt: "Define your physical residence and legal jurisdiction to apply statutory tenancy covenants under Nigerian Law."

| # | Field | Prompt | Type | Validation | Storage Column | API |
|---|-------|--------|------|------------|----------------|-----|
| 1.1 | Country | "Country of Residence" | select | `isSupportedCountry` + `Country.active=true` | `users.countryId → Country.code` | `POST /api/onboarding/location` |
| 1.2 | Legal Jurisdiction / State | "Legal Jurisdiction / State" | select | belongs to `countryId`, `active=true` | `users.jurisdictionId → Jurisdiction.id` | same |
| 1.3 | City / Estate Address | "City / Estate Address" | text | 2–100 chars, free-text + autocomplete | `users.city` | same |
| 1.4 | Street Address Line 1 | "Street Address" | text | 4–200 chars | `users.addressLine1` | same |
| 1.5 | Street Address Line 2 | "Apartment / Suite (optional)" | text | 0–200, optional | `users.addressLine2` | same |

- Source: `src/lib/countries.ts` (200+), `nigeria-states.ts` (37), `nigeria-cities.ts` (13 states + free-text fallback).
- Only Nigeria live; GH/GB/BJ/IT show "Coming soon" disabled.
- Endpoint: `GET /api/onboarding/location/options?countryCode=NG` with static fallback when `jurisdictions` empty.
- Display hint: "Lagos Tenancy Law 2011 applicable" when `code: LA`.

---

## 3. STEP 2 — PHONE VERIFICATION (ALL ROLES — Required)

> Prompt: "Add a phone number so landlords, agents, and the platform can reach you for disbursements and authorizations."

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 2.1 | Phone Number | "Nigerian GSM Contact — WhatsApp 2FA" | tel | E.164 (`+234`), `users.phone @unique` | `users.phone` |
| 2.2 | OTP Code | "6-digit code" | text | `/^\d{6}$/`, `expiresAt: now+5m` | `PhoneOtp{userId, otpHash, expiresAt}` |

- `POST /api/onboarding/contact` → normalizes E.164 → rate-limit `3/15m` → `sendSMS({to:'234...'})` via Termii `src/lib/sms/termii.ts` (mock logs when `TERMII_API_KEY` unset) → `devCode` only when `NODE_ENV!=production`.
- `POST /api/onboarding/phone/verify` → `timingSafeEqual(hashOtp)` → `phoneVerified=true`, row deleted.
- `POST /api/onboarding/phone/resend` → re-issue.
- Duplicate `phone` → `409 PHONE_IN_USE`. Schema: `onboardingContactSchema{phone}`, `onboardingPhoneVerifySchema{code}`.

---

## 4. STEP 3 — IDENTITY & KYC (ALL ROLES — Required)

> Prompt: "Verify your identity to unlock listings, agreements, and automated rent collections."

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 3.1 | Full Legal Name | "Legal Full Name (as on ID)" | text | auto-filled from `users.fullName`, 2–120 | `users.fullName` |
| 3.2 | Date of Birth | "Date of Birth" | date | `YYYY-MM-DD`, must be ≥18y | dossier / `users` extra |
| 3.3 | Home Address | "Residential Address" | text | 4–200 | `users.addressLine1` (reuse) |
| 3.4 | ID Type | "Government-Issued Photo ID" | select | `['nin','bvn','passport','drivers_licence','voters_card']` per `verificationProvider.getSupportedIdTypes()` | `users.idType` |
| 3.5 | ID Number | "ID Number" | text | 5–20, encrypted AES-256-GCM | `users.idNumberEnc` + `users.idNumberHash @unique` (mirrored to `ninHash` for NIN) |
| 3.6 | ID Document Upload | "Upload Photo ID (Passport / Driver's License)" | file | `image/*, application/pdf`, max 10MB → Cloudinary | `users.idDocUrl` |
| 3.7 | NIN / TIN / BVN | "National Identification / Tax Code" | text | 11 digits (NIN), 11 (BVN), TIN varies | `users.ninEncrypted/ninHash`, `bvnEncrypted`, `idNumberEnc` |

- Verified via `prembly.verifyNIN(nin, firstName, lastName)` / `prembly.verifyBVN(bvn, ...)` — mock fallback when `PREMBLY_API_KEY` unset. `status==='success'` → `idVerified=true`, `UserKyc{status:approved, level:2, verifiedAt}`.
- `verified:false` → `UserKyc.status=rejected`. Provider `503` → `UserOnboarding.status=blocked` (retry banner).
- `409 ID_IN_USE` if `idNumberHash` belongs to another user. Full number never re-displayed.
- Does NOT create `Verification` (property-scoped; crashes on `null listingId`).

### Role-Specific Additions in Step 3:

| Role | Extra Field | Prompt | Storage |
|------|-------------|--------|---------|
| **Landlord** | Tax Documentation | "TIN / NIN / Tax Registration Code" | `users` extra + dossier |
| **Landlord** | Ownership Entity Type | "Individual / Joint Owners / Registered Company" | `users` + `Organisation` |
| **Agent** | Professional Contact | "Business Phone, Corporate Email, LinkedIn / Instagram" | `users.phone` + `agentAreas` JSON |
| **Agent** | Emergency Contact | "Full name, phone, relationship" | dossier `guarantor*` pattern / `emergencyContact` JSON |
| **Estate Manager** | Corporate Registration | "CAC Documents + Corporate TIN" | `BusinessProfile`, `BusinessVerification` |
| **Estate Manager** | Professional Credentials | "NIESV / ESVARBON Registration Number" | `AgentLicense{board, status}` |

---

## 5. LANDLORD — Steps 4 & 5 (Owner-Specific)

### Step 4 — Primary Owner Profile

> Prompt: "Tell us about the legal ownership entity for KYC and tenancy execution."

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 4.1 | Legal Ownership Entity | "Individual owner's full legal name, joint owners' names, or registered company name" | text | 2–200 | `users.fullName` + `Organisation.name` |
| 4.2 | Contact Credentials | "Primary phone, verified email, mailing address for official notices" | tel + email + text | E.164 + email regex + 4–200 | `users.phone/email/addressLine1` |
| 4.3 | Government ID Upload | "Valid photo ID (Passport or Driver's License) — KYC" | file | image/pdf, 10MB → Cloudinary | `users.idDocUrl` (reuse Step 3) |
| 4.4 | Tax Documentation | "TIN / NIN / Tax Registration Code" | text | 5–20, encrypted | `users.idNumberEnc` + hash |

### Step 5 — Financial Settlement Instructions

> Prompt: "Configure how rental income will be disbursed to you."

| # | Field | Prompt | Type | Validation | Storage | API |
|---|-------|--------|------|------------|---------|-----|
| 5.1 | Account Name | "Bank Account Name (must match legal entity)" | text | 2–120 | `UserPaystackAccount.accountName` / `Wallet` | `POST /api/onboarding/landlord/settlement` |
| 5.2 | Bank Name | "Bank Name" | select | from Paystack `listBanks` | `UserPaystackAccount.bankName` | same |
| 5.3 | Account Number | "Account Number (NUBAN - 10 digits)" | text | `/^\d{10}$/` | `UserPaystackAccount.accountNumber` | same |
| 5.4 | BVN / Routing | "BVN for verification" | text | 11 digits, encrypted | `users.bvnEncrypted` | same |
| 5.5 | Target Rent Price | "Base monthly / annual target rent (₦)" | number | `≥0` → BigInt | `Listing` / dossier `monthlyBudget` | same |
| 5.6 | Security Deposit | "Minimum security deposit (₦)" | number | `≥0` → BigInt | `Listing.cautionDeposit` pattern | same |
| 5.7 | Lease Duration | "Preferred lease durations" | select | `6m \| 12m \| 24m \| flexible` | dossier / `Agreement` | same |
| 5.8 | Management Fee Consent | "Acknowledge agency commission %, maintenance reserve cap, onboarding fee" | checkbox | required | `Organisation` / agreement consent | same |

- Paystack Dedicated Virtual Account (DVA) provisioned via `paystack.createCustomer` + `createDedicatedAccount` in webhook — landlord settlement reuses same rail.

---

## 6. AGENT — Steps 4–7 (Professional-Specific)

### Step 4 — Professional Profile & Identity Verification

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 4.1 | Legal Identification | "Full legal name, date of birth, home address + government photo ID upload (Driver's License / International Passport)" | text + date + file | 2–120, valid date ≥18y, image/pdf 10MB | `users.*` + `idDocUrl` |
| 4.2 | Professional Contact | "Business phone, corporate email, LinkedIn / corporate Instagram" | tel + email + url | E.164 + email + url | `users` + `agentAreas` |
| 4.3 | NIN / BVN / TIN | "National Identification & Tax Codes" | text | 11 (NIN/BVN), TIN varies, encrypted | `users.*` (Step 3 pattern) |
| 4.4 | Emergency Contact | "Full name, phone, relationship" | text + tel | 2–120, E.164, 2–60 | dossier JSON |

### Step 5 — Licensing & Regulatory Compliance

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 5.1 | License Number | "Real Estate Board Registration — REDAN / NIESV / regional broker council — license number, certificate" | text + file | 2–60 + image/pdf | `AgentLicense{board, licenseNumber, status}` |
| 5.2 | Corporate Entity | "If agency/firm (not freelancer): CAC corporate registry docs upload" | file | image/pdf, optional if `individual` | `BusinessProfile` / `BusinessVerification` |
| 5.3 | Indemnity Insurance | "Professional indemnity / E&O insurance — policy number + expiration date" | text + date | policy 2–60, date future | `AgentLicense` extra / dossier JSON |
| 5.4 | Background & Code of Conduct | "Background clearance + signed digital assent to fair housing / ethical code" | checkbox + file | required | `UserKyc` / agreement consent |

### Step 6 — Territory & Portfolio Scope

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 6.1 | Operational Territory | "Regions, cities, zones, estates/neighborhoods with boots-on-ground coverage" | multi-select | ≥1, from `Jurisdiction` + `STATE_CITIES` | `users.agentAreas` (JSON array) |
| 6.2 | Focus Area | "Specializations — Residential Sales, Commercial Lettings, Luxury Estates, Land Flipping, Short-Let Management" | checkboxes | ≥1 | `users.agentAreas` / `Listing.propertyType` |
| 6.3 | Active Listings Count | "Inventory size to port onto platform" | number | `≥0` | `Listing` count disclosure |

### Step 7 — Financial & Commission Setup + Technical Requirements

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 7.1 | Settlement Bank | "Bank name, account number, routing/sort codes, account title — for split-commission distributions" | text + select | NUBAN 10, bank from Paystack list | `UserPaystackAccount` / `Wallet` |
| 7.2 | Commission Tier | "Fee parameters, split % with brokerage, or subscription-tier for lead gen" | select + number | `0–100%` | `Organisation` / dossier |
| 7.3 | CRM & Device | "Primary mobile OS (iOS/Android), existing field tool workflows for integration" | select + text | `ios \| android \| both` | dossier JSON |

---

## 7. ESTATE MANAGER — Steps 4–6 (Corporate & Authority)

### Step 4 — Identity & Corporate Profile

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 4.1 | Legal Operator Entity | "Full legal name of estate manager, or registered corporate name if firm" | text | 2–200 | `users.fullName` + `Organisation.name` |
| 4.2 | Corporate Registration | "CAC documents + corporate TIN — upload" | file | image/pdf, 10MB | `BusinessProfile`, `BusinessVerification` |
| 4.3 | Professional Credentials | "NIESV / ESVARBON registration / license number" | text | 2–60 | `AgentLicense{board, status}` |
| 4.4 | Operational Team Contacts | "Primary office address, business lines, emergency hotlines, designated account managers" | text + tel | 4–200, E.164 | `Organisation` + `OrgMember` |

### Step 5 — Scope of Management Authority (Power of Attorney)

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 5.1 | Management Agreement / POA | "Executed Property Management Agreement or Power of Attorney — upload" | file | image/pdf, required | `Document` / `Agreement` |
| 5.2 | Eviction & Legal Mandate | "Boundary of authority: serving Quit Notices, handling tenancy disputes — declaration" | checkbox + text | required | dossier / `Agreement.specialClauses` |
| 5.3 | Tenant Screening Parameters | "Agreed criteria: minimum income thresholds, acceptable guarantor requirements" | text + number | income `≥0` BigInt | dossier `reviewerNotes` |

### Step 6 — Financial & Rental Remittance Logistics

| # | Field | Prompt | Type | Validation | Storage |
|---|-------|--------|------|------------|---------|
| 6.1 | Client Trust Bank Account | "Dedicated escrow/trust account — Bank name, Account name, Account number (strictly for deposits/rent before remittance)" | text + select | NUBAN 10, bank select, name 2–120 | `UserPaystackAccount` (trust) / `Wallet` escrow |
| 6.2 | Remittance Cycle | "Payout timeline — instant split / monthly / annual minus fees" | select | `instant \| monthly \| annual` | `Organisation` / dossier |
| 6.3 | Management Fee Breakdown | "Percentage or flat-rate for rent collection, renewals, new tenant onboarding" | number + text | `0–100%` or `≥0` flat | dossier / `Organisation` |
| 6.4 | Tax Withholding Protocols | "WHT on rental income — instructions for statutory deductions" | text + checkbox | — | dossier / `Agreement` tax clause |

---

## 8. TENANT — Steps 4–7 (Full Screening Dossier — See docs/ONBOARDING_TENANT_SCREENING.md)

Tenant Steps 4–7 are the exhaustive 30-question screening dossier (employment, guarantor, household, rental history, legal). Summarized here, detailed in the companion file:

| Step | Fields | API |
|------|--------|-----|
| 4. Employment & Income | `employmentStatus/Type`, `employerName`, `jobTitle`, `yearlyIncome`, `yearsInEmployment` + 7 extended Qs (pay stubs ≥3× rent, extra income, bankruptcy, deposit readiness, payment rail) | `POST /api/onboarding/employment` |
| 5. Guarantor + Household + Rental History + Legal | See §5 in `ONBOARDING_TENANT_SCREENING.md` — 20 questions across guarantor, occupants/pets/vehicles, move-in date, eviction history, emergency contact, NIN, screening consent | `POST /api/onboarding/guarantor` + `GET|PATCH /api/onboarding/rental-application` + `/submit` |

---

## 9. WIZARD & GATE CONTRACT

- `/onboarding` renders the full-page wizard (current placeholder `Welcome → Profile → Complete` writing only to `unsafeMetadata` is replaced by `OnboardingWizard.tsx`).
- Gate renders the **same** steps as a centred non-dismissable modal (`Modal: open, onOpenChange={()=>{}} , showClose=false, closeOnOverlayClick=false, closeOnEscape=false`) with `OnboardingGate → OnboardingWizard(embedded=true)` mounted once in `DashboardShell→TenantRailShell`. Sign out is the only escape.
- Styling: HTML reference uses `primary #006c49 / primary-container #10b981 / surface #fbf8fc / tertiary #bf0715` + Inter + Material Symbols Outlined — reconcile with shipped dark bichrome `#09090b / #10b981 / zinc`.
- Role switcher pill: `Tenant (7 Steps)` vs `Landlord (5 Steps)` vs `Agent (7 Steps)` vs `Estate Manager (6 Steps)` — stepper respects `ROLE_STEPS[role] ?? []`; `accountant/` on disk has no `UserRole` → safe `[]`.
- Server enforcement: `assertOnboarded(user)` → `403 ONBOARDING_REQUIRED` on write endpoints only.

---

## 10. DATABASE & INFRA

- Supabase: `DATABASE_URL` pooled `:6543?pgbouncer=true` + `DIRECT_URL` direct `db.<ref>.supabase.co:5432?sslmode=require`.
- Migration `20261027150000_add_user_onboarding_and_jurisdiction` — verified via `42P07` then `42703` errors until repaired.
- Seed: `prisma/seed-countries.ts` imports `NIGERIAN_STATES` (37) via `seedCountriesAndJurisdictions()`. `npm run db:seed` seeds countries + jurisdictions.
- Env: `ENCRYPTION_KEY` (≥32 chars, `openssl rand -base64 32`) required for `/identity`, otherwise throws. `TERMII_API_KEY` / `PREMBLY_API_KEY` optional (mock fallbacks).

---

## 11. OPEN QUESTIONS (Non-blocking — Code Ready)

- `ENCRYPTION_KEY` — must be set.
- Which `Country.active` beyond `NG`? GH/BJ/GB/IT seeded `active:false` ("Coming soon") — live is a data task.
- Should `estate_manager` ever require `employment`? Currently no.

