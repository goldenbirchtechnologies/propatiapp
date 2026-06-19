# PROPATI — Claude Instructions

Nigeria's first verified property marketplace. Next.js 14 App Router + Prisma + Supabase + Clerk + Paystack.

## Stack at a glance
- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL) via Prisma ORM
- **Auth:** Clerk (`clerkMiddleware`, webhooks → Prisma User table)
- **Payments:** Paystack (HMAC-SHA512 webhook), Remita (stamp duty / FIRS)
- **Files:** Cloudinary (images, documents, PDFs, videos)
- **Roles:** `landlord | tenant | agent | estate_manager | admin`

## Route layout
```
src/app/
  (public)/          # listings, home, marketing pages
  (dashboard)/       # auth-guarded shell — layout.tsx is 9-line auth-only server component
    dashboard/
      landlord/      # landlord pages
      tenant/        # tenant pages
      agent/         # agent pages
      estate-manager/
      [role]/        # shared: messages, payments, notifications (validates params.role === user.role)
  admin/             # admin-only
  onboarding/        # post-signup wizard
  sign-up/           # role picker → Clerk <SignUp>
  sign-in/
  api/               # all API routes
```

## Critical rules
- **Never commit `.env`** — it is gitignored and contains all secrets
- Only `NEXT_PUBLIC_` vars reach the browser — everything else is server-only
- `(dashboard)/layout.tsx` must remain a thin auth-only server component — adding UI there causes double sidebar
- Run `npx prisma generate && next build` (not just `next build`) — Vercel needs the generate step
- `DATABASE_URL` uses pooler port 6543; `DIRECT_URL` uses direct port 5432 for migrations
- Mock fallbacks are active for all external services when env vars are unset (Remita, Prembly, Termii, Cloudinary)

## Key files
- `prisma/schema.prisma` — source of truth for all 24+ tables
- `src/lib/navigation.tsx` — all sidebar nav configs per role
- `src/lib/auth.ts` — `getRoleRedirectPath()`, `getCurrentUser()`
- `src/components/layout/DashboardShell.tsx` — sidebar + topbar chrome
- `src/lib/stamp-duty.ts` — Remita/FIRS stamp duty logic (0.78% of annual rent)

## Stamp duty
Nigerian Stamp Duties Act, CAP S8, LFN 2004. Rate: 0.78%, min ₦500, zero for amounts ≤ ₦10,000. Paid via Remita (SystemSpecs) which is the official FIRS/GIFMIS gateway. E-certificate is generated and embedded in tenancy agreements.

## Docs index
All documentation lives in `docs/`. Key files:
- [BUILD_PLAN.md](docs/BUILD_PLAN.md) — phases A–H, current build status
- [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — phases 1–10, launch checklist
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, component map
- [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — all tables documented
- [API_REFERENCE.md](docs/API_REFERENCE.md) — all API routes
- [SECURITY.md](docs/SECURITY.md) — security model, encryption, audit logging
- [TRD.md](docs/TRD.md) — full technical requirements
- [USER_JOURNEYS.md](docs/USER_JOURNEYS.md) — all 5 role journeys
- [VERIFICATION_SYSTEM.md](docs/VERIFICATION_SYSTEM.md) — 5-layer verification
- [DEPLOYMENT.md](DEPLOYMENT.md) — GitHub → Supabase → Clerk → Vercel → propati.ng
