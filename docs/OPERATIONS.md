# PROPATI — Operations Playbook

**Version:** 1.0  
**On-Call Rotation:** Engineering Lead (primary) · Backend Engineer (secondary)

---

## Table of Contents

1. [Monitoring Stack](#1-monitoring-stack)
2. [Alert Thresholds](#2-alert-thresholds)
3. [Incident Severity Levels](#3-incident-severity-levels)
4. [On-Call Playbooks](#4-on-call-playbooks)
5. [Database Operations](#5-database-operations)
6. [Cron Job Management](#6-cron-job-management)
7. [Vercel Deployment Operations](#7-vercel-deployment-operations)
8. [Performance Baselines](#8-performance-baselines)
9. [Third-Party Service Health](#9-third-party-service-health)
10. [Daily Operations Checklist](#10-daily-operations-checklist)

---

## 1. Monitoring Stack

| Tool | Purpose | Access |
|------|---------|--------|
| **Vercel Analytics** | Page load metrics, Web Vitals, API error rates | Vercel Dashboard |
| **Vercel Logs** | API route logs, cron job output, edge function logs | Vercel Dashboard → Logs |
| **Sentry** | Error tracking, stack traces, performance | sentry.io |
| **Supabase Dashboard** | DB query performance, connection count, storage | supabase.com |
| **UptimeRobot** | External uptime monitoring, 5-min check interval | uptimerobot.com |
| **Paystack Dashboard** | Transaction status, webhook delivery, dispute queue | dashboard.paystack.com |
| **Clerk Dashboard** | Auth event logs, webhook delivery status | dashboard.clerk.com |

### 1.1 Sentry Configuration

```typescript
// src/instrumentation.ts (Next.js 14 App Router)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Don't send encrypted data to Sentry
  beforeSend(event) {
    // Scrub sensitive fields
    if (event.request?.data) {
      delete event.request.data.idNumber;
      delete event.request.data.nin;
      delete event.request.data.bvn;
    }
    return event;
  },
});
```

### 1.2 UptimeRobot Monitors

| Monitor | URL | Expected Status |
|---------|-----|----------------|
| Homepage | `https://propati.ng` | 200 |
| API Health | `https://propati.ng/api/health` | 200, body contains `"status":"ok"` |
| Staging | `https://staging.propati.ng` | 200 |

Alert channel: `#alerts` Slack channel + email to on-call engineer.

---

## 2. Alert Thresholds

### 2.1 Error Rate Alerts (Sentry)

| Metric | Warning | Critical |
|--------|---------|----------|
| API 5xx error rate | > 1% over 5 min | > 5% over 5 min |
| Payment webhook failures | > 2 in 10 min | > 5 in 10 min |
| Clerk webhook failures | > 3 in 15 min | — |
| New unhandled exception | — | Any |

### 2.2 Performance Alerts (Vercel Analytics)

| Metric | Warning | Critical |
|--------|---------|----------|
| Homepage LCP | > 2.5s (p75) | > 4s (p75) |
| API P95 latency | > 1s | > 3s |
| API P99 latency | > 3s | > 10s |

### 2.3 Database Alerts (Supabase)

| Metric | Warning | Critical |
|--------|---------|----------|
| Connections (direct) | > 15 | > 18 (max is 20) |
| CPU utilisation | > 60% for 5 min | > 90% for 2 min |
| Storage | > 70% of plan | > 90% of plan |
| Slow queries (> 1s) | > 10 in 5 min | > 50 in 5 min |

---

## 3. Incident Severity Levels

| Level | Description | Response Time | Notify |
|-------|-------------|--------------|--------|
| **P0 — Critical** | Platform down, data breach, payment fraud | 15 min | Engineering Lead immediately |
| **P1 — High** | Core feature broken (can't pay, can't list), < 50% users affected | 1 hour | Engineering Lead |
| **P2 — Medium** | Feature degraded, workaround exists | 4 hours | Engineering Lead |
| **P3 — Low** | Minor bug, single user | Next sprint | Logged in GitHub Issues |

### 3.1 Incident Lifecycle

```
Alert fires
  │
  ├─ Acknowledge: On-call engineer claims incident in Slack
  │
  ├─ Investigate: Identify root cause using logs/metrics
  │
  ├─ Communicate: Post status update in #incidents channel
  │
  ├─ Mitigate: Rollback / hotfix / service restart
  │
  ├─ Resolve: Confirm resolution, update status
  │
  └─ Post-mortem: Written document within 7 days (P0/P1 only)
```

---

## 4. On-Call Playbooks

### 4.1 P0: Platform Completely Down

**Symptoms:** Homepage returns 5xx, UptimeRobot fires, Sentry spike

```bash
# 1. Check provider status
open https://vercel-status.com
open https://status.supabase.com
open https://status.clerk.com

# 2. Check Vercel deployment status
vercel ls --prod
# Look for "Error" or "Building" state that's stalled

# 3. If last deployment is suspect, rollback
vercel rollback <previous-deployment-id>

# 4. Check DB connectivity
# Supabase Dashboard → Database → Connections
# If > 18 connections: may be connection storm from a bad deployment

# 5. If all services healthy but app is down — check for bad env var
# Vercel Dashboard → Settings → Environment Variables
# Look for recently changed variables
```

**Communication template:**
```
🔴 [P0 INCIDENT] propati.ng is down
Time: [time]
Impact: All users
Investigating: [your name]
Next update: in 15 minutes
```

---

### 4.2 P1: Payment Processing Broken

**Symptoms:** Paystack webhook failures in Sentry, transactions stuck in `pending`

```bash
# 1. Check Paystack status
open https://status.paystack.com

# 2. Check recent webhook delivery in Paystack Dashboard
# Dashboard → Webhooks → Delivery Logs
# Look for failed deliveries with error codes

# 3. Common causes:
# a) PAYSTACK_WEBHOOK_SECRET mismatch → check Vercel env var matches Paystack dashboard
# b) Next.js body already parsed → ensure webhook route reads raw ArrayBuffer
# c) Paystack IP blocked → check Vercel Edge WAF rules

# 4. Test webhook endpoint manually
curl -X POST https://propati.ng/api/webhook/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test" \
  -d '{"event":"test"}'
# Expected: 400 (invalid signature) — proves endpoint is reachable

# 5. For stuck transactions, manually verify via Paystack API
curl https://api.paystack.co/transaction/verify/PROPATI-REF-HERE \
  -H "Authorization: Bearer $PAYSTACK_SECRET_KEY"
# Update transaction.status in DB to match Paystack's status
```

---

### 4.3 P1: Authentication Down (Users Can't Log In)

**Symptoms:** 401 errors spike, Clerk webhook failures, sign-in pages unresponsive

```bash
# 1. Check Clerk status
open https://status.clerk.com

# 2. Test Clerk middleware
curl -I https://propati.ng/dashboard
# Should redirect to /sign-in (302), not 500

# 3. Check middleware.ts hasn't been accidentally deployed with wrong config
# Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set in Vercel

# 4. If Clerk is operational but users are stuck:
# Check if CLERK_WEBHOOK_SECRET changed — would cause user sync failures
# New signups would fail to create Prisma user records
```

---

### 4.4 P2: Verification Stuck (Users Can't Advance Layers)

**Symptoms:** Landlords reporting Layer 2 failing, Prembly errors in Sentry

```bash
# 1. Check Prembly API status (no public status page — check response from API)
curl -X POST https://api.prembly.com/identitypass/verification/nin \
  -H "x-api-key: $PREMBLY_API_KEY" \
  -H "app-id: $PREMBLY_APP_ID" \
  -d '{"number":"12345678901","type":"nin"}'

# 2. If Prembly is down, enable mock mode temporarily
# Set PREMBLY_API_KEY=mock in Vercel env vars
# This allows testing to continue on staging

# 3. Notify affected landlords if Prembly outage > 2 hours
# Template: "We're experiencing a temporary delay with identity verification.
# Your documents have been saved and will be verified once the service recovers."
```

---

### 4.5 P2: Database Slow (High Latency)

**Symptoms:** API P95 > 3s, Supabase slow query alerts, user complaints about speed

```bash
# 1. Check Supabase Dashboard → Database → Performance
# Look for: long-running queries, connection count, CPU spike

# 2. Find slow queries
# Supabase Dashboard → SQL Editor:
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# 3. Check connection count
SELECT count(*) FROM pg_stat_activity;
# If > 15, there may be a connection leak in application code

# 4. If a specific query is the culprit, check for missing index
EXPLAIN ANALYZE <slow query here>;
# Look for "Seq Scan" on large tables — add an index

# 5. If connections are maxed out:
# Restart the Vercel deployment to reset serverless connections
vercel --prod --force
```

---

### 4.6 P3: Cron Job Missed

**Symptoms:** No rent reminders sent on expected day, listings not expiring

```bash
# 1. Check Vercel cron log
# Vercel Dashboard → Functions → Filter for /api/cron/*

# 2. Manually trigger the cron to catch up
curl -X GET https://propati.ng/api/cron/rent-reminders \
  -H "Authorization: Bearer $CRON_SECRET"

# 3. Cron jobs are idempotent — safe to run twice
# The rent-reminders cron checks sent_at before sending to prevent duplicates

# 4. If cron consistently fails, check the function timeout
# Vercel hobby plan: 10s timeout. Pro plan: 300s.
# Ensure cron logic is batched and doesn't exceed timeout.
```

---

## 5. Database Operations

### 5.1 Check Database Health

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries (> 30 seconds)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
  AND state != 'idle';

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### 5.2 Kill a Runaway Query

```sql
-- Identify the pid from the long-running query check above
SELECT pg_terminate_backend(<pid>);
```

### 5.3 Backup and Restore

**Supabase Point-in-Time Recovery (PITR):**
1. Supabase Dashboard → Settings → Backups
2. Select a recovery timestamp
3. Restore to a new project (do NOT restore over production — verify data first)
4. After verification, if full restore is needed: update `DATABASE_URL` and `DIRECT_URL` in Vercel to point to restored project

**Manual backup before major migration:**
```bash
# Uses DIRECT_URL (port 5432, bypasses PgBouncer)
pg_dump "postgresql://postgres:<pass>@db.<ref>.supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  -F c \
  -f "backup_$(date +%Y%m%d_%H%M).dump"
```

### 5.4 Analyse Table Statistics (after large writes)

After bulk inserts or major data changes, update query planner statistics:

```sql
ANALYZE listings;
ANALYZE transactions;
```

---

## 6. Cron Job Management

### 6.1 Viewing Cron Logs

```bash
# Via Vercel CLI
vercel logs --filter=/api/cron

# Expected output per run:
# [cron] rent-reminders: processed 14 tenants, sent 12 SMS, 2 already sent
```

### 6.2 Cron Schedule Overview

| Job | WAT Time | Frequency |
|-----|----------|-----------|
| `rent-reminders` | 08:00 daily | Sends SMS to tenants with rent due in 3 days |
| `expire-listings` | 04:00 daily | Sets inactive status for listings past `availableFrom + 30d` |
| `flag-review` | 07:00 Mondays | Admin email digest of flagged listings |

### 6.3 Adding a New Cron Job

```typescript
// src/app/api/cron/my-new-job/route.ts
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Idempotent logic here
  const result = await runMyJob();
  return Response.json({ processed: result.count });
}
```

Then add to `vercel.json`:
```json
{ "path": "/api/cron/my-new-job", "schedule": "0 8 * * *" }
```

---

## 7. Vercel Deployment Operations

### 7.1 View Deployment History

```bash
vercel ls --prod
```

### 7.2 Roll Back Production

```bash
vercel rollback <deployment-url-or-id>
```

### 7.3 Set / Update Environment Variable

```bash
# Interactive
vercel env add SOME_SECRET production

# Or update via Dashboard: Settings → Environment Variables
```

After changing env vars, redeploy for changes to take effect:
```bash
vercel --prod --force
```

### 7.4 Check Build Errors

```bash
vercel inspect <deployment-url>
```

---

## 8. Performance Baselines

These are targets and should be measured monthly. If metrics degrade, raise a P2 issue.

| Metric | Target | Tool |
|--------|--------|------|
| Homepage LCP | < 2.5s (p75) | Vercel Analytics |
| Homepage FID | < 100ms | Vercel Analytics |
| Homepage CLS | < 0.1 | Vercel Analytics |
| Listing search P50 | < 200ms | Vercel Logs |
| Listing search P95 | < 800ms | Vercel Logs |
| API write P95 | < 1s | Vercel Logs |
| Paystack webhook P95 | < 500ms | Sentry |
| DB connections (idle) | < 5 | Supabase |

### 8.1 Core Web Vitals

Vercel Analytics tracks real-user CWV automatically at `propati.ng/analytics`. Review weekly.

---

## 9. Third-Party Service Health

Bookmark these status pages:

| Service | Status Page |
|---------|------------|
| Vercel | https://vercel-status.com |
| Supabase | https://status.supabase.com |
| Clerk | https://status.clerk.com |
| Paystack | https://status.paystack.com |
| Cloudinary | https://status.cloudinary.com |

During an incident, always check these before digging into PROPATI code — the issue may be external.

---

## 10. Daily Operations Checklist

Run each morning before 09:00 WAT:

```markdown
## Daily Ops — [date]

**Platform Health**
- [ ] propati.ng loads correctly (manual check)
- [ ] `/api/health` returns 200 + database connected
- [ ] Vercel: no error spike in last 24 hours
- [ ] Sentry: no new unhandled exceptions

**Cron Jobs (yesterday)**
- [ ] `rent-reminders` — check Vercel log, confirm SMS were sent
- [ ] `expire-listings` — check Vercel log, confirm no errors

**Payments**
- [ ] Paystack: no failed webhooks in last 24 hours
- [ ] No transactions stuck in `pending` for > 1 hour

**Verification Queue**
- [ ] Admin queue: `GET /api/verification/admin/queue` — review count
- [ ] No verifications pending > 24 hours without admin action

**Database**
- [ ] Supabase: connection count < 10
- [ ] Supabase: no alerts on CPU/storage

**User Reports**
- [ ] Review any new listings flagged (count of open flags)
- [ ] Review any new support emails
```
