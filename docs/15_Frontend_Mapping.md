# 15 – Frontend Mapping

## 1. Public Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `src/app/page.tsx` | Landing page |
| `/listings` | `src/app/(public)/listings/page.tsx` | Public search results |
| `/listings/[id]` | `src/app/(public)/listings/[id]/page.tsx` | Listing detail |
| `/sign-in/[[...sign-in]]` | Clerk default | Sign in |
| `/sign-up/[[...sign-up]]` | Clerk default | Sign up with role |
| `/onboarding` | `src/app/onboarding/page.tsx` | Post-signup wizard |

## 2. Dashboard Routes

| Route | Layout | Purpose |
|-------|--------|---------|
| `/dashboard/landlord` | `src/app/dashboard/[role]/layout.tsx` | Landlord home |
| `/dashboard/landlord/properties` | Same | My properties |
| `/dashboard/landlord/listing/new` | Same | Create listing |
| `/dashboard/landlord/rent` | Same | Rent collection |
| `/dashboard/landlord/agreements` | Same | Agreements list |
| `/dashboard/landlord/screening` | Same | Screening calls |
| `/dashboard/landlord/verify` | Same | Verification wizard |
| `/dashboard/landlord/messages` | Same | Conversations |
| `/dashboard/landlord/profile` | Same | Profile |

Tenant, Agent, Estate Manager, and Admin routes follow the same pattern. See `docs/02_Information_Architecture.md` for full tree.

## 3. API Route Mapping

| Domain | Path Prefix | Key Files |
|--------|-------------|-----------|
| Auth | `/api/auth/*`, `/api/webhook/clerk` | `clerk-webhook/route.ts` |
| Listings | `/api/listings`, `/api/listings/[id]/*` | CRUD, save, flag |
| Applications | `/api/applications` | Tenant apply, landlord review |
| Agreements | `/api/agreements`, `/api/agreements/[id]/*` | Sign, PDF, rent schedule |
| Verification | `/api/verification/*` | 5-layer wizard routes |
| Payments | `/api/payments/*`, `/api/webhook/paystack` | Initiate, verify, release, webhook |
| Messages | `/api/messages`, `/api/conversations/*` | List, send, mark read |
| Notifications | `/api/notifications/*` | CRUD, unread count |
| Orgs | `/api/orgs`, `/api/orgs/[id]/*` | Portfolio, ledger, tickets, team, billing, reports |
| Admin | `/api/admin/*` | Users, verifications, flagged listings, stats, revenue, audit |
| Stamp Duty | `/api/stamp-duty/*` | Initiate, verify |
| Disputes | `/api/disputes/*` | CRUD, action |
| Webhooks | `/api/webhook/paystack`, `/api/webhook/remita` | External callbacks |

## 4. State Management

- Server: Prisma queries in route handlers / server components
- Client: SWR / custom hooks in `src/hooks/`
- UI state: local `useState` / `zustand` (if used)

## 5. Shared Layouts

- `(public)/layout.tsx` — public shell
- `(dashboard)/layout.tsx` — 9-line auth-only server component
- `dashboard/[role]/layout.tsx` — role shell
- `admin/layout.tsx` — admin shell (if present)
