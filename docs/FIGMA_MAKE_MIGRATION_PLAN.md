# FIGMA MAKE → PROPATI MIGRATION PLAN

> Goal: adopt the new visual design without losing any backend behavior.
> Rule: every old fetch, redirect, validation, and role guard must survive the cut.

---

## MIGRATION PATTERN

For every page:

1. Read the current `src/app/.../page.tsx` and list its data sources, forms, redirects, and guards.
2. Keep that logic exactly as-is.
3. Replace only the JSX/presentation layer with the new Figma Make visual shell.
4. Wire the old data/handlers into the new shell’s props/hooks.
5. Verify: same APIs, same routes, same outcomes — only the skin changes.

---

## PHASE 0 — SHARED PRIMITIVES

Files to port from `docs/Project Planning/src/components/` into `src/components/`:

| Component | Target file | Notes |
|-----------|-------------|-------|
| Button variants | `src/components/ui/button.tsx` | 6 variants: default, secondary, outline, ghost, destructive, link |
| Card | `src/components/ui/card.tsx` | dark surface + border tokens |
| Input / Textarea / Select | `src/components/ui/input.tsx`, etc. | focus ring = emerald |
| Badge | `src/components/ui/badge.tsx` | 7 variants incl. type colors |
| Tabs | `src/components/ui/tabs.tsx` | active = white text + white border |
| Dialog/Modal/Sheet | `src/components/ui/dialog.tsx`, etc. | overlay + card dark |
| Table | `src/components/ui/table.tsx` | header muted, rows border-white/5 |
| Tooltip/Popover | `src/components/ui/tooltip.tsx` | dark popup |
| DropdownMenu | `src/components/ui/dropdown-menu.tsx` | dark items |
| PageHeader | new `src/components/ui/page-header.tsx` | title, description, breadcrumb, actions slot |
| StatCard | new `src/components/ui/stat-card.tsx` | label, value, trend, icon |
| StatusBadge | new `src/components/ui/status-badge.tsx` | success/warning/destructive/info |
| DataTable | new `src/components/ui/data-table.tsx` | generic column renderer |

Also port:
- `src/components/navigation/public-nav.tsx` ← `docs/.../PublicLayout.tsx` nav block
- `src/components/layout/sidebar.tsx` ← `docs/.../DashboardLayout.tsx` sidebar
- `src/components/layout/topbar.tsx` ← `docs/.../DashboardLayout.tsx` topbar

**Gate:** `npm run build -- --no-lint` passes; `npm run test` stays 60/60.

---

## PHASE 1 — PUBLIC SHELL

Files:
- `src/app/(public)/layout.tsx`

Change:
- Replace footer with Figma Make version: `bg-black border-t border-white/10`, links `text-neutral-400 hover:text-white`.
- Replace `PublicNav` with the new dark nav from `docs/Project Planning/src/layouts/PublicLayout.tsx`.

**What to preserve:**
- All existing `<main>{children}</main>` behavior
- Footer link targets that actually exist in your app

**Gate:** landing + listings pages render with new nav/footer; no 404s in footer.

---

## PHASE 2 — LANDING PAGE

Current file: `src/app/page.tsx`
New design source: `docs/Project Planning/src/pages/public/Landing.tsx`

### What the old page does
- Client component with scroll state
- Renders hero, stats, how-it-works, featured listings, testimonials, trust props, CTAs
- Uses hardcoded arrays: `stats`, `steps`, `testimonials`, `featuredListings`
- Links to `/listings`, `/signup`

### What to preserve
- All content sections and copy
- All internal links
- Scroll behavior and mobile menu state
- Image sources and priority loading

### What to swap
- Replace class tokens: `bg-card` → `bg-[#09090b]`, `text-primary` → `text-[#10b981]`, `bg-primary/10` → `bg-[#10b981]/10`, `border-border` → `border-white/10`, `text-muted-foreground` → `text-neutral-400`
- Replace `SectionLabel` with new pill style: `bg-[#10b981]/10 text-[#10b981]`
- Replace stat cards: `bg-[#09090b] border border-white/10 rounded-2xl`
- Replace how-it-works cards: same dark card, step number `text-[#10b981]/20`
- Replace featured listing cards: dark card, hover `border-white/20`, price badge `bg-black/80 backdrop-blur text-white`
- Replace testimonial cards: dark card, stars `text-[#10b981]`
- Replace verified badge: `bg-[#10b981]/10 text-[#10b981]` instead of `bg-green-50 text-green-700`

**Do NOT add/remove sections unless asked.**

**Gate:**
- No `bg-muted`, `bg-card`, `bg-primary/10`, `text-green-*`, `bg-green-*`, `border-border`, `shadow-sm`, `shadow-card-hover`, `shadow-elevated` remain in this file
- Visual check at 375px and 1440px
- All CTAs navigate correctly

---

## PHASE 3 — LISTINGS PAGE

Current file: `src/app/(public)/listings/page.tsx`
New design source: `docs/Project Planning/src/pages/public/Listings.tsx`

### What the old page does
- Client component with filters, sort, view mode, drawer
- Uses `CategoryToggle`, `PropertyCard`, `PropertyCardSkeleton`
- Filter state: category, location, price range, bedrooms, property types, verification tier, amenities, listing type
- URL sync via `useSearchParams`
- Renders filter drawer, sticky filter bar, grid/list toggle
- **Currently uses MOCK_PROPERTIES** — this is a placeholder; real API is `src/app/api/listings/[id]/route.ts`

### What to preserve
- All filter handlers: `handleCategoryChange`, `handlePriceRangeChange`, `handleBedroomSelect`, etc.
- All URL param sync
- Sort logic
- View mode toggle
- Drawer open/close + body scroll lock
- All existing links to listing detail pages

### What to swap
- Replace `PublicNav` with the new nav
- Replace filter bar classes: `bg-surface` → `bg-black/90 backdrop-blur-md border-b border-white/10`
- Replace category toggle active: `bg-[#10b981] text-white`, inactive `bg-[#09090b] text-neutral-400 border border-white/10`
- Replace inputs: `bg-[#09090b] border border-[#27272a] text-white placeholder:text-neutral-500 focus:border-[#10b981]`
- Replace filter drawer: `bg-[#09090b] border-r border-white/10`, overlay `bg-black/60`
- Replace bedroom buttons: active `bg-[#10b981] text-white`, inactive `bg-[#09090b] text-neutral-400 border-white/10`
- Replace PropertyCard to dark spec: `bg-[#09090b] border border-white/10 hover:border-white/20`
- Replace price text: `text-white font-bold`
- Replace spec text: `text-neutral-400`
- Replace sort dropdown: `bg-[#09090b] border border-white/10`

**Also fix:** purge all `bg-slate-900`, `border-slate-700`, `text-slate-400`, `text-on-surface*`, `bg-surface-container*`, `border-outline*`, `focus:border-emerald-500` → dark tokens.

**Gate:**
- All filters still filter the same properties
- URL params still sync
- Drawer still opens/closes
- No legacy slate/surface classes remain

---

## PHASE 4 — LISTING DETAIL

Current file: `src/app/(public)/listings/[id]/page.tsx`

### What to preserve
- Dynamic route param `id`
- All data fetches for the listing
- Image gallery behavior
- Contact/save/flag actions
- Agent card and verification badge rendering

### What to swap
- Page bg: `bg-black`
- Header: `bg-black/95 backdrop-blur border-b border-white/10`
- Gallery: `rounded-2xl border border-white/10`
- Thumbnail active ring: `border-[#10b981]`
- Title: `text-white text-3xl font-bold`
- Specs divider: `bg-white/10`
- Spec icons: `text-[#10b981]`
- Description: `text-neutral-400`
- Amenities: `bg-[#09090b] border border-white/10`
- Contact card: `bg-[#09090b] border border-white/10 rounded-2xl`
- Price: `text-[#10b981]`
- Buttons: primary `bg-[#10b981]`, secondary `bg-[#121215] border border-white/10`

**Gate:** listing detail renders with all old actions intact; contact buttons still call their handlers.

---

## PHASE 5 — AUTH PAGES

Files:
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`
- `src/app/signup/page.tsx`

### What to preserve
- Clerk `<SignUp>` / `<SignIn>` components
- Role picker logic
- All redirects after auth
- Appearance props passed to Clerk

### What to swap
- Page wrapper: `bg-black`
- Clerk card: `bg-[#09090b] border border-white/10 rounded-2xl`
- Clerk `<Appearance>` tokens: sync to dark palette
- Role cards: `bg-[#09090b] border border-white/10 hover:border-[#10b981]`
- Role icons: `text-[#10b981]`
- Selected ring: `border-[#10b981]`

**Gate:** auth flow works end-to-end; role picker still sets role; Clerk UI matches dark theme.

---

## PHASE 6 — DASHBOARD SHELL

Files:
- `src/components/layout/DashboardShell.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/topbar.tsx`

### What to preserve
- All `navConfig` sections and items
- Role-based nav rendering
- Collapse toggle behavior
- Mobile drawer behavior
- User card rendering
- Notification/search/settings icons
- All `<Outlet />` mounting

### What to swap
- Sidebar bg: `bg-[#09090b] border-r border-white/10`
- Topbar bg: `bg-[#09090b] border-b border-white/10`
- Active nav: `bg-[#10b981]/10 text-[#10b981]`
- Inactive nav: `text-neutral-400 hover:text-white hover:bg-white/5`
- User card: `border-b border-white/10`
- Section labels: `text-neutral-500`
- Content area: `bg-black`
- Collapse toggle: `bg-[#121215]`
- LoadingShell inline colors: `#093057` → `#09090b`, `rgba(255,255,255,0.18)` → `rgba(255,255,255,0.08)`

**Gate:** all 6 role dashboards render with new sidebar; every nav link still goes to the same route; collapse still works.

---

## PHASE 7 — LANDLORD P0 PAGES

Order:
1. `/dashboard/landlord/page.tsx` — home
2. `/dashboard/landlord/properties/page.tsx` — properties list
3. `/dashboard/landlord/properties/[id]/page.tsx` — property detail
4. `/dashboard/landlord/listing/new/page.tsx` — add listing wizard
5. `/dashboard/landlord/listings/page.tsx` — listings list
6. `/dashboard/landlord/financials/page.tsx` — financials

Pattern for each:
- Read old page → list fetches, forms, redirects, guards
- Wrap old logic in a provider/shell if needed
- Replace only the JSX with Figma Make generic shells: `GenericTablePage`, `GenericFormPage`, `GenericProfilePage`, etc.
- Pass old data + handlers as props

**Gate per page:** same data loads, same forms submit, same redirects fire.

---

## PHASE 8 — TENANT P0 PAGES

Order:
1. `/dashboard/tenant/page.tsx`
2. `/dashboard/tenant/payments/page.tsx`
3. `/dashboard/tenant/applications/[id]/page.tsx`
4. `/dashboard/tenant/agreements/page.tsx`
5. `/dashboard/tenant/maintenance/page.tsx`

Same wrapper pattern.

---

## PHASE 9 — AGENT + ESTATE MANAGER P0 PAGES

Agent:
1. `/dashboard/agent/page.tsx`
2. `/dashboard/agent/listings/page.tsx`
3. `/dashboard/agent/deals/page.tsx`
4. `/dashboard/agent/commissions/page.tsx`

Estate Manager:
1. `/dashboard/estate-manager/page.tsx`
2. `/dashboard/estate-manager/units/page.tsx`
3. `/dashboard/estate-manager/financials/page.tsx`
4. `/dashboard/estate-manager/tenants/page.tsx`

---

## PHASE 10 — REMAINING PAGES

Walk the rest of the route tree from `docs/Project Planning/src/routes.tsx`:

For each unmigrated page:
1. Open old `src/app/.../page.tsx`
2. Extract data/behavior contract
3. Port visual shell from `docs/Project Planning/src/pages/...`
4. Wire old logic into new shell
5. Run build + tests
6. Mark complete

Priority order:
- P1: auth-adjacent pages (profiles, settings, verification)
- P1: payment pages
- P2: reports, analytics, admin settings
- P2: coming-soon, misc pages

---

## FINAL GATE

Run these in order:
```
npm run test
npm run build -- --no-lint
```

Then grep the entire `src/app/` and `src/components/` for legacy classes:
```
grep -rnE 'bg-slate-900|border-slate-700|text-slate-400|bg-blue-50|text-blue-700|bg-green-50|text-green-700|bg-surface-container|text-on-surface|border-outline|shadow-sm|shadow-card-hover|shadow-elevated' src/
```

All must be gone from migrated files.

---

## FILES THAT MUST NEVER CHANGE

- `src/app/api/**` — all API routes
- `src/lib/**` — auth, paystack, countries, rules-engine, navigation
- `prisma/schema.prisma` — database schema
- `src/app/api/webhooks/**` — Clerk/Paystack webhooks
- `src/lib/auth.ts` — `getRoleRedirectPath()` is single source of truth
