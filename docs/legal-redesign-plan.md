# Propati Legal Dispute Routing & Agreement Review — Redesign Plan

## 1. Executive Summary

Redesign the existing `law firm` feature into a **legitimate Nigerian legal dispute routing and agreement review system**. This plan addresses the six critical problems in the current codebase:

1. No separation between legal and non-legal disputes
2. CAC-only verification is insufficient for Nigerian legal practice
3. No client consent before lawyer engagement
4. No conflict-of-interest checks
5. No scope / fee structure
6. Pagstack chargebacks shouldn't auto-route to lawyers

---

## 2. Schema Changes (`prisma/schema.prisma`)

### 2.1 Revised Enums

```prisma
enum DisputeType {
  tenancy_non_delivery          // Landlord fails to deliver possession
  tenancy_habitability          // Structural / sanitary defects
  tenancy_illegal_eviction      // Self-help / forceful eviction
  tenancy_rent_dispute          // Illegal rent hike / overcharge
  tenancy_utility_dispute       // Failure to provide agreed utilities
  tenancy_security_deposit      // Wrongful withholding of deposit
  tenancy_disturbance           // Nuisance / harassment
  sale_agreement_breach         // Breach of sale-of-land agreement
  sale_fraudulent_misrepresentation
  sale_title_dispute
  sale_payment_dispute
  paystack_chargeback           // Payment processor disputes (NO auto-route)
  other
}

enum DisputeStatus {
  open
  investigating
  routed
  consent_required
  consent_granted
  conflict_check
  engaged
  mediated
  resolved
  closed
}

enum LawyerVerificationStatus {
  pending
  under_review
  verified
  rejected
  suspended
}

enum EngagementType {
  full_representation
  advisory_only
  document_review
  limited_scope
}

enum EngagementStatus {
  draft
  sent_to_client
  consent_pending
  consent_rejected
  consent_accepted
  active
  completed
  withdrawn
}

enum ConflictCheckStatus {
  not_checked
  clear
  conflict
  waived
}
```

### 2.2 Revised `LawFirm` → `LawFirm` (renamed fields, added verification)

```prisma
model LawFirm {
  id                    String                @id @default(cuid()) @map("id") // 'lf_' + 12 chars
  name                  String
  cacNumber             String                @unique @map("cac_number")
  email                 String
  phone                 String?
  address               String?
  billingEmail          String?               @map("billing_email")
  jurisdiction          Json                  // ["Lagos", "Ogun", "Oyo", ...]
  verified              Boolean               @default(false)
  verificationStatus    LawyerVerificationStatus @default(pending) @map("verification_status")
  callToBarNumber       String?               @unique @map("call_to_bar_number")
  yearOfCall            Int?
  nbaEnrollmentNumber   String?               @unique @map("nba_enrollment_number")
  nbaEnrollmentYear     Int?                   @map("nba_enrollment_year")
  principalPartnerName  String?                @map("principal_partner_name")
  principalPartnerCall  String?                @map("principal_partner_call_number")
  rating                Decimal?               @db.Decimal(3, 2)
  reviewCount           Int                    @default(0) @map("review_count")
  specializations       Json?                  // ["tenancy", "land_sale", "commercial"]
  feeStructure          Json?                  // default hourly/fixed rates per practice area
  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")

  cases                 LawFirmCase[]
  engagements           Engagement[]
  conflictChecks        ConflictCheck[]

  @@index([verificationStatus], map:"idx_law_firms_verification")
  @@index([callToBarNumber], map:"idx_law_firms_call_to_bar")
  @@map("law_firms")
}
```

### 2.3 New `LawyerProfile` (individual lawyer record)

Link individual counsel to a firm for conflict-of-interest granularity.

```prisma
model LawyerProfile {
  id                  String    @id @default(cuid()) @map("id") // 'lwp_' + 12 chars
  userId              String    @unique @map("user_id")   // optional User link
  lawFirmId           String    @map("law_firm_id")
  fullName            String    @map("full_name")
  email               String
  callToBarNumber     String    @unique @map("call_to_bar_number")
  yearOfCall          Int
  nbaNumber           String?   @unique @map("nba_number")
  nbaYear             Int?
  specializationAreas Json      // ["tenancy", "land_sale", "corporate"]
  isPrincipalPartner  Boolean   @default(false) @map("is_principal_partner")
  isActive            Boolean   @default(true) @map("is_active")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")

  lawFirm             LawFirm   @relation(fields: [lawFirmId], references: [id], onDelete: Cascade)
  conflictChecks      ConflictCheck[]

  @@index([lawFirmId], map:"idx_lawyer_profiles_firm")
  @@map("lawyer_profiles")
}
```

### 2.4 Revised `LawFirmCase`

```prisma
model LawFirmCase {
  id              String          @id @default(cuid()) @map("id") // 'lfc_' + 12 chars
  disputeId       String          @unique @map("dispute_id")
  firmId          String          @map("firm_id")
  status          LawFirmCaseStatus @default(assigned)
  engagementType  EngagementType  @default(limited_scope) @map("engagement_type")
  engagementId    String?         @unique @map("engagement_id")
  feeModel        Json            // {"type":"fixed|hourly|retainer", "amount":..., "currency":"NGN", "scope":"..."}
  conflictCheckId String?         @unique @map("conflict_check_id")
  assignedAt      DateTime        @default(now()) @map("assigned_at")
  resolvedAt      DateTime?       @map("resolved_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  firm            LawFirm         @relation(fields: [firmId], references: [id])
  dispute         Dispute         @relation("DisputeLawFirmCase", fields: [disputeId], references: [id])
  engagement      Engagement?
  conflictCheck   ConflictCheck?

  @@index([firmId], map:"idx_law_firm_cases_firm")
  @@index([status], map:"idx_law_firm_cases_status")
  @@map("law_firm_cases")
}
```

### 2.5 Revised `EvidencePack` (fix relation, add review metadata)

```prisma
model EvidencePack {
  id            String    @id @default(cuid()) @map("id") // 'evp_' + 12 chars
  disputeId     String    @unique @map("dispute_id")
  lawFirmId     String?   @map("law_firm_id")   // FIX: previously pointed to Organisation
  status        String    @default("draft") @map("status") // draft | final | sealed | revoked
  fileUrls      Json      // URLs + checksums
  payments      Json
  messages      Json
  auditLogs     Json
  reviewedByLawyer Boolean @default(false) @map("reviewed_by_lawyer")
  sealedAt      DateTime? @map("sealed_at")
  metadata      Json?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  dispute       Dispute   @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  lawFirm       LawFirm?  @relation(fields: [lawFirmId], references: [id], onDelete: SetNull)

  @@map("evidence_packs")
}
```

### 2.6 New `Engagement` (fee agreement + consent)

```prisma
model Engagement {
  id                  String             @id @default(cuid()) @map("id") // 'eng_' + 12 chars
  caseId              String             @unique @map("case_id")
  type                EngagementType
  status              EngagementStatus  @default(draft)
  scopeOfWork         String             @map("scope_of_work")
  feeModel            Json               // {"type":"fixed|hourly|retainer","amount":...,"currency":"NGN"}
  disbursements       Json?
  estimatedDuration   String?            @map("estimated_duration") // e.g. "4-6 weeks"
  advancePaymentRequired Boolean @default(false) @map("advance_payment_required")
  advancePaymentAmount  Decimal?         @db.Decimal(12,2) @map("advance_payment_amount")
  clientConsentText   String             @map("client_consent_text")
  clientConsentedAt   DateTime?          @map("client_consented_at")
  clientConsentIp      String?            @map("client_consent_ip")
  clientConsentUserAgent String?          @map("client_consent_user_agent")
  lawyerReviewStatus  String             @default("pending") @map("lawyer_review_status") // pending|approved|rejected
  lawyerReviewNotes   String?             @map("lawyer_review_notes")
  lawyerReviewedAt    DateTime?           @map("lawyer_reviewed_at")
  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @updatedAt @map("updated_at")

  case                LawFirmCase       @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@map("engagements")
}
```

### 2.7 New `ConflictCheck`

```prisma
model ConflictCheck {
  id                  String              @id @default(cuid()) @map("id") // 'cck_' + 12 chars
  caseId              String              @unique @map("case_id")
  lawFirmId           String              @map("law_firm_id")
  lawyerProfileId     String?             @map("lawyer_profile_id")
  status              ConflictCheckStatus @default(not_checked)
  adversePartyType    String              @map("adverse_party_type") // landlord|tenant|organisation|user
  adversePartyId      String              @map("adverse_party_id")
  adversePartyName    String              @map("adverse_party_name")
  previousWork        Json?               // prior engagements with adverse party
  conflictRationale   String?             @map("conflict_rationale")
  reviewedByAdminId   String?             @map("reviewed_by_admin_id")
  reviewedAt          DateTime?
  waiverApproved      Boolean             @default(false) @map("waiver_approved")
  waiverApprovedBy    String?             @map("waiver_approved_by")
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")

  case                LawFirmCase          @relation(fields: [caseId], references: [id], onDelete: Cascade)
  lawFirm             LawFirm              @relation(fields: [lawFirmId], references: [id])
  lawyerProfile       LawyerProfile?

  @@index([lawFirmId], map:"idx_conflict_checks_firm")
  @@index([status], map:"idx_conflict_checks_status")
  @@map("conflict_checks")
}
```

### 2.8 New `LawyerDocument` (reviewed agreements)

```prisma
model LawyerDocument {
  id            String    @id @default(cuid()) @map("id") // 'lwd_' + 12 chars
  engagementId  String    @map("engagement_id")
  documentId    String    @map("document_id")
  reviewStatus  String    @default("pending") @map("review_status") // pending|approved|rejected|amended
  lawyerNotes   String?   @map("lawyer_notes")
  redlinedUrl   String?   @map("redlined_url")
  approvedAt    DateTime? @map("approved_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  engagement    Engagement @relation(fields: [engagementId], references: [id], onDelete: Cascade)

  @@unique([engagementId, documentId])
  @@map("lawyer_documents")
}
```

### 2.9 Migration Notes

- Existing `EvidencePack.firmId` relation must be migrated from Organisation to LawFirm (or null).
- Existing `Dispute.type` values must be migrated:
  - `non_delivery` → `tenancy_non_delivery`
  - `misrepresentation` → `sale_fraudulent_misrepresentation`
  - `refund` → `paystack_chargeback`
  - `other` → `other`
- Run a backfill: all disputes with `listingId` and `type` starting with `tenancy_` get `routed` status; sale listings get lawyer-review-gate.

---

## 3. API Contracts

### 3.1 Dispute Routing (new behavior)

#### `POST /api/disputes`
**Request**
```json
{
  "listingId": "string|null",
  "type": "DisputeType",
  "description": "string"
}
```

**Response**
Returns created dispute with new status.

**Routing logic (server-side):**
- `tenancy_*` → status `routed`, auto-create `LawFirmCase` candidate (but NOT assigned until consent)
- `sale_*` → status `consent_required` (lawyer review gate)
- `paystack_chargeback` → status `open` (no lawyer routing; retained for financial dispute resolution)
- `other` → status `open` (manual admin triage)

#### `GET /api/disputes?status=&type=`
Add filter by `legal=true` (any `tenancy_*` or `sale_*`) or `legal=false`.

### 3.2 Law Firm Verification

#### `POST /api/admin/law-firms/verify`
**Auth:** admin only

**Body**
```json
{
  "firmId": "string",
  "callToBarNumber": "string",
  "yearOfCall": 2020,
  "nbaEnrollmentNumber": "string",
  "nbaEnrollmentYear": 2021,
  "principalPartnerName": "string",
  "principalPartnerCall": "string",
  "verified": true
}
```

Response: updated LawFirm with `verificationStatus=verified`.

### 3.3 Lawyer Profiles

#### `POST /api/admin/lawyer-profiles`
#### `GET /api/admin/lawyer-profiles`
#### `PATCH /api/admin/lawyer-profiles/[id]`

Standard CRUD for individual counsel linked to a verified LawFirm.

### 3.4 Conflict Checks

#### `POST /api/admin/conflict-checks`
**Body**
```json
{
  "caseId": "string",
  "lawFirmId": "string",
  "lawyerProfileId": "string|null",
  "adversePartyType": "landlord|tenant|organisation|user",
  "adversePartyId": "string",
  "adversePartyName": "string"
}
```

Logic:
1. Check `LawyerProfile.previousWork` for adverse party.
2. Check `LawFirm` prior cases involving adverse party.
3. Return `clear` or `conflict`.

#### `POST /api/admin/conflict-checks/[id]/waive`
For exceptional situations where conflict is waived in writing.

### 3.5 Engagements

#### `POST /api/law-firm-cases/[id]/engagement`
**Body**
```json
{
  "type": "EngagementType",
  "scopeOfWork": "string (min 20 chars)",
  "feeModel": {"type": "fixed|hourly|retainer", "amount": 500000, "currency": "NGN"},
  "disbursements": "...",
  "estimatedDuration": "4-6 weeks",
  "advancePaymentRequired": false,
  "clientConsentText": "I, ... agree to ..."
}
```

Creates Engagement in `draft`. Admin edits → sends to client.

#### `POST /api/law-firm-cases/[id]/engagement/send`
Moves status to `sent_to_client`.

#### `POST /api/law-firm-cases/[id]/engagement/consent`
**Auth:** client (tennant / landlord)
**Body:** `{ "consented": true }` + IP / UA captured server-side.
- true → `consent_accepted`
- false → `consent_rejected`

#### `PATCH /api/law-firm-cases/[id]/engagement/lawyer-review`
**Auth:** lawyer
Body: `{ "status": "approved|rejected", "notes": "string" }`

### 3.6 Lawyer Agreement Review

#### `POST /api/engagements/[id]/review-agreement`
**Auth:** lawyer
Request: `{ "documentId": "string", "reviewStatus": "approved|rejected", "lawyerNotes": "..." }`
Returns `LawyerDocument`.

#### `GET /api/engagements/[id]/documents`
Returns all reviewed documents with redlines / notes.

---

## 4. UI Flow Changes

### 4.1 User Journey — Tenant raising a Tenancy Dispute

```
1. Renters app: "File Dispute" (tenancy-specific categories)
   └─ Select category: "Habitability", "Non-delivery", etc.
   └─ Describe issue, attach evidence
   └─ Submit

2. System: status = "routed"
   └─ Admin dashboard: new "Routed to Legal" queue
   └─ Admin reviews, selects verified LawFirm
   └─ Creates LawFirmCase (status: assigned)

3. System: auto-generates Engagement (draft)
   └─ Admin fills scope / fee model
   └─ Admin sends to client

4. Client sees "Legal Engagement Proposal" in-app + email
   └─ Reviews scope and fee structure
   └─ Ticks explicit consent checkbox
   └─ Submits

5. System receives consent (status: consent_accepted)
   └─ Lawyer reviews engagement terms
   └─ lawyer_review_status = approved

6. Case status → engaged
   └─ EvidencePack reviewable by lawyer
   └─ Agreement review flow kicks off if sale listing involved

7. Party can freely cancel engagement (with written notice)
   └─ Case status → cancelled (no obligation if consent not given)
```

### 4.2 Admin: Lawyer-Firm Onboarding & Verification

```
/admin/business/law-firms
├─ Firm listing with verificationStatus badges
├─ "Add Firm" form: name, CAC, email, phone, address, jurisdiction
├─ "Verify" drawer/modal:
│  ├─ Call to Bar number + Year
│  ├─ NBA enrollment number + Year
│  ├─ Principal partner name + call number
│  ├─ Upload certificate (call to bar) + NBA card
│  └─ Save → verificationStatus=verified (or rejected)
```

### 4.3 Admin: Conflict-Check Workflow

```
/admin/business/conflict-checks
├─ List of unchecked cases
├─ "Run Check" button:
│  ├─ Fetches tenant/landlord/org details
│  ├─ Flags prior engagements (auto-highlight)
│  └─ Status: clear | conflict
├─ "Waive Conflict" modal (admin + principal partner signature)
```

### 4.4 Agreement Review (Sale Listings)

When a dispute involves a `sale` listing:
1. Engagement `type` defaults to `document_review`
2. Agreement PDF linked to engagement
3. Lawyer sees agreement in dashboard, uploads redlined version or notes
4. Status: `approved | rejected | amended`

---

## 5. Routing Rules Table

| Dispute Type | Auto-route to Lawyer? | Needs Conflict Check? | Needs Client Consent? | Requires Agreement Review |
|---|---|---|---|---|
| `tenancy_non_delivery` | Yes, to tenancy-specialized firm | Yes | Yes | No |
| `tenancy_habitability` | Yes | Yes | Yes | No |
| `tenancy_illegal_eviction` | Yes | Yes | Yes | No |
| `tenancy_rent_dispute` | Yes | Yes | Yes | No |
| `tenancy_utility_dispute` | Yes | Yes | Yes | No |
| `tenancy_security_deposit` | Yes | Yes | Yes | No |
| `tenancy_disturbance` | Yes | Yes | Yes | No |
| `sale_agreement_breach` | Yes (review gate) | Yes | Yes | Yes |
| `sale_fraudulent_misrepresentation` | Yes (review gate) | Yes | Yes | Yes |
| `sale_title_dispute` | Yes (review gate) | Yes | Yes | Yes |
| `sale_payment_dispute` | Yes (review gate) | Yes | Yes | Yes |
| `paystack_chargeback` | **No** | No | No | No |
| `other` | Manual admin triage | If assigned | If assigned | If sale agreement |

### Routing Logic Details

1. **Legal threshold**: Any `tenancy_*` or `sale_*` type triggers legal routing.
2. **High-value / sale gate**: If listing type is `sale` OR amount > 5M NGN → mandatory lawyer document review before case engages.
3. **Non-legal**: `paystack_chargeback` retained by finance/admin; may be escalated manually.
4. **Tenant vs landlord selection**: Route to firm with jurisdiction covering the listing's state; preference for firm with tenancy specialization.

---

## 6. Verification

### 6.1 LawFirm Verification (CAC + NBA)

Before a firm can accept routed disputes:
- CAC registration number (unique)
- Call to Bar number + Year (unique)
- NBA enrollment number + Year (unique)
- Principal partner identified
- Jurisdiction declared

Admin workflow:
1. Upload certificate images (call to bar, NBA card, CAC certificate)
2. Admin verifies against NBA online directory (future integration point)
3. Mark `verified=true`, `verificationStatus=verified`

### 6.2 Individual Lawyer Profile

Optional but recommended for conflict checks:
- Link to User account (if lawyer is platform user)
- Call to Bar number (unique)
- NBA number
- Specializations

---

## 7. Consent

### 7.1 Client Opt-In Flow

No lawyer engagement is active until the **client explicitly consents** in the system.

- Consent text is auto-generated but admin-editable
- Includes: firm name, lawyer(s), scope of work, fee estimate, estimated duration
- Captures: timestamp, IP, user-agent (same as `AgreementSignature` pattern)
- Button: "I agree to engage [Law Firm] for [scope] at [fee estimate]"
- If denied, case goes to `consent_rejected` and is unassigned

### 7.2 Withdrawal

- Either party may withdraw with written notice
- Engagement status → `withdrawn`
- Any advance payment refunded per agreement terms

---

## 8. Conflict-of-Interest Checks

### 8.1 Check Scope

Run whenever a `LawFirmCase` or `Engagement` is drafted:

1. **Adverse party identification**: tenant ↔ landlord ↔ org ↔ referencing user
2. **Firm-level prior work**: search `LawFirmCase` + `Engagement` for same adverse party
3. **Lawyer-level prior work**: search `LawyerProfile` prior engagements

If match found → `conflict` status, admin must:
- Reassign to another firm/lawyer, OR
- Execute written waiver (principal partner + admin sign).

### 8.2 Data Model

Stored in `ConflictCheck` with `clear | conflict | waived`.

---

## 9. Engagement & Fee Model

### 9.1 Fee Structure Options

```json
{
  "type": "fixed|hourly|retainer|contingency",
  "amount": 500000,
  "currency": "NGN",
  "billingFrequency": "monthly|milestone|one_time",
  "disbursements": [
    {"item": "Court filing fee", "estimate": 25000}
  ],
  "nbaMinFeeReference": "..." // optional
}
```

### 9.2 Scope of Work (mandatory)

```json
{
  "scope": "Represent client in tenancy dispute re: 12B Bourdillon Rd. Covers: 1) Legal notice to landlord, 2) Negotiation, 3) Representation at tenancy tribunal if required. Excludes: property sale, criminal matters.",
  "estimatedDuration": "4-6 weeks",
  "deliverables": ["Demand letter", "Settlement agreement", "Tribunal representation"]
}
```

### 9.3 Advance Payment

- Default: no advance required
- Optional: firm may request advance with explicit cap
- Stored in `advancePaymentRequired` + `advancePaymentAmount`

---

## 10. API Validators (Zod)

Add to `validators.commercial.ts`:

```typescript
export const disputeTypeSchema = z.enum([
  'tenancy_non_delivery',
  'tenancy_habitability',
  'tenancy_illegal_eviction',
  'tenancy_rent_dispute',
  'tenancy_utility_dispute',
  'tenancy_security_deposit',
  'tenancy_disturbance',
  'sale_agreement_breach',
  'sale_fraudulent_misrepresentation',
  'sale_title_dispute',
  'sale_payment_dispute',
  'paystack_chargeback',
  'other',
]);

export const createEngagementSchema = z.object({
  type: z.enum(['full_representation', 'advisory_only', 'document_review', 'limited_scope']),
  scopeOfWork: z.string().min(20).max(5000),
  feeModel: z.object({
    type: z.enum(['fixed', 'hourly', 'retainer', 'contingency']),
    amount: z.number().nonnegative(),
    currency: z.string().default('NGN'),
    billingFrequency: z.enum(['monthly', 'milestone', 'one_time']).optional(),
    disbursements: z.array(z.object({
      item: z.string(),
      estimate: z.number().nonnegative().optional(),
    })).optional(),
  }),
  estimatedDuration: z.string().max(100).optional(),
  advancePaymentRequired: z.boolean().default(false),
  advancePaymentAmount: z.number().nonnegative().optional(),
  clientConsentText: z.string().min(20).max(2000),
});
```

---

## 11. Notifications

- **Dispute filed** → Admin + assigned law firm
- **Lawyer assigned** → Client (tenant/landlord)
- **Engagement sent** → Client (email + in-app)
- **Consent granted** → Law firm + admin
- **Lawyer review complete** → Client + admin
- **Conflict detected** → Admin + lawyer (immediate hold)
- **Chargeback filed** → Finance team only (no legal notification)

---

## 12. Admin Dashboard Pages (new structure)

```
/admin/business/law-firms
  ├─ List, Add, Verify, Edit, Delete
  └─ Lawyer Profiles sub-tab

/admin/business/law-firm-cases
  ├─ All Cases
  ├─ Awaiting Consent
  ├─ Conflict Checks
  └─ Engaged

/admin/business/engagements
  ├─ Draft engagements
  ├─ Pending client consent
  └─ Active / Completed

/admin/business/conflict-checks
  ├─ Unchecked
  ├─ Clear
  ├─ Conflict
  └─ Waived
```

---

## 13. Migration Playbook

1. **Schema**: Apply new enums and new models via Prisma migration.
2. **Data backfill**:
   ```sql
   UPDATE disputes SET type = 'tenancy_non_delivery' WHERE type = 'non_delivery';
   UPDATE disputes SET type = 'paystack_chargeback' WHERE type = 'refund';
   -- sale-related 'other' rows to be manually classified by admin
   ```
3. **EvidencePack**: Migrate `firmId` references from `organisations` to `law_firms` (requires mapping business profile orgId → law firm Id or null).
4. **API gate**: Update dispute creation to enforce routing logic.
5. **Frontend**: Add new consent / engagement / conflict UIs.
6. **Feature flag**: Keep old route until migration validated.

---

## 14. Non-Goals (Out of Scope for This Redesign)

- Full integration with NBA online lookup API (manual upload + future integration point)
- Electronic tribunal / court filing integration
- Online legal payment processing (keep Paystack for advance only)
- Multi-jurisdictional international disputes

---

## 15. Acceptance Criteria

- [ ] Disputes of tenancy/sale type never auto-resolve without lawyer engagement
- [ ] No LawFirm can be verified without CAC + Call to Bar + NBA enrollment
- [ ] Client consent is mandatory before any engagement status = active
- [ ] Conflict check runs and is recorded on every engagement
- [ ] Paystack chargebacks do NOT appear in legal routing queues
- [ ] High-value sale agreements require lawyer `document_review` before tenant sees final-ish doc
- [ ] Admin can waive conflicts with written justification
- [ ] Engagement defines explicit scope, fee model, and duration
