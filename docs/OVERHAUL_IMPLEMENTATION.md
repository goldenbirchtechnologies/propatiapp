# VERCEL DARK UI OVERHAUL — IMPLEMENTATION PLAN

> Companion to `OVERHAUL_PLAN.md`. This file is the **execution roadmap** —
> what to build, in what order, and how to verify. The plan document is the
> full page-by-page spec; this is how you ship it.

---

## EXECUTION PRINCIPLES

1. **Visual-only.** No logic, data-fetching, route, or schema changes. Tests stay 60/60.
2. **Token-first.** Every color is a CSS variable. Zero raw hex in `.tsx` files.
3. **Public pages first.** Landing + listings are the external face — they ship before dashboards.
4. **Component primitives before pages.** Fix Button/Card/Input once, every page inherits.
5. **Purge legacy classes per-zone.** No half-dark pages. A page is either done or not shipped.
6. **Verify at each gate.** Build passes, lint clean, visual spot-check on 375px / 1440px.

---

## PHASE 0 — FOUNDATION (primitives + tokens)
**Goal:** The building blocks are dark-correct so every page inherits the theme.

| Step | Action | Files | Verify |
|------|--------|-------|--------|
| 0.1 | Add `.glass-card`, `.dark-surface`, `.dark-input`, scrollbar, selection globals to `globals.css` | `src/app/globals.css` | Tokens resolve |
| 0.2 | Add `obsidian` scale + `glow-*` shadows to `tailwind.config.ts` | `tailwind.config.ts` | `npx tailwindcss` parses |
| 0.3 | Override shadcn `Button` variants to dark spec (6 variants) | `src/components/ui/button.tsx` | All variants render dark |
| 0.4 | Override `Card` to dark surface + border | `src/components/ui/card.tsx` | Card renders on black |
| 0.5 | Override `Input`/`Textarea`/`Select` to dark spec | `src/components/ui/input.tsx`, etc. | Focus ring = green |
| 0.6 | Override `Badge` 7 variants to dark tokens | `src/components/ui/badge.tsx` | Status badges correct |
| 0.7 | Override `Tabs` (active = white text + white border) | `src/components/ui/tabs.tsx` | Active tab clearly white |
| 0.8 | Override `Dialog`/`Modal`/`Sheet` to dark | `src/components/ui/dialog.tsx` | Overlay + card dark |
| 0.9 | Override `Table`/`TableRow`/`TableCell` to dark | `src/components/ui/table.tsx` | Header muted, rows border-white/5 |
| 0.10 | Override `Tooltip`/`Popover` to dark | `src/components/ui/tooltip.tsx` | Dark popup |
| 0.11 | Override `DropdownMenu` to dark | `src/components/ui/dropdown-menu.tsx` | Menu items dark |
| 0.12 | Skeleton shimmer colors → dark gradient | `src/components/layout/DashboardShell.tsx` inline | Skeleton invisible on dark? No — visible contrast |

**Gate 0:** `npm run build -- --no-lint` passes. All 40+ UI components render correctly on a black background. Visual check on Button, Card, Input, Badge, Tabs.

---

## PHASE 1 — PUBLIC SHELL (Nav + Footer)
**Goal:** The public-facing chrome is fully dark.

| Step | Action | Files |
|------|--------|-------|
| 1.1 | `PublicNav.tsx`: transparent → `bg-black/90 backdrop-blur`, links `text-neutral-300 hover:text-white`, active `bg-[#10b981]`, mobile drawer `bg-black border-white/10` | `src/components/navigation/public-nav.tsx` |
| 1.2 | `(public)/layout.tsx`: footer `bg-black border-t border-white/10`, links `text-neutral-400 hover:text-white` | `src/app/(public)/layout.tsx` |

**Gate 1:** Public nav + footer look correct on landing and listings pages.

---

## PHASE 2 — LANDING PAGE (`/`)
**Goal:** The #1 impression page is full Vercel Dark.

| Step | Action | Files |
|------|--------|-------|
| 2.1 | Hero: overlay gradient darker, CTAs correct on black | `src/app/page.tsx` |
| 2.2 | SectionLabel → `bg-[#10b981]/10 text-[#10b981]` | `src/app/page.tsx` |
| 2.3 | Stat cards → `bg-[#09090b] border-white/10`, values white, labels neutral-400 | `src/app/page.tsx` |
| 2.4 | How-it-works cards → dark, step number `text-[#10b981]/20` | `src/app/page.tsx` |
| 2.5 | Featured listing cards → dark, verified badge `bg-[#10b981]/10 text-[#10b981]` | `src/app/page.tsx` |
| 2.6 | Testimonial cards → dark, stars `text-[#10b981]` | `src/app/page.tsx` |
| 2.7 | Trust/value cards → dark | `src/app/page.tsx` |
| 2.8 | CTA section → dark | `src/app/page.tsx` |
| 2.9 | **Purge check:** grep for `bg-muted`, `bg-card`, `bg-primary/10`, `text-green-*`, `bg-green-*`, `bg-commercial-gold`, `border-border`, `shadow-sm`, `shadow-card-hover`, `shadow-elevated` — all gone from this file | `src/app/page.tsx` |

**Gate 2:** Landing page is uniformly dark. No light-mode artifacts. Scroll through full page at 375px and 1440px.

---

## PHASE 3 — LISTINGS + DETAIL
**Goal:** Search, filter, and property detail are dark.

| Step | Action | Files |
|------|--------|-------|
| 3.1 | Listings page: purge all `bg-slate-900`, `border-slate-700`, `text-slate-400`, `text-on-surface*`, `bg-surface-container*`, `border-outline*` → dark tokens | `src/app/(public)/listings/page.tsx` |
| 3.2 | Filter drawer → `bg-[#09090b] border-white/10`, overlay `bg-black/60` | same |
| 3.3 | Category toggle, bedroom buttons, checkboxes → dark spec | same |
| 3.4 | Listing detail page: full dark treatment | `src/app/(public)/listings/[id]/page.tsx` |
| 3.5 | `PropertyCard.tsx` component → dark card spec | `src/components/listings/PropertyCard.tsx` |
| 3.6 | Saved listings page → dark | `src/app/(public)/saved/page.tsx` |

**Gate 3:** Listings grid, filter drawer, and property detail all dark. Cards have `border-white/10`, hover `border-white/20`.

---

## PHASE 4 — AUTH PAGES
**Goal:** Sign-in / sign-up match the dark exterior.

| Step | Action | Files |
|------|--------|-------|
| 4.1 | Sign-in: Clerk `<Appearance>` tokens synced to dark, wrapper `bg-black` | `src/app/sign-in/[[...sign-in]]/page.tsx` |
| 4.2 | Sign-up: same | `src/app/sign-up/[[...sign-up]]/page.tsx` |
| 4.3 | Role picker (`/signup`): cards `bg-[#09090b] border-white/10 hover:border-[#10b981]` | `src/app/signup/page.tsx` |

**Gate 4:** Auth flow looks native to the dark theme.

---

## PHASE 5 — DASHBOARD SHELL
**Goal:** Sidebar + topbar + content area are uniformly dark.

| Step | Action | Files |
|------|--------|-------|
| 5.1 | `DashboardShell.tsx`: LoadingShell inline `#093057` → `#09090b`, `rgba(255,255,255,0.18)` → `rgba(255,255,255,0.08)` | `src/components/layout/DashboardShell.tsx` |
| 5.2 | `sidebar.tsx`: verify all `var(--*)` resolve to dark; collapse toggle `bg-[#121215]` | `src/components/layout/sidebar.tsx` |
| 5.3 | `topbar.tsx`: verify dark | `src/components/layout/topbar.tsx` |
| 5.4 | `GlobalSearch.tsx`: dark | `src/components/layout/GlobalSearch.tsx` |

**Gate 5:** Dashboard shell is uniformly dark across all roles.

---

## PHASE 6 — LANDLORD DASHBOARD (45 pages)
**Goal:** Every landlord subpage consumes dark tokens.

Execution pattern per page:
1. Replace `bg-muted` → `bg-[#09090b]`
2. Replace `bg-card` → `bg-[#09090b]`
3. Replace `border-border` → `border-white/10`
4. Replace `text-muted-foreground` → `text-neutral-400`
5. Replace `bg-primary/10` → `bg-[#10b981]/10`
6. Replace `shadow-*` → border-based elevation
7. Tables: header `text-neutral-400`, rows `border-b border-white/5`
8. Inputs: `bg-[#09090b] border-[#27272a] focus:border-[#10b981]`

Priority order: P0 pages first (home, properties, listings, financials, tenants), then P1, then P2.

**Gate 6:** All 45 landlord pages dark. Spot-check 10 random pages.

---

## PHASE 7 — TENANT DASHBOARD (30 pages)
**Goal:** All tenant subpages dark. Same pattern as Phase 6.

**Gate 7:** All 30 tenant pages dark.

---

## PHASE 8 — AGENT DASHBOARD (30 pages)
**Goal:** All agent subpages dark.

**Gate 8:** All 30 agent pages dark.

---

## PHASE 9 — ESTATE MANAGER DASHBOARD (35 pages)
**Goal:** All estate manager subpages dark.

**Gate 9:** All 35 estate manager pages dark.

---

## PHASE 10 — ADMIN DASHBOARD (35 pages)
**Goal:** All admin subpages dark. Denser tables, mono refs.

**Gate 10:** All 35 admin pages dark.

---

## PHASE 11 — SHARED + ACCOUNTANT + VERIFICATION
**Goal:** Remaining pages.

| Zone | Pages |
|------|-------|
| `/dashboard/[role]/*` | 12 pages |
| `/dashboard/accountant/*` | 9 pages |
| `/dashboard/verification/*` | 9 pages |
| `/verification/*` (public) | 7 pages |
| `/dashboard/wallet` | 1 page |
| Other (`coming-soon`, `payment/*`, `search`, `account/suspended`) | ~6 pages |

**Gate 11:** All remaining pages dark.

---

## PHASE 12 — FINAL PURGE + POLISH
**Goal:** Zero legacy classes remain. Accessibility verified.

| Step | Action |
|------|--------|
| 12.1 | Grep entire `src/` for `bg-slate-900`, `border-slate-700`, `text-slate-400`, `bg-blue-50`, `text-blue-700`, `bg-green-50`, `text-green-700`, `bg-surface-container`, `text-on-surface`, `border-outline`, `shadow-sm`, `shadow-card-hover`, `shadow-elevated` — all must be gone |
| 12.2 | Grep for `bg-muted` on public pages (allowed in dashboard) |
| 12.3 | Contrast check: `#a1a1aa` on `#09090b`, `#ededed` on `#09090b`, `#10b981` on `#09090b` |
| 12.4 | Focus-visible rings = `2px solid #10b981` |
| 12.5 | `prefers-reduced-motion` disables shimmer/pulse |
| 12.6 | Visual QA at 375px, 768px, 1024px, 1440px on landing + listings + 1 dashboard per role |
| 12.7 | `npm run test` — must stay 60/60 |
| 12.8 | `npm run build -- --no-lint` — must pass |

**Gate 12:** Clean grep, clean build, clean tests, visual QA passed.

---

## ESTIMATED EFFORT

| Phase | Pages | Est. time |
|-------|-------|-----------|
| 0 — Foundation | 12 files | 1 session |
| 1 — Public shell | 2 files | 0.5 session |
| 2 — Landing | 1 file | 1 session |
| 3 — Listings + detail | 3 files | 1 session |
| 4 — Auth | 3 files | 0.5 session |
| 5 — Dashboard shell | 4 files | 0.5 session |
| 6 — Landlord | 45 files | 2 sessions |
| 7 — Tenant | 30 files | 1.5 sessions |
| 8 — Agent | 30 files | 1.5 sessions |
| 9 — Estate Manager | 35 files | 1.5 sessions |
| 10 — Admin | 35 files | 1.5 sessions |
| 11 — Shared + other | ~35 files | 1 session |
| 12 — Purge + QA | all | 1 session |
| **Total** | **~229 pages** | **~14 sessions** |

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Clerk `<Appearance>` overrides custom dark | Sync Clerk theme tokens to same palette; Clerk supports full token override |
| shadcn update wipes overrides | Overrides are in the component files themselves (not the registry) — safe |
| A page breaks the build | Each phase gates on `npm run build -- --no-lint` before moving on |
| Visual regression missed | Phase 12 grep is exhaustive — any legacy class is a blocker |
| Tests fail due to class changes | Tests assert behavior, not classes. If a test asserts a class name, update the assertion |
| Contrast failure on `#52525b` placeholder | Placeholder text is exempt at AA (it's 4.6:1, passes) |

---

*Implementation plan v1.0 — execution roadmap for the Vercel Dark UI overhaul*
*Spec: `docs/OVERHAUL_PLAN.md` | Token source: `src/app/globals.css` + `tailwind.config.ts`*
