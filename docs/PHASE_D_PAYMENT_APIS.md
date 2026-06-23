# PROPATI Phase D: Payment APIs & Paystack Webhook Implementation

**Status:** ✅ Complete  
**Date:** June 18, 2026  
**Phase:** D - Payments & Escrow

---

## Overview

This document details the complete implementation of PROPATI's payment infrastructure for Phase D, including:
- Payment initiation API
- Payment verification API
- Paystack webhook handler with signature verification
- Escrow release API with bank account verification
- Transaction listing and detail APIs
- Receipt generation API (stub for future implementation)
- React hooks for payment management
- Webhook security utilities

---

## Files Created

### API Routes

1. **`src/app/api/payments/initiate/route.ts`**
   - POST handler for payment initiation
   - Validates user authentication and listing availability
   - Computes platform fees and agent commissions
   - Creates transaction record in database
   - Calls Paystack initialize API
   - Returns authorization URL and transaction details

2. **`src/app/api/payments/verify/[reference]/route.ts`**
   - GET handler for payment verification
   - Verifies payment with Paystack API
   - Updates transaction status to IN_ESCROW on success
   - Creates notifications for all parties
   - Handles failed payments gracefully

3. **`src/app/api/webhook/paystack/route.ts`** (Updated)
   - POST handler with HMAC-SHA512 signature verification
   - Handles multiple Paystack events:
     - `charge.success` → Move to IN_ESCROW
     - `charge.failed` → Mark as FAILED
     - `transfer.success` → Mark as RELEASED
     - `transfer.failed` → Log failure, notify admin
     - `charge.dispute.create` → Create dispute record
     - `charge.dispute.resolve` → Update dispute status
     - `subscription.*` → Handle org subscriptions
   - Idempotent event processing
   - Returns 200 for all valid webhooks

4. **`src/app/api/payments/release-escrow/[id]/route.ts`**
   - POST handler for escrow release
   - Authorization: Admin or landlord (payee)
   - Validates transaction is IN_ESCROW
   - Resolves bank account with Paystack
   - Verifies account name matches
   - Creates transfer recipient
   - Initiates Paystack transfer
   - Updates transaction status to RELEASED
   - Sends notifications to all parties

5. **`src/app/api/payments/transactions/route.ts`**
   - GET handler for paginated transaction list
   - Filters: userId, status, type, listingId, agreementId
   - Role-based authorization (users see own, admin sees all)
   - Returns formatted amounts in Naira

6. **`src/app/api/payments/transactions/[id]/route.ts`**
   - GET handler for single transaction details
   - Includes listing, payer, payee, agent details
   - Authorization: Transaction participants or admin

7. **`src/app/api/payments/transactions/[id]/receipt/route.ts`**
   - GET handler for PDF receipt generation
   - Currently returns 501 (Not Implemented) as per requirements
   - Placeholder for future PDF generation

---

## Library Files

### Validators (`src/lib/validators.ts`)
Added schemas:
- `releaseEscrowSchema` - Bank account and recipient validation
- `transactionFiltersSchema` - Transaction list query parameters
- Exported types: `ReleaseEscrowInput`, `TransactionFilters`

### Webhook Helpers (`src/lib/webhook-helpers.ts`)
New utilities:
- `getRawBody()` - Extract raw request body
- `verifyPaystackSignature()` - HMAC-SHA512 verification
- `verifySignatureSecure()` - Timing-safe signature comparison
- `parseWebhookEvent()` - Safe JSON parsing
- `generateIdempotencyKey()` - Prevent duplicate processing
- `isWebhookProcessed()` / `markWebhookProcessed()` - Event deduplication
- `WebhookResponse` - Standard response helpers

### API Client (`src/lib/api.ts`)
Updated endpoints:
- `payments.getTransactions()` → `/api/payments/transactions`
- `payments.getTransaction(id)` → `/api/payments/transactions/${id}`
- `payments.initiate()` → `/api/payments/initiate`
- `payments.verify(reference)` → `/api/payments/verify/${reference}`
- `payments.releaseEscrow(id, data)` → `/api/payments/release-escrow/${id}`
- `payments.getReceipt(id)` → `/api/payments/transactions/${id}/receipt`

---

## React Hooks

### `src/hooks/usePayments.ts` (Updated)

#### Query Hooks
```typescript
useTransactions(params?: TransactionFilters)
// Returns paginated transaction list with filters
// Params: page, limit, userId, status, type, listingId, agreementId

useTransaction(id: string, enabled?: boolean)
// Returns single transaction with full details
```

#### Mutation Hooks
```typescript
useInitiatePayment()
// Initiates payment, returns Paystack authorization URL
// Input: { listingId, agreementId?, type, amount, email, metadata? }

useVerifyPayment()
// Verifies payment by reference
// Input: reference (string)

useReleaseEscrow()
// Releases funds from escrow to bank account
// Input: { transactionId, recipientBankCode, recipientAccountNumber, recipientName, amount?, reason? }
```

#### Utility Hooks
```typescript
usePaymentStatus(transaction)
// Returns status badge config (color, label)

usePaymentBreakdown(transaction)
// Calculates fee percentages and formatted amounts
```

---

## API Endpoints Reference

### 1. Payment Initiation
**POST** `/api/payments/initiate`

**Request:**
```json
{
  "listingId": "uuid",
  "agreementId": "uuid (optional)",
  "type": "rent | caution | sale | short_let | subscription",
  "amount": 1000000,
  "email": "tenant@example.com",
  "metadata": {
    "description": "First month rent"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "...",
  "reference": "PROPATI_RENT_1234567890_abc123",
  "transaction": {
    "id": "uuid",
    "reference": "...",
    "amount": 100000000,
    "amountFormatted": "₦1,000,000",
    "type": "rent",
    "status": "pending",
    "fees": {
      "platformFee": 10000000,
      "platformFeeFormatted": "₦100,000",
      "agentCommission": 1000000,
      "agentCommissionFormatted": "₦10,000",
      "payeeAmount": 89000000,
      "payeeAmountFormatted": "₦890,000"
    },
    "createdAt": "2026-06-18T..."
  }
}
```

---

### 2. Payment Verification
**GET** `/api/payments/verify/[reference]`

**Response (200):**
```json
{
  "success": true,
  "transaction": { /* full transaction object */ },
  "status": "in_escrow",
  "message": "Payment verified successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Payment verification failed",
  "details": "Card declined"
}
```

---

### 3. Paystack Webhook
**POST** `/api/webhook/paystack`

**Headers:**
```
x-paystack-signature: <hmac-sha512-signature>
```

**Request Body (charge.success):**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "PROPATI_RENT_...",
    "amount": 100000000,
    "status": "success",
    "customer": { ... },
    "metadata": { ... }
  }
}
```

**Response (200):**
```json
{
  "received": true,
  "event": "charge.success"
}
```

**Events Handled:**
- `charge.success` - Payment successful → IN_ESCROW
- `charge.failed` - Payment failed → FAILED
- `transfer.success` - Transfer successful → RELEASED
- `transfer.failed` - Transfer failed → Log + notify admin
- `charge.dispute.create` - Chargeback initiated → Create dispute
- `charge.dispute.resolve` - Dispute resolved → Update status
- `subscription.create` / `subscription.disable` / `subscription.not_renew` - Org subscriptions

---

### 4. Escrow Release
**POST** `/api/payments/release-escrow/[id]`

**Authorization:** Admin or Landlord (payee)

**Request:**
```json
{
  "recipientBankCode": "058",
  "recipientAccountNumber": "0123456789",
  "recipientName": "John Doe",
  "amount": 890000,
  "reason": "Rent payment for June 2026"
}
```

**Response (200):**
```json
{
  "success": true,
  "transfer": {
    "transferCode": "TRF_...",
    "reference": "ESCROW_RELEASE_...",
    "amount": 89000000,
    "amountFormatted": "₦890,000",
    "recipient": "JOHN DOE",
    "accountNumber": "0123456789",
    "status": "pending"
  },
  "transaction": { /* updated transaction */ }
}
```

**Validation:**
- Resolves account number with Paystack
- Verifies account name matches (fuzzy match)
- Creates transfer recipient
- Initiates transfer
- Updates transaction status

---

### 5. Transaction List
**GET** `/api/payments/transactions?page=1&limit=20&status=in_escrow&type=rent`

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `userId` - Filter by user (admin only)
- `status` - Filter by transaction status
- `type` - Filter by transaction type
- `listingId` - Filter by listing
- `agreementId` - Filter by agreement

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "reference": "...",
      "type": "rent",
      "status": "in_escrow",
      "amount": 100000000,
      "amountFormatted": "₦1,000,000",
      "listing": { ... },
      "payer": { ... },
      "payee": { ... },
      "createdAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 6. Transaction Detail
**GET** `/api/payments/transactions/[id]`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "reference": "...",
    "type": "rent",
    "status": "in_escrow",
    "amount": 100000000,
    "amountFormatted": "₦1,000,000",
    "platformFee": 10000000,
    "platformFeeFormatted": "₦100,000",
    "agentCommission": 1000000,
    "agentCommissionFormatted": "₦10,000",
    "payeeAmount": 89000000,
    "payeeAmountFormatted": "₦890,000",
    "description": "...",
    "listing": {
      "id": "...",
      "title": "3-Bedroom Apartment",
      "address": "...",
      "images": [...]
    },
    "payer": { ... },
    "payee": { ... },
    "agent": { ... },
    "agreements": [...],
    "rentSchedule": [...],
    "paystackData": { ... },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 7. Receipt Generation
**GET** `/api/payments/transactions/[id]/receipt`

**Response (501 - Not Implemented):**
```json
{
  "success": false,
  "error": "Receipt generation not yet implemented",
  "message": "PDF receipt generation will be implemented in the next phase"
}
```

---

## Security Measures

### 1. Webhook Signature Verification
- Uses HMAC-SHA512 algorithm
- Compares signatures with timing-safe equality
- Rejects requests with invalid signatures
- Returns 400 for signature failures

### 2. Idempotency
- Generates unique references with timestamps
- In-memory cache prevents duplicate processing
- Webhook events deduplicated by event ID
- Transaction status checks prevent double-processing

### 3. Authorization
All endpoints implement role-based access control:
- **Initiate Payment:** Authenticated users
- **Verify Payment:** Payer, payee, or admin
- **Webhook:** Signature-verified Paystack requests only
- **Release Escrow:** Admin or landlord (payee)
- **View Transactions:** Owner or admin
- **Download Receipt:** Payer or admin

### 4. Raw Body Handling
- Webhook route reads raw body for signature verification
- Uses `request.text()` for raw body access
- Prevents body parsing before verification

### 5. Bank Account Verification
- Resolves account number with Paystack API
- Verifies account name matches (case-insensitive, space-insensitive)
- Returns error on name mismatch
- Prevents transfers to wrong accounts

### 6. Audit Logging
All payment actions logged:
- Payment initiation
- Verification attempts
- Escrow releases
- Webhook events
- Transfer successes/failures

---

## Error Handling

### Paystack Errors
```typescript
// Invalid API key
{ error: 'Payment provider error', details: 'Unauthorized' }

// Insufficient funds
{ error: 'Payment provider error', details: 'Insufficient funds' }

// Card declined
{ error: 'Payment verification failed', details: 'Card declined' }

// Network errors
{ error: 'Payment provider error', details: 'Network timeout' }
```

### Validation Errors
```typescript
// Invalid request body
{ error: 'Invalid request body', details: { /* Zod errors */ } }

// Missing required field
{ error: 'Invalid request body', details: [{ path: ['amount'], message: '...' }] }
```

### Authorization Errors
```typescript
// Not authorized
{ error: 'FORBIDDEN: Not authorized to release this escrow' }

// Not authenticated
{ error: 'Unauthorized', details: 'No valid session' }
```

### Business Logic Errors
```typescript
// Transaction not in escrow
{ error: 'Cannot release escrow in pending status' }

// Agreement not signed
{ error: 'Agreement must be fully signed before escrow release' }

// Listing not available
{ error: 'Listing is not available for payment' }
```

---

## Database Schema

### Transaction Model
```prisma
model Transaction {
  id               String           @id @default(cuid())
  reference        String?          @unique
  listingId        String?
  payerId          String
  payeeId          String
  agentId          String?
  type             TransactionType
  status           TransactionStatus @default(pending)
  amount           BigInt           // kobo
  platformFee      BigInt           @default(0)
  agentCommission  BigInt           @default(0)
  payeeAmount      BigInt?
  description      String?
  paystackData     Json?
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  listing          Listing?
  payer            User
  payee            User
  agent            User?
  agreements       Agreement[]
  rentSchedule     RentSchedule?
}

enum TransactionType {
  rent
  caution
  sale
  short_let
  subscription
}

enum TransactionStatus {
  pending
  in_escrow
  released
  failed
  refunded
}
```

---

## Testing Checklist

### Manual Testing
- [ ] Payment initiation flow
- [ ] Paystack checkout redirect
- [ ] Payment callback handling
- [ ] Webhook signature verification
- [ ] Escrow release with bank verification
- [ ] Transaction list filtering
- [ ] Transaction detail view
- [ ] Authorization checks
- [ ] Error scenarios

### Test Cards (Paystack)
```
Success: 4084084084084081
Declined: 5060666666666666666
```

### Webhook Testing
Use Paystack webhook tester or ngrok:
```bash
ngrok http 3000
# Update webhook URL in Paystack dashboard
```

---

## Environment Variables

Add to `.env`:
```bash
# Paystack
PAYSTACK_SECRET_KEY=[REPLACE...RET]  # use sk_test_... in dev
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=[REPLA...OKABLE]
PAYSTACK_WEBHOOK_SECRET=[REPLA...RET]  # Optional, uses SECRET_KEY if not set

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Next Steps (Not Implemented)

### Receipt Generation
- [ ] PDF generation with PDFKit
- [ ] Receipt template design
- [ ] Cloudinary upload for receipts
- [ ] Email receipt to payer
- [ ] Receipt caching in database

### Automated Escrow Release
- [ ] Cron job for scheduled releases
- [ ] Agreement-based release triggers
- [ ] Dispute period handling
- [ ] Multi-party approval workflow

### Agent Commission Payout
- [ ] Separate commission transactions
- [ ] Batch payout processing
- [ ] Agent payment preferences
- [ ] Commission statements

---

## Issues Encountered

### None
All APIs implemented successfully with proper error handling, validation, and security measures in place.

---

## Summary

**Completed:**
✅ Payment initiation API with fee calculation  
✅ Payment verification API with Paystack integration  
✅ Webhook handler with signature verification  
✅ Escrow release API with bank account verification  
✅ Transaction listing and detail APIs  
✅ Receipt generation API stub  
✅ React hooks for payment management  
✅ Webhook security utilities  
✅ Comprehensive error handling  
✅ Role-based authorization  
✅ Audit logging  
✅ Idempotency measures  

**Not Implemented (As Requested):**
- Frontend UI components
- PDF receipt generation logic
- Automated escrow release triggers

---

**End of Phase D Implementation**

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
