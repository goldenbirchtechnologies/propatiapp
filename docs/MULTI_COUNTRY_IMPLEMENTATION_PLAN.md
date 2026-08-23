# PROPATI — Multi-Country Implementation Plan
Platform-first, jurisdiction-second. Nigeria pilot. Five-country capable from day one.

## Strategic Principles
- Global core owns only universal concerns: users, orgs, listings, payments ledger, documents, messages, agreements, disputes, notifications.
- Country modules own local concerns: payments, tax, verification, document templates, compliance rules, navigation.
- Nigeria is Tier 1 (complete). Ghana + Benin are Tier 2 (natural reuse). UK + Italy are Tier 3 (harder, prove abstractions).
- Build the platform for five countries. Build detailed legal/compliance implementations progressively.
- No Nigerian assumptions in core tables: no Nigerian state enums, no Nigerian phone regex in core, no NGN-only currency.

## Phase 0 — Foundation (1–2 weeks, before Nigeria go-live)
Goal: Cheap columns and interfaces that make future expansion possible without schema surgery.

### Tasks
1. **Schema: country/jurisdiction tables**
   - Add `countryId` (FK to `Country.code`) to: `User`, `Organisation`, `Listing`, `Agreement`, `Invoice`, `Payment`.
   - Add `jurisdictionId` (FK to `Jurisdiction.id`) to: `Listing`, `Agreement`, `LegalMatter`.
   - Create `Country` table: `code` (ISO 3166-1 alpha-2, PK), `name`, `currency` (ISO 4217), `locale`, `timezone`, `active` (boolean, default false).
   - Create `Jurisdiction` table: `id` (UUID), `countryId` (FK), `name`, `level` (`national` | `state` | `province`), `code`, `metadata` (JSON, for England/Scotland variants), `active`.
   - Create `LegalMatter` table: `id` (UUID), `jurisdictionId` (FK), `countryId` (FK), `type` (`tenancy` | `sale` | `dispute` | `compliance`), `parties` (JSON), `propertyId` (FK), `listingId` (FK), `agreementId` (FK nullable), `status` (JSON), `deadlines` (JSON), `actions` (JSON), `approvals` (JSON), `evidence` (JSON), `createdAt`, `updatedAt`.
   - Seed `Country` with: NG, GH, GB, BJ, IT (all `active = false` except NG).
   - Seed `Jurisdiction` with Nigeria states + FCT.
   - Backfill `countryId = 'NG'` and `jurisdictionId` for existing Nigeria data.

2. **Schema: remove Nigerian assumptions**
   - If `Listing.state` is an enum of Nigerian states, rename to `region` (text) and add `jurisdictionId`.
   - If `Agreement.type` is Nigerian-only, convert to lookup table `AgreementType` (`id`, `countryId`, `code`, `name`, `active`).
   - Ensure `User.phone` is stored as E.164 text, validated per country module.
   - Ensure all monetary fields have explicit `currency` column or derive from `country.currency`.

3. **Interfaces: pluggable services**
   - Create `src/lib/interfaces/payment.ts` — `PaymentProvider` interface.
   - Create `src/lib/interfaces/tax.ts` — `TaxEngine` interface.
   - Create `src/lib/interfaces/verification.ts` — `VerificationProvider` interface.
   - Create `src/lib/interfaces/legal.ts` — `LegalEngine` interface.
   - Create `src/lib/interfaces/documents.ts` — `DocumentRenderer` interface.
   - Create `src/lib/interfaces/notifications.ts` — `Notifier` interface.

4. **Country module: Nigeria (ng)**
   - Create `src/lib/countries/ng/index.ts` — exports all Nigeria implementations.
   - Move `stamp-duty.ts` to `src/lib/countries/ng/tax.ts` implementing `TaxEngine`.
   - Move Nigerian verification logic to `src/lib/countries/ng/verification.ts` implementing `VerificationProvider`.
   - Move Nigerian agreement clauses to `src/lib/countries/ng/agreements.ts` implementing `LegalEngine`.
   - Move Paystack client to `src/lib/countries/ng/payment.ts` implementing `PaymentProvider`.
   - Move Nigerian PDF templates to `src/lib/countries/ng/documents.ts` implementing `DocumentRenderer`.
   - Update core to import from `CountryModuleRegistry` instead of direct paths.

5. **Country module registry**
   - Create `src/lib/countries/registry.ts` — `CountryModuleRegistry` mapping `countryCode → module exports`.
   - Create `src/lib/countries/resolver.ts` — `resolveCountryModule(countryCode)` with fallback to Nigeria or null.

6. **Full country list**
   - Create `src/lib/countries.ts` with:
     - `CountryCode` type (all ISO 3166-1 alpha-2 codes).
     - `SUPPORTED_COUNTRIES: CountryCode[] = ['NG', 'GH', 'GB', 'BJ', 'IT']`.
     - `Country` interface and `COUNTRIES` array (~250 entries with name, phonePrefix, currency, locale).
   - Create `/coming-soon` page for unsupported countries with email capture.

7. **Registration gating**
   - Update signup form to include country dropdown (all countries from `COUNTRIES`).
   - On submission: if `!SUPPORTED_COUNTRIES.includes(countryCode)`, redirect to `/coming-soon?country={code}`.
   - Store selected `countryId` on `User` and `Organisation` during creation.

8. **Dashboard guard**
   - Update `(dashboard)/layout.tsx` or role-specific layouts to check `SUPPORTED_COUNTRIES.includes(user.countryCode)`.
   - If unsupported, render `<RegionNotAvailable />` component instead of dashboard chrome.

### Acceptance Criteria
- `npm run test` passes (60/60).
- `npx prisma generate` passes.
- `npx tsc --noEmit` passes.
- Nigeria product works identically to before (no behavior change).
- Signup with `countryCode = 'US'` redirects to `/coming-soon?country=US`.
- Signup with `countryCode = 'NG'` proceeds normally.
- Dashboard shows “coming soon” for users with unsupported `countryCode`.

---

## Phase 1 — Nigeria Go-Live (current priority, 4–8 weeks)
Goal: Complete, compliant Nigerian product.

### Tasks
- Landlord dashboard: properties, units, listings, agent invites, agreements, payments, maintenance.
- Tenant dashboard: search, apply, agreements, payments, messages, disputes.
- Agent dashboard: listings, clients, invitations.
- Admin dashboard: users, listings, disputes, reports, verification queue.
- Payment flows: Paystack charges, webhooks, HMAC validation.
- Document generation: Nigerian tenancy agreements with FIRS e-stamping.
- Notifications: email, SMS, WhatsApp.
- Verification: Prembly integration.

### Acceptance Criteria
- End-to-end tenancy flow works for Nigeria.
- Production deploy on Vercel + Supabase + Clerk + Paystack.

---

## Phase 2 — Country Module Framework (2–3 weeks, post-Nigeria go-live)
Goal: Prove that adding a country is a module build, not a platform rebuild.

### Tasks
1. `CountryModule` interface fully defined and typed.
2. Module loader with fallback.
3. Admin UI for managing `Country`, `Jurisdiction`, `LegalMatter`.
4. `CountryCapability` table: tracks which features are live per country.
5. Feature flags per country in UI.

### Acceptance Criteria
- Admin can create a Ghana user, assign to Ghana listing, and see “Payments coming soon for Ghana” in UI.

---

## Phase 3 — Tier 2 Expansion (Ghana + Benin, 3–4 weeks each)
Goal: Natural African expansion with high code reuse.

### Ghana
- Currency: GHS
- Payment: Paystack (same provider, different currency/account)
- Tax: simplified calculation
- Verification: Ghana Card API
- Documents: Ghana tenancy templates, English
- Phone: +233 validation

### Benin
- Currency: XOF
- Payment: Paystack or local provider
- Tax: simplified calculation
- Documents: French-language templates
- Phone: +229 validation

### Acceptance Criteria
- Ghana landlord can list, collect rent in GHS, generate agreement, verify tenant.

---

## Phase 4 — Tier 3 Expansion (UK + Italy, 4–6 weeks each)
Goal: Prove platform handles developed-market regulatory complexity.

### United Kingdom
- Payment: Stripe + GoCardless
- Tax: SDLT calculator
- Verification: Right-to-Rent, EPC, gas safety, deposit protection (TDS)
- Documents: AST templates, break clauses
- Workflow: deposit protection, Section 8/21 notices, EPC renewal

### Italy
- Payment: SEPA direct debit, Stripe
- Tax: Italian registration tax, IRPEF withholding
- Verification: Italian fiscal code
- Documents: Italian lease contracts, cedolare secca
- Workflow: lease registration, rent review, eviction
- Language: Italian locale

### Acceptance Criteria
- UK landlord can list, collect rent via direct debit, generate AST, register deposit with TDS.

---

## Phase 5 — Rules Engine (6–8 weeks, after 2 countries live)
Goal: Turn accumulated legal logic into data-driven rules.

### Tasks
1. `JurisdictionRule` table: ruleType, conditions (JSON), actions (JSON), priority, effectiveDate, expiryDate.
2. `ComplianceEvent` table: legalMatterId, eventType, deadline, status, assignedTo.
3. `DocumentTemplate` table: countryId, jurisdictionId, propertyType, tenancyType, version, templateSchema (JSON), mandatoryClauses (JSON).
4. Rules evaluator: `evaluateRules(jurisdiction, matterType, context) → requiredActions[]`.
5. Template renderer: `renderTemplate(templateId, context) → PDF`.
6. Admin UI for managing rules and templates without code deploys.

### Acceptance Criteria
- New compliance requirement can be added by inserting a `JurisdictionRule` record, not by deploying code.

---

## File Map (Phase 0)
```
prisma/schema.prisma              # Add Country, Jurisdiction, LegalMatter; add countryId/jurisdictionId FKs
src/lib/countries.ts              # Full ISO country list + SUPPORTED_COUNTRIES
src/lib/countries/registry.ts     # CountryModuleRegistry
src/lib/countries/resolver.ts     # resolveCountryModule()
src/lib/countries/ng/index.ts     # Nigeria module exports
src/lib/countries/ng/tax.ts       # Stamp duty (from stamp-duty.ts)
src/lib/countries/ng/verification.ts
src/lib/countries/ng/agreements.ts
src/lib/countries/ng/payment.ts
src/lib/countries/ng/documents.ts
src/lib/interfaces/               # PaymentProvider, TaxEngine, etc.
src/app/coming-soon/page.tsx      # Unsupported country page
src/app/sign-up/actions.ts        # Country gating on registration
src/app/(dashboard)/dashboard/[role]/layout.tsx  # Region guard
```

## Decision Gates
| Gate | Criteria |
|------|----------|
| Phase 0 complete | Tests pass, Nigeria works, countryId columns exist, registry loads NG module |
| Nigeria go-live | End-to-end tenancy works, production deploy |
| Phase 2 complete | Can register non-Nigeria country and see feature flags |
| Ghana launch | 10+ paying landlords, end-to-end GHS flows |
| UK launch | 10+ paying landlords, Stripe + SDLT + AST + deposit protection |
| Rules engine | Two countries live, tired of hardcoding rules |

## What Not to Do
- Don’t build the `JurisdictionRule` rules engine before Nigeria is live.
- Don’t build UK/Italy modules before you have paying users asking for them.
- Don’t multi-language the UI until you launch a non-English market.
- Don’t add per-country Supabase projects or read replicas until you have traffic justifying it.

## Immediate Next Steps (This Week)
1. Review this plan.
2. Approve Phase 0 schema changes.
3. Begin Phase 0 Task 1: add `Country`, `Jurisdiction`, `LegalMatter` tables + `countryId` columns.
4. Begin Phase 0 Task 3: create `src/lib/interfaces/`.
5. Begin Phase 0 Task 4: create `src/lib/countries/ng/` and move Nigerian logic.
6. Begin Phase 0 Task 6: create `src/lib/countries.ts` with full country list.
