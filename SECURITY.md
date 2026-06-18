# PROPATI — Security Policy

**Version:** 1.0  
**Status:** Production  
**Classification:** Internal  
**Owner:** Engineering Lead

---

## Table of Contents

1. [Threat Model](#1-threat-model)
2. [Authentication Security](#2-authentication-security)
3. [Authorisation & RBAC](#3-authorisation--rbac)
4. [Data Protection & Encryption](#4-data-protection--encryption)
5. [NDPR Compliance](#5-ndpr-compliance-nigerian-data-protection-regulation)
6. [API Security](#6-api-security)
7. [Infrastructure Security](#7-infrastructure-security)
8. [Third-Party Security](#8-third-party-security)
9. [Incident Response](#9-incident-response)
10. [Penetration Testing Scope](#10-penetration-testing-scope)
11. [Security Checklist (Pre-Launch)](#11-security-checklist-pre-launch)
12. [Responsible Disclosure](#12-responsible-disclosure)

---

## 1. Threat Model

### 1.1 Assets Being Protected

| Asset | Sensitivity | Impact of Compromise |
|-------|-------------|----------------------|
| NIN / BVN numbers | Critical | Identity theft, regulatory breach |
| Bank account numbers (payee) | High | Financial fraud |
| Rental agreements (signed) | High | Legal fraud, impersonation |
| Transaction records | High | Financial disputes |
| User PII (name, phone, email) | High | Phishing, social engineering |
| Verification documents (C of O) | High | Property fraud |
| Platform admin credentials | Critical | Full platform compromise |

### 1.2 Threat Actors

| Actor | Motivation | Capability |
|-------|------------|------------|
| Fraudulent landlords | Post fake listings, collect deposits | Low-to-medium technical |
| Identity thieves | Harvest NIN/BVN | Medium technical |
| Competing platforms | Scrape listings | Medium automated |
| Nation-state / organised crime | Financial fraud at scale | High technical |
| Disgruntled tenants | Sabotage listings (flagging spam) | Low technical |
| Compromised insider | Data exfiltration | Medium (internal access) |

### 1.3 Trust Boundaries

```
Untrusted                                                  Trusted
─────────────────────────────────────────────────────────────────
Internet │ Vercel Edge + Clerk JWT │ API Route Layer │ Database
         │                        │                 │
         │ Rate limit, CORS        │ Auth check      │ Parameterised
         │ CSP headers            │ Role check      │ queries only
         │ Input sanitisation     │ Ownership check │
```

### 1.4 Attack Surface

| Surface | Risk | Mitigation |
|---------|------|------------|
| Public listing endpoints | Scraping, DDoS | Rate limit, CDN, ISR caching |
| Auth endpoints | Credential stuffing, brute force | 10 req/15min per IP, Clerk lockout |
| File upload | Malicious file, oversized upload | MIME check, size limit, server-side only |
| Paystack webhook | Replay attacks, fake events | HMAC-SHA512 verification + idempotency |
| Clerk webhook | Fake events | svix signature verification |
| Admin console | Privilege escalation | `requireAdmin()` on every route + Clerk MFA |
| Verification docs | Unauthorised access | Cloudinary signed URLs, short expiry |

---

## 2. Authentication Security

### 2.1 Clerk Configuration (Required)

In Clerk Dashboard, enforce:
- **Email verification required** before account activation
- **Password minimum:** 8 characters, 1 uppercase, 1 number
- **Session duration:** 7 days (matches refresh token)
- **MFA:** Required for `admin` and `estate_manager` roles
- **Attack protection:** Enable brute-force detection
- **Allowed redirect URLs:** `https://propati.ng/**`, `https://staging.propati.ng/**` only

### 2.2 JWT Handling

Clerk issues RS256 JWTs signed with Clerk's private key. PROPATI verifies these via Clerk's JWKS endpoint:
- Do **not** manually verify JWT signatures — use `auth()` from `@clerk/nextjs/server`
- JWT expiry: 1 hour (Clerk default)
- Session token stored in httpOnly cookie by Clerk.js — not accessible to JavaScript
- Never log JWT contents in application logs

### 2.3 Session Security

```typescript
// Clerk middleware enforces auth — this is the perimeter
export default clerkMiddleware((auth, req) => {
  if (!isPublic(req)) {
    auth().protect(); // throws 401 if no valid session
  }
});
```

If a user is banned (`User.isBanned = true` or `User.isActive = false`):
1. Clerk session should be revoked via Clerk Management API
2. Application checks `isActive` on every API request via `withAuth()`

### 2.4 Password Reset Security

Handled entirely by Clerk (secure email link, short expiry, one-time use). PROPATI does not implement custom password reset flows.

---

## 3. Authorisation & RBAC

### 3.1 Defence in Depth

Role enforcement occurs at **three layers**:

```
Layer 1: Clerk Middleware (route-level)
  → Blocks unauthenticated users from protected routes
  → Role check for role-specific route groups (/admin/**, /estate-manager/**)

Layer 2: API Route (request-level)
  → withAuth(req, allowedRoles) — verifies token + role on EVERY API call
  → Never trust client-supplied userId

Layer 3: Database Query (resource-level)
  → WHERE ownerId = user.id — ownership enforced in query, not just logic
  → Prevents horizontal privilege escalation
```

### 3.2 Common Authorisation Mistakes to Avoid

```typescript
// WRONG — trusts client-supplied userId
const listing = await prisma.listing.update({
  where: { id: params.id },
  data: { title: body.title },
});

// CORRECT — ownership enforced in WHERE clause
const listing = await prisma.listing.updateMany({
  where: { id: params.id, ownerId: user.id }, // fails silently if not owner
  data: { title: body.title },
});
if (!listing.count) return errorResponse('FORBIDDEN', 403);
```

### 3.3 Org Scoping

All organisation endpoints must verify:
1. User is a member of the org (`OrgMember` record exists with `status=active`)
2. User's org role allows the action (e.g. `accountant` can view ledger but not invite team)

```typescript
// Required pattern for every /api/orgs/[id]/** route
const member = await prisma.orgMember.findFirst({
  where: { orgId: params.id, userId: user.id, status: 'active' },
});
if (!member) return errorResponse('FORBIDDEN', 403);
```

---

## 4. Data Protection & Encryption

### 4.1 NIN/BVN Encryption

Nigerian identity numbers (NIN, BVN) are **Critical** sensitivity. NDPR mandates encryption at rest.

**Implementation:**
```typescript
// src/lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes
const HMAC_KEY = Buffer.from(process.env.NIN_HMAC_KEY!, 'hex'); // separate 32 bytes

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store: iv (12) + authTag (16) + ciphertext — all base64
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(stored: string): string {
  const buf = Buffer.from(stored, 'base64');
  const iv = buf.slice(0, 12);
  const authTag = buf.slice(12, 28);
  const ciphertext = buf.slice(28);
  const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final('utf8');
}

// For deduplication — deterministic, no IV
export function hmac(value: string): string {
  return createHmac('sha256', HMAC_KEY).update(value).digest('hex');
}
```

**Rules:**
- `ENCRYPTION_KEY` and `NIN_HMAC_KEY` must be **different** keys
- Keys must be at least 32 bytes (64 hex chars)
- Keys are rotated annually or on suspected compromise
- Decryption occurs only for: identity verification confirmation, admin review, data export to owner
- Never log decrypted NIN/BVN values — not in application logs, not in Sentry

### 4.2 Income Privacy

```typescript
// src/lib/income.ts — income band display for landlords
export function toIncomeBand(yearlyIncome: bigint): string {
  const naira = Number(yearlyIncome);
  if (naira < 1_200_000) return 'Below ₦1.2M/yr';
  if (naira < 3_000_000) return '₦1.2M–₦3M/yr';
  if (naira < 6_000_000) return '₦3M–₦6M/yr';
  if (naira < 12_000_000) return '₦6M–₦12M/yr';
  return '₦12M+/yr';
}
```

### 4.3 Data Classification

| Data Class | Examples | Access | Retention |
|------------|----------|--------|-----------|
| **Critical** | NIN, BVN | Encrypted + user-only | User lifetime + 6 months |
| **Confidential** | Bank account, exact income, agreements | Auth + role | 7 years (financial records) |
| **Internal** | User profile, messages, listings | Auth required | User lifetime |
| **Public** | Listing title, price, area, verification tier | No auth | Until deleted |

### 4.4 Data Minimisation

- Don't store what you don't need
- `User.password` field is a legacy artefact — **never write to it**. Clerk handles all authentication
- Prembly API response data (photo, address): log to `email_log` for audit but do not persist raw identity data beyond what's needed for the match confirmation
- OTP records: deleted after use or after 10-minute expiry

### 4.5 Verification Document Access Control

Documents uploaded to Cloudinary (`propati/documents/`) must **never** be publicly accessible. Access pattern:

```typescript
// Generate a signed Cloudinary URL with 15-minute expiry for admin review
import { v2 as cloudinary } from 'cloudinary';

function getSignedDocUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: Math.floor(Date.now() / 1000) + 900, // 15 min
  });
}
```

---

## 5. NDPR Compliance (Nigerian Data Protection Regulation)

### 5.1 Legal Basis for Processing

| Data Category | Legal Basis | Collection Point |
|---------------|-------------|------------------|
| Name, email, phone | Contract performance | Signup form |
| NIN/BVN | Legitimate interest (fraud prevention) + consent | Identity verification flow |
| Employment + income | Consent (optional for tenants) | Tenant profile |
| Payment information | Contract performance | Payment flow |
| Browsing behaviour | Legitimate interest (security, analytics) | Privacy policy |

### 5.2 Consent Implementation

- Privacy policy and terms of service linked at signup — acceptance recorded in `User.createdAt` timestamp
- NIN/BVN collection: explicit consent modal before submission with purpose statement
- Marketing emails: opt-in only, unsubscribe in every email footer

### 5.3 Data Subject Rights

| Right | Implementation | SLA |
|-------|----------------|-----|
| Access | `GET /api/users/me/profile` returns all user data | Immediate (self-service) |
| Correction | `PATCH /api/users/me/profile` | Immediate |
| Deletion | Admin: soft-delete user, null PII fields | 30 days |
| Portability | JSON export of user data (Phase 2) | 7 days |
| Objection to processing | Support email | 14 days |

### 5.4 Breach Notification

Nigeria Data Protection Bureau requires breach notification within 72 hours. See Section 9 (Incident Response) for the notification procedure.

---

## 6. API Security

### 6.1 Input Validation

Every API route validates request bodies with Zod before processing:

```typescript
const Schema = z.object({
  title: z.string().min(5).max(200).trim(),
  price: z.number().int().positive().max(1_000_000_000), // max 1 billion Naira
  area: z.string().min(2).max(100).trim(),
});

const parsed = Schema.safeParse(await req.json());
if (!parsed.success) {
  return errorResponse('VALIDATION_ERROR', 422, parsed.error.flatten());
}
```

Never use `Schema.parse()` in API routes — use `safeParse()` so Zod errors become structured 422 responses rather than unhandled exceptions.

### 6.2 SQL Injection Prevention

Prisma generates parameterised queries. Never use `prisma.$queryRawUnsafe()`. If raw SQL is needed:

```typescript
// Allowed — tagged template literal (auto-escaped by Prisma)
const results = await prisma.$queryRaw`
  SELECT * FROM listings WHERE area ILIKE ${'%' + area + '%'} LIMIT 20
`;

// FORBIDDEN — never concatenate user input into SQL
const results = await prisma.$queryRawUnsafe(`SELECT * FROM listings WHERE area ILIKE '%${area}%'`);
```

### 6.3 CORS Policy

```typescript
// next.config.js
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL, // propati.ng only
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

No wildcard `*` origins in production.

### 6.4 Rate Limiting

| Endpoint Group | Limit | Window | Key |
|----------------|-------|--------|-----|
| All routes | 300 req | 15 min | IP |
| `/api/auth/**` | 10 req | 15 min | IP |
| `/api/verification/layer2` (Prembly) | 5 req | 1 min | userId |
| `/api/payments` (initiate) | 10 req | 1 min | userId |
| File uploads | 20 req | 1 min | userId |

Rate limit responses: HTTP 429 with `Retry-After: <seconds>` header.

### 6.5 Content Security Policy

```javascript
// next.config.js headers
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.propati.ng https://js.paystack.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://res.cloudinary.com https://img.clerk.com",
    "connect-src 'self' https://api.paystack.co https://clerk.propati.ng",
    "frame-src https://checkout.paystack.com",
  ].join('; ')
}
```

### 6.6 Security Headers

```javascript
// Applied to all routes
{ key: 'X-Frame-Options', value: 'DENY' },
{ key: 'X-Content-Type-Options', value: 'nosniff' },
{ key: 'X-XSS-Protection', value: '1; mode=block' },
{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
```

---

## 7. Infrastructure Security

### 7.1 Vercel

- All environment secrets stored in Vercel Environment Variables (encrypted at rest)
- Preview deployments do **not** receive production secrets — use staging secrets only
- Disable Vercel public access on `staging.propati.ng` (Vercel password protection)
- Enable Vercel Web Application Firewall on production

### 7.2 Supabase

- Row Level Security (RLS): Disabled — authorisation enforced at application layer via Prisma
- Database password: 32+ character random, stored only in Vercel env vars
- Point-in-Time Recovery (PITR): Enabled for production (30-day window)
- Network: Connection restricted to Supabase pooler + direct URLs (no public exposures)
- Supabase MFA: Required for all team members with database access

### 7.3 Clerk Dashboard

- Team access: Only Engineering Lead and one backup admin
- MFA: Required for all team members
- Webhook signing keys: Rotated quarterly or on team member departure

### 7.4 Secrets Management

Rules for secret handling:
- **Never commit secrets** to git — `.env.local` is gitignored
- **Never log secrets** — Sentry breadcrumbs and error metadata must not include API keys or tokens
- **Rotate on breach** — any exposed secret rotated within 1 hour of discovery
- **Principle of least privilege** — each service uses scoped API keys, not master keys

```bash
# .gitignore ensures these are never committed
.env
.env.local
.env.production.local
```

---

## 8. Third-Party Security

### 8.1 Paystack Webhook Verification

```typescript
// Raw body must be captured before JSON parsing
// In Next.js 14 App Router:
export async function POST(req: Request) {
  const rawBody = await req.arrayBuffer();
  const rawBodyBuffer = Buffer.from(rawBody);

  const signature = req.headers.get('x-paystack-signature');
  const expected = createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(rawBodyBuffer)
    .digest('hex');

  if (signature !== expected) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(rawBodyBuffer.toString());
  // Process event...
}
```

Paystack webhook IPs are documented — consider allowlisting in Vercel Edge Rules.

### 8.2 Clerk Webhook Verification

```typescript
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const svixId = req.headers.get('svix-id')!;
  const svixTimestamp = req.headers.get('svix-timestamp')!;
  const svixSignature = req.headers.get('svix-signature')!;

  const body = await req.text();
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt;
  try {
    evt = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature });
  } catch {
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }
  // Process evt...
}
```

### 8.3 Cloudinary Upload Security

- All uploads are server-side — client never receives Cloudinary API credentials
- Signed upload presets used for verification documents (authenticated delivery)
- Image transformations include `fl_sanitize` to strip malicious SVG content
- Upload validation: MIME type checked server-side regardless of file extension

### 8.4 Prembly / Identity Pass

- API key stored server-side only — never exposed to browser
- Responses containing identity data (photo, address) are used for confirmation only and not persisted raw
- Failed lookups logged at `warn` level with error code only (no PII in logs)

---

## 9. Incident Response

### 9.1 Severity Levels

| Level | Description | Examples | Response Time |
|-------|-------------|---------|---------------|
| **P0 — Critical** | Production down or data breach | Database exposed, payment fraud | 15 minutes |
| **P1 — High** | Major feature broken, potential breach | Payment webhook failing, admin locked out | 1 hour |
| **P2 — Medium** | Degraded performance, minor data issue | Slow queries, SMS failures | 4 hours |
| **P3 — Low** | Minor bug, cosmetic issue | UI glitch, incorrect label | Next sprint |

### 9.2 Incident Response Procedure

**P0/P1 — Data Breach:**
1. **Contain (0–15 min):** Disable affected service (Vercel env var `MAINTENANCE_MODE=true`), revoke compromised API keys
2. **Assess (15–60 min):** Determine scope — what data, how many users, how long
3. **Notify team (60 min):** Engineering Lead + Product Lead + Legal
4. **Notify regulator (within 72 hrs):** Nigeria Data Protection Bureau (NDPB) — mandatory for NDPR compliance
5. **Notify affected users:** Template email prepared in `src/lib/email.ts` as `security_incident`
6. **Post-mortem (within 7 days):** Root cause analysis, timeline, remediation

**P0 — Platform Down:**
1. Check Vercel status (`vercel.com/status`)
2. Check Supabase status (`status.supabase.com`)
3. Check Clerk status (`status.clerk.com`)
4. Roll back last deployment if issue started with deploy: `vercel rollback`
5. Emergency DNS: point `propati.ng` to maintenance page

### 9.3 Contact Information

| Role | Contact | Alert Method |
|------|---------|--------------|
| Engineering Lead | [Internal] | Phone + Slack |
| Database Admin | [Internal] | Slack |
| Paystack Support | support@paystack.com | Email |
| Supabase Support | support@supabase.com | Dashboard ticket |
| Clerk Support | support@clerk.com | Dashboard ticket |
| NDPB (regulator) | ndpb.gov.ng | Formal written notice |

---

## 10. Penetration Testing Scope

### 10.1 In Scope

- All `propati.ng` and `api.propati.ng` endpoints
- Authentication flows (signup, login, token refresh, password reset)
- Authorization checks (role escalation, horizontal access)
- File upload endpoints (malicious file, path traversal)
- Verification system (5-layer logic bypass)
- Payment flow (replay attacks, parameter tampering)
- Webhook endpoints (signature bypass)

### 10.2 Out of Scope

- Clerk authentication infrastructure (report to Clerk's bug bounty)
- Paystack infrastructure (report to Paystack)
- Supabase infrastructure (report to Supabase)
- Denial-of-service attacks
- Social engineering against staff

### 10.3 Testing Rules of Engagement

- Conduct in staging environment only (`staging.propati.ng`)
- Do not access real user data
- Report findings to security@propati.ng before public disclosure
- 90-day coordinated disclosure window

---

## 11. Security Checklist (Pre-Launch)

### Authentication
- [ ] Clerk MFA required for admin + estate_manager roles
- [ ] `clerkMiddleware` (v5 API) — not deprecated `authMiddleware`
- [ ] Session cookie is httpOnly and Secure
- [ ] All protected routes call `auth().protect()` in middleware

### Data
- [ ] `ENCRYPTION_KEY` and `NIN_HMAC_KEY` are different 32-byte keys
- [ ] NIN/BVN stored encrypted; decryption tested
- [ ] Income stored as BigInt; income band tested
- [ ] `User.password` field: never written (Clerk handles auth)
- [ ] Verification documents in Cloudinary `authenticated` delivery type

### API
- [ ] `withAuth()` called on every non-public API route
- [ ] Zod validation on every POST/PATCH body
- [ ] Ownership check in every mutation (WHERE ownerId = user.id)
- [ ] Paystack webhook signature verified (raw body)
- [ ] Clerk webhook signature verified (svix)
- [ ] CORS restricted to `propati.ng` only

### Infrastructure
- [ ] All secrets in Vercel env vars — nothing in code or git
- [ ] `.env.local` gitignored and confirmed absent from git history
- [ ] Supabase PITR enabled
- [ ] Vercel WAF enabled
- [ ] Security headers verified via `securityheaders.com`

### Compliance
- [ ] Privacy policy published and linked at signup
- [ ] NIN/BVN consent modal implemented
- [ ] Data deletion procedure documented
- [ ] NDPB registration completed (if > 2000 data subjects)

---

## 12. Responsible Disclosure

If you discover a security vulnerability in PROPATI:

1. **Do not** publicly disclose until we have addressed it
2. Email: security@propati.ng with subject "Security Vulnerability Report"
3. Include: description, reproduction steps, impact assessment, suggested fix
4. We will acknowledge within 48 hours and provide a 90-day fix timeline
5. We will credit researchers in our release notes (if desired)

We do not have a formal bug bounty programme at this time.

---

*This document is reviewed quarterly and updated after any security incident. All engineering team members must read and acknowledge this policy before contributing to the codebase.*
