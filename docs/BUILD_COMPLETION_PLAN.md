# PROPATI — Build Completion Plan (Gap Analysis & Fix Plan)

**Generated:** 2025-06-23
**Based on:** Full codebase audit — 134 API routes, 95 pages, 70 components, 49 lib files, 1436-line Prisma schema

---

## 1. Current State Summary

| Area | Built | Missing | Completion |
|------|-------|---------|------------|
| Prisma Schema | 40+ models, 30+ enums | 0 missing models | ~100% |
| API Routes | 134 route.ts files | screening-calls, evidence-packs (public) | ~95% |
| Dashboard Pages | 90 of 95 nav targets | 5 realtor pages | ~95% |
| Admin Pages | 14 pages (incl. business/) | admin/agreements | ~93% |
| Hooks | 17 hooks | None critical | ~95% |
| Lib Layer | 49 files | No test infrastructure | ~90% |
| Components | 70 files | Some realtor-specific components | ~85% |
| Tests | 0 configured | Vitest/Playwright setup, all tests | 0% |
| CI/CD | GitHub Actions file? | Need to verify + deploy pipeline | ~10% |

**Overall codebase: ~85% complete. The gap to launch is mostly realtor pages, screening-calls API, test infrastructure, and polish.**

---

## 2. GAP 1 — Missing Realtor Dashboard Pages [Priority: HIGH]

The navigation config defines 5 realtor routes. Only `/dashboard/realtor` and `/dashboard/realtor/deals` exist. The rest are 404s.

| Missing Page | Nav Label | Needed API |
|---|---|---|
| `/dashboard/realtor/buy/page.tsx` | Buy Pipeline | `GET /api/listings?listingType=sale&realtor_id=me` |
| `/dashboard/realtor/sell/page.tsx` | Sell Pipeline | `GET /api/listings?listingType=sale&owner_id=me` |
| `/dashboard/realtor/listings/page.tsx` | My Listings | `GET /api/listings?owner_id=me` |
| `/dashboard/realtor/profile/page.tsx` | My Profile | `GET/PATCH /api/users/me/profile` |
| `/dashboard/realtor/messages/page.tsx` | Messages | `GET /api/conversations` (shared) |

**Fix Plan:**
- 5 page files + 3-4 client components (BuyPipelineClient, SellPipelineClient, etc.)
- Realtor is essentially a specialized agent focused on buy/sale — reuse agent patterns
- Messages/Profile can reuse the shared `[role]/messages` and `[role]/settings` pages
- Estimated effort: 1.5 days

---

## 3. GAP 2 — Missing Screening-Calls API [Priority: HIGH]

Schema model `ScreeningCall` exists (line 908). Both landlord and tenant screening pages exist in the dashboard. But there is NO `/api/screening-calls` route — the screening pages are likely broken or hitting a non-existent endpoint.

| Needed Route | Purpose |
|---|---|
| `GET /api/screening-calls` | List calls for current user (landlord or tenant) |
| `POST /api/screening-calls` | Schedule a new screening call |
| `PATCH /api/screening-calls/[id]` | Update status (completed/cancelled/no_show) |
| `GET /api/screening-calls/[id]` | Get single call details |

**Fix Plan:**
- Create `src/app/api/screening-calls/` directory with 3 route files
- Wire landlord/tenant screening pages to use these endpoints
- Estimated effort: 0.5 days

---

## 4. GAP 3 — Missing Admin Agreements Page [Priority: MEDIUM]

Admin navigation doesn't explicitly list an agreements route, but the BUILD_PLAN Phase G mentions admin agreement management. There are two admin areas:

- `/src/app/admin/` — standalone admin (Clerk auth guard, custom shell)
- `/src/app/dashboard/admin/` — inside dashboard shell

Missing:
| Page | Status |
|---|---|
| `/admin/agreements/page.tsx` | MISSING |
| `/dashboard/admin/payments/page.tsx` | MISSING |

**Fix Plan:**
- Create admin agreements page (list all agreements, filter by status/landlord/tenant)
- Create dashboard/admin payments page (escrow overview for admin-in-dashboard view)
- Estimated effort: 0.5 days

---

## 5. GAP 4 — No Test Infrastructure [Priority: HIGH for launch]

Zero test configuration in package.json. No Vitest, no Jest, no Playwright. The BUILD_PLAN Phase 6 specifies:

- Unit: Vitest + React Testing Library (80% coverage target)
- Integration: Vitest + Prisma test DB (60% target)
- E2E: Playwright (100% critical paths)

**Fix Plan:**
1. Install and configure Vitest + React Testing Library
2. Create `vitest.config.ts` with path aliases
3. Create `src/__tests__/` directory structure
4. Write unit tests for: `fees.ts`, `stamp-duty.ts`, `verification.ts`, `utils.ts`
5. Write integration tests for critical API routes: payments/initiate, agreements, verification
6. Configure Playwright with 5 critical E2E paths
7. Estimated effort: 3-4 days

---

## 6. GAP 5 — Build/TypeScript Issues [Priority: CRITICAL]

The `next build` and `tsc --noEmit` both timed out (>120s) suggesting:
- Large bundle or circular dependencies
- Possibly many TypeScript errors that slow compilation
- May need `skipLibCheck: true` or incremental builds

**Fix Plan:**
- Run `tsc --noEmit` with increased timeout to capture error list
- Fix all type errors systematically
- Ensure `npm run lint` passes
- Verify `npm run build` completes in <120s
- Estimated effort: 1-2 days (depends on error count)

---

## 7. GAP 6 — Missing Realtor API Routes [Priority: MEDIUM]

Nav items for realtor reference buy/sell pipelines. These likely need dedicated API routes or at minimum query parameter support on existing listing routes.

| Needed | Purpose |
|---|---|
| `GET /api/listings?listingType=sale&realtor_id=me` | May already work — verify |
| Realtor commission tracking | Schema has `agentTier`/`agentCommission` fields on User — realtor needs own view |

**Fix Plan:**
- Verify existing `/api/listings` supports `realtor_id` filter
- Add `realtor_id` query param support if missing
- Estimated effort: 0.5 days

---

## 8. GAP 7 — Navigation Misalignment [Priority: LOW]

Current navigation has some structural mismatches:

| Issue | Detail |
|---|---|
| Landlord "Add Listing" → `/dashboard/landlord/listing/new` | Works, but also `/dashboard/landlord/properties/new` exists — dual paths |
| Tenant nav: no "Applications" link | But `/dashboard/tenant/applications/page.tsx` exists |
| EM nav: no "Subscription" link | But `/dashboard/estate-manager/subscription/page.tsx` exists |
| Admin nav: points to `/admin/*` | But dashboard admin also exists at `/dashboard/admin/*` — dual admin areas |
| Shared `[role]/` routes | Messages, payments, agreements, notifications use `[role]` param — some roles may not match |

**Fix Plan:**
- Add "Applications" to TENANT_NAVIGATION
- Add "Subscription" to ESTATE_MANAGER_NAVIGATION (replaces/alongside "Billing")
- Consolidate admin entry — pick one path (`/admin/*` is the canonical one)
- Verify all `[role]` dynamic routes work for all 6 roles
- Estimated effort: 0.5 days

---

## 9. GAP 8 — Short-Let Calendar/Pricing API Coverage [Priority: LOW]

Schema has `CalendarSlot` + `PricingRule` models. API routes exist under `listings/[id]/calendar` and `listings/[id]/pricing`. But no top-level `/api/calendar-slots` or `/api/pricing-rules` routes.

**Assessment:** This is fine — calendar/pricing are always in the context of a specific listing. The nested routes are correct. The direct API directories (calendar, pricing) are unnecessary.

**Action:** No fix needed. Just verify the landlord short-let page calls the nested routes correctly.

---

## 10. GAP 9 — CI/CD Pipeline [Priority: MEDIUM for launch]

Need to verify:
- `.github/workflows/ci.yml` exists?
- Deploy to Vercel configured?
- Prisma migrate on deploy?

**Fix Plan:**
- Create/verify `.github/workflows/ci.yml` with lint → typecheck → test → build
- Configure Vercel deploy on main branch merge
- Add `prisma migrate deploy` to post-build step
- Estimated effort: 1 day

---

## 11. GAP 10 — Missing Migrations for Recent Schema Additions [Priority: HIGH]

Only 4 migration directories exist:
1. `add_evidence_pack_fields`
2. `law-firm-commercial`
3. `short-let-engine`
4. `subscription-revenue-model`

But the schema has 40+ models including recent additions (TurnoverTask, ServiceCharge, Unit, etc.). These may not have been migrated to the database yet.

**Fix Plan:**
- Run `npx prisma migrate diff` to find schema drift
- Create missing migrations for all unmigrated models
- Run `npx prisma migrate deploy` against staging DB
- Estimated effort: 1 day

---

## 12. EXECUTION PLAN — Ordered by Priority

| Week | Phase | Tasks | Effort |
|---|---|---|---|
| **Week 1** | **P0: Fix Build** | Fix TypeScript errors, get `npm run build` passing | 1-2 days |
| | **P1: Missing Pages** | 5 realtor pages + client components | 1.5 days |
| | **P1: Missing APIs** | Screening-calls CRUD API, realtor listing filter | 1 day |
| | **P1: Missing Migrations** | Verify + create missing DB migrations | 1 day |
| **Week 2** | **P2: Nav Alignment** | Add missing nav items, fix dual paths, verify all [role] routes | 0.5 days |
| | **P2: Admin Gaps** | admin/agreements page, dashboard/admin/payments page | 0.5 days |
| | **P2: Test Setup** | Vitest + RTL, unit tests for fees/stamp-duty/verification/utils | 2 days |
| | **P2: CI/CD** | GitHub Actions, Vercel deploy config | 1 day |
| **Week 3** | **P3: E2E Tests** | Playwright setup + 5 critical user journeys | 2 days |
| | **P3: Polish** | Mobile audit, skeleton loaders, SEO meta tags, error boundaries | 2 days |
| | **P3: Launch Prep** | Production env vars, domain setup, smoke test | 2 days |

**Total estimated: 14-18 days (matches original BUILD_PLAN timeline)**

---

## 13. Immediate Next Steps (Do Today)

1. **Run `tsc --noEmit`** with 300s timeout to get full error count
2. **Create 5 realtor pages** — these are straightforward, use agent page patterns
3. **Create screening-calls API** — 3 route files, schema model already exists
4. **Add missing nav items** (tenant applications, EM subscription)
5. **Run `npx prisma migrate diff`** to identify schema drift

These 5 tasks unblock everything else and can be done in parallel.
