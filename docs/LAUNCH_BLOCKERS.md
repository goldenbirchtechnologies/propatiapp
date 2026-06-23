# Launch Blockers — PROPATI

**Status as of:** 2026-06-23 (S8 — Launch Prep Finalize)  
**Phase:** 10 — Active  
**Codebase completeness:** ~85%

> This file lists only verified blockers requiring action before or during launch. It is updated from the codebase audit in `docs/BUILD_COMPLETION_PLAN.md` and the status table in `docs/BUILD_PLAN.md`. No fabricated pass/fail logs.

---

## Active Blockers

| # | Blocker | Impact | Source |
|---|---------|--------|--------|
| 1 | **Test infrastructure not configured** — Vitest + React Testing Library + Playwright absent from `package.json`; zero test suites exist | Launch risk: regressions undetected; required by launch-gate checklist | `docs/BUILD_COMPLETION_PLAN.md` §4, `docs/IMPLEMENTATION_PLAN.md` §6 |
| 2 | **CI/CD pipeline not verified** — `.github/workflows/ci.yml` existence + Vercel deploy config + `prisma migrate deploy` step need confirmation | No automated quality gate or deploy pipeline; manual deploy only | `docs/BUILD_COMPLETION_PLAN.md` §9 |
| 3 | **Prisma migration drift unconfirmed** — Schema advertises 40+ models but only 4 migration directories exist; staged columns may not exist in database | Runtime 500 errors on any query touching unmigrated columns (e.g. `TurnoverTask`, `ServiceCharge`, `Unit`) | `docs/BUILD_COMPLETION_PLAN.md` §10 |
| 4 | **5 Realtor dashboard pages missing** — `/dashboard/realtor/buy`, `/sell`, `/listings`, `/profile`, `/messages` return 404 | Realtor role cannot access primary screens; navigation entries are dead links | `docs/BUILD_COMPLETION_PLAN.md` §2 |
| 5 | **Screening-calls API absent** — Schema model `ScreeningCall` exists but no CRUD routes under `/api/screening-calls/` | Landlord and tenant "Screening" screens broken or hitting non-existent endpoints | `docs/BUILD_COMPLETION_PLAN.md` §3 |
| 6 | **Admin agreements page missing** — `/admin/agreements/page.tsx` and `/dashboard/admin/payments/page.tsx` do not exist | Admin cannot view or govern agreements holistically | `docs/BUILD_COMPLETION_PLAN.md` §4 |
| 7 | **Prembly production credentials not yet set** — `PREMBLY_API_KEY` + `PREMBLY_APP_ID` not configured in Railway; NIN/BVN verification running in mock/stub mode | L2 identity verification is non-functional end-to-end in production | `docs/IMPLEMENTATION_PLAN.md` Phase 7, `docs/PREMBLY_SETUP_INSTRUCTIONS.md` |
| 8 | **TypeScript build timeout** — `tsc --noEmit` and `next build` both reported >120 s timeouts in gap analysis; root cause (bundle size vs. type errors) not yet diagnosed | Potential deploy failures; bundle size may breach Vercel limits | `docs/BUILD_COMPLETION_PLAN.md` §6 |

---

## Resolved / Not Blockers

These were identified in earlier audits and are confirmed complete based on the current codebase:

- ✅ Core App Router, Prisma, Clerk, Paystack, Notifications, Verification — all functional
- ✅ Agreement PDF generation + email receipt
- ✅ Tenant application → agreement draft flow
- ✅ SMS/email notification templates and cron triggers

---

## Unblock Order (Recommended)

1. **Today:** `tsc --noEmit` (308 s timeout) + `prisma migrate diff` — diagnose build health  
2. **Day 1–2:** Create screening-calls API + 5 realtor pages (parallel, low coupling)  
3. **Day 2–3:** CI/CD setup + test infrastructure bootstrap  
4. **Day 3–4:** Admin agreements page + Lighthouse audit  
5. **Day 4–5:** Prembly production keys + deploy smoke test (Phase 10 completion)
