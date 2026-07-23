# PROPATI Dashboard UX/UI Refactor Plan
_Source: `/mnt/c/Users/USER/Desktop/update.md`_
_Created: 2026-07-23_

## Objectives
1. Move notifications into the top header bell with unread badge/drawer; remove from sidebar navs.
2. Replace tenant-only `Find Property` with a global search bar in the top header.
3. Merge screening calls into messages with sub-tabs.
4. Consolidate financial items (invoices/receipts/overdue) under a single `Rent & Payments` landing with sub-tabs.
5. Restructure profile into 4 tabs (`Personal & Bio`, `Rental Application`, `Guarantors`, `Identity & Verification`).
6. Slim the primary sidebar to essential items per role.

---
## Current State Snapshot
- `src/lib/navigation.tsx` is the canonical nav config per role.
- `src/components/layout/topbar.tsx` already renders `<NotificationsBell />`, theme toggle, user menu, and a tenant-only `<PurposeSwitcher />`.
- `src/components/notifications/notifications-bell.tsx` is a `<button>` + dropdown; spec wants a bell icon with unread badge and slide-out drawer/dropdown. Already close but should be standardized/role-aware.
- `src/components/layout/DashboardShell.tsx` already supports `navigation` prop, `shellLoading` skeleton, mobile overlay/collapse.
- Tenant search lives at `src/app/dashboard/tenant/search/page.tsx` with client `TenantSearchClient`.
- Messages UI is shared via `src/components/messaging/UnifiedMessagesClient.tsx`.
- Screening pages exist at tenant + landlord only, not agent/estate manager.
- Payments clients exist per role; invoices/receipts pages exist for tenant.
- Profile clients exist per role but are not tabbed.
- Verification hub exists at `/dashboard/verification?type=...` and is linked from several sidebars.
- `src/app/api/notifications/` exists with `unread-count`, `mark-all-read`, `[id]`.

---
## Phase 1 — Header & Sidebar Cleanup (Low Risk)
**Goal:** move repetitive items out of sidebars, introduce the new header controls.

### 1.1 Sidebar nav pruning
- **File:** `src/lib/navigation.tsx`
- **Change:** Remove these labels from all role arrays where present:
  - `Notifications`
  - `Find Property` (tenant)
  - `Screening Calls` (landlord, tenant)
  - `Identity Verification`
  - Standalone `Invoices`, `Receipts`, `Overdue Payments` (conservative: keep until Phase 3 cabinets)
- Add `Global Search` icon-only collapsed item for landlord/agent/admin/estate manager when `sidebarCollapsed` is true? Spec says expand top header input for global search, so sidebar link can be dropped entirely.

### 1.2 Topbar global search
- **Create:** `src/components/layout/GlobalSearch.tsx`
  - Text input in topbar, left side.
  - On submit/type, navigate to `/search?q=...` or open a command palette overlay with results.
  - For now, feature-flag: tenant uses existing search page, other roles get a permission-scoped results drawer.
- **File:** `src/components/layout/topbar.tsx`
  - Add `<GlobalSearch />` after mobile menu toggle.
  - Remove `<PurposeSwitcher />` or gate it behind `role === 'tenant'` on the new global search component.

### 1.3 Notification bell standardization
- **File:** `src/components/notifications/notifications-bell.tsx`
  - Replace dropdown with a `Popover` or `Drawer` to match spec’s “slide-out drawer or dropdown popover.”
  - Accent badge color: switch red to theme `accent`/green to match brand.
  - Ensure it’s rendered consistently in `<Topbar>` for all roles—currently it is, but double-check props.

---
## Phase 2 — Messages + Screening Calls Unification
**Goal:** Deep merge screening into messages sub-tabs.

### 2.1 Messages sub-tabs
- **Component:** `src/components/messaging/UnifiedMessagesClient.tsx`
  - Add top tabs: `All Messages | Chats | Screening Calls`.
  - Add filter state; `Screening Calls` tab renders existing screening call cards/banners.
- **API probing:** confirm `src/app/api/bookings/route.ts` and `src/app/api/conversations/route.ts` already cover screening call data; if not, extend minimal endpoints.

### 2.2 Sidebar removal
- Remove `Screening Calls` from `src/lib/navigation.tsx` in Phase 1, so navigation stays consistent once messages tab launches.

---
## Phase 3 — Financial Hub Consolidation
**Goal:** one `Rent & Payments` entry per role with internal sub-tabs.

### 3.1 Rent & Payments landing (per role)
- **Tenant:** `src/app/dashboard/tenant/payments/page.tsx` becomes the tab landing; keep shell, replace body with `TenantFinancialsHub`.
- **Landlord, Agent, Estate Manager, Accountant:** confirm analogous `.../payments` or `.../financials` pages exist.
  - If missing, scaffold server component in Phase 3.1 and warn in review notes.

### 3.2 Financial hub client
- **Create:** `src/components/financials/FinancialHubTabs.tsx` or role-specific variants under same directory.
  - Tabs (or cards with tab behavior): `Overview`, `Invoices`, `Receipts & History`, `Overdue Payments`.
  - `Overview` shows alert banner for overdue balance + `Pay Overdue` CTA.
  - Data fetching: lift server-side PRISMA queries into page.tsx props; keep client tabbed UI.

### 3.3 Navigation cleanup
- Remove inline links to standalone financial pages from role arrays in `src/lib/navigation.tsx`.

---
## Phase 4 — Profile 4-Tab Restructure + Verification Migration
**Goal:** make profile the single source of truth for identity and rental application.

### 4.1 Profile page restructure
- **Tenant:** `src/app/dashboard/tenant/profile/page.tsx` + `TenantProfileClient.tsx`
  - Tabs/sections: `Personal & Bio`, `Rental Application`, `Guarantors & Referees`, `Identity & Verification`.
  - Persistent state: server action or `PATCH /api/users/[id]` to avoid client-only updates.
- **Other roles:** Apply same structure by extending existing profile clients, or by extracting a shared `<ProfileLayout />` component.

### 4.2 Verification migration
- **Deprecate** `Identity Verification` sidebar links.
- **New behavior:** profile tab routes to `/dashboard/verification?type=identity&mode=embedded` or mounts verification flow inline in profile tab.
- Need guardrails: if verification flow depends on standalone page chrome, add `DashboardShell` prop so it still works embedded.

### 4.3 Profile data model check
- Verify Prisma `User` and related models can store employment, rental history, guarantor contacts; if not, note extensions in review and await approval before schema changes.

---
## Phase 5 — Cross-Role Polish, Sidebar Slimming, Responsive Checks
**Goal:** finalize sidebar shapes per spec, run QA.

### 5.1 Final sidebar structure (target)
- **Tenant:** Dashboard, Rent & Payments, My Agreements, Applications, Maintenance, Messages, My Profile.
- **Landlord:** Dashboard, Rent & Payments, My Properties, Agreements, Messages, My Profile. (+ Portfolio, etc. if approved)
- **Agent:** Dashboard, Rent & Payments, Deal Pipeline, Listings, Messages, My Profile.
- **Estate Manager:** Dashboard, Rent & Payments, Portfolio, Units, Agreements, Messages, My Profile.
- **Admin/Accountant:** keep existing simplified shapes with Rent & Payments and Messages.

### 5.2 Header behavior
- Global search should show/hide based on sidebar collapsed state? Suggested: visible in all topbar states, full width when sidebar open, compressed when collapsed on desktop, always drawer on mobile.
- Notifications bell: accent badge, unread count suppressed above 99? keep `99+`.

### 5.3 QA gates
- Each role dashboard renders new header + sidebar + first page in shell.
- Lint + `npm run test` passes.
- `npm run build -- --no-lint` exits 0.

---
## Dependencies & Risks
- **Existing pages** for invoices/receipts/overdue exist for tenant but not for other roles. Phase 3 may need additional scaffolding.
- **Screening call data** may only be tenant/landlord oriented; agent/estate manager may need new domain models. Flag for review in Phase 2.
- **Global search API**: no unified search endpoint exists today. Phase 1 should probably start with redirect-to-search-page behavior, not full cross-entity indexing, to avoid backend work.
- **Profile data model**: rental application + guarantor fields may exceed current Prisma model. Do not touch schema in plan execution without explicit approval.

---
## Review Checklist (before execution)
- [ ] Confirm target tab names and toast copy.
- [ ] Approve roles receiving financial hub consolidation now vs later.
- [ ] Decide global search strategy: redirect vs command palette vs new API.
- [ ] Decide notification bell accent color (`accent` green or alert red).
- [ ] Approve sidebar item cuts for each role.

---
## Suggested Execution Order
1. Phase 1.1 — prune every sidebar nav in `src/lib/navigation.tsx`
2. Phase 1.2 — GlobalSearch + Topbar wiring
3. Phase 1.3 — Notifications bell polish + approved color
4. Phase 2 — UnifiedMessagesClient tab injection
5. Phase 3 — Financial hub per role
6. Phase 4 — Profile tabs + embedded verification
7. Phase 5 + QA/branching for release
