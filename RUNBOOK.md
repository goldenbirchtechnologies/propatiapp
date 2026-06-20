# Propati Runbook

Source of truth for running, verifying, and operating the Propati application.

## Prerequisites

- Node.js >= 18.17.0
- npm >= 9.0.0
- WSL environment recommended for parity with local tooling

## Env Setup

1. Copy `.env.example` to `.env` and fill production values.
2. Set only `NEXT_PUBLIC_*` vars for browser-exposed keys.
3. Confirm `DATABASE_URL` uses port 6543 and `DIRECT_URL` uses 5432.

## Install

```bash
npm install
```

## Generate + Build

```bash
npm run db:generate
npm run build
```

## Lint

```bash
npm run lint
```

## Local Dev

```bash
npm run dev
```

## Database

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:seed
```

## Deploy

- GitHub main branch deploys via existing pipeline.
- For manual deploy: verify build locally, then push `main`.
- Remove Vercel secret references from config files before deploy.

## Auth Flow

- Clerk sign-up stores role via Prisma webhook.
- `src/lib/auth.ts` preserves existing role during Clerk sync.
- On sign-in, user is redirected to `/dashboard/<role>` or `/admin`.
- Onboarding redirects completed users to their role dashboard.

## Incident Response

### Severity Levels

- SEV1: auth/signup or database write path broken for users; payments disabled; data loss risk.
- SEV2: major role dashboard unreachable; webhooks failing; significant admin surface down.
- SEV3: minor label, cosmetic UI breakage, or lint gaps not blocking release.

### First Steps

1. Check deployment health (`/api/health`) and recent deploy logs.
2. Reproduce locally with `npm run build` and `npm run dev`.
3. Identify changed files with `git status --short` and recent commits.
4. Check middleware, auth route, and role redirects in:
   - `src/middleware.ts`
   - `src/app/sign-in/[[...sign-in]]/page.tsx`
   - `src/app/onboarding/page.tsx`
   - `src/lib/auth.ts`
5. Do not change secrets or rotate production credentials without confirmation.

### Escalation Path

- Keep user informed of investigation state.
- If database issue suspected, stop writes first, then inspect Prisma client logs.

## Rollback

### Quick Rollback

- Revert specific commit: `git revert <sha>`
- Force-issue a rollback commit only after confirming build health.
- Do not rewrite history on shared branches.

### Full Rollback

1. Stop deploy if mid-pipeline.
2. Revert last deployed commit range.
3. Push to `main` and verify `/api/health` returns 200.
4. Confirm role landing pages and sign-in redirect paths are valid.

## Monitoring

- Watch `/api/health` after every deployment.
- Verify common auth signals: login completion, role assignment, onboarding completion.
- Track payment webhooks: `/api/webhook/paystack`, `/api/webhook/remita`.
- Monitor clerk webhook handler delivery and Prisma sync.

## Key URLs

- Health: `/api/health`
- Sign-in: `/sign-in`
- Sign-up: `/sign-up`
- Onboarding: `/onboarding`
- Dashboards: `/dashboard/tenant`, `/dashboard/landlord`, `/dashboard/agent`, `/dashboard/estate-manager`
- Admin: `/admin`
