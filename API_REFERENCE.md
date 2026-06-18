# PROPATI — API Reference

**Version:** 1.0  
**Base URL:** `https://propati.ng/api` (production) · `http://localhost:3000/api` (dev)  
**Authentication:** Clerk JWT via `Authorization: Bearer <token>` or session cookie  
**Content-Type:** `application/json` (all requests and responses)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Listings](#3-listings)
4. [Verification](#4-verification)
5. [Agreements](#5-agreements)
6. [Messages](#6-messages)
7. [Payments](#7-payments)
8. [Users & Profile](#8-users--profile)
9. [Organisations (B2B)](#9-organisations-b2b)
10. [Webhooks](#10-webhooks)
11. [Error Reference](#11-error-reference)

---

## 1. Overview

### 1.1 Response Envelope

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_CODE",
  "details": { ... }
}
```

### 1.2 Pagination

List endpoints support cursor-based pagination:

```
GET /api/listings?page=2&limit=20

Response headers:
  X-Total-Count: 847
  X-Page: 2
  X-Limit: 20
  X-Total-Pages: 43
```

### 1.3 Authentication

All protected endpoints require a valid Clerk session token:

```bash
# Via Authorization header
curl -H "Authorization: Bearer <clerk_jwt>" https://propati.ng/api/listings

# In browser — Clerk.js automatically attaches the session cookie
# No manual token handling needed for frontend code
```

---

## 2. Authentication

Handled by Clerk. PROPATI does not implement custom auth endpoints. Role and profile management uses the `/api/users` endpoints below.

### 2.1 Get Current User

```
GET /api/auth/me
Auth: Required
```

**Response 200:**
```json
{
  "data": {
    "id": "clx1a2b3c4d5e6f7",
    "clerkId": "user_2abc123",
    "email": "adaeze@example.com",
    "fullName": "Adaeze Okonkwo",
    "role": "tenant",
    "avatarUrl": "https://img.clerk.com/...",
    "phoneVerified": true,
    "ninVerified": true,
    "idVerified": false,
    "profileCompleted": true,
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

---

## 3. Listings

### 3.1 Search Listings

```
GET /api/listings
Auth: Public
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `rent\|sale\|short_let\|share\|commercial` | No | Filter by listing type |
| `propertyType` | `apartment\|house\|duplex\|land\|office\|shop\|warehouse` | No | Filter by property type |
| `area` | string | No | Location search (ILIKE — partial match) |
| `state` | string | No | State filter (default: all) |
| `priceMin` | integer | No | Min price in Naira |
| `priceMax` | integer | No | Max price in Naira |
| `bedrooms` | integer | No | Exact bedrooms |
| `tier` | `basic\|verified\|inspected\|certified` | No | Min verification tier |
| `sort` | `newest\|price_asc\|price_desc\|most_verified` | No | Sort order (default: newest) |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Results per page (default: 20, max: 50) |
| `ownerId` | string | No | Filter by owner (for landlord's own listings) |

**Response 200:**
```json
{
  "data": {
    "listings": [
      {
        "id": "clx1abc",
        "title": "3-Bedroom Luxury Flat, Lekki Phase 1",
        "listingType": "rent",
        "propertyType": "apartment",
        "address": "14B Admiralty Way",
        "area": "Lekki Phase 1",
        "state": "Lagos",
        "price": "850000",
        "pricePeriod": "month",
        "bedrooms": 3,
        "bathrooms": 3,
        "sizeSqm": "145.00",
        "verificationTier": "certified",
        "status": "active",
        "isFeatured": false,
        "viewsCount": 234,
        "coverImage": "https://res.cloudinary.com/propati/image/upload/...",
        "owner": {
          "id": "clx_owner",
          "fullName": "Emeka Obi",
          "avatarUrl": null,
          "ninVerified": true
        },
        "savedByCount": 12,
        "createdAt": "2026-03-10T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 847,
      "totalPages": 43
    }
  }
}
```

---

### 3.2 Create Listing

```
POST /api/listings
Auth: Required
Roles: landlord, estate_manager
```

**Request Body:**
```json
{
  "title": "3-Bedroom Luxury Flat, Lekki Phase 1",
  "listingType": "rent",
  "propertyType": "apartment",
  "address": "14B Admiralty Way",
  "area": "Lekki Phase 1",
  "state": "Lagos",
  "price": 850000,
  "pricePeriod": "month",
  "cautionDeposit": 850000,
  "serviceCharge": 50000,
  "bedrooms": 3,
  "bathrooms": 3,
  "toilets": 4,
  "sizeSqm": 145,
  "floorLevel": 4,
  "furnished": false,
  "parkingSpaces": 2,
  "amenities": ["generator", "security", "swimming pool", "gym"],
  "availableFrom": "2026-07-01",
  "description": "Spacious luxury flat in prime Lekki location..."
}
```

**Field Validation:**

| Field | Rules |
|-------|-------|
| `title` | min 5, max 200 chars |
| `listingType` | Required. One of the enum values |
| `address` | min 5, max 300 chars |
| `area` | min 2, max 100 chars |
| `price` | Positive integer (Naira) |

**Response 201:**
```json
{
  "data": {
    "id": "clx_new_listing",
    "status": "draft",
    "createdAt": "2026-06-18T10:00:00.000Z"
  }
}
```

---

### 3.3 Get Listing

```
GET /api/listings/[id]
Auth: Public
```

**Response 200:** Full listing object with images, owner details, verification status, and saved state (if authenticated).

---

### 3.4 Update Listing

```
PATCH /api/listings/[id]
Auth: Required
Roles: Owner (landlord), assigned agent, admin
```

**Request Body:** Any subset of listing fields. Only provided fields are updated.

**Response 200:** Updated listing object.

---

### 3.5 Upload Listing Images

```
POST /api/listings/[id]/images
Auth: Required
Roles: Owner, assigned agent
Content-Type: multipart/form-data
```

**Form Fields:**
- `images` — File[]. JPEG, PNG, or WebP. Max 10MB each. Max 10 total.
- `isCover` — boolean (optional). Mark first image as cover.

**Response 200:**
```json
{
  "data": {
    "uploaded": [
      {
        "id": "clx_img1",
        "url": "https://res.cloudinary.com/propati/image/upload/f_auto,q_auto,w_800/propati/images/clx_img1",
        "isCover": true
      }
    ],
    "totalImages": 3
  }
}
```

---

### 3.6 Save / Unsave Listing

```
POST /api/listings/[id]/save
Auth: Required
Roles: Any authenticated user
```

**Response 200:**
```json
{ "data": { "saved": true } }       // was unsaved, now saved
{ "data": { "saved": false } }      // was saved, now unsaved (toggle)
```

---

### 3.7 Flag Listing

```
POST /api/listings/[id]/flag
Auth: Required
```

**Request Body:**
```json
{
  "type": "fraud",
  "description": "This listing has the same photos as another property..."
}
```

`type` options: `fraud | duplicate | misleading | wrong_price | harassment | other`

**Response 201:** `{ "data": { "flagId": "clx_flag1" } }`

At 10 open flags, listing is auto-suspended and admin is notified.

---

## 4. Verification

The 5-layer verification system is a sequential state machine. Each layer must be approved before the next can be submitted.

### 4.1 Get Verification Status

```
GET /api/verification/status?listingId=[id]
Auth: Required
Roles: Listing owner, admin
```

**Response 200:**
```json
{
  "data": {
    "id": "clx_ver1",
    "listingId": "clx_lst1",
    "currentLayer": 3,
    "overallStatus": "in_progress",
    "l1Status": "approved",
    "l2Status": "approved",
    "l3Status": "pending",
    "l4Status": "pending",
    "l5Status": "pending",
    "adminNotes": null,
    "updatedAt": "2026-06-18T09:00:00.000Z"
  }
}
```

---

### 4.2 Layer 1 — Submit Documents

```
POST /api/verification/layer1
Auth: Required
Roles: landlord
Content-Type: multipart/form-data
```

**Form Fields:**
- `listingId` — string (required)
- `documentType` — `certificate_of_occupancy | deed_of_assignment | survey_plan | governors_consent`
- `document` — File. PDF, JPEG, PNG. Max 20MB.

Submits one document at a time. Call this endpoint for each required document, then call Layer 1 review to request admin approval.

**Response 201:** `{ "data": { "docUrl": "https://...", "documentType": "certificate_of_occupancy" } }`

---

### 4.3 Layer 1 — Admin Review

```
POST /api/verification/layer1/review
Auth: Required
Roles: admin
```

**Request Body:**
```json
{
  "verificationId": "clx_ver1",
  "approved": true,
  "reason": null
}
```

On approval, `l1Status` → `approved`, `currentLayer` → 2, landlord notified.

---

### 4.4 Layer 2 — Identity Lookup (Prembly)

```
POST /api/verification/layer2
Auth: Required
Roles: landlord
```

**Request Body:**
```json
{
  "listingId": "clx_lst1",
  "idType": "nin",
  "idNumber": "12345678901"
}
```

`idType`: `nin | bvn | drivers_licence | voters_card`

**Response 200:**
```json
{
  "data": {
    "found": true,
    "name": "EMEKA OBI",
    "dateOfBirth": "1985-04-12",
    "gender": "male",
    "photoUrl": "https://prembly-response.../photo.jpg",
    "matchToken": "prembly_match_abc123"
  }
}
```

---

### 4.5 Layer 2 — Confirm Identity Match

```
POST /api/verification/layer2/confirm
Auth: Required
Roles: landlord
```

**Request Body:**
```json
{
  "listingId": "clx_lst1",
  "matchToken": "prembly_match_abc123",
  "confirmed": true
}
```

On confirmation, `l2Status` → `approved`, `currentLayer` → 3.

---

### 4.6 Layer 3 — Upload Video Proof

```
POST /api/verification/layer3
Auth: Required
Roles: landlord
Content-Type: multipart/form-data
```

**Form Fields:**
- `listingId` — string
- `video` — File. MP4 or MOV. Max 100MB.
- `qrCode` — string. The unique QR code value provided by PROPATI.

The video must show the landlord inside the property holding the QR code printout.

**Response 201:** `{ "data": { "videoUrl": "https://..." } }`

---

### 4.7 Layer 3 — Admin Review Video

```
POST /api/verification/layer3/review
Auth: Required
Roles: admin
```

Same body as Layer 1 review. On approval, `l3Status` → `approved`, `currentLayer` → 4.

---

### 4.8 Layer 4 — Request Physical Inspection

```
POST /api/verification/layer4
Auth: Required
Roles: landlord
```

**Request Body:**
```json
{
  "listingId": "clx_lst1",
  "preferredDate": "2026-07-10",
  "contactPhone": "08012345678",
  "notes": "Available weekdays after 2pm"
}
```

**Response 201:** An inspection is scheduled and assigned to a PROPATI agent.

---

### 4.9 Layer 4 — Complete Inspection

```
POST /api/verification/layer4/complete
Auth: Required
Roles: agent, admin
```

**Request Body:**
```json
{
  "verificationId": "clx_ver1",
  "approved": true,
  "reportUrl": "https://cloudinary.com/propati/documents/inspection_report.pdf",
  "notes": "Property matches listing description. All documents verified on-site."
}
```

---

### 4.10 Layer 5 — Grant Certified Badge

```
POST /api/verification/layer5
Auth: Required
Roles: admin
```

**Request Body:**
```json
{
  "verificationId": "clx_ver1",
  "notes": "All layers approved. Listing is certified."
}
```

**Effect:** `overallStatus` → `certified`, `listing.verificationTier` → `certified`, owner notified.

---

### 4.11 Admin Verification Queue

```
GET /api/verification/admin/queue
Auth: Required
Roles: admin
```

**Query Parameters:**
- `layer` — `1|2|3|4|5` — filter by pending layer
- `status` — `pending|approved|rejected` — filter by layer status
- `page`, `limit`

**Response 200:**
```json
{
  "data": {
    "queue": [
      {
        "verificationId": "clx_ver1",
        "listing": { "id": "clx_lst1", "title": "...", "area": "Lekki" },
        "owner": { "id": "clx_usr1", "fullName": "Emeka Obi", "ninVerified": true },
        "currentLayer": 3,
        "l1Status": "approved",
        "l2Status": "approved",
        "l3Status": "pending",
        "l3VideoUrl": "https://...",
        "submittedAt": "2026-06-17T14:00:00.000Z"
      }
    ],
    "total": 14
  }
}
```

---

## 5. Agreements

### 5.1 Create Agreement

```
POST /api/agreements
Auth: Required
Roles: landlord
```

**Request Body:**
```json
{
  "listingId": "clx_lst1",
  "tenantId": "clx_tenant1",
  "type": "rental",
  "startDate": "2026-08-01",
  "endDate": "2027-07-31",
  "rentAmount": 850000,
  "rentPeriod": "monthly",
  "cautionDeposit": 850000,
  "serviceCharge": 50000,
  "noticePeriodDays": 30,
  "specialClauses": "No pets allowed. Landlord provides DSTV subscription."
}
```

**Response 201:**
```json
{
  "data": {
    "id": "clx_agr1",
    "status": "draft",
    "createdAt": "2026-06-18T10:00:00.000Z"
  }
}
```

---

### 5.2 List Agreements

```
GET /api/agreements
Auth: Required
Roles: Any authenticated party
```

Returns all agreements where the user is landlord, tenant, or agent.

**Query Parameters:**
- `status` — filter by agreement status
- `type` — `rental|sale|short_let|share`

---

### 5.3 Get Agreement

```
GET /api/agreements/[id]
Auth: Required
Roles: Party to agreement (landlord, tenant, or agent)
```

---

### 5.4 Preview Agreement (HTML)

```
GET /api/agreements/[id]/preview
Auth: Required
Roles: Party to agreement
```

Returns `text/html` — rendered agreement document for display in a browser tab or iframe.

---

### 5.5 Sign Agreement

```
POST /api/agreements/[id]/sign
Auth: Required
Roles: Landlord or tenant (must be a party)
```

**Request Body:**
```json
{
  "consent": true,
  "consentText": "I, Adaeze Okonkwo, agree to the terms of this tenancy agreement."
}
```

**Response 200:**
```json
{
  "data": {
    "agreementId": "clx_agr1",
    "status": "fully_signed",
    "signedAt": "2026-06-18T11:30:00.000Z",
    "checksum": "sha256:abc123..."
  }
}
```

On `fully_signed`: rent schedule is automatically generated and both parties receive email notifications.

**Signing States:**

```
draft → pending_tenant [landlord signs first]
pending_tenant → tenant_signed [tenant signs]
tenant_signed → fully_signed [already landlord-signed]

OR:

draft → pending_landlord [tenant signs first, unusual]
pending_landlord → landlord_signed [landlord signs]
landlord_signed → fully_signed [already tenant-signed]
```

---

### 5.6 Terminate Agreement

```
POST /api/agreements/[id]/terminate
Auth: Required
Roles: landlord, admin
```

**Request Body:**
```json
{
  "reason": "Tenant vacated early with mutual agreement."
}
```

---

## 6. Messages

Messaging uses **4-second client polling** for real-time feel. WebSockets are planned for v1.1.

### 6.1 List Conversations

```
GET /api/messages
Auth: Required
```

**Response 200:**
```json
{
  "data": {
    "conversations": [
      {
        "id": "clx_cnv1",
        "listing": { "id": "clx_lst1", "title": "3-Bed Flat, Lekki", "coverImage": "https://..." },
        "otherParty": { "id": "clx_usr2", "fullName": "Emeka Obi", "avatarUrl": null },
        "lastMessage": "When can I schedule a viewing?",
        "lastMessageAt": "2026-06-18T09:45:00.000Z",
        "unreadCount": 2,
        "status": "active"
      }
    ]
  }
}
```

---

### 6.2 Create Conversation

```
POST /api/messages
Auth: Required
```

**Request Body:**
```json
{
  "landlordId": "clx_landlord1",
  "tenantId": "clx_tenant1",
  "listingId": "clx_lst1",
  "initialMessage": "Hi, I'm interested in this property. Is it still available?"
}
```

**Idempotent:** If a conversation already exists for this `landlordId + tenantId + listingId` triple, the existing conversation is returned (HTTP 200) rather than a new one created.

**Response 201/200:**
```json
{
  "data": {
    "conversationId": "clx_cnv1",
    "isNew": true
  }
}
```

---

### 6.3 Get Messages (Poll)

```
GET /api/messages/[conversationId]?since=2026-06-18T09:40:00.000Z
Auth: Required
Roles: Party to conversation
```

The `since` parameter returns only messages after that timestamp. Omit for full history. This endpoint also marks all messages as read for the requesting user.

**Response 200:**
```json
{
  "data": {
    "messages": [
      {
        "id": "clx_msg1",
        "content": "When can I schedule a viewing?",
        "senderId": "clx_tenant1",
        "isRead": false,
        "attachmentUrl": null,
        "attachmentType": null,
        "createdAt": "2026-06-18T09:45:00.000Z"
      }
    ]
  }
}
```

---

### 6.4 Send Message

```
POST /api/messages/[conversationId]
Auth: Required
Roles: Party to conversation
```

**Request Body:**
```json
{
  "content": "Yes, it's still available. I can show you this Saturday.",
  "attachmentUrl": null
}
```

**Response 201:**
```json
{
  "data": {
    "id": "clx_msg2",
    "content": "Yes, it's still available...",
    "createdAt": "2026-06-18T10:02:00.000Z"
  }
}
```

An SMS is sent to the recipient if this is the **first unread message** in the conversation (prevents notification spam).

---

## 7. Payments

### 7.1 Initiate Payment

```
POST /api/payments
Auth: Required
Roles: tenant
```

**Request Body:**
```json
{
  "listingId": "clx_lst1",
  "type": "rent",
  "rentScheduleId": "clx_rnt1"
}
```

`type`: `rent | caution | sale | short_let`

**Response 200:**
```json
{
  "data": {
    "transactionId": "clx_txn1",
    "authorizationUrl": "https://checkout.paystack.com/xxxxx",
    "reference": "PROPATI-1718700000-abc123",
    "amount": 850000,
    "platformFee": 85000,
    "totalCharged": 935000
  }
}
```

The client should redirect to or open `authorizationUrl` in the Paystack inline checkout widget.

---

### 7.2 Get Transaction

```
GET /api/payments/[id]
Auth: Required
Roles: Payer, payee, admin
```

**Response 200:**
```json
{
  "data": {
    "id": "clx_txn1",
    "reference": "PROPATI-1718700000-abc123",
    "type": "rent",
    "status": "in_escrow",
    "amount": 850000,
    "platformFee": 85000,
    "agentCommission": 8500,
    "payeeAmount": 756500,
    "listing": { "id": "clx_lst1", "title": "3-Bed Flat, Lekki" },
    "payer": { "id": "clx_tenant1", "fullName": "Adaeze Okonkwo" },
    "payee": { "id": "clx_landlord1", "fullName": "Emeka Obi" },
    "createdAt": "2026-06-18T12:00:00.000Z",
    "updatedAt": "2026-06-18T12:05:00.000Z"
  }
}
```

---

### 7.3 Verify Payment Status

```
POST /api/payments/[id]/verify
Auth: Required
```

Queries Paystack API to confirm payment status. Useful to poll after checkout redirect.

**Response 200:** Updated transaction with current `status`.

---

### 7.4 Release Escrow

```
POST /api/payments/[id]/release
Auth: Required
Roles: admin
```

Triggers Paystack Transfer API to send `payeeAmount` to the payee's bank account.

**Request Body:**
```json
{
  "adminNotes": "Tenant confirmed move-in on 2026-08-01."
}
```

**Response 200:**
```json
{
  "data": {
    "transactionId": "clx_txn1",
    "status": "released",
    "transferReference": "TRF_xxx",
    "releasedAt": "2026-08-01T09:00:00.000Z"
  }
}
```

---

## 8. Users & Profile

### 8.1 Get My Profile

```
GET /api/users/me/profile
Auth: Required
```

Returns the full user profile including verification flags, employment data (tenant only), and agent data (agent only).

---

### 8.2 Update My Profile

```
PATCH /api/users/me/profile
Auth: Required
```

**Request Body (examples):**
```json
{
  "fullName": "Adaeze Okonkwo",
  "phone": "08012345678",
  "profileBio": "Young professional, non-smoker, works in finance.",
  "employmentStatus": "employed",
  "employmentType": "full_time",
  "employerName": "Access Bank PLC",
  "jobTitle": "Senior Analyst",
  "yearlyIncome": 7200000,
  "guarantorName": "Chukwudi Okonkwo",
  "guarantorPhone": "08098765432",
  "guarantorRelationship": "Father"
}
```

---

### 8.3 Get Notifications

```
GET /api/users/me/notifications?unreadOnly=false&page=1
Auth: Required
```

**Response 200:**
```json
{
  "data": {
    "notifications": [
      {
        "id": "clx_not1",
        "type": "verification",
        "title": "Layer 1 Approved",
        "body": "Your property documents have been verified. Proceed to Layer 2.",
        "read": false,
        "createdAt": "2026-06-18T08:30:00.000Z"
      }
    ],
    "unreadCount": 3
  }
}
```

---

### 8.4 Mark Notifications Read

```
PATCH /api/users/me/notifications
Auth: Required
```

**Request Body:**
```json
{
  "ids": ["clx_not1", "clx_not2"],
  "markAllRead": false
}
```

Pass `"markAllRead": true` to mark all notifications as read.

---

### 8.5 Admin: List Users

```
GET /api/users?role=tenant&page=1&limit=50&search=adaeze
Auth: Required
Roles: admin
```

---

### 8.6 Admin: Update User

```
PATCH /api/users/[id]
Auth: Required
Roles: admin
```

**Request Body:**
```json
{
  "isActive": false,
  "isBanned": true,
  "banReason": "Multiple fraud reports confirmed.",
  "agentApproved": false
}
```

---

## 9. Organisations (B2B)

### 9.1 Create Organisation

```
POST /api/orgs
Auth: Required
Roles: estate_manager
```

**Request Body:**
```json
{
  "name": "Prime Estate Managers Ltd",
  "billingEmail": "billing@primeestates.ng",
  "address": "14 Victoria Island, Lagos",
  "cacNumber": "RC-1234567"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "clx_org1",
    "name": "Prime Estate Managers Ltd",
    "planTier": "starter",
    "maxUnits": 20,
    "maxSeats": 1
  }
}
```

---

### 9.2 Get Organisation

```
GET /api/orgs/[id]
Auth: Required
Roles: Org member, admin
```

---

### 9.3 Portfolio

```
GET /api/orgs/[id]/portfolio
Auth: Required
Roles: Org member
```

**Response 200:**
```json
{
  "data": {
    "units": [
      {
        "listingId": "clx_lst1",
        "title": "Unit 4A, Zenith Court",
        "area": "Ikeja GRA",
        "status": "occupied",
        "tenant": { "id": "clx_t1", "fullName": "Adaeze Okonkwo" },
        "monthlyRent": 350000,
        "nextDueDate": "2026-07-01"
      }
    ],
    "summary": {
      "total": 18,
      "occupied": 14,
      "vacant": 3,
      "maintenance": 1
    }
  }
}
```

---

### 9.4 Rent Ledger

```
GET /api/orgs/[id]/ledger?month=2026-06&status=overdue
Auth: Required
Roles: manager, accountant
```

---

### 9.5 Team Management

**Invite Member:**
```
POST /api/orgs/[id]/members
Auth: Required
Roles: manager
```

```json
{
  "email": "amaka@primeestates.ng",
  "role": "accountant"
}
```

Roles: `manager | accountant | maintenance | owner_view`

**Update Member:**
```
PATCH /api/orgs/[id]/members/[memberId]
```
```json
{ "role": "maintenance" }
```

**Remove Member:**
```
DELETE /api/orgs/[id]/members/[memberId]
Auth: Required
Roles: manager
```

---

### 9.6 Maintenance Tickets

**List Tickets:**
```
GET /api/orgs/[id]/tickets?status=open&priority=urgent&page=1
```

**Create Ticket:**
```
POST /api/orgs/[id]/tickets
```
```json
{
  "listingId": "clx_lst1",
  "title": "Burst pipe in kitchen",
  "description": "Water leaking under the sink.",
  "category": "plumbing",
  "priority": "urgent"
}
```

**Update Ticket:**
```
PATCH /api/orgs/[id]/tickets/[ticketId]
```
```json
{
  "status": "assigned",
  "assignedTo": "clx_maintenance_member",
  "resolutionNote": null
}
```

---

### 9.7 Subscribe / Upgrade Plan

```
POST /api/orgs/[id]/subscription
Auth: Required
Roles: manager (owner)
```

**Request Body:**
```json
{
  "plan": "growth"
}
```

Plans: `starter | growth | enterprise`

**Response 200:**
```json
{
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/sub_xxx",
    "plan": "growth",
    "amount": 60000,
    "interval": "monthly"
  }
}
```

---

### 9.8 Bulk CSV Import

```
POST /api/orgs/[id]/bulk-upload
Auth: Required
Roles: manager
Content-Type: multipart/form-data
```

**Form Fields:**
- `file` — CSV file

**CSV Template Headers:**
```
title,address,area,state,property_type,bedrooms,bathrooms,price,tenant_email,monthly_rent,start_date,end_date
```

**Response 200:**
```json
{
  "data": {
    "imported": 14,
    "failed": 2,
    "errors": [
      { "row": 8, "field": "tenant_email", "message": "Invalid email format" },
      { "row": 12, "field": "price", "message": "Must be a positive number" }
    ]
  }
}
```

---

### 9.9 Monthly Reports

```
GET /api/orgs/[id]/reports?month=2026-06
Auth: Required
Roles: manager, accountant
```

**Response 200:**
```json
{
  "data": {
    "month": "2026-06",
    "revenue": {
      "collected": 4200000,
      "outstanding": 700000,
      "total": 4900000
    },
    "occupancy": {
      "occupied": 14,
      "vacant": 3,
      "rate": 0.82
    },
    "maintenance": {
      "opened": 5,
      "resolved": 4,
      "avgResolutionDays": 2.3
    },
    "arrears": [
      { "unit": "Unit 3B", "tenant": "John Doe", "amountOwed": 350000, "daysOverdue": 18 }
    ]
  }
}
```

---

## 10. Webhooks

### 10.1 Paystack Webhook

```
POST /api/webhook/paystack
Auth: HMAC-SHA512 signature (x-paystack-signature header)
Content-Type: application/json (raw body)
```

**Handled Events:**

| Event | Action |
|-------|--------|
| `charge.success` | `transaction.status` → `in_escrow`; tenant notified |
| `charge.failed` | `transaction.status` → `failed`; tenant notified |
| `transfer.success` | `transaction.status` → `released`; payee notified |
| `transfer.failed` | Log + alert admin |
| `subscription.create` | `org_subscriptions` record created |
| `subscription.disable` | `org_subscriptions.status` → `cancelled` |

All events are idempotent — processing the same event twice has no effect.

---

### 10.2 Clerk Webhook

```
POST /api/webhook/clerk
Auth: svix HMAC signature (svix-signature header)
Content-Type: application/json
```

**Handled Events:**

| Event | Action |
|-------|--------|
| `user.created` | `prisma.user.create()` with Clerk metadata |
| `user.updated` | `prisma.user.update()` role, name, email |
| `user.deleted` | `prisma.user.update()` → `isActive=false` (soft delete) |

---

## 11. Error Reference

### 11.1 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | No valid session token |
| `FORBIDDEN` | 403 | Authenticated but insufficient role or not resource owner |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `VALIDATION_ERROR` | 422 | Request body failed Zod validation. `details` contains field-level errors |
| `CONFLICT` | 409 | Resource already exists (e.g. duplicate conversation) |
| `RATE_LIMITED` | 429 | Too many requests. Check `Retry-After` header |
| `VERIFICATION_LAYER_LOCKED` | 409 | Trying to submit a layer that hasn't been unlocked yet |
| `ORG_UNIT_LIMIT_REACHED` | 409 | Organisation has reached plan's max unit count |
| `ORG_SEAT_LIMIT_REACHED` | 409 | Organisation has reached plan's max team seat count |
| `PAYMENT_ALREADY_IN_ESCROW` | 409 | Duplicate payment initiation for same rent schedule |
| `AGREEMENT_NOT_SIGNABLE` | 409 | Trying to sign an agreement not in a pending state |
| `EXTERNAL_SERVICE_ERROR` | 502 | Prembly, Paystack, or Termii returned an error |
| `INTERNAL_ERROR` | 500 | Unexpected server error (logged to Sentry) |

### 11.2 Validation Error Format

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "fieldErrors": {
      "price": ["Expected number, received string"],
      "area": ["String must contain at least 2 character(s)"]
    },
    "formErrors": []
  }
}
```

### 11.3 Rate Limit Response

```json
HTTP/1.1 429 Too Many Requests
Retry-After: 347
Content-Type: application/json

{
  "error": "Too many requests. Please slow down.",
  "code": "RATE_LIMITED",
  "details": { "retryAfter": 347 }
}
```

---

*This reference documents the Next.js 14 API. Endpoints are subject to change during active development — check `BUILD_PLAN.md` for implementation status of each phase.*
