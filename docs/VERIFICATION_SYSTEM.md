# PROPATI Verification State Machine Documentation

## Overview

The PROPATI verification system is a 5-layer progressive verification flow that ensures property listing authenticity and builds trust in the marketplace. Each layer adds more verification depth, culminating in a "Certified" badge for fully verified properties.

## Verification Flow

```
not_started → layer1_documents → layer2_identity → layer3_video →
layer4_inspection → layer5_admin_review → certified
```

Each layer can also transition to `rejected` if verification fails.

## Layer Breakdown

### Layer 1: Document Verification
**Status:** `l1Status` (pending/approved/rejected)

**Requirements:**
- Certificate of Occupancy (C of O)
- Deed of Assignment
- Building Plan
- Tax Clearance or Receipt

**Process:**
1. Owner uploads required documents via `/api/verification/upload-document`
2. Documents submitted for review via `/api/verification/layer1`
3. Admin reviews documents in queue (`/api/verification/admin/queue`)
4. Admin approves/rejects via `/api/verification/layer1/review`

**Outcome:**
- **Approved:** Progress to Layer 2, listing tier updates to `verified`
- **Rejected:** Can resubmit with corrected documents

### Layer 2: Identity Verification
**Status:** `l2Status` (pending/approved/rejected)

**Requirements:**
- NIN or BVN verification via Prembly
- Name must match documents from Layer 1

**Process:**
1. Owner initiates verification via `/api/verification/layer2`
2. Prembly API call to verify NIN/BVN
3. Auto-approval if match, or admin review if discrepancy
4. Admin confirms via `/api/verification/layer2/confirm`

**Outcome:**
- **Approved:** Progress to Layer 3
- **Rejected:** Identity mismatch, cannot proceed

### Layer 3: Video Verification
**Status:** `l3Status` (pending/approved/rejected)

**Requirements:**
- Video walkthrough of the property
- QR code displayed in video (prevents pre-recorded videos)
- Clear footage of all rooms

**Process:**
1. System generates unique QR code
2. Owner records video showing QR code and property via `/api/verification/layer3`
3. Admin reviews video for authenticity
4. Admin approves/rejects via `/api/verification/layer3/review`

**Outcome:**
- **Approved:** Progress to Layer 4
- **Rejected:** Video quality issues or QR code not visible

### Layer 4: Physical Inspection
**Status:** `l4Status` (pending/approved/rejected)

**Requirements:**
- Physical visit by verified PROPATI agent
- Inspection report with photos
- Verification of property condition

**Process:**
1. Owner requests inspection via `/api/verification/layer4`
2. System assigns available agent
3. Agent visits property and completes inspection
4. Agent uploads report via `/api/verification/layer4/complete`
5. Admin reviews inspection report

**Outcome:**
- **Approved:** Progress to Layer 5, listing tier updates to `inspected`
- **Rejected:** Property condition issues or access problems

### Layer 5: Admin Certification
**Status:** `l5Status` (pending/approved/rejected)

**Requirements:**
- All layers 1-4 must be approved
- Final admin review of complete verification package

**Process:**
1. System automatically notifies admins when Layer 4 completes
2. Or owner manually submits via `/api/verification/[id]/submit`
3. Admin performs final review via `/api/verification/layer5`
4. Admin certifies or rejects

**Outcome:**
- **Approved:** Status becomes `certified`, listing tier updates to `certified`, property gets Certified badge
- **Rejected:** Must address specific issues flagged by admin

## State Machine Implementation

### Core Service: `src/lib/verification.ts`

```typescript
class VerificationService {
  // State transitions
  static getTransition(currentStatus, currentLayer, action)
  
  // Layer submissions
  static submitLayer1(listingId, docUrl, userId)
  static submitLayer2(listingId, idType, userId)
  static uploadVideo(listingId, videoUrl, qrCode)
  static requestInspection(listingId, preferredDate)
  
  // Admin actions
  static adminReviewLayer1(listingId, approve, notes, reviewerId)
  static confirmLayer2(listingId, verified, reviewerId)
  static adminReviewLayer3(listingId, approve, reviewerId)
  static completeInspection(listingId, reportUrl, agentId)
  static adminCertify(listingId, approve, reviewerId)
  
  // Management
  static createVerification(listingId, ownerId)
  static getVerificationStatus(listingId)
  static getUserVerifications(userId, status?)
  static updateListingTier(listingId)
  static getAdminQueue(status?)
}
```

### Helper Functions: `src/lib/verification-helpers.ts`

```typescript
// Progress calculation
calculateProgress(verification) → number (0-100)

// Requirements
getNextRequirements(verification) → string[]
getCurrentLayerDetails(verification) → { layer, name, status, requirements, completed }

// Validation
canSubmitForReview(verification) → boolean
canProgressToNextLayer(verification) → boolean

// Status
getVerificationTierFromProgress(verification) → 'basic' | 'verified' | 'inspected' | 'certified'
getCompletedLayers(verification) → number[]
getPendingLayers(verification) → number[]
getRejectedLayers(verification) → number[]
hasRejectedLayers(verification) → boolean
getStatusMessage(verification) → string
```

## API Endpoints

### Core Management APIs

#### `POST /api/verification/start`
Create a new verification record for a listing.

**Body:**
```json
{
  "listingId": "lst_123abc"
}
```

**Response:**
```json
{
  "success": true,
  "verification": {
    "id": "ver_xyz789",
    "status": "not_started",
    "listingId": "lst_123abc",
    "currentLayer": 1
  }
}
```

#### `GET /api/verification/[id]`
Get verification details with all layer progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "listingId": "lst_123abc",
    "ownerId": "usr_abc123",
    "overallStatus": "in_progress",
    "currentLayer": 2,
    "l1Status": "approved",
    "l2Status": "pending",
    "l3Status": "pending",
    "l4Status": "pending",
    "l5Status": "pending",
    "listing": { ... },
    "owner": { ... },
    "reviewer": { ... }
  }
}
```

#### `GET /api/verification/[id]/status`
Get current status and requirements for next layer.

**Response:**
```json
{
  "status": "in_progress",
  "currentLayer": 2,
  "progress": 20,
  "completed": [1],
  "current": {
    "layer": 2,
    "name": "Identity Verification",
    "requirements": [
      "Verify NIN or BVN",
      "Name must match documents from Layer 1"
    ],
    "completed": false,
    "status": "pending"
  },
  "next": {
    "layer": 3,
    "name": "Video Verification"
  },
  "canSubmitForReview": false,
  "statusMessage": "Currently on Layer 2: Identity Verification",
  "listing": {
    "id": "lst_123abc",
    "title": "3 Bedroom Flat in Lekki",
    "verificationTier": "verified"
  }
}
```

#### `POST /api/verification/[id]/submit`
Submit verification for final admin review (Layer 5).

Checks that all layers 1-4 are complete.

**Response:**
```json
{
  "success": true,
  "message": "Verification submitted for final admin review",
  "data": { ... }
}
```

**Error (if incomplete):**
```json
{
  "error": "Cannot submit for review",
  "message": "All layers (1-4) must be approved before submitting for final review",
  "currentStatus": {
    "layer1": "approved",
    "layer2": "approved",
    "layer3": "pending",
    "layer4": "pending"
  }
}
```

#### `GET /api/verification/my`
Get all verifications for current user.

**Query Params:**
- `status`: Filter by verification status (optional)
- `listingId`: Filter by listing ID (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ver_xyz789",
      "listingId": "lst_123abc",
      "overallStatus": "in_progress",
      "currentLayer": 2,
      "listing": {
        "id": "lst_123abc",
        "title": "3 Bedroom Flat in Lekki",
        "area": "Lekki Phase 1",
        "verificationTier": "verified",
        "status": "active"
      }
    }
  ],
  "count": 1
}
```

#### `PATCH /api/verification/[id]`
Update verification (admin only - for rejections, approvals).

**Body:**
```json
{
  "status": "certified",
  "adminNotes": "All requirements met. Property certified."
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

#### `DELETE /api/verification/[id]`
Cancel verification (owner only).

Cannot cancel if status is `certified`.

**Response:**
```json
{
  "success": true,
  "message": "Verification cancelled"
}
```

## React Hooks

### Core Management Hooks (`src/hooks/useVerifications.ts`)

```typescript
// Start verification
const { mutate: startVerification } = useStartVerification();
startVerification(listingId);

// Get verification by ID
const { data: verification } = useVerification(verificationId);

// Get detailed status with requirements
const { data: status } = useVerificationDetailedStatus(verificationId);
// Polls every 5 seconds for updates

// Submit for final review
const { mutate: submitForReview } = useSubmitForReview();
submitForReview(verificationId);

// Get my verifications
const { data: myVerifications } = useMyVerifications({ status: 'in_progress' });

// Update verification (admin)
const { mutate: updateVerification } = useUpdateVerification();
updateVerification({ id, data: { status: 'certified' } });

// Cancel verification
const { mutate: cancelVerification } = useCancelVerification();
cancelVerification(verificationId);
```

### Legacy Layer Hooks (still supported)

```typescript
// Layer 1
const { mutate: submitLayer1 } = useSubmitLayer1();
submitLayer1({ listingId, docUrl });

// Layer 2
const { mutate: submitLayer2 } = useSubmitLayer2();
submitLayer2({ listingId, idType, idNumber });

const { mutate: confirmLayer2 } = useConfirmLayer2();
confirmLayer2({ listingId, confirmed: true });

// Layer 3
const { mutate: uploadVideo } = useUploadVideo();
uploadVideo({ listingId, videoUrl });

// Layer 4
const { mutate: requestInspection } = useRequestInspection();
requestInspection({ listingId, preferredDate, preferredTime });

// Admin review
const { mutate: adminReview } = useAdminReviewVerification();
adminReview({ listingId, layer: 1, action: 'approve', notes });
```

## Notification Triggers

The system sends notifications at key verification milestones:

| Trigger | Recipient | Event |
|---------|-----------|-------|
| `layer1_submitted` | Admin | User submits Layer 1 documents |
| `layer1_approved` | User | Admin approves Layer 1 |
| `layer1_rejected` | User | Admin rejects Layer 1 with reason |
| `layer2_verified` | User | Identity verified successfully |
| `layer2_rejected` | User | Identity verification failed |
| `layer3_submitted` | Admin | Video uploaded |
| `layer3_approved` | User | Admin approves video |
| `layer3_rejected` | User | Admin rejects video |
| `layer4_requested` | Admin + Agents | Inspection requested |
| `layer4_scheduled` | User + Agent | Inspection scheduled |
| `layer4_completed` | User + Admin | Inspection completed |
| `layer5_submitted` | Admin | All layers complete, ready for certification |
| `certified` | User | Verification certified (+ update listing tier) |
| `rejected` | User | Final rejection with reason |

**Implementation Note:** Notification sending is not yet implemented. These are triggers that should be used when implementing the notification system.

## Database Schema

```prisma
model Verification {
  id                String                   @id @default(cuid())
  listingId         String                   @unique
  ownerId           String

  // Layer 1: Documents
  l1Status          VerificationLayerStatus  @default(pending)
  l1DocUrl          String?
  l1SubmittedAt     DateTime?

  // Layer 2: Identity Match
  l2Status          VerificationLayerStatus  @default(pending)
  l2IdType          IdType?
  l2VerifiedAt      DateTime?

  // Layer 3: Live Video
  l3Status          VerificationLayerStatus  @default(pending)
  l3VideoUrl        String?
  l3QrCode          String?

  // Layer 4: Physical Inspection
  l4Status          VerificationLayerStatus  @default(pending)
  l4AgentId         String?
  l4ScheduledAt     DateTime?
  l4CompletedAt     DateTime?
  l4ReportUrl       String?

  // Layer 5: Admin Certification
  l5Status          VerificationLayerStatus  @default(pending)
  currentLayer      Int                      @default(1)
  overallStatus     VerificationOverallStatus @default(not_started)
  adminNotes        String?
  reviewedBy        String?
  reviewedAt        DateTime?
  updatedAt         DateTime                 @updatedAt

  listing           Listing
  owner             User
  reviewer          User?
  l4Agent           User?
}

enum VerificationLayerStatus {
  pending
  approved
  rejected
}

enum VerificationOverallStatus {
  not_started
  in_progress
  certified
  rejected
}
```

## Integration Points

### For Frontend Developers

**Starting Verification:**
```tsx
import { useStartVerification } from '@/hooks/useVerifications';

function ListingActions({ listingId }) {
  const { mutate: start, isPending } = useStartVerification();

  return (
    <button onClick={() => start(listingId)} disabled={isPending}>
      Start Verification
    </button>
  );
}
```

**Verification Progress Display:**
```tsx
import { useVerificationDetailedStatus } from '@/hooks/useVerifications';

function VerificationProgress({ verificationId }) {
  const { data: status } = useVerificationDetailedStatus(verificationId);

  return (
    <div>
      <ProgressBar value={status.progress} />
      <p>Current Layer: {status.current.name}</p>
      <ul>
        {status.current.requirements.map(req => (
          <li key={req}>{req}</li>
        ))}
      </ul>
    </div>
  );
}
```

### For Backend Developers

**Automatic Listing Tier Update:**
```typescript
import { verificationService } from '@/lib/verification';

// After any layer approval
await verificationService.updateListingTier(listingId);
// This automatically sets the correct tier based on progress
```

**Admin Queue:**
```typescript
import { verificationService } from '@/lib/verification';

// Get verifications pending review
const queue = await verificationService.getAdminQueue('in_progress');
```

## Security Considerations

1. **Permission Checks:**
   - Only owner, agent, or admin can view verification
   - Only owner can start/cancel verification
   - Only admin can approve/reject layers
   - Only admin can update verification status

2. **State Validation:**
   - Cannot skip layers (must progress sequentially)
   - Cannot revert from certified to lower status
   - Layer actions validated against current state

3. **Idempotency:**
   - Starting verification for same listing returns existing record
   - Multiple submissions handled gracefully

## Testing

### Unit Tests Needed
- State machine transitions
- Helper function calculations
- Permission checks
- Validation logic

### Integration Tests Needed
- Complete 5-layer flow
- Rejection and resubmission flow
- Admin actions
- Listing tier updates

### E2E Tests Needed
- Landlord: Start verification → Complete all layers → Get certified
- Admin: Review queue → Approve/reject layers
- Edge cases: Skip layers, multiple rejections

## Future Enhancements

1. **Auto-progress:**
   - Automatically advance layers when requirements met
   - Reduce manual admin review where possible

2. **Notifications:**
   - Implement all notification triggers
   - SMS + Email + In-app

3. **Analytics:**
   - Track verification completion rates
   - Layer-by-layer drop-off analysis
   - Time-to-certification metrics

4. **Agent Assignment:**
   - Smart agent matching for Layer 4 inspections
   - Availability calendar integration
   - Agent performance tracking

5. **Document OCR:**
   - Automatic document text extraction
   - Auto-verify document numbers
   - Reduce manual admin work

---

**Last Updated:** 2026-06-18
**Version:** 1.0
**Maintained by:** PROPATI Development Team

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
