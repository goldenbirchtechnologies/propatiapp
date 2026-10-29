# PropatiBox — Complete Onboarding & Tenant Screening Spec

> **Build prompt** — paste this entire file to any code agent (Cursor / Lovable / Claude Code) to generate the onboarding wizard, the dashboard gate, and the tenant screening dossier exactly as specified. Every field lists its validation, storage column, and API route.

---

## 1. Global Rules

- **Auth**: Clerk with `routing="path"` inside `[[...sign-in]]` / `[[...sign-up]]` catch-alls. The flat `/sign-in/page.tsx` pattern is forbidden — it breaks `/factor-one` (MFA) and `/verify-email-address` / `/sso-callback`.
- **Role assignment**: client writes `unsafeMetadata.role` → webhook `POST /api/auth/clerk-webhook` reads `publicMetadata.role` → writes `users.role`. `ensurePrismaUserFromClerk()` is the lazy fallback.
- **Jurisdiction is never optional**: `Country.code` + `Jurisdiction{countryId, level=state, code}` + free-text `city` + `addressLine1/2`. Validated server-side against `GET /api/onboarding/location/options` on every `POST /api/onboarding/location`. Feeds stamp-duty (Remita/FIRS), agreement templates, and the legal engine.
- **Gate**: soft-block. Dashboard renders blurred, `OnboardingGate` (fixed centered modal, `TenantRailShell`, covers all roles via `DashboardShell→TenantRailShell`) is non-dismissable (`closeOnOverlayClick=false`, `closeOnEscape=false`). Reads `GET /api/onboarding/status` → shows only when `required:true && status!="completed"`. Existing rows have `onboardingRequired=false` → never gated. Fails OPEN on 500/network.
- **Progress is derived**, not stored as a percent:
  ```
  location:  countryId && jurisdictionId && city
  contact:   phone && phoneVerified
  identity:  idType && idNumberEnc && idVerified
  employment: employmentStatus && employerName && jobTitle && yearlyIncome != null
  guarantor: guarantorName && guarantorPhone && guarantorRelationship
  ```
  `POST /api/onboarding/complete` re-checks every predicate server-side.
- **Crypto**: phone OTP hashed with `hashOtp(code,userId)` + `timingSafeEqual`; ID number AES-256-GCM via `src/lib/encryption.ts` (`ENCRYPTION_KEY` ≥ 32 chars) + `id_number_hash` (sha256+pepper) unique. BigInt money serialized as string.
- **DB**: Supabase `DATABASE_URL` pooled `:6543` + `DIRECT_URL` direct `db.<ref>.supabase.co:5432?sslmode=require`. Migration `20261027150000_add_user_onboarding_and_jurisdiction` must be applied.

---

## 2. Role Matrix — Step Count

| Role | Steps | Wizard title | Completes to |
|------|-------|-------------|--------------|
| Tenant | **5** | `Tenant (5 Steps)` | `/dashboard/tenant` |
| Landlord | **3** | `Landlord / Agent (3 Steps)` | `/dashboard/landlord` |
| Agent | **3 + business check** | `Landlord / Agent (3 Steps)` | `/dashboard/agent` → 5-layer Verification |
| Estate Manager | **3** | `Landlord / Agent (3 Steps)` | `/dashboard/estate-manager` |
| Admin | **0** | exempt | `/dashboard/admin` (never gated) |

`ROLE_STEPS[role] ?? []` — `accountant/` on disk has no `UserRole` → safe fallback.

---

## 3. Tenant — 5 Steps (Required Before Any Dashboard Access)

### Step 1 · Jurisdiction & Location — `POST /api/onboarding/location`

| Field | Type | Validation | Storage |
|-------|------|-----------|---------|
| `countryId` | select | `isSupportedCountry` + `Country.active=true` | `users.countryId → Country.code` |
| `jurisdictionId` | select | belongs to `countryId`, `active=true` | `users.jurisdictionId → Jurisdiction.id` |
| `city` | text | 2–100 chars, free-text (autocomplete from `nigeria-cities.ts`) | `users.city` |
| `addressLine1` | text | 4–200 chars | `users.addressLine1` |
| `addressLine2` | text | 0–200 chars, optional | `users.addressLine2` |

Source: `src/lib/countries.ts` (200+), `src/lib/locations/nigeria-states.ts` (37), `GET /api/onboarding/location/options?countryCode=NG`. Only Nigeria live today; GH/GB/BJ/IT show "Coming soon" disabled.

---

### Step 2 · Phone Verification — `POST /api/onboarding/contact` → `/phone/verify` → `/phone/resend`

| Field | Type | Validation | Storage |
|-------|------|-----------|---------|
| `phone` | tel | E.164 normalized (`+234`), `users.phone @unique` | `users.phone` |

- OTP: 6 digits, `PhoneOtp{userId, otpHash, expiresAt: now+5m}`, cascade delete on verify.
- `POST /contact` normalizes → rate-limit `3/15m` → `sendSMS({to:'234...'})` (Termii `src/lib/sms/termii.ts`, mock logs when `TERMII_API_KEY` unset) → `devCode` echoed only when `NODE_ENV!=production`.
- `POST /phone/verify` → `timingSafeEqual(hashOtp(code,userId))` → `phoneVerified=true`, row deleted.
- Duplicate `phone` → `409 PHONE_IN_USE` (never leak owner). Schema: `onboardingContactSchema{phone}`, `onboardingPhoneVerifySchema{code:/^\d{6}$/}`.

---

### Step 3 · Government ID / CAC — `POST /api/onboarding/identity`

| Field | Type | Validation | Storage |
|-------|------|-----------|---------|
| `idType` | select | `['nin','bvn','passport','drivers_licence','voters_card']` per `verificationProvider.getSupportedIdTypes()` | `users.idType` |
| `number` | text | 5–20 chars | `users.idNumberEnc` (AES-256-GCM) + `users.idNumberHash` (`@unique`, mirrored to `ninHash` for NIN) |

- Verified via `prembly.verifyNIN(nin, firstName, lastName)` / `prembly.verifyBVN(bvn, firstName, lastName)` — mock fallback when `PREMBLY_API_KEY` unset. `status==='success'` → `idVerified=true`, `UserKyc{status:approved, level:2, verifiedAt}`.
- `verified:false` → `UserKyc.status=rejected`. Provider `503` → `UserOnboarding.status=blocked` (retry banner, not `completed`).
- `409 ID_IN_USE` if `idNumberHash` belongs to another user. Full number never re-displayed.
- Does **not** create `Verification` (property-scoped; crashes on `null listingId` with `P2025`).

---

### Step 4 · Employment & Income — `POST /api/onboarding/employment` (tenant-only)

| Field | Type | Validation | Storage |
|-------|------|-----------|---------|
| `employmentStatus` | select | `employed \| self_employed \| business_owner \| student \| retired \| unemployed` | `users.employmentStatus` + `rental_application_dossiers.employmentStatus` |
| `employmentType` | select | `full_time \| part_time \| contract \| freelance \| internship` — **required only when** `status ∈ {employed, self_employed, business_owner}`. Hidden for `student/retired/unemployed`. | `users.employmentType` + dossier |
| `employerName` | text | 2–120 | `users.employerName` + dossier |
| `jobTitle` | text | 2–120 | `users.jobTitle` + dossier |
| `yearlyIncome` | number | `≥0`, coerced → `BigInt(Math.round)` | `users.yearlyIncome` (BigInt) + dossier |
| `yearsInEmployment` | text | 0–20, optional | dossier only |

**Extended screening questions (this section):**

| # | Question | Purpose | Storage |
|---|----------|---------|---------|
| 4.1 | Who is your current employer, what is your job title, and how long have you worked there? | Tenure & stability | `employerName`, `jobTitle`, `yearsInEmployment` |
| 4.2 | Can you provide recent pay stubs, W-2s, or tax returns proving ≥ 3× monthly rent? | Affordability threshold | `yearlyIncome` + `incomeVerified` (doc upload → Cloudinary `idDocUrl` pattern) |
| 4.3 | Do you have other verifiable income (freelance, child support, investments)? | Total household income | `monthlyBudget` + dossier `preferredListingType` notes |
| 4.4 | Do you anticipate any changes that could affect your ability to pay rent? | Forward risk — job change, medical, loan | dossier `reviewerNotes` (free-text disclosure) |
| 4.5 | Are you ready to pay the full security deposit and first month's rent upfront? | Liquidity check | `monthlyBudget` vs `rentAmount` comparison at application time |
| 4.6 | How will you be paying rent each month? | Rail preference — direct debit / transfer / standing order | dossier `preferredListingType` + future `paystack` rail |
| 4.7 | Have you ever filed for bankruptcy? | Long-term financial risk | disclosure field on dossier |

Dual-written via `upsertDossier()` — `users.*` for dashboards, `rental_application_dossiers.*` for the reusable dossier.

---

### Step 5 · Guarantor & Full Rental Application — `POST /api/onboarding/guarantor` + `GET|PATCH /api/onboarding/rental-application` + `/submit`

#### 5a. Guarantor

| Field | Type | Validation | Storage |
|-------|------|-----------|---------|
| `guarantorName` | text | 2–120 | `users.guarantorName` + dossier |
| `guarantorPhone` | tel | E.164, normalized same as tenant | `users.guarantorPhone` + dossier |
| `guarantorRelationship` | text | 2–60 | `users.guarantorRelationship` + dossier |
| `guarantorAddress` | text | 0–200, optional | dossier `guarantorAddress` |
| `guarantorOccupation` | text | 0–120, optional | dossier `guarantorOccupation` |

#### 5b. Core Verification (identity + residence history)

| # | Question | Type | Storage |
|---|----------|------|---------|
| 5.1 | What is your legal full name, current phone, and email? | auto-filled from `users` + Step 2 | `users.fullName`, `phone`, `email` |
| 5.2 | Can you provide a government-issued photo ID (driver's license, passport)? | covered in Step 3 | `idType`, `idNumberEnc`, `idVerified` |
| 5.3 | What are your current and previous addresses for the past 2–3 years? | text (free-form, 4–200) | `rental_application_dossiers.addressLine1/2`, `city` |

#### 5c. Household & Lifestyle

| # | Question | Type | Validation | Storage |
|---|----------|------|-----------|---------|
| 5.4 | How many people will live in the unit? Names + relationships? | number + text list | ≥1 | dossier `reviewerNotes` / JSON `householdMembers` |
| 5.5 | Do you have pets? Breed, size, age? Housebroken, vaccinated, friendly with strangers? | select + text | — | dossier `reviewerNotes` |
| 5.6 | How many vehicles will be parked? Makes/models? | number + text | ≥0 | dossier `reviewerNotes` |
| 5.7 | Does anyone in the household smoke or vape? | boolean | — | dossier `reviewerNotes` |
| 5.8 | Does anyone play a musical instrument or work unusual shifts? | boolean + text | — | dossier `reviewerNotes` |
| 5.9 | Do you anticipate long-term guests or household additions? | boolean | — | dossier `reviewerNotes` |
| 5.10 | What are your expectations for the property's features? | text | — | dossier `preferredListingType` + notes |

#### 5d. Rental History & Move Details

| # | Question | Type | Storage |
|---|----------|------|---------|
| 5.11 | Preferred move-in date + desired lease length? | date + select (`6m \| 12m \| 24m`) | dossier `submittedAt` context + future `Agreement.startDate/endDate` |
| 5.12 | Why are you leaving your current residence? | text | dossier `reviewerNotes` |
| 5.13 | References — current landlord + professional references (name, phone, email)? | text list | dossier `reviewerNotes` |
| 5.14 | Screening consent — credit, background, eviction check? | checkbox (required) | `UserKyc.status` / agreement consent |
| 5.15 | Have you ever broken a lease? | boolean + explanation | dossier `reviewerNotes` |
| 5.16 | Have you ever been formally evicted or asked to leave? | boolean + explanation | dossier `reviewerNotes` |
| 5.17 | How long have you lived at your current residence? | select | dossier `yearsInEmployment` analogue |

#### 5e. Legal & Security

| # | Question | Type | Storage |
|---|----------|------|---------|
| 5.18 | Is there anything I should know before the formal background/credit check? | text (honesty disclosure) | dossier `reviewerNotes` |
| 5.19 | Can you provide your NIN for identity verification? | covered in Step 3 | `idType=nin`, `idVerified` |
| 5.20 | Who is your emergency contact (name, phone, relationship)? | text + tel | dossier `guarantor*` extended / `emergencyContact` JSON |

**Submission**: `POST /api/onboarding/rental-application/submit` → `rental_application_dossiers.status='submitted', submittedAt=now()`. Later copied into `Application{screeningStatus, guarantorData, applicantDocuments}` via `applyDossierToApplication()` — tenant never re-enters the dossier. Address/prefs: `GET|PATCH /api/onboarding/rental-application` (`addressLine1/2`, `city`, `preferredListingType`, `monthlyBudget`).

**Completion**: `POST /api/onboarding/complete` → `users.onboardingStatus='completed'`, `user_onboardings.status='completed'`, tenant `profileCompleted=true`, `onboardingCompletedAt=now()`.

---

## 4. Landlord — 3 Steps

Identical Steps 1–3 only. No employment/guarantor. Completes to `/dashboard/landlord`. Property verification is separate (`Verification{listingId, l1..l5}`).

Additional landlord-specific fields (collected post-onboarding, not gating):
- `agentAreas` (managed areas), `agentBio`, `agentTier`
- Property portfolio via `Listing`, `Unit`, `Organisation`

---

## 5. Agent — 3 Steps + Business Check

Identical Steps 1–3. After identity, the existing `/dashboard/agent/onboarding` 5-layer Verification runs. Fields `agentTier` / `agentApproved` / `agentBio` / `agentAreas` checked thereafter. Completes to `/dashboard/agent`.

Post-onboarding business verification:
- `BusinessProfile`, `BusinessVerification`, `AgentLicense{board, status}`

---

## 6. Estate Manager — 3 Steps

Identical Steps 1–3. Manages facility ops, service charges, turnover — portfolio/turnover tasks are post-onboarding under `src/app/dashboard/estate-manager/*`. Completes to `/dashboard/estate-manager`.

---

## 7. Admin — 0 Steps

Exempt (`ROLE_STEPS={admin:[]}`). Never gated, never shown the wizard. Only grantable via admin-guarded change-role route.

---

## 8. Wizard + Gate Contract

- `/onboarding` renders the full-page wizard (current placeholder `Welcome → Profile → Complete` writing only to `unsafeMetadata` is replaced by `OnboardingWizard.tsx`).
- Gate renders the **same** steps as a centred non-dismissable modal (`Modal: open, onOpenChange={()=>{}} , showClose=false, closeOnOverlayClick=false, closeOnEscape=false`) with `OnboardingGate → OnboardingWizard(embedded=true)` mounted once in `DashboardShell→TenantRailShell`. Sign out is the only escape.
- Styling: HTML reference uses `primary #006c49 / primary-container #10b981 / surface #fbf8fc / tertiary #bf0715` with Inter + Material Symbols Outlined — reconcile with shipped dark bichrome (`#09090b / #10b981 / zinc`), pick one.
- Role switcher: `Tenant (5 Steps)` vs `Landlord / Agent (3 Steps)` pill; stepper respects `ROLE_STEPS[role] ?? []`; `accountant/` on disk has no `UserRole` → safe `[]`.
- Re-check on every `POST /api/onboarding/location`, `409 PHONE_IN_USE`, `409 ID_IN_USE`, BigInt as string, `403 ONBOARDING_REQUIRED` only on write endpoints.

---

## 9. Database & Infra

- Supabase: `DATABASE_URL` pooled `:6543?pgbouncer=true` + `DIRECT_URL` direct `db.<ref>.supabase.co:5432?sslmode=require`.
- Migration `20261027150000_add_user_onboarding_and_jurisdiction` must be applied — verified via `42P07` then `42703` errors until repaired.
- Seed: `prisma/seed-countries.ts` now imports `NIGERIAN_STATES` from `src/lib/locations/nigeria-states.ts` (37) via `seedCountriesAndJurisdictions()`. `npm run db:seed` seeds countries + jurisdictions.
- Env: `ENCRYPTION_KEY` (≥32 chars, `openssl rand -base64 32`) required for `/identity`, otherwise throws.

---

## 10. Open Questions (non-blocking — code ready)

- `ENCRYPTION_KEY` — must be set.
- Which `Country.active` beyond `NG`? GH/BJ/GB/IT seeded `active:false` ("Coming soon") — live is a data task.
- Should `estate_manager` ever require employment? Currently no.
