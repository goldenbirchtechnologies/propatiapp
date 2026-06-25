# Nigerian Tenancy Law Compliance — Agreement Template Redesign Plan

## 1. Gap Analysis: Current Templates vs. Lagos State Tenancy Law 2011 & General Nigerian Tenancy Law

### 1.1 Current State Summary

| File | Role | Observations |
|------|------|--------------|
| `src/lib/agreement-templates.ts` | HTML templates (rental, sale, short_let, share) | Minimal terms; no statutory notices; share falls back to residential template. |
| `src/lib/pdf-generator.ts` | PDF generation via pdfkit + Cloudinary | Mirrors HTML template clauses; no statutory enhancements. |
| `src/lib/agreement-service.ts` | AgreementService (generate + render) | No branch logic for state-specific schedules; no extra data required for statutory clauses. |
| `src/lib/validators.ts` | Zod schemas for agreements | No validation for noticePeriodDays thresholds or stamp duty flagging. |
| `src/app/api/agreements/route.ts` | REST API | Straight passthrough; no compliance guardrails. |
| `prisma/schema.prisma` | AgreementType enum + Agreement model | Model supports needed fields but does not enforce compliance fields (e.g., `listing.state` for jurisdiction). |

### 1.2 Missing Statutory Provisions (Lagos State Tenancy Law 2011 & General Nigerian Tenancy Law)

| Required Provision | Lagos Tenancy Law 2011 / Nigerian Law Basis | Current Coverage |
|---------------------|--------------------------------------------|----------------|
| Quiet Enjoyment | Implied statutory right: tenant’s right to peaceful enjoyment without landlord interference. | ✗ Absent |
| Statutory Notice Requirements | Service of notice — prescribed forms/methods (written delivery, demand acknowledgment). | ✗ Absent |
| Landlord Notice to Quit | 6 months’ notice for 1-year+ tenancy; 1 week for license-type tenancies (short-let). | ✗ Absent |
| Tenant Notice to Landlord | Proportional notice periods by tenancy type. | Partially (custom days only) |
| Rent Increase Procedure | Written notice of increase; method of notice; 7-day objection window in some contexts. | ✗ Absent |
| Distress-for-Rent Safeguards | Rent must be in arrears; proper distraint; prohibition of self-help/self-eviction. | ✗ Absent |
| Anti-Harrassment Clause | Landlord/agent cannot forcibly evict, cut utilities, or harass tenant. | ✗ Absent |
| Governing Law, Venue, Statutory Citation | Express clause citing Lagos State Tenancy Law 2011 AND/OR relevant state statute + contract law. | ✗ Absent |
| Service Charge Limitation | Service charge not to exceed agreed amount without tenant consent; annual accounting. | ✗ Absent |
| Habitation Standards / Repair | Duty to keep premises fit for habitation; latent defects; emergency repair notice. | ✗ Absent |
| State-Specific Tenancy Law References | Multiple states have statutes — template must detect listing state and render appropriate clause set. | ✗ Absent |
| Head-of-Tenancy vs Sub-Tenant Distinction | “Share” agreements must clarify who holds head tenancy; indemnification; head-tenant obligations flow-down. | ✗ Absent |
| Licensed Premise Considerations (short-let) | Short-let is a license, not a lease; no security of tenure; entry rights; guest responsibilities. | ✗ Absent |
| Ownership/Capacity Verification | Seller must prove title and capacity to transfer; buyer can inspect title. | ✗ Minimal |
| Property Condition (sale) | Condition and liability for latent defects transfer on completion. | ✗ Absent |

## 2. Risk Tier Model

| Tier | Agreements | Thresholds | Required Safeguard |
|------|------------|------------|-------------------|
| Self-Serve | `share` (single room, head-tenant provided, verified), `short_let` under 14 days with verified host and < ₦500,000 annualized | Short-let: ≤14 nights OR annualized < ₦500k; Share: verified head-tenant, single unit | Automated generation + simple disclosure + digital signatures. Prompt: “Not legal advice.” |
| Lawyer Review Required | `rental` (all), `sale` (all), `short_let` above threshold, `share` where head-tenant is unverified or multi-room | Any rental; any sale; short-let >14 nights OR ≥ ₦500k annualized; share without verified head-tenant | Front-end flag; stamp-duty readiness; mandatory checklist (C of O, survey plan, tax compliance); escrow suggested; jurisdiction-specific statutory clauses included; “Review recommended” banner on PDF. |

> Implementation: Add `riskTier` enum (`self_serve` | `review_required`) to Prisma Agreement model (+ corresponding schema + API validation). Render different footer/watermark + clause depth based on tier.

## 3. Redesigned Template Specifications

### 3.1 Contract-Level Metadata (All Templates)

Every agreement must render:
- **Parties & capacity**: full names, ID numbers (NIN or BVN-last-4 masked), email, phone, CAC number where relevant.
- **Property Details**: title, address, area, state, property type, survey plan/C of O reference if available.
- **Financial Terms**: rent, deposit, service charge, payment schedule, escalation mechanism.
- **Term**: start, end, renewal mechanism.
- **Signature Blocks**: landlord, tenant, agent (if any), witness for lawyer-review tier.
- **Stamp Duty Endorsement**: electronic certificate block + statutory reference (“Stamp Duties Act, CAP S8, LFN 2004”).
- **Governing Law/Venue**: “This agreement is governed by the laws of the Federal Republic of Nigeria and, where applicable, the Tenancy Law of [State] [Year]. The parties submit to the exclusive jurisdiction of the courts of [State].” — included in all templates.

### 3.2 Statutory Clauses by Agreement Type

#### Rental (Residential & Commercial — nullified distinction collapsed to one template, propertyUse tag distinguishes)
- **Preamble**: reference to Tenancy Law of [Listing State].
- **Definitions**: “Landlord,” “Tenant,” “Premises,” “Service Charge.”
- **Quiet Enjoyment**: Tenant’s right to peaceful occupation without interference.
- **Rent**: mode of payment; consequences of default ( late fee cap — no more than 10% of monthly rent OR court-determined rate). Procedure to lawfully demand rent.
- **Caution Deposit**: held in interest-bearing account (recommended); itemized deductions only; return within statutory period.
- **Service Charge**: limitation clause; may only be varied by written agreement; annual reconciliation.
- **Maintenance & Habitation**: landlord’s duty to keep premises structurally sound, weatherproof, with essential services (water, electricity, sewage); tenant’s duty to notify landlord of defects.
- **Assignment & Subletting**: prohibition by default; landlord may consent in writing.
- **Rent Increase**: written notice required; notice period aligns with tenancy duration.
- **Termination & Notice**: statutory notice periods by payment schedule (monthly = 1 month notice by landlord; 1 week by tenant; by landlord if tenant in arrears for prescribed period).
- **Distress-for-Rent / Recovery**: landlord may exercise only via court order; self-help eviction prohibited; anti-harrassment clause; notice to quit procedure.
- **Revocation of Tenancy / Re-entry**: grounds and procedure for landlord re-entry.
- **Stamp Duty**: obligation to pay; embedded certificate block.
- **Governing Law & Venue**: as above.
- **Special Clauses**: user-supplied.

#### Sale (Freehold / Land + Building)
- **Parties & Capacity**: seller’s right to sell; confirm not under incapacity/restriction.
- **Property Description**: address, title type (C of O, Governor’s Consent, Deed of Assignment), survey plan number.
- **Title Warranties**: seller warrants good title, free from encumbrances (unless disclosed), power to sell.
- **Purchase Price & Deposit**: deposit held by stakeholder (lawyer/escrow).
- **Completion**: transfer date; condition of property on completion.
- **Latent Defects**: latent defects liability survives completion (e.g., 90 days).
- **Risk**: passes on completion; insurance obligation for interim period.
- **Closing Conditions**: tax clearance, governor’s consent (if applicable), execution of deed.
- **Governing Law**: federal contract law + relevant state Property and Conveyancing law + Land Use Act.
- **Dispute Resolution**: negotiation → mediation → litigation (venue).
- **Stamp Duty**: embedded certificate block.

#### Short-Let (License to Occupy)
- **License Nature**: explicitly states this is a license, not a tenancy; revocable on expiry; no security of tenure beyond stated dates.
- **Check-in/out Times**: enforcement rights for early arrival/late departure.
- **House Rules**: noise, smoking, maximum occupancy, parties, pets.
- **Damage & Cleaning**: liability for damages; cleaning fee schedule; deposit.
- **Host Access**: host may access for maintenance/safety with notice (except emergencies).
- **Force Majeure / Cancellation**: cancellations due to natural disasters, government restrictions, pandemics — refund rules.
- **Governing Law & Venue**: Nigeria.

#### Share (Room in shared dwelling)
- **Head-of-Tenancy Identification**: identify head tenant (master tenant) and sub-tenant; confirmation that head tenant holds valid written tenancy from landlord for the demised property.
- **Landlord Consent**: evidence that landlord/head landlord has consented to subletting/sharing (or that head tenant has authority to license).
- **Shared Facilities & Common Areas**: rules, cleaning rota, utility split methodology.
- **Deposit**: sub-tenant deposit held in trust by head tenant; refund process.
- **Termination**: head tenant’s right to terminate main tenancy triggers sub-tenancy termination; statutory notice must pass through.
- **Head Tenant Obligations**: ensures premises remain habitable; passes through notice requirements; not to assign/sublet further without sub-tenant consent.
- **Governing Law & Venue**: Nigeria.

### 3.3 Risk Tier Implementation in Templates

- `self_serve` templates append an advisory banner: *“This document was generated automatically and is for informational purposes only. It does not constitute legal advice. Please consult a qualified legal practitioner before relying on it.”*
- `review_required` templates append: *“PROPATI recommends independent legal review of this agreement. Use of this document without such review is at your own risk. Stamp duty and registration requirements may apply.”*
- Tier also influences verification requirement: `review_required` agreements must go through enhanced verification (e.g., DOCUMENT_VERIFIED or equivalent).

## 4. Complete File-by-File Change List

### 4.1 `prisma/schema.prisma`
- **Add field** `riskTier` to `Agreement` model (default `review_required`).
- **Add field** `jurisdictionState` to `Agreement` (default from listing `state`).
- **Add field** `governingStatute` String? to `Agreement`.
- **Migration** required.

### 4.2 `src/lib/validators.ts`
- Update `createAgreementSchema`:
  - Add `riskTier: z.enum(['self_serve','review_required']).default('review_required')`
  - Add `jurisdictionState: z.string().min(2).optional().default('Lagos')`
  - Add `governingStatute: z.string().optional()`
- Add validation:
  - `rentAmount` threshold checks to auto-suggest stamp duty threshold (link to stamp-duty module).
  - If `type === 'short_let'`, cap `endDate - startDate` to configured policy days (e.g., 90) unless override by admin.
  - If `type === 'share'`, require `headTenantVerified: boolean`.

### 4.3 `src/lib/agreement-templates.ts`
- **Replace** `AgreementTemplateData` interface with enriched data shape (see `AgreementTemplateDataV2` below).
- **Implement** `residentialRentTemplate`, `commercialRentTemplate`, `shortLetTemplate`, `saleAgreementTemplate`, `shareAgreementTemplate` (decoupled from residential).
- **Add** `renderStatutoryClauses({ state, type, riskTier, extraParams })` helper.
- **Utility functions**: `renderQuietEnjoyment`, `renderNoticeRequirements(state)`, `renderRentIncrease(state)`, `renderDistressSafeguards(state)`, `renderAntiHarrassment`, `renderGoverningLaw(state)`, `renderServiceChargeLimitation`, `renderHabitationStandards`, `renderHeadTenancyDistinction`, `renderLicensedPremiseClauses`, `renderTitleWarranties`, `renderLatentDefects`, `renderStampDutyEndorsement`.

### 4.4 `src/lib/agreement-service.ts`
- **Update** `GenerateAgreementParams`:
  - Add `riskTier`
  - Add `jurisdictionState`
  - Add `governingStatute`
  - Add `headTenantVerified` (for share)
- **Update** `generateAgreement`:
  - Enrich `templateVars` with statutory context.
  - Validate short-let duration limits; enforce/minimum notice periods for rental.
- **Update** `renderAgreement`:
  - Pass enriched `templateData` (including risk tier, state, statutory flags).

### 4.5 `src/lib/pdf-generator.ts`
- **Update** `buildAgreementPDFBuffer`:
  - Include statutory clauses sections.
  - Include tier-specific banners.
- **Update** `templateData` typing (align with V2 shape).
- **Update** PDF HEADER/FOOTER with agreement type, risk tier, statutory citation, generated timestamp, agreement ID, PROPATI verification badge.

### 4.6 `src/app/api/agreements/route.ts`
- **GET**: include new fields (`riskTier`, `jurisdictionState`, `governingStatute`) in response payload.
- **POST**:
  - Accept and persist new fields via schema.
  - Add compliance checks:
    - If `type === 'short_let' && duration > policyMax`, reject or require `review_required`.
    - If `type === 'share'`, require `headTenantVerified` boolean.
    - If `type === 'sale' && amount > threshold`, require `review_required` (e.g., ₦50M for enhanced due diligence).
    - Auto-calculate and store `jurisdictionState` from listing.
- **Notifications**: Update notification text to mention compliance status (e.g., “requires lawyer review” vs “self-serve”).

### 4.7 `src/app/dashboard/[role]/agreements/new/page.tsx`
- **Add** form fields:
  - Risk tier (auto-set based on dtype + values, allow override only for admin).
  - Jurisdiction state (default to listing state).
  - Head tenant verification checkbox (share).
  - Lawyer review check/uncheck UI.
  - Statutory clause preview toggle.
- **Validation**: inline feedback when clause is auto-mandatory (e.g., distress-for-rent always present).

### 4.8 `src/components/agreements/preview.tsx`
- Re-render preview with statutory clauses + tier banner + jurisdiction badge.

### 4.9 `src/lib/navigation.tsx`, `src/components/layout/sidebar.tsx`
- Add “Agreement Compliance” or “Lawyer Review Queue” navigation item for admin/legal.

### 4.10 `prisma/seed.ts`
- Update seed to assign varied agreement types (including sale, share, short-let scenarios) plus `riskTier` values.

### 4.11 `src/lib/stamp-duty.ts`
- No breaking changes needed; ensure `calculateStampDuty` is invoked automatically for `review_required` and high-risk sale/short-let agreements.

## 5. Example AgreementTemplateDataV2 Interface (Proposed)

```ts
export interface AgreementTemplateDataV2 {
  agreementId: string;
  agreementDate: string;
  listingTitle: string;
  listingArea: string;
  listingState: string;
  listingAddress: string;
  propertyType: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  agentName: string;
  agentEmail: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  rentPeriod: string;
  cautionDeposit: string;
  serviceCharge: string;
  noticePeriodDays: number;
  specialClauses: string;
  stampDuty?: StampDutyEndorsement;
  governingLaw: string;
  jurisdictionState: string;
  governingStatute: string;
  riskTier: 'self_serve' | 'review_required';
  propertyUse: 'residential' | 'commercial' | 'short_let' | 'share';
  headTenantVerified?: boolean;
}
```

## 6. Implementation Sequence

1. **Schema migration** — add Agreement fields (`riskTier`, `jurisdictionState`, `governingStatute`).
2. **Validators + API** — accept/persist new fields; add compliance rules.
3. **Templates** — deploy new templates for rental, sale, short-let, share with statutory clauses.
4. **PDF + AgreeementService** — wire in new data and statutory rendering.
5. **UI** — forms + preview + navigation.
6. **Seed + manual QA** — create sample agreements and verify output HTML/PDF.
7. **Rollout** — feature flag template version so clients on old drafts are unaffected until explicitly regenerated.

## 7. Regulatory Citations to Embed in Templates

- Lagos State Tenancy Law 2011.
- Stamp Duties Act, CAP S8, Laws of the Federation of Nigeria 2004.
- Land Use Act, Cap L5, LFN 2004 (title/sale provisions).
- Federal Government guidelines on anti-harassment of tenants (as applicable).
- Federal Competition and Consumer Protection Act — where habitability is framed as implied condition.

---

*Plan prepared for Propati engineering team. Next step: review with legal counsel and migrate Prisma schema.*
