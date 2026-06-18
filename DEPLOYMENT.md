# PROPATI — Deployment Runbook

**Version:** 1.0  
**Platform:** Vercel (hosting) · Supabase (database) · Clerk (auth) · Cloudinary (media)

---

## Table of Contents

1. [Environment Overview](#1-environment-overview)
2. [Vercel Configuration](#2-vercel-configuration)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Database Migrations](#4-database-migrations)
5. [Deployment Procedures](#5-deployment-procedures)
6. [Staging to Production Promotion](#6-staging-to-production-promotion)
7. [Rollback Procedure](#7-rollback-procedure)
8. [Post-Deploy Verification](#8-post-deploy-verification)
9. [Secrets Rotation](#9-secrets-rotation)
10. [Cron Jobs](#10-cron-jobs)

---

## 1. Environment Overview

| Environment | URL | Branch | Vercel Project | Database |
|-------------|-----|--------|----------------|----------|
| **Local** | localhost:3000 | any feature branch | — | Developer's own Supabase |
| **Preview** | `<pr>.vercel.app` | Any PR branch | `propati-preview` | Staging DB (read-only seeded data) |
| **Staging** | staging.propati.ng | `staging` | `propati-staging` | Staging DB |
| **Production** | propati.ng | `main` | `propati-prod` | Production DB |

**Key rules:**
- Preview deployments never access production data
- Staging mirrors production infrastructure (same region, same tier) to catch scaling issues
- Only Engineering Lead can deploy to production (`main` is branch-protected)

---

## 2. Vercel Configuration

### 2.1 vercel.json

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    { "path": "/api/cron/rent-reminders", "schedule": "0 7 * * *" },
    { "path": "/api/cron/expire-listings", "schedule": "0 3 * * *" },
    { "path": "/api/cron/flag-review",     "schedule": "0 6 * * 1" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options",            "value": "DENY" },
        { "key": "X-Content-Type-Options",      "value": "nosniff" },
        { "key": "Strict-Transport-Security",   "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "Referrer-Policy",             "value": "strict-origin-when-cross-origin" },
        { "key": "X-XSS-Protection",            "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 2.2 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['propati.ng', 'staging.propati.ng'] },
  },
};

module.exports = nextConfig;
```

---

## 3. Environment Variables Reference

All variables are set in Vercel Dashboard → Settings → Environment Variables. Scope each variable to the correct environment(s).

### 3.1 Database

| Variable | Scope | Description |
|----------|-------|-------------|
| `DATABASE_URL` | All | PgBouncer connection string (port 6543) — used by Prisma at runtime |
| `DIRECT_URL` | All | Direct Postgres connection (port 5432) — used by Prisma for migrations only |

**Format:**
```
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<password>@db.<ref>.supabase.co:5432/postgres
```

### 3.2 Authentication (Clerk)

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | All | `pk_live_xxx` (prod) or `pk_test_xxx` (staging) |
| `CLERK_SECRET_KEY` | All | `sk_live_xxx` (prod) or `sk_test_xxx` (staging) |
| `CLERK_WEBHOOK_SECRET` | All | `whsec_xxx` — from Clerk Dashboard → Webhooks |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | All | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | All | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | All | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | All | `/onboarding` |

### 3.3 Payments (Paystack)

| Variable | Scope | Description |
|----------|-------|-------------|
| `PAYSTACK_SECRET_KEY` | All | `sk_live_xxx` (prod) or `sk_test_xxx` (staging) |
| `PAYSTACK_WEBHOOK_SECRET` | All | HMAC key from Paystack Dashboard → Webhooks |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | All | `pk_live_xxx` (prod) or `pk_test_xxx` (staging) |

### 3.4 Media (Cloudinary)

| Variable | Scope | Description |
|----------|-------|-------------|
| `CLOUDINARY_CLOUD_NAME` | All | `propati` |
| `CLOUDINARY_API_KEY` | All | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | All | **Never expose to browser** |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | All | Same as `CLOUDINARY_CLOUD_NAME` (public) |

### 3.5 Identity Verification (Prembly)

| Variable | Scope | Description |
|----------|-------|-------------|
| `PREMBLY_API_KEY` | All | From Prembly Dashboard. Use `mock` on staging for free testing |
| `PREMBLY_APP_ID` | All | From Prembly Dashboard |

### 3.6 SMS (Termii)

| Variable | Scope | Description |
|----------|-------|-------------|
| `TERMII_API_KEY` | All | From Termii Dashboard |
| `TERMII_SENDER_ID` | All | `PROPATI` (must be registered with Termii) |

### 3.7 Encryption

| Variable | Scope | Description |
|----------|-------|-------------|
| `ENCRYPTION_KEY` | All | 32-byte hex key for AES-256-GCM (NIN/BVN) |
| `NIN_HMAC_KEY` | All | 32-byte hex key for HMAC-SHA256 deduplication |

Generate:
```bash
openssl rand -hex 32  # run twice for two different keys
```

### 3.8 Application

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | All | `https://propati.ng` (prod) or `https://staging.propati.ng` |
| `CRON_SECRET` | All | `openssl rand -hex 16` — protects `/api/cron/*` routes |
| `MAINTENANCE_MODE` | All | `false` by default. Set to `true` to enable maintenance page |

---

## 4. Database Migrations

Migrations are run manually against each environment. They are **not** run automatically on deploy.

### 4.1 Staging Migration

```bash
# On your local machine, with staging DATABASE credentials
DIRECT_URL=<staging-direct-url> pnpm prisma migrate deploy
```

Always run `migrate deploy` (not `migrate dev`) on non-local environments. `migrate deploy` applies pending migrations without creating new ones.

### 4.2 Production Migration

```bash
# Pre-migration: check what will be applied
DIRECT_URL=<prod-direct-url> pnpm prisma migrate status

# Apply migration (run during low-traffic window, e.g. 3am–5am WAT)
DIRECT_URL=<prod-direct-url> pnpm prisma migrate deploy

# Post-migration: verify no pending migrations remain
DIRECT_URL=<prod-direct-url> pnpm prisma migrate status
```

### 4.3 Migration Safety Rules

| Migration Type | Approach |
|---------------|---------|
| Add column (nullable) | Safe — deploy migration first, then deploy code |
| Add column (non-nullable with default) | Safe — migration adds default, then code writes it |
| Add column (non-nullable, no default) | Unsafe — must add nullable first, backfill, then add NOT NULL constraint |
| Add index | Safe — creates `CONCURRENTLY` to avoid table lock |
| Drop column | Unsafe — remove from code first (deploy), then drop column (second deploy) |
| Rename column | Unsafe — add new column, dual-write, backfill, switch reads, drop old |
| Add foreign key | Verify data integrity before adding constraint |

### 4.4 Large Table Migrations

For tables with > 100k rows, add `CONCURRENTLY` to index creation and use batched backfills:

```sql
-- Add index without locking
CREATE INDEX CONCURRENTLY idx_listings_area ON listings(area, state, status);

-- Backfill in batches (run as raw SQL in Supabase Studio)
DO $$
DECLARE batch_size INT := 1000;
DECLARE offset_val INT := 0;
BEGIN
  LOOP
    UPDATE listings SET new_column = ... WHERE id IN (
      SELECT id FROM listings WHERE new_column IS NULL LIMIT batch_size OFFSET offset_val
    );
    EXIT WHEN NOT FOUND;
    offset_val := offset_val + batch_size;
    PERFORM pg_sleep(0.1); -- brief pause to avoid lock contention
  END LOOP;
END;
$$;
```

---

## 5. Deployment Procedures

### 5.1 Continuous Deployment to Staging

Staging deploys automatically when a PR is merged to the `staging` branch via GitHub Actions:

```yaml
# .github/workflows/staging.yml
on:
  push:
    branches: [staging]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test --run
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel-args: '--prod'
```

### 5.2 Preview Deployments

Every PR automatically gets a preview URL from Vercel (`<pr-hash>.vercel.app`). Preview deployments use staging secrets (not production).

Preview deploy checklist before requesting review:
- [ ] Preview URL is working (Vercel dashboard shows green)
- [ ] Auth flow works (sign in, sign up)
- [ ] Feature you built works on the preview URL
- [ ] No console errors on the page you built

---

## 6. Staging to Production Promotion

This procedure is run by Engineering Lead only.

### 6.1 Pre-Promotion Checklist

- [ ] All PRs for the release are merged to `staging`
- [ ] Staging has been deployed and accessible
- [ ] QA sign-off obtained from Product
- [ ] Database migration script reviewed (if any)
- [ ] On-call engineer is available for the next 2 hours post-deploy
- [ ] Rollback plan confirmed (last production deployment ID from Vercel)

### 6.2 Promotion Steps

```bash
# 1. Create release PR: staging → main
gh pr create --base main --head staging --title "Release $(date +%Y-%m-%d)" \
  --body "Release promotion from staging. See merged PRs for details."

# 2. Have a second engineer review and approve

# 3. If there are database migrations:
#    Run migrations BEFORE merging the PR
DIRECT_URL=<prod-direct-url> pnpm prisma migrate deploy

# 4. Merge PR (Merge Commit, not Squash — preserves feature history)
gh pr merge --merge

# 5. Monitor Vercel deployment:
vercel --prod   # or watch in Vercel dashboard

# 6. Post-deploy verification (Section 8)
```

### 6.3 Release Notes

After every production release, post a brief summary to the team Slack:
```
🚀 Production Release 2026-06-18

Changes:
- Layer 3 video upload for verification
- Org bulk CSV import
- Rent reminder SMS improvements

Deployed by: [name]
DB migration: Yes (add listing views index)
```

---

## 7. Rollback Procedure

### 7.1 Application Rollback (< 5 minutes)

If the new deployment is broken, Vercel can instantly promote the previous deployment:

```bash
# List recent deployments
vercel ls --prod

# Rollback to previous deployment (gets the deployment ID from list output)
vercel rollback <deployment-id>
```

Or via Vercel Dashboard: Production → Deployments → [previous deployment] → Promote to Production.

### 7.2 Database Rollback

**Prisma does not support automatic rollback of applied migrations.** For most schema changes (adding columns, adding indexes), the correct approach is to deploy a new "undo" migration.

```bash
# Create a rollback migration
pnpm prisma migrate dev --name rollback_add_listing_views_index

# Write the inverse SQL manually in the migration file:
# DROP INDEX CONCURRENTLY idx_listings_area;

# Apply to staging, verify, then apply to production
DIRECT_URL=<prod-direct-url> pnpm prisma migrate deploy
```

For destructive rollbacks (dropping data), consult Engineering Lead before proceeding.

### 7.3 Rollback Decision Tree

```
Broken deploy?
│
├─ Is it a code bug (no DB change)?
│   → Vercel rollback (5 min fix)
│
├─ Is it a DB migration that added a column?
│   → Vercel rollback + write rollback migration to drop column
│
├─ Is it a DB migration that dropped a column (data loss)?
│   → Restore from Supabase PITR snapshot (30-day window)
│   → Alert Engineering Lead + run incident response (Section 9 in SECURITY.md)
│
└─ Is it a third-party service (Clerk, Paystack, Supabase down)?
    → Enable maintenance mode (MAINTENANCE_MODE=true in Vercel env vars)
    → Monitor provider status page, re-enable when resolved
```

---

## 8. Post-Deploy Verification

Run these checks after every production deployment:

### 8.1 Automated (CI)

CI runs type-check, lint, and unit tests on every push. These do not replace manual verification.

### 8.2 Manual Smoke Tests

| Test | Expected |
|------|---------|
| `GET /api/health` | `{ "status": "ok", "database": "connected" }` |
| `GET /api/listings?limit=5` | Returns 5 listings with 200 status |
| Sign up new user | User created in Clerk and Prisma |
| Sign in existing user | Redirected to `/dashboard` |
| View a listing | Page loads with images, verification tier badge |
| Admin panel | `propati.ng/admin` loads for admin user |

### 8.3 Monitoring Checks

After deploy:
1. Vercel Analytics: error rate < 1% in the 15 minutes post-deploy
2. Sentry: no new error spike
3. Supabase: connection count within normal range (< 15 on pooler)

---

## 9. Secrets Rotation

Rotate secrets when:
- A team member with access leaves
- Suspected compromise
- Scheduled quarterly rotation

### 9.1 Rotation Procedure

```bash
# 1. Generate new key
openssl rand -hex 32

# 2. Update in Vercel env vars (do NOT delete old key yet)
# Vercel Dashboard → Settings → Environment Variables → Edit

# 3. Trigger a new deployment (Vercel picks up new env vars on deploy)
vercel --prod --force

# 4. Verify everything still works (smoke tests from Section 8.2)

# 5. Delete old key from Vercel (if it was stored separately)
```

**Note for ENCRYPTION_KEY rotation:** AES-GCM encrypted data (NIN/BVN) cannot be decrypted with the new key. A key rotation requires re-encrypting all stored ciphertext with the new key before removing the old one. This is a maintenance operation — schedule with Engineering Lead.

---

## 10. Cron Jobs

Cron jobs are Vercel functions triggered on a schedule. They are protected by the `CRON_SECRET` env var.

| Path | Schedule (UTC) | Description |
|------|---------------|-------------|
| `/api/cron/rent-reminders` | `0 7 * * *` | 08:00 WAT — SMS reminder for rents due in 3 days |
| `/api/cron/expire-listings` | `0 3 * * *` | 04:00 WAT — Marks expired listings as inactive |
| `/api/cron/flag-review` | `0 6 * * 1` | Monday 07:00 WAT — Emails admin digest of new flags |

### 10.1 Manual Trigger

For testing or manual recovery:

```bash
curl -X POST https://propati.ng/api/cron/rent-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 10.2 Cron Monitoring

Vercel logs each cron invocation. Check Vercel Dashboard → Functions → `/api/cron/*` for execution history. If a cron fails, Vercel does not retry — implement idempotent logic so a manual re-trigger is safe.

```typescript
// Cron route pattern — every cron handler must follow this
export async function GET(req: Request) {
  // Verify this is from Vercel Cron or an authorised manual trigger
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // All work below must be idempotent
  // (safe to run twice without causing duplicates or double-sends)
  const results = await processRentReminders();
  return Response.json({ processed: results.count });
}
```
