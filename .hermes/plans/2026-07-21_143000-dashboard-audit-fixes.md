# Dashboard Audit Findings Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Restore full dashboard sidebar integrity by fixing all missing pages, broken cross-links, and raw-error rendering paths across landlord, tenant, agent, estate-manager, admin, and accountant dashboards.

**Architecture:** Create the missing leaf/aggregator pages, add lightweight server `try/catch` wrapping around Prisma data fetches, add user-facing error UI fallbacks, and fix the one build-breaking Server Component boundary violation in `admin/profile/page.tsx`. No new API routes unless explicitly required by a broken nav link.

**Tech Stack:** Next.js 14 App Router, TypeScript, shadcn/ui, Prisma, Clerk, `sonner` toasts.

---
## Current Context

A full read-only audit found:

**Missing dashboard pages (nav hrefs with no `page.tsx`)**
- `src/app/dashboard/admin/settings/page.tsx`
- `src/app/dashboard/admin/transactions/page.tsx`
- `src/app/dashboard/tenant/support/page.tsx`

**Known broken cross-links from sidebar / page internals**
- `/dashboard/tenant/agreements/[id]`
- `/dashboard/tenant/agreements/[id]/sign`
- `/dashboard/landlord/properties/[id]/edit`
- `/dashboard/landlord/properties/[id]/publish`
- `/dashboard/landlord/listing/[id]`
- `/dashboard/landlord/rents`
- `/dashboard/agent/inspections/new`
- `/dashboard/agent/agreements/new`
- `/dashboard/admin/transactions`
- `/listings/[id]` (public listing detail used by agent + tenant)

**Critical render error**
- `src/app/dashboard/admin/profile/page.tsx` calls client hook `useUser()` inside an async server component — crashes at build/render.

**Widespread weak error rendering**
- Many server-side dashboard pages run direct Prisma queries with no `try/catch`, no toast notification, and no fallback UI. They rely only on `ErrorBoundary`.

**Open question to decide before building**
1. Do we want real page content for `admin/settings` and `admin/transactions`, or minimal aggregator shells that redirect to existing child pages?
2. Do we want real tenant agreement detail/sign pages now, or placeholder shells that show “coming soon”?
3. For `listings/[id]` public detail, do we want a brand-new page or reuse `verification/[id]` layout?

---
## Step 1: Stop the critical build-breaking error

### Task 1.1: Fix admin profile Server/Client boundary violation

**Objective:** Remove the build-breaking `useUser()` hook from `admin/profile/page.tsx` and delegate to a client-side wrapper, matching the rest of the dashboard.

**Files:**
- Modify: `src/app/dashboard/admin/profile/page.tsx:1-80`
- May touch: `src/app/dashboard/admin/profile/security/page.tsx` only for reference

**Step 1:** Read current file to confirm `useUser()` usage.

```bash
sed -n '1,80p' src/app/dashboard/admin/profile/page.tsx
```

**Step 2:** Replace async server component with thin wrapper that renders existing client UI or `DashboardShell` + redirect/role guard.

**Step 3:** Run build.

```bash
npm run build -- --no-lint
```

Expected: Previous profile error is gone; build still completes.

**Commit message:** `fix(admin): remove server/client boundary violation in profile page`

---
## Step 2: Add missing aggregator pages

### Task 2.1: Add `admin/settings/page.tsx`

**Objective:** Create missing parent aggregator so `/dashboard/admin/settings` resolves. Redirect `/dashboard/admin/settings` → `/dashboard/admin/settings/dashboard` (or show tabs). Prefer minimal redirect to avoid content duplication.

**Files:**
- Create: `src/app/dashboard/admin/settings/page.tsx`

**Step 1:** Write file with metadata + redirect to first child.

**Step 2:** Run build; check route exists.

```bash
npm run build -- --no-lint
```

Expected: Route `○ /dashboard/admin/settings` or `ƒ` present.

**Commit message:** `fix(admin): add missing settings aggregator page`

### Task 2.2: Add `admin/transactions/page.tsx`

**Objective:** Create missing parent aggregator so `/dashboard/admin/transactions` resolves. Redirect to `/dashboard/admin/transactions/withdrawals`.

**Files:**
- Create: `src/app/dashboard/admin/transactions/page.tsx`

**Step 1 / 2 / Commit:** same pattern as Task 2.1.

**Commit message:** `fix(admin): add missing transactions aggregator page`

---
## Step 3: Fix broken cross-links that block normal dashboard use

These break when users click sidebar items or inline actions.

### Task 3.1: Add tenant agreement detail and sign pages

**Objective:** Unblock tenant agreements list. Create placeholder detail + sign pages so internal links resolve.

**Files:**
- Create: `src/app/dashboard/tenant/agreements/[id]/page.tsx`
- Create: `src/app/dashboard/tenant/agreements/[id]/sign/page.tsx`

**Step 1:** Write both files with `DashboardShell`, `notFound()` for missing IDs, and “Coming soon” / “Contact support to sign” UI.

**Step 2:** Search + replace remaining direct links to `/api/agreements/${id}/pdf` in tenant client components to avoid 404s until API route is built.

```bash
grep -rn '/api/agreements/.*pdf' src/app/dashboard/tenant
```

**Step 3:** Run build.

**Commit message:** `fix(tenant): add agreement detail and sign pages to prevent broken links`

### Task 3.2: Add landlord property edit/publish, rents, and listing detail pages

**Objective:** Unblock landlord property and rent flows.

**Files:**
- Create: `src/app/dashboard/landlord/properties/[id]/edit/page.tsx`
- Create: `src/app/dashboard/landlord/properties/[id]/publish/page.tsx`
- Create: `src/app/dashboard/landlord/rents/page.tsx`
- Create: `src/app/dashboard/landlord/listing/[id]/page.tsx` — if `listings/[id]` public page is too large, neutralize links first

**Step 1:** Write placeholder pages for edit/publish/rents/listing detail.

**Step 2:** Verify nav links in `src/app/dashboard/landlord/page.tsx` no longer hit 404s.

**Step 3:** Run build.

**Commit message:** `fix(landlord): add missing property, rent, and listing detail pages`

### Task 3.3: Add agent inspections/new and agreements/new pages

**Objective:** Unblock agent deal detail flows.

**Files:**
- Create: `src/app/dashboard/agent/inspections/new/page.tsx`
- Create: `src/app/dashboard/agent/agreements/new/page.tsx`

**Step 1:** Write placeholder pages with query param handling (`?dealId=...`).

**Step 2:** Run build.

**Commit message:** `fix(agent): add missing inspection and agreement creation pages`

### Task 3.4: Add public listing detail page

**Objective:** Unblock many “view listing” links across agent and tenant dashboards.

**Files:**
- Create: `src/app/listings/[id]/page.tsx` (server component, fetches from `api/listings` or Prisma directly)

**Step 1:** Write minimal public listing detail shell.

**Step 2:** Run build.

**Commit message:** `feat(listings): add public listing detail page`

---
## Step 4: Batch error-render hardening

**Objective:** Add a simple `try/catch` + fallback error card + `sonner` toast to every server dashboard page that currently runs bare Prisma queries.

Implementation pattern for each page:

```tsx
import { toast } from 'sonner';

export default async function SomePage() {
  let items: any[] = [];
  let error: string | null = null;
  try {
    items = await prisma.xxx.findMany({ ... });
  } catch (e) {
    error = 'Failed to load data';
    // toast can be called in Server Component in this codebase
    // if not, wrap fetch in a tiny client component
  }

  if (error) {
    return (
      <DashboardShell ...>
        <Card>
          <CardHeader><CardTitle>Something went wrong</CardTitle></CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }
  ...
}
```

If `toast` cannot be awaited in a server component for a given page, inline a small `'use client'` wrapper that calls toast once on mount.

Batch by page groups:

### Task 4.1: Tenant error-render hardening

Files:
- `src/app/dashboard/tenant/page.tsx`
- `src/app/dashboard/tenant/payments/page.tsx`
- `src/app/dashboard/tenant/notifications/page.tsx`
- `src/app/dashboard/tenant/applications/page.tsx`
- `src/app/dashboard/tenant/applications/[id]/page.tsx`
- `src/app/dashboard/tenant/maintenance/page.tsx`
- `src/app/dashboard/tenant/receipts/page.tsx`
- `src/app/dashboard/tenant/saved/page.tsx`
- `src/app/dashboard/tenant/messages/page.tsx`
- `src/app/dashboard/tenant/invoices/page.tsx`

Steps per file:
1. Add `try/catch` around each Prisma call.
2. Add `error` fallback UI (`FailureState` or inline Card).
3. Add toast on error if possible in server component.
4. Run `npm run test`.

**Commit message:** `fix(tenant): harden error handling in dashboard pages`

### Task 4.2: Landlord error-render hardening

Files:
- `src/app/dashboard/landlord/page.tsx`
- `src/app/dashboard/landlord/agreements/page.tsx`
- `src/app/dashboard/landlord/applications/page.tsx`
- `src/app/dashboard/landlord/applications/[id]/page.tsx`
- `src/app/dashboard/landlord/financials/page.tsx`
- `src/app/dashboard/landlord/financials/reports/page.tsx`
- `src/app/dashboard/landlord/properties/page.tsx`
- `src/app/dashboard/landlord/properties/[id]/page.tsx`
- `src/app/dashboard/landlord/rent/page.tsx`
- `src/app/dashboard/landlord/screening/page.tsx`
- `src/app/dashboard/landlord/short-let/page.tsx`
- `src/app/dashboard/landlord/turnover/page.tsx`
- `src/app/dashboard/landlord/verification/page.tsx`
- `src/app/dashboard/landlord/verify/page.tsx`

**Commit message:** `fix(landlord): harden error handling in dashboard pages`

### Task 4.3: Agent error-render hardening

Files:
- `src/app/dashboard/agent/page.tsx`
- `src/app/dashboard/agent/commissions/page.tsx` (fix empty catch)
- `src/app/dashboard/agent/listings/page.tsx`
- `src/app/dashboard/agent/listings/[id]/page.tsx`
- `src/app/dashboard/agent/deals/page.tsx`
- `src/app/dashboard/agent/deals/[id]/page.tsx`
- `src/app/dashboard/agent/inspections/report/page.tsx`
- `src/app/dashboard/agent/invites/page.tsx`
- `src/app/dashboard/agent/reputation/page.tsx`
- `src/app/dashboard/agent/pipeline/page.tsx`
- `src/app/dashboard/agent/market/page.tsx`
- `src/app/dashboard/agent/profile/page.tsx`
- `src/app/dashboard/agent/schedule/page.tsx`

Also decide: keep or remove `src/app/dashboard/agent/inspections/office/page.tsx`. If unused, delete.

**Commit message:** `fix(agent): harden error handling and fix empty catch in commissions`

### Task 4.4: Estate-manager error-render hardening

Files:
- `src/app/dashboard/estate-manager/page.tsx`
- `src/app/dashboard/estate-manager/agreements/page.tsx`
- `src/app/dashboard/estate-manager/invoices/page.tsx`
- `src/app/dashboard/estate-manager/portfolio/analytics/page.tsx`
- `src/app/dashboard/estate-manager/financials/scenario-builder/page.tsx`
- `src/app/dashboard/estate-manager/reports/revenue-signature/page.tsx`

Leave `maintenance/page.tsx` and `portfolio/page.tsx` for a follow-up if they are already wrapped in client components.

**Commit message:** `fix(estate-manager): harden error handling in dashboard pages`

### Task 4.5: Admin error-render hardening

Files (these had no `try/catch`):
- `src/app/dashboard/admin/page.tsx`
- `src/app/dashboard/admin/verifications/page.tsx`
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/admin/agreements/page.tsx`
- `src/app/dashboard/admin/payments/page.tsx`
- `src/app/dashboard/admin/properties/page.tsx`
- `src/app/dashboard/admin/revenue/page.tsx`
- `src/app/dashboard/admin/transactions/escrow/page.tsx`
- `src/app/dashboard/admin/overview/page.tsx`
- `src/app/dashboard/admin/audit/logs/page.tsx`
- `src/app/dashboard/admin/roles/verification-officer/page.tsx`
- `src/app/dashboard/admin/transactions/withdrawals/page.tsx`

**Commit message:** `fix(admin): harden error handling in dashboard pages`

---
## Step 5: Verify build and tests

**Objective:** Ensure nothing is broken by the above changes.

**Commands:**

```bash
npm run test
# Expected: 60/60

npm run build -- --no-lint
# Expected: exit 0, 330 routes
```

If build fails on a missing route, create minimal placeholder page and rerun.

If tests drop below 60/60, inspect failed test, fix code, do not alter tests unless test assumption is wrong.

---
## Completion Criteria

- [ ] `/dashboard/admin/settings` and `/dashboard/admin/transactions` no longer 404.
- [ ] `/dashboard/tenant/support` exists.
- [ ] All tenant/landlord/agent agreement and property detail links resolve.
- [ ] `admin/profile/page.tsx` builds without Server/Client boundary error.
- [ ] Every server-side dashboard page that previously ran bare Prisma queries now has `try/catch` + error UI + toast.
- [ ] `npm run test` passes at previous count.
- [ ] `npm run build -- --no-lint` exits 0.
