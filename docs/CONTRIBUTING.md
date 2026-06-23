# PROPATI — Contributor Guide

**Version:** 1.0  
**Stack:** Next.js 14 App Router · TypeScript · Prisma · Supabase · Clerk · Paystack

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Setup](#2-local-setup)
3. [Environment Variables](#3-environment-variables)
4. [Git Workflow](#4-git-workflow)
5. [Commit Message Conventions](#5-commit-message-conventions)
6. [Pull Request Process](#6-pull-request-process)
7. [Code Review Standards](#7-code-review-standards)
8. [Coding Standards](#8-coding-standards)
9. [Database Changes](#9-database-changes)
10. [Testing Requirements](#10-testing-requirements)
11. [Troubleshooting Local Setup](#11-troubleshooting-local-setup)

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) |
| pnpm | 9.x | `npm i -g pnpm` |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| VS Code | Latest | Recommended IDE |

**Required VS Code extensions:**
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Prisma (`Prisma.prisma`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

---

## 2. Local Setup

### 2.1 Clone and Install

```bash
git clone git@github.com:propati-ng/propati.git
cd propati
pnpm install
```

### 2.2 Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your development credentials. See Section 3 for all required variables and where to get them.

### 2.3 Database Setup

PROPATI uses a shared staging Supabase database for local development. Each developer should use their own Supabase project for feature development:

```bash
# Apply migrations to your dev database
pnpm prisma migrate dev

# Seed with test data
pnpm prisma db seed
```

Seed creates:
- 1 admin user (admin@propati.test / see `.env.local`)
- 3 landlords with verified listings at each tier
- 2 tenants with completed profiles
- 1 estate manager with 5 listings

### 2.4 Start Development Server

```bash
pnpm dev
```

App runs on `http://localhost:3000`.

### 2.5 Verify Setup

Open `http://localhost:3000/api/health`. Response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

---

## 3. Environment Variables

### 3.1 Required for Local Dev

| Variable | Where to Get |
|----------|-------------|
| `DATABASE_URL` | Your personal Supabase project → Settings → Database → Connection string (Transaction mode, port 6543) |
| `DIRECT_URL` | Same Supabase project → Connection string (Direct, port 5432) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → sign the dev endpoint with ngrok (see 3.2) |
| `PAYSTACK_SECRET_KEY` | Paystack Dashboard → Test mode → API Keys |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack Dashboard → Webhooks |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack Dashboard → Test mode |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `PREMBLY_API_KEY` | Use `mock` in local dev |
| `ENCRYPTION_KEY` | Generate: `openssl rand -hex 32` |
| `NIN_HMAC_KEY` | Generate: `openssl rand -hex 32` |
| `CRON_SECRET` | Generate: `openssl rand -hex 16` |

### 3.2 Webhook Testing Locally (ngrok)

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy the https://xxxx.ngrok.app URL
# In Clerk Dashboard → Webhooks, add endpoint: https://xxxx.ngrok.app/api/webhook/clerk
# In Paystack Dashboard → Webhooks, add endpoint: https://xxxx.ngrok.app/api/webhook/paystack
```

### 3.3 Prembly Mock Mode

In `.env.local`, set `PREMBLY_API_KEY=mock`. When using mock mode, the Layer 2 verification endpoint returns a fixed mock response with NIN `12345678901` resolving to a test identity.

---

## 4. Git Workflow

### 4.1 Branch Naming

```
feature/<short-description>     # New feature
fix/<short-description>         # Bug fix
chore/<short-description>       # Tooling, deps, config
docs/<short-description>        # Documentation only
db/<short-description>          # Schema migration
```

Examples:
- `feature/verification-layer3-video`
- `fix/rent-schedule-timezone`
- `db/add-listing-views-index`

### 4.2 Gitflow

```
main ──────────────────────── production
  │
staging ──────────────────── deployed to staging.propati.ng
  │                           CI runs all tests
  │
feature/xyz ──────────────── your work
```

**Rules:**
1. Never commit directly to `main` or `staging`
2. Branch from `staging`, merge back to `staging` via PR
3. `staging` → `main` is done by Engineering Lead only after QA sign-off
4. If your branch has been open for more than 3 days, rebase on `staging` to avoid large merge conflicts

### 4.3 Keeping Your Branch Up to Date

```bash
git fetch origin
git rebase origin/staging
```

If there are conflicts, resolve them, then:
```bash
git add .
git rebase --continue
```

---

## 5. Commit Message Conventions

PROPATI uses **Conventional Commits** (`conventionalcommits.org`).

### 5.1 Format

```
<type>(<scope>): <short description>

[optional body — explain WHY, not WHAT]

[optional footer — references issues, BREAKING CHANGE]
```

### 5.2 Types

| Type | Use When |
|------|---------|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Code restructure with no behaviour change |
| `test` | Add or update tests |
| `docs` | Documentation only |
| `chore` | Tooling, deps, CI, config |
| `db` | Schema migration (always pair with Prisma migration file) |

### 5.3 Scopes

```
listings | verification | agreements | payments | messages | auth | users
orgs | admin | email | notifications | middleware | config | tests | docs
```

### 5.4 Examples

```
feat(verification): add Layer 3 video upload with QR code validation

The landlord must hold a QR code printout while walking through the property.
This ties the video to a specific verification session and prevents reuse
of old video footage.

Closes #87
```

```
fix(payments): use raw body buffer for Paystack HMAC verification

Next.js parses body automatically for API routes. Must read as ArrayBuffer
before parsing to JSON, otherwise the HMAC check always fails.
```

```
db(listings): add btree index on (state, area, status) for search query

Search was doing full table scan on 40k listings. This index reduces
the search query from 1200ms to 45ms.
```

---

## 6. Pull Request Process

### 6.1 Before Opening a PR

- [ ] All tests pass locally: `pnpm test`
- [ ] TypeScript compiles: `pnpm type-check`
- [ ] Lint passes: `pnpm lint`
- [ ] If schema changed: migration file exists and `prisma generate` was run
- [ ] If UI changed: manually tested on mobile viewport (375px)
- [ ] No secrets committed (check `git diff` for API keys)

### 6.2 PR Description Template

```markdown
## What
Brief description of what this PR does.

## Why
Why this change is needed. Link to issue or explain the business context.

## How
Key implementation decisions or approach, if non-obvious.

## Testing
How you tested this. What edge cases were checked.

## Checklist
- [ ] Tests added/updated
- [ ] Types pass
- [ ] Lint passes
- [ ] Migration tested (if DB change)
- [ ] Tested on mobile
```

### 6.3 PR Size Guidelines

- **Ideal:** < 400 lines changed
- **Maximum:** 800 lines (ask for review exemption above this)
- If your PR is large, break it into smaller, logically independent PRs
- Feature flags are not required — dark deployments are acceptable for large features (unlinked pages)

### 6.4 Review Requirements

| PR Type | Approvals Required |
|---------|--------------------|
| Hotfix to main | 1 approval + Engineering Lead review |
| Feature or fix | 1 approval |
| DB migration | 1 approval + Engineering Lead review |
| Security change | Engineering Lead review required |

### 6.5 Merge Strategy

- Use **Squash and Merge** for feature branches (keeps history clean)
- Use **Merge Commit** for staging → main promotions (preserves feature history for traceability)

---

## 7. Code Review Standards

### 7.1 Reviewer Responsibilities

When reviewing a PR:
- **Check logic correctness** — does the code do what the PR claims?
- **Check security** — is there input validation? Ownership check? No secret in code?
- **Check database access** — is there an N+1 query? Missing index? Missing `select`?
- **Check error handling** — are errors propagated correctly? Does a failure leave state inconsistent?

Do **not** block on:
- Code style differences that don't affect readability
- Bikeshedding on variable names (request changes only if genuinely confusing)
- Personal preferences that aren't in the style guide

### 7.2 Comment Labels

Use these labels in code review comments:

| Label | Meaning |
|-------|---------|
| `[blocking]` | Must fix before merge |
| `[suggestion]` | Nice to have, author's choice |
| `[question]` | Seeking clarification, not a change request |
| `[nit]` | Minor style — optional fix |

Example:
```
[blocking] This is missing the ownership check. A tenant could update another
tenant's profile. Add `WHERE userId = currentUser.id` to the Prisma query.
```

### 7.3 Author's Response

- Address every `[blocking]` comment with either a fix or a clear explanation of why you disagree
- Mark resolved comments as resolved in GitHub after addressing them
- Don't force-push after review starts — add new commits

---

## 8. Coding Standards

### 8.1 TypeScript

- Strict mode is on — no `any` casts without an explanatory comment
- Use `unknown` for untyped external data, narrow before use
- Prefer `interface` for object shapes, `type` for unions and utility types
- Export types from `src/types/` — not from within component files

### 8.2 Server vs Client Components

```typescript
// Server Component (default — no 'use client')
// ✓ Can be async, access DB, read env vars
// ✗ Cannot use useState, useEffect, event handlers, browser APIs

// Client Component ('use client' at top of file)
// ✓ Interactive, stateful, event handlers
// ✗ Cannot access DB, cannot be async component
```

Default to Server Components. Add `'use client'` only when required. Never add `'use client'` to a page component that could stay server-side.

### 8.3 API Route Pattern

```typescript
// src/app/api/listings/route.ts
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-helpers';

const CreateSchema = z.object({
  title: z.string().min(5).max(200),
  // ...
});

export async function POST(req: Request) {
  const { user, error } = await withAuth(req, ['landlord', 'estate_manager']);
  if (error) return error;

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 422, parsed.error.flatten());

  const listing = await prisma.listing.create({
    data: { ...parsed.data, ownerId: user.id },
    select: { id: true, status: true, createdAt: true },
  });

  return successResponse(listing, 201);
}
```

### 8.4 Money / BigInt

```typescript
// Prices are ALWAYS stored in kobo (1/100 Naira) as BigInt
const priceKobo = BigInt(850000) * 100n; // 850,000 Naira = 85,000,000 kobo

// Display
const displayNaira = (kobo: bigint) => `₦${(Number(kobo) / 100).toLocaleString('en-NG')}`;

// JSON serialisation (BigInt doesn't JSON.stringify)
return Response.json({ price: priceKobo.toString() }); // stringify for API response
```

### 8.5 Prisma Query Patterns

```typescript
// Always use select, not include, for list queries (prevents over-fetching)
const listings = await prisma.listing.findMany({
  where: { status: 'active' },
  select: {
    id: true, title: true, price: true, area: true,
    owner: { select: { fullName: true, ninVerified: true } },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20,
});

// Use $transaction for operations that must succeed or fail together
const [agreement, _schedules] = await prisma.$transaction([
  prisma.agreement.update({ where: { id }, data: { status: 'fully_signed' } }),
  prisma.rentSchedule.createMany({ data: schedules }),
]);
```

### 8.6 Imports

```
Import order (enforced by ESLint):
1. React
2. Next.js
3. Third-party packages
4. Internal @/ aliases (types, lib, components, hooks)
5. Relative imports
```

---

## 9. Database Changes

### 9.1 Migration Workflow

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
pnpm prisma migrate dev --name add_listing_views_index

# 3. Verify migration SQL looks correct
cat prisma/migrations/<timestamp>_add_listing_views_index/migration.sql

# 4. Regenerate Prisma client
pnpm prisma generate
```

### 9.2 Migration Rules

- **Never** use `prisma migrate reset` on staging or production
- **Never** manually edit a migration file after it has been committed
- **Always** include migration file in the same PR as the code that uses it
- **Destructive changes** (drop column, rename column) require a multi-PR strategy:
  1. PR 1: Add new column, dual-write in application
  2. PR 2: Backfill data
  3. PR 3: Switch reads to new column
  4. PR 4: Drop old column

### 9.3 Index Guidelines

Add an index when a query:
- Filters or sorts on a non-primary-key column in a table with > 1000 rows
- Joins on a foreign key that isn't already indexed
- Is used in a background job or cron (no user-facing latency to mask slowness)

---

## 10. Testing Requirements

Full details in `TESTING_GUIDE.md`. Summary:

| PR Type | Required Tests |
|---------|----------------|
| New API route | Unit test for auth + validation + happy path |
| Business logic (verification, payments, agreements) | Unit test for each state transition |
| UI page | Playwright E2E for the golden path |
| Bug fix | Regression test that would have caught the bug |
| Refactor | Existing tests must still pass, no new tests required unless logic changed |

Run tests locally before every PR:
```bash
pnpm test          # Vitest unit/integration
pnpm test:e2e      # Playwright (requires dev server running)
pnpm type-check    # TypeScript
pnpm lint          # ESLint + Prettier
```

---

## 11. Troubleshooting Local Setup

### "Prisma: Can't reach database server"

Check that `DATABASE_URL` uses port 6543 (PgBouncer), not 5432 (direct). For migrations only use `DIRECT_URL` at port 5432.

### "Clerk: Invalid JWT" or "No session found"

1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set (check Clerk dashboard)
2. Verify `CLERK_SECRET_KEY` is set (from Clerk dashboard)
3. Clear browser cookies and log in again
4. Restart the dev server (Clerk keys are baked in at start)

### "Paystack: Webhook signature mismatch"

When testing locally, you must use the webhook secret from Paystack Test mode (not live). In dev, the `PAYSTACK_WEBHOOK_SECRET` should match what's in the Paystack Test dashboard.

### "pnpm install fails on Windows"

```bash
# Run as administrator or use:
pnpm install --ignore-scripts
# Then run prisma generate manually:
pnpm prisma generate
```

### "Clerk webhook events not reaching localhost"

Make sure ngrok is running and the tunnel URL is registered in Clerk Dashboard. Clerk webhooks will fail silently if the endpoint returns non-2xx. Check the Clerk webhook logs in the dashboard for delivery status and error codes.

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
