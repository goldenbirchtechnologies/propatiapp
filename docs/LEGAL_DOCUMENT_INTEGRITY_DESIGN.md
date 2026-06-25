# Legal Document Integrity & Evidence Packaging — Design Plan

> **Scope:** Court-ready tamper-evident storage, post-sign locking, sealed evidence packs, and cryptographic linkage across agreements, signatures, and stamp duty in the Propati legal operations stack.

---

## 1. Current Gaps (Baseline)

| Area | Gap | Risk |
|------|-----|------|
| **Document storage** | No per-version hash; no chain-link between versions | Cannot detect modification or prove version lineage |
| **Agreement lifecycle** | `fully_signed` status accepted as fact but not enforced; no `finalizedAt`; editable via ORM or admin | Post-sign tampering is possible |
| **Signature integrity** | `AgreementSignature.checksum` hashes only `agreementId:signerId:signedAt` | Does not bind the signature to the *document content* or PDF URL |
| **Stamp duty linkage** | `StampDuty.certificateUrl`/`certificateNumber` is loose; no binding to a specific PDF digest | Certificate could be divorced from the signed document in court |
| **EvidencePack** | `fileUrls`, `payments`, `messages`, `auditLogs` are untyped JSON blobs | No exhibit numbering, no seal hash, no chain-of-custody entries, no sealed immutability |
| **Access audit** | No document-level access log | Cannot show who viewed, downloaded, or printed a sensitive legal document |

---

## 2. Design Principles

1. **Content-addressed integrity:** Every legal artifact is identified first by a SHA-256 digest of its bytes.
2. **Immutable once finalized:** Agreements and sealed packs are cryptographically locked; modifications become new versions.
3. **Verifiable linkage:** A Merkle-style chain links Agreement → Signatures → Stamp Duty → EvidencePack.
4. **Court transparency:** Every state transition is captured as an append-only `EvidenceCustodyEntry`.
5. **Least privilege by default:** `private`/`sealed` access controls enforced at API and storage layers.

---

## 3. Schema Changes

### 3.1 New Enums

```prisma
enum DocumentAccessAction {
  view
  download
  print
  share
}

enum EvidencePackSealStatus {
  draft
  pending_review
  sealed
  revoked
}

enum AgreementLockStatus {
  mutable
  locked
  immutable
}
```

### 3.2 New Models

#### `DocumentVersion`
Adds explicit versioning, file bytes reference, and content hash.

```prisma
model DocumentVersion {
  id            String    @id @default(cuid()) @map("id") // 'dv_' + 12 chars
  documentId    String    @map("document_id")
  version       Int
  url           String
  sizeBytes     BigInt?   @map("size_bytes")
  mimeType      String?   @map("mime_type")
  // SHA-256 hex digest of the uploaded bytes (PDF, PNG, etc.)
  contentHash   String    @map("content_hash")
  // SHA-256 of (previousVersionHash + contentHash + timestamp)
  chainHash     String?   @map("chain_hash")
  // Who approved this version (null for user self-uploads)
  approvedBy    String?   @map("approved_by")
  approvedAt    DateTime? @map("approved_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  document      Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@unique([documentId, version])
  @@index([documentId], map: "idx_doc_versions_document")
  @@index([contentHash], map: "idx_doc_versions_hash")
  @@map("document_versions")
}
```

#### `DocumentAccessLog`
Document-level access audit trail.

```prisma
model DocumentAccessLog {
  id            String               @id @default(cuid()) @map("id") // 'dac_' + 12 chars
  documentId    String               @map("document_id")
  userId        String               @map("user_id")
  action        DocumentAccessAction
  ipAddress     String?              @map("ip_address")
  userAgent     String?              @map("user_agent")
  createdAt     DateTime             @default(now()) @map("created_at")

  document      Document             @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId, userId], map: "idx_doc_access_doc_user")
  @@index([documentId], map: "idx_doc_access_document")
  @@map("document_access_logs")
}
```

#### `EvidenceCustodyEntry`
Append-only chain-of-custody for evidence packs.

```prisma
model EvidenceCustodyEntry {
  id              String              @id @default(cuid()) @map("id") // 'ece_' + 12 chars
  packId          String              @map("pack_id")
  // Who performed this action (user or system)
  actorId         String?             @map("actor_id")
  actorType       String              @default("user") @map("actor_type") // user | system
  action          String              // created | updated | sealed | revoked | exported
  // Stable hash of the pack metadata at this moment
  stateHash       String              @map("state_hash")
  // Optional reference to an ExhibitItem id added/modified
  exhibitRef      String?             @map("exhibit_ref")
  // Free-form note (e.g., court submission reference, sealed by clerk)
  note             String?
  ipAddress       String?             @map("ip_address")
  createdAt       DateTime            @default(now()) @map("created_at")

  pack            EvidencePack        @relation(fields: [packId], references: [id], onDelete: Cascade)

  @@index([packId], map: "idx_custody_pack")
  @@map("evidence_custody_entries")
}
```

#### `EvidenceExhibit`
Typed exhibit items instead of raw JSON blobs.

```prisma
model EvidenceExhibit {
  id            String    @id @default(cuid()) @map("id") // 'exh_' + 12 chars
  packId        String    @map("pack_id")
  exhibitNumber String    @map("exhibit_number") // e.g., "EX-001"
  // 'agreement' | 'signature' | 'stamp_certificate' | 'payment' | 'message' | 'audit_log' | 'other'
  category      String
  // Content hash of the rendered/admitted artifact
  contentHash   String?   @map("content_hash")
  title         String
  description   String?
  url           String?
  // The underlying source record (e.g., agreementSignatureId, transactionId, messageId)
  sourceRecordId String?  @map("source_record_id")
  sourceTable    String?  @map("source_table")
  // Order within the exhibit list
  sortOrder      Int      @default(0) @map("sort_order")
  createdAt      DateTime @default(now()) @map("created_at")
  createdBy      String?  @map("created_by")

  pack           EvidencePack @relation(fields: [packId], references: [id], onDelete: Cascade)

  @@unique([packId, exhibitNumber])
  @@index([packId, sortOrder], map: "idx_exhibits_pack_order")
  @@map("evidence_exhibits")
}
```

### 3.3 Modified Models

#### `Document`
Adds current version pointer, legal hold flag, and access-controlled fields.

```prisma
model Document {
  id              String    @id @default(cuid()) @map("id")
  // ...existing fields...
  listingId       String?   @map("listing_id")
  uploadedById    String    @map("uploaded_by_id")
  type            String    // agreement, receipt, verification, other
  version         Int       @default(1)
  url             String
  name            String
  mimeType        String?   @map("mime_type")
  sizeBytes       BigInt?   @map("size_bytes")
  accessControl   String    @default("private") @map("access_control")

  // NEW
  currentVersion  Int?      @default(1) @map("current_version")
  legalHold       Boolean   @default(false) @map("legal_hold")
  chainHash       String?   @map("chain_hash") // hash of the first DocumentVersion.chainHash
  lockedBy        String?   @map("locked_by")
  lockedAt        DateTime? @map("locked_at")

  listing         Listing?  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  uploadedBy      User      @relation(fields: [uploadedById], references: [id])
  versions        DocumentVersion[]
  accessLogs      DocumentAccessLog[]

  // ...existing indexes + @@map("documents")...
}
```

#### `Agreement`
Adds content binding, finalized/lock state, and explicit linkage fields.

```prisma
model Agreement {
  id                  String           @id @default(cuid()) @map("id")
  // ...existing fields...

  // NEW — integrity fields
  pdfContentHash      String?          @map("pdf_content_hash")       // SHA-256 of final PDF bytes
  finalizedAt         DateTime?        @map("finalized_at")
  lockStatus          AgreementLockStatus @default(mutable) @map("lock_status")
  // Chain hash across the Agreement lifecycle:
  // H(H(signatures) || stampDutyHash || finalizedAt)
  integrityChainHash  String?          @map("integrity_chain_hash")
  lockedBy            String?          @map("locked_by")

  // ...existing relations + @@map...
}
```

#### `AgreementSignature`
Binding to document content hash and version.

```prisma
model AgreementSignature {
  id              String   @id @default(cuid()) @map("id")
  // ...existing fields...
  agreementId     String   @map("agreement_id")
  signerId        String   @map("signer_id")
  role            String   // 'landlord' | 'tenant' | 'agent'
  ipAddress       String?  @map("ip_address")
  userAgent       String?  @map("user_agent")
  consentText     String?  @map("consent_text")
  signedAt        DateTime @default(now()) @map("signed_at")
  checksum        String?  // existing — keep for backwards compat

  // NEW — cryptographic binding
  documentHash    String?  @map("document_hash")      // SHA-256 of the PDF at signing time
  // Hash of (documentHash || signerId || signedAt || ipAddress)
  bindingHash     String?  @map("binding_hash")

  agreement       Agreement @relation(fields: [agreementId], references: [id], onDelete: Cascade)
  signer          User     @relation(fields: [signerId], references: [id])

  // ...existing @@map...
}
```

#### `StampDuty`
Binds certificate to the agreement's PDF digest.

```prisma
model StampDuty {
  id                String          @id @default(cuid())
  agreementId       String          @unique @map("agreement_id")
  amount            Decimal         @db.Decimal(15, 2)
  remitaRrr         String?         @map("remita_rrr")
  transactionId     String?         @map("transaction_id")
  certificateNumber String?         @map("certificate_number")
  certificateUrl    String?         @map("certificate_url")
  status            StampDutyStatus @default(pending)
  paidAt            DateTime?       @map("paid_at")
  issuedAt          DateTime?       @map("issued_at")

  // NEW
  agreementPdfHash  String?         @map("agreement_pdf_hash")   // MUST match Agreement.pdfContentHash
  certificateHash   String?         @map("certificate_hash")     // SHA-256 of cert PDF bytes
  // hash agreementPdfHash + certificateHash + paidAt
  linkageHash       String?         @map("linkage_hash")

  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")

  agreement         Agreement       @relation(fields: [agreementId], references: [id], onDelete: Cascade)

  // ...existing indexes + @@map...
}
```

#### `EvidencePack`
Typed and sealed with integrity hash.

```prisma
model EvidencePack {
  id            String    @id @default(cuid()) @map("id")
  disputeId     String    @unique @map("dispute_id")
  firmId        String?   @map("firm_id")
  status        String    @default("draft") @map("status") // draft | final | sealed | revoked
  // deprecated but kept for backwards-compat migration; new code should use EvidenceExhibit
  fileUrls      Json?
  payments      Json?
  messages      Json?
  auditLogs     Json?
  metadata      Json?

  // NEW
  exhibitPrefix String?   @default("EX") @map("exhibit_prefix")   // e.g. EX or COLL
  exhibitCount  Int       @default(0) @map("exhibit_count")
  // Top-level hash (Merkle root over all exhibits + custody entries)
  sealHash      String?   @map("seal_hash")
  sealedAt      DateTime? @map("sealed_at")
  sealedBy      String?   @map("sealed_by")
  chainHash     String?   @map("chain_hash")  // PreviousPack.chainHash || this pack root (if cross-linking)

  dispute       Dispute    @relation(fields: [disputeId], references: [id], onDelete: Cascade)
  firm           Organisation? @relation(fields: [firmId], references: [id], onDelete: SetNull)
  exhibits       EvidenceExhibit[]
  custodyEntries EvidenceCustodyEntry[]

  @@map("evidence_packs")
}
```

---

## 4. Integrity Algorithm Design

### 4.1 Document Versioning & Chain

```
For each new DocumentVersion v_i:
  v_i.contentHash = SHA256(fileBytes)

  if i == 1:
    v_i.chainHash = SHA256(v_1.contentHash || ts)        // timestamp of creation
  else:
    v_i.chainHash = SHA256(v_{i-1}.chainHash || v_i.contentHash || ts)

Document.chainHash = SHA256(v_last.chainHash)
Document.currentVersion = last version number
```

**Why this matters:**
- Any byte flip in any prior version is detectable because `chainHash` of later versions includes earlier hashes.
- Court can verify "this PDF existed at time T in exactly this form" without trusting a single database row.

### 4.2 Post-Sign Lock on Agreement

Locking states:

```
mutable  →  fully_signed exists but not yet finalized
  ↓
lock_status = locked   (finalizedAt = now, lockedBy = actorId)
  ↓
lock_status = immutable  (pdfUrl and pdfContentHash frozen; further signatures disallowed)
```

Enforcement logic (pseudo-trigger in backend / service layer):

```
async function finalizeAgreement(agreementId, actorId):
  if agreement.status != "fully_signed":
    throw new Error("Agreement must be fully signed before finalization")

  if agreement.pdfUrl is null:
    throw new Error("Signed PDF must be generated before finalization")

  pdfBytes = download(agreement.pdfUrl)
  agreement.pdfContentHash = SHA256(pdfBytes)

  // Compute integrity chain over ordered signatures
  sigs = getSignaturesByAgreement(agreementId)
  sigChain = reduce(sigs, acc, sig => SHA256(acc || sig.bindingHash), initial=b'')
  agreement.integrityChainHash = SHA256(sigChain || agreement.pdfContentHash || now)

  agreement.finalizedAt = now
  agreement.lockStatus = "locked"
  agreement.lockedBy = actorId
  await save(agreement)
```

**ORM-level safeguard:**
- Add a database-level trigger (PostgreSQL) to raise an exception if any UPDATE to `agreements` tries to set `lock_status = 'mutable'` while `finalizedAt IS NOT NULL`.
- Alternatively, enforce in the application *and* issue a `Row Level Security` policy: only `service_role` (migrations) can touch finalized rows.

### 4.3 Signature Binding

When a signer completes:

```
documentHash = SHA256(PDF bytes currently presented at signing)
bindingHash  = SHA256(documentHash || signerId || signedAt || ipAddress)
AgreementSignature: stores documentHash + bindingHash
```

Verification:

```
expected = SHA256(signature.documentHash || signer.signerId || signature.signedAt || signature.ipAddress)
return signature.bindingHash === expected && signature.documentHash === expectedPdfHash
```

### 4.4 Stamp Duty Linkage

When stamp duty is paid and certificate issued:

```
agreementPdfHash = Agreement.pdfContentHash    // must already be set
certificatePdf   = download(certificateUrl)
certificateHash  = SHA256(certificatePdf)
StampDuty:
  agreementPdfHash = agreementPdfHash
  certificateHash  = certificateHash
  linkageHash      = SHA256(agreementPdfHash || certificateHash || paidAt)
```

**Enforcement:**
- `StampDuty` webhook handler rejects storing a certificate unless `agreement.pdfContentHash` exists.
- UI hides "Apply Stamp Duty" button until agreement is `locked`.

### 4.5 EvidencePack Sealing (Merkle-Style)

When exhibits are finalized:

```
exhibitHashes = exhibits
  .sort((a,b) => a.sortOrder - b.sortOrder)
  .map(e => SHA256(e.category || e.title || e.url || e.sourceRecordId || e.contentHash || e.exhibitNumber))

packRoot = merkleRoot(exhibitHashes)

// Include custody trail in root calculation
custodyEntries = chain(id, createdAt) for this pack
custodyStateHash = reduce(custodyEntries, (a,b) => SHA256(a || b.stateHash || b.action || b.createdAt), b'')

sealHash = SHA256(packId || packRoot || custodyStateHash || pack.exhibitPrefix)

EvidencePack.sealHash = sealHash
EvidencePack.sealedAt  = now
EvidencePack.sealedBy  = actorId
EvidencePack.status    = "sealed"

// Append initial custody entry
EvidenceCustodyEntry:
  packId, action="sealed", stateHash=sealHash, actorId, ipAddress
```

**Revocation rule:**
- Only `admin` can set `sealed → revoked`.
- Revocation must append a new `EvidenceCustodyEntry` with `action="revoked"` and compute a new `chainHash` (previous `sealHash || "REVOKED" || ts`).
- Original `sealHash` is preserved in the record for audit transparency.

### 4.6 Cross-Object Cryptographic Chain

```
Document.chainHash ──► Agreement.pdfContentHash ──► Signature.documentHash ──► StampDuty.agreementPdfHash
                                                                                     │
                                                                        EvidencePack.exhibits[stamp_certificate].contentHash = StampDuty.certificateHash
                                                                                     │
                                                                        EvidencePack.sealHash
```

This forms a verifiable chain a forensic expert can follow end-to-end.

---

## 5. API Contract Changes

### 5.1 Documents

#### `POST /api/documents`
**Change:** Return the `DocumentVersion` created; store `contentHash` and `chainHash`.

```
Request (multipart): file, type
Response 201:
{
  "success": true,
  "document": {
    "id", "type", "version", "currentVersion", "name", "url",
    "accessControl", "createdAt", "updatedAt",
    "chainHash"
  },
  "version": {
    "documentId", "version", "url", "sizeBytes", "mimeType",
    "contentHash", "chainHash", "createdAt"
  }
}
```

#### `GET /api/documents`
Add `currentVersion`, `chainHash`, `legalHold` to response.

#### `POST /api/documents/{id}/versions`
New endpoint to upload a new versions, enforcing `Document.chainHash` continuity.

```
Request: multipart file
Response: DocumentVersion object + updated Document
```

#### `POST /api/documents/{id}/lock`
Finalize document into legal hold.

```
Request: { "reason": string }
Response: Document with lockedBy, lockedAt, legalHold = true
```

#### `GET /api/documents/{id}/versions`
Returns ordered versions with `contentHash`, `chainHash`.

### 5.2 Agreements

#### `POST /api/agreements/{id}/sign`
**Change:** Before creating `AgreementSignature`, fetch current PDF bytes (`agreement.pdfUrl`), compute `documentHash`, compute `bindingHash`, persist both.

#### `POST /api/agreements/{id}/finalize`
New endpoint. Enforces:
- Must be `fully_signed`
- Must have non-null `pdfUrl`
- Computes all hashes and transitions to `locked`

```
Request: {}   // actor determined from session
Response 200:
{
  "id", "status", "lockStatus", "finalizedAt", "pdfContentHash",
  "integrityChainHash"
}
```

#### `PATCH /api/agreements/{id}`
**Change:** Block mutations when `lockStatus ∈ {locked, immutable}`. Return `409 Conflict` with metadata.

```
Error response:
{
  "error": "Agreement is finalized and locked",
  "lockStatus": "locked",
  "finalizedAt": "...",
  "lockedBy": "..."
}
```

### 5.3 Stamp Duty

#### `POST /api/stamp-duty/{agreementId}/confirm`
**Change:** After payment verification, require that `Agreement.lockStatus == 'locked'` and `Agreement.pdfContentHash` is set before creating/updating `StampDuty`. Compute `agreementPdfHash`, `certificateHash`, `linkageHash`.

### 5.4 Evidence Packs

#### `POST /api/admin/evidence-packs`
**Change:** Return a `sealed` pack only after exhibits are built and `sealHash` is computed.

#### `POST /api/admin/evidence-packs/{id}/exhibits`
New endpoint to add exhibits one-by-one with version control.

```
Request:
{
  "exhibitNumber": "EX-001",
  "category": "agreement",
  "title": "Rental Agreement",
  "url": "...",
  "sourceRecordId": "agr_...",
  "sourceTable": "Agreement",
  "contentHash": "sha256:..."
}
Response 201: EvidenceExhibit
```

#### `POST /api/admin/evidence-packs/{id}/seal`
New endpoint. Recomputes `sealHash`, sets `status = sealed`, `sealedAt`, `sealedBy`, and records first custody entry.

```
Request: { "note"?: string, "actorId"?: string }
Response:
{
  "id", "status", "sealHash", "sealedAt", "sealedBy",
  "exhibitCount", "integrityChainHash"
}
```

#### `POST /api/admin/evidence-packs/{id}/revoke`
New endpoint. Appends custody entry, updates `chainHash`, sets `status = revoked`.

#### `POST /api/admin/evidence-packs/{id}/export`
New endpoint to produce a court-ready ZIP/JSON containing:
- All exhibits rendered with `exhibitNumber`, title, source, `contentHash`
- The `sealHash` manifest
- The `EvidenceCustodyEntry` list
- A human-readable verification receipt (SHA-256 tree)

#### `GET /api/admin/evidence-packs/{id}/chain`
New endpoint to retrieve the full custody + exhibit chain for forensic verification.

### 5.5 New Integrity Verification Endpoints

#### `POST /api/integrity/verify-document/{documentId}`
```
Request: { "content": base64 }   // re-upload bytes to compare
Response:
{
  "verified": true,
  "currentContentHash": "...",
  "providedContentHash": "...",
  "chainHash": "...",
  "mismatch": false
}
```

#### `POST /api/integrity/verify-agreement/{agreementId}`
```
Response:
{
  "pdfContentHash": "...",
  "integrityChainHash": "...",
  "signatures": [ { "bindingHash", "documentHash", ... } ],
  "stampDuty": { "linkageHash", "agreementPdfHash", "certificateHash" },
  "evidencePackIds": [...]
}
```

---

## 6. UI Changes

### 6.1 User Document Manager (`src/app/documents/page.tsx`)
- Display per-version list with `contentHash` (first 16 hex chars), `chainHash`, and `createdAt`.
- "Upload New Version" button auto-increments version and shows diff of hash.
- Lock button: "Place in Legal Hold" with confirmation modal; shows `lockedBy` + `lockedAt`.
- Download link includes a `?verify=1` query that triggers a JS-side SHA-256 of the downloaded blob and compares to `contentHash` before opening.

### 6.2 Agreement Signing Flow
- On signing screen, show a **frozen preview** of the exact bytes whose hash will be stored. Append notice: *"By signing, you bind your identity to the SHA-256 digest of this document (shown above)."*
- After the second signature reaches `fully_signed`:
  - Show "Finalize Agreement" button (landlord/admin only).
  - Disable "Edit Agreement" once `finalizedAt` is present.
- Visual lock icon on agreement cards in lists.

### 6.3 Stamp Duty → Agreement Coupling
- Disable "Pay Stamp Duty" until agreement is `locked`.
- After payment, display certificate + computed `linkageHash` with a verify link.

### 6.4 Admin Evidence Packs (`src/app/admin/evidence-packs/`)
Add two new panels:

**Exhibit Builder:**
- "Add Exhibit" dialog → forms mapped to `EvidenceExhibit` schema.
- Auto-numbering: `EX-001`, `EX-002`, ... based on `exhibitPrefix` + `exhibitCount`.
- Per-row hash input (or auto-computed from uploaded bytes).
- Drag re-order with auto-renumbering.

**Seal / Revoke Action Bar:**
- "Seal Pack" performs recompute, locks pack, emits custody entry, shows `sealHash` in a modal.
- "Revoke Pack" requires reason; emits new custody entry; `sealHash` remains frozen in history.

**Detail Dialog Upgrade:**
- Exhibit table columns: Number, Category, Title, Source Record, `contentHash`, Created, Created By.
- Chain-of-custody timeline below exhibits.
- Footer: "Full pack fingerprint: `SHA256(sealHash)`".

**Export Action:**
- "Export Court-Ready Pack" downloads a ZIP with:
  - `manifest.json` (sealHash, exhibitCount, rootHash)
  - `exhibits/EX-001-...`, `exhibits/EX-002-...` (saved copies)
  - `custody.json` (append-only entries)
  - `verification-receipt.txt` (human-readable hashes + step-by-step verification guide)

---

## 7. Security & Compliance Considerations

1. **Private key handling:** If future functionality requires signing the `sealHash` with a firm private key, store keys in a KMS (AWS KMS, HashiCorp Vault). Design uses hashing only to avoid signing complexity for now.
2. **Immutable storage:** Cloudinary URLs are mutable by the uploader. For legal-grade immutability, consider moving final/archived documents to an append-only bucket (e.g., S3 Object Lock, GRS) and storing the permanent URL.
3. **Retention:** Documents in legal hold (`legalHold = true`) must bypass any retention/auto-delete policy.
4. **RBAC:** Only `admin` and the owning `firm` should seal/revoke packs; `landlord`/`tenant` may view but not mutate final agreements.
5. **Compliance mapping:** Hash algorithms (SHA-256) are aligned with Nigerian Evidence Act / best-practice standards for electronic records.

---

## 8. Implementation Roadmap

| Phase | Deliverables | Owner / Notes |
|-------|--------------|---------------|
| **1 — Schema** | Prisma migration with all new models, enums, and `@@index` changes | DB Engineer |
| **2 — Document Integrity** | `DocumentVersion` service, `POST /versions`, `lock-document` endpoint, hash display on UI + download verify | Fullstack |
| **3 — Agreement Locking** | `finalizeAgreement` service, locking enforcement in all mutation paths, new API field validation | Fullstack |
| **4 — Signature Binding** | Update `createSignature` flow to store `documentHash` + `bindingHash`; add `verifySignature` upgrade | Fullstack |
| **5 — Stamp Duty Linkage** | Update stamp duty flow to enforce agreement lock, compute/cache `linkageHash` | Payments |
| **6 — Evidence Pack Rework** | Replace JSON blobs with `EvidenceExhibit` + `EvidenceCustodyEntry`; build exhibit builder UI; `seal/revoke/export` endpoints | Fullstack |
| **7 — Cross-Link Verification** | `POST /api/integrity/verify-*` endpoints + forensic verification UI | Fullstack |
| **8 — Hardening** | PostgreSQL triggers/Row Level Security, Cloudinary immutability review, audit log integration | Backend / DevOps |

---

## 9. Backwards Migration (High-Level)

1. **Backfill:** For every existing `Agreement` with `pdfUrl ≠ null`, compute `pdfContentHash` from live URL and set `integrityChainHash = SHA256(pdfContentHash)`.
2. **Backfill signatures:** Recompute `documentHash` from `Agreement.pdfUrl` at `signedAt` and set `bindingHash`.
3. **Backfill Document:** Generate a `DocumentVersion` per existing `Document` using stored `url`
4. **Backfill EvidencePack:** Convert flat `fileUrls` JSON into `EvidenceExhibit` rows, then append a single custody row with `action="backfilled"`.
5. **Feature flag:** Run all new code behind `LEGAL_INTEGRITY_V2=true`; keep old fallbacks until verified.

---

## 10. Testing & Verification Checklist

- [ ] Tamper a PDF byte → `POST /api/integrity/verify-agreement/{id}` returns `verified: false`.
- [ ] Edit `Agreement.status` after `finalizedAt` → API returns `409`.
- [ ] Compute `sealHash` locally, compare to server `sealHash` → match.
- [ ] Append custody entry after seal → `chainHash` updates.
- [ ] Download document with `?verify=1` → browser hash matches server `contentHash`.
- [ ] Attempt stamp duty payment on unfinalized agreement → API returns `409`.

---

*Document generated from Propati codebase analysis on 2026-06-23.*
