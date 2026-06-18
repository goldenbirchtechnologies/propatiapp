# Verification API Reference

## Core Management Endpoints

### Start Verification
```
POST /api/verification/start
```

**Request:**
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

**Permissions:** Authenticated users only  
**Rate Limit:** None

---

### Get Verification
```
GET /api/verification/[id]
```

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
    "l1DocUrl": "https://...",
    "l1SubmittedAt": "2026-06-18T10:00:00Z",
    "listing": {
      "id": "lst_123abc",
      "title": "3 Bedroom Flat in Lekki",
      "area": "Lekki Phase 1",
      "verificationTier": "verified",
      "ownerId": "usr_abc123",
      "agentId": null
    },
    "owner": {
      "id": "usr_abc123",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "reviewer": null,
    "adminNotes": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "updatedAt": "2026-06-18T11:30:00Z"
  }
}
```

**Permissions:** Owner, agent on listing, or admin  
**Rate Limit:** None

---

### Get Verification Status
```
GET /api/verification/[id]/status
```

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
      "Ensure name matches documents from Layer 1",
      "Identity will be verified via Prembly"
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

**Permissions:** Owner, agent on listing, or admin  
**Rate Limit:** None  
**Polling:** Recommended 5-10 second interval

---

### Submit for Review
```
POST /api/verification/[id]/submit
```

**Request:** Empty body

**Response (Success):**
```json
{
  "success": true,
  "message": "Verification submitted for final admin review",
  "data": {
    "id": "ver_xyz789",
    "currentLayer": 5,
    "l5Status": "pending",
    "updatedAt": "2026-06-18T15:00:00Z"
  }
}
```

**Response (Error - Incomplete):**
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

**Permissions:** Owner only  
**Rate Limit:** None  
**Side Effects:** Creates notifications for all active admins

---

### Get My Verifications
```
GET /api/verification/my
```

**Query Parameters:**
- `status` (optional): `not_started`, `in_progress`, `certified`, `rejected`
- `listingId` (optional): Filter by specific listing

**Example:**
```
GET /api/verification/my?status=in_progress&listingId=lst_123abc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
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
      "updatedAt": "2026-06-18T11:30:00Z",
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

**Permissions:** Authenticated users only (returns their verifications)  
**Rate Limit:** None

---

### Update Verification (Admin)
```
PATCH /api/verification/[id]
```

**Request:**
```json
{
  "status": "certified",
  "adminNotes": "All requirements met. Property certified."
}
```

**Fields:**
- `status` (optional): `certified` or `rejected`
- `rejectionReason` (optional): string
- `adminNotes` (optional): string

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "overallStatus": "certified",
    "adminNotes": "All requirements met. Property certified.",
    "reviewedBy": "usr_admin123",
    "reviewedAt": "2026-06-18T16:00:00Z"
  }
}
```

**Permissions:** Admin only  
**Rate Limit:** None  
**Side Effects:** Updates listing tier if status is `certified`

---

### Cancel Verification
```
DELETE /api/verification/[id]
```

**Request:** Empty body

**Response:**
```json
{
  "success": true,
  "message": "Verification cancelled"
}
```

**Response (Error - Already Certified):**
```json
{
  "error": "Cannot cancel certified verification"
}
```

**Permissions:** Owner or admin  
**Rate Limit:** None  
**Note:** Cannot cancel if status is `certified`

---

## Layer-Specific Endpoints (Legacy)

These endpoints still work for backward compatibility. They use `listingId` instead of verification `id`.

### Layer 1: Submit Documents
```
POST /api/verification/layer1
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "docUrl": "https://cloudinary.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l1Status": "pending",
    "l1SubmittedAt": "2026-06-18T10:00:00Z"
  }
}
```

---

### Layer 1: Admin Review
```
POST /api/verification/layer1/review
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "approve": true,
  "notes": "All documents verified"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l1Status": "approved",
    "currentLayer": 2,
    "reviewedBy": "usr_admin123",
    "reviewedAt": "2026-06-18T11:00:00Z"
  }
}
```

**Permissions:** Admin only

---

### Layer 2: Submit Identity
```
POST /api/verification/layer2
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "idType": "nin",
  "idNumber": "12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l2Status": "pending",
    "l2IdType": "nin"
  }
}
```

---

### Layer 2: Confirm Identity
```
POST /api/verification/layer2/confirm
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "confirmed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l2Status": "approved",
    "l2VerifiedAt": "2026-06-18T12:00:00Z",
    "currentLayer": 3
  }
}
```

**Permissions:** Admin only

---

### Layer 3: Upload Video
```
POST /api/verification/layer3
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "videoUrl": "https://cloudinary.com/video.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l3Status": "pending",
    "l3VideoUrl": "https://cloudinary.com/video.mp4"
  }
}
```

---

### Layer 3: Admin Review
```
POST /api/verification/layer3/review
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "approve": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l3Status": "approved",
    "currentLayer": 4
  }
}
```

**Permissions:** Admin only

---

### Layer 4: Request Inspection
```
POST /api/verification/layer4
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "preferredDate": "2026-06-20T10:00:00Z",
  "preferredTime": "10:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l4Status": "pending",
    "l4ScheduledAt": "2026-06-20T10:00:00Z"
  }
}
```

---

### Layer 4: Complete Inspection
```
POST /api/verification/layer4/complete
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "reportUrl": "https://cloudinary.com/report.pdf",
  "agentId": "usr_agent123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l4Status": "approved",
    "l4CompletedAt": "2026-06-20T14:00:00Z",
    "l4ReportUrl": "https://cloudinary.com/report.pdf",
    "l4AgentId": "usr_agent123",
    "currentLayer": 5
  }
}
```

**Permissions:** Agent or admin

---

### Layer 5: Admin Certify
```
POST /api/verification/layer5
```

**Request:**
```json
{
  "listingId": "lst_123abc",
  "approve": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ver_xyz789",
    "l5Status": "approved",
    "overallStatus": "certified",
    "reviewedBy": "usr_admin123",
    "reviewedAt": "2026-06-21T10:00:00Z"
  }
}
```

**Permissions:** Admin only  
**Side Effects:** Updates listing tier to `certified`, sends notification to owner

---

### Admin Queue
```
GET /api/verification/admin/queue
```

**Query Parameters:**
- `status` (optional): Filter by overall status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Example:**
```
GET /api/verification/admin/queue?status=in_progress&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ver_xyz789",
      "listingId": "lst_123abc",
      "ownerId": "usr_abc123",
      "overallStatus": "in_progress",
      "currentLayer": 1,
      "l1Status": "pending",
      "listing": {
        "id": "lst_123abc",
        "title": "3 Bedroom Flat in Lekki",
        "area": "Lekki Phase 1",
        "ownerId": "usr_abc123",
        "agentId": null
      },
      "owner": {
        "id": "usr_abc123",
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Permissions:** Admin only

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": { ... }  // Optional, for validation errors
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error, invalid state)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding:
- 100 requests/minute per user for read endpoints
- 20 requests/minute per user for write endpoints
- 10 requests/minute per IP for unauthenticated endpoints

---

## Webhook Events (Future)

When webhook system is implemented, these events will be fired:

- `verification.started` - Verification created
- `verification.layer1.submitted` - Documents submitted
- `verification.layer1.approved` - Documents approved
- `verification.layer1.rejected` - Documents rejected
- `verification.layer2.verified` - Identity verified
- `verification.layer2.failed` - Identity verification failed
- `verification.layer3.submitted` - Video uploaded
- `verification.layer3.approved` - Video approved
- `verification.layer3.rejected` - Video rejected
- `verification.layer4.requested` - Inspection requested
- `verification.layer4.scheduled` - Inspection scheduled
- `verification.layer4.completed` - Inspection completed
- `verification.submitted` - Submitted for Layer 5 review
- `verification.certified` - Verification certified
- `verification.rejected` - Verification rejected
- `verification.cancelled` - Verification cancelled

Each webhook payload will include:
```json
{
  "event": "verification.certified",
  "timestamp": "2026-06-18T16:00:00Z",
  "data": {
    "verificationId": "ver_xyz789",
    "listingId": "lst_123abc",
    "ownerId": "usr_abc123",
    "status": "certified"
  }
}
```

---

**API Version:** 1.0  
**Last Updated:** 2026-06-18  
**Base URL:** `/api`  
**Authentication:** Clerk JWT tokens via Authorization header
