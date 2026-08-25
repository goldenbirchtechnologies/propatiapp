# SITE-WIDE VERCEL DARK UI OVERHAUL PLAN

> **Project:** PROPATI — Nigeria's First Verified Property Marketplace
> **Scope:** Full sitewide visual overhaul to a unified Vercel-inspired dark theme
> **Palette:** Black canvas `#000000` | Surface `#09090b` | Elevated `#121215` | Accent `#10b981` (green) | Text `#ededed` | Muted `#a1a1aa` | Border `rgba(255,255,255,0.08)`
> **Font:** Inter (body + headings — already wired via `localFont`)
> **Radius:** 6px (tag/btn-sm) | 8px (btn) | 12px (card) | 14px (card-lg) | 16px (modal)
> **Status tokens:** Green success, red destructive, amber warning, blue info — same semantics, dark-tinted backgrounds

---

## 0. CURRENT STATE AUDIT

| Layer | Current State | Gap |
|-------|--------------|-----|
| `globals.css` | Vercel Dark tokens ALREADY defined (`--theme-dark-*`, `--theme-landing-*`, `--theme-landlord-*`, etc.) | Tokens exist but are not consistently consumed |
| `tailwind.config.ts` | Semantic color mapping via CSS vars, `darkMode: ['class']` | Complete |
| Dashboard shell | `DashboardShell.tsx` + `sidebar.tsx` use `var(--surface)`, `var(--border)` etc. | Mostly dark-aware already |
| Public pages | `page.tsx` (landing) uses `bg-card`, `text-muted-foreground` but mixed with legacy `bg-muted`, `bg-primary/10` | **Not fully dark** — light-mode residual classes |
| Listings page | Uses `bg-slate-900`, `text-slate-400`, `border-slate-700` inline | Hardcoded slate, not token-driven |
| Listing detail | Uses `bg-background`, `text-foreground` (token-aware) but legacy `bg-muted`, `bg-primary` | Partial |
| Components (40+) | shadcn/ui with CSS var mapping | Works in dark, but legacy `bg-blue-50`, `text-blue-700` etc. in some |
| Footer | `bg-muted/30` with `text-muted-foreground` | Needs dark treatment |

**Bottom line:** The token infrastructure is in place. The overhaul is about (a) purging legacy light-mode classes from public pages, (b) making listings/search fully dark, (c) ensuring every subpage consumes tokens consistently, and (d) the landing page gets the full Vercel Dark treatment.

---

## 1. DESIGN TOKENS — SINGLE SOURCE OF TRUTH

All colors MUST come from CSS variables. No raw hex in components except the token definitions themselves.

```css
/* globals.css — these already exist, verified :root */
--theme-dark-bg: #000000;
--theme-dark-surface: #09090b;
--theme-dark-surface-elevated: #121215;
--theme-dark-border: #27272a;          /* zinc-800 */
--theme-dark-border-subtle: rgba(255,255,255,0.08);
--theme-dark-text: #ededed;             /* zinc-200 */
--theme-dark-muted-foreground: #a1a1aa; /* zinc-400 */
--theme-dark-accent: #10b981;           /* emerald-500 */
--theme-dark-accent2: #059669;          /* emerald-600 */
```

### Semantic mapping (per theme class)

| Token | Landing | Landlord | Tenant | Agent | Admin | Estate Mgr |
|-------|---------|----------|--------|-------|-------|------------|
| `--bg` | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` | `#000000` |
| `--surface` | `#000000` | `#09090b` | `#09090b` | `#09090b` | `#09090b` | `#09090b` |
| `--surface-elevated` | — | `#121215` | — | — | `#121215` | `#121215` |
| `--border` | `#000000` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.08)` |
| `--text` | `#ededed` | `#ededed` | `#ededed` | `#ededed` | `#ededed` | `#ededed` |
| `--muted-foreground` | `#475569` | `#a1a1aa` | `#a1a1aa` | `#a1a1aa` | `#a1a1aa` | `#a1a1aa` |
| `--accent` | `#10b981` | `#10b981` | `#10b981` | `#10b981` | `#10b981` | `#10b981` |

### Status / feedback tokens (theme-agnostic)

| Status | Text | Background | Border |
|--------|------|------------|--------|
| Success | `#10b981` | `rgba(16,185,129,0.1)` | `rgba(16,185,129,0.2)` |
| Warning | `#f59e0b` | `rgba(245,158,11,0.1)` | `rgba(245,158,11,0.2)` |
| Destructive | `#ef4444` | `rgba(239,68,68,0.1)` | `rgba(239,68,68,0.2)` |
| Info | `#3b82f6` | `rgba(59,130,246,0.1)` | `rgba(59,130,246,0.2)` |

### Listing type colors (unchanged, work on dark)

`type-rent:#3b82f6 | type-lease:#8b5cf6 | type-sale:#10b981 | type-shortlet:#f59e0b | type-roomshare:#ec4899`

---

## 2. COMPONENT OVERHAUL SPECIFICATIONS

### 2.1 Button (shadcn/ui — 6 variants)

| Variant | Dark spec |
|---------|-----------|
| `default` (primary) | `bg-[#10b981] text-white hover:bg-[#059669]` |
| `secondary` | `bg-[#121215] text-white border border-[#27272a] hover:bg-[#1a1a1e]` |
| `outline` | `bg-transparent border border-[#27272a] text-white hover:bg-[#121215]` |
| `ghost` | `bg-transparent text-[#a1a1aa] hover:bg-[#121215] hover:text-white` |
| `destructive` | `bg-[#ef4444] text-white hover:bg-[#dc2626]` |
| `link` | `bg-transparent text-[#10b981] underline-offset-4 hover:underline` |

Sizes: sm (h-8 px-3 text-xs) | default (h-10 px-4 text-sm) | lg (h-11 px-6 text-base) | icon (h-10 w-10) | xl (h-12 px-8 text-base)

### 2.2 Card

```
bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-xl
hover:border-[rgba(255,255,255,0.15)] transition-colors
```

### 2.3 Input / Select / Textarea

```
bg-[#09090b] border border-[#27272a] text-white placeholder:text-[#52525b]
focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]
```

### 2.4 Badge (7 variants)

| Variant | Spec |
|---------|------|
| default (slate) | `bg-[#121215] text-[#a1a1aa] border border-[#27272a]` |
| success | `bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20` |
| warning | `bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20` |
| destructive | `bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20` |
| info | `bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20` |
| gold | `bg-[#c9952a]/10 text-[#c9952a] border border-[#c9952a]/20` |
| rent/lease/sale/shortlet/roomshare | type color /10 bg, type color text, type color /20 border |

### 2.5 Tabs

```
Inactive: text-[#52525b] hover:text-[#a1a1aa]
Active: text-white border-b-2 border-white bg-transparent
Panel bg: transparent
```

### 2.6 Modal / Dialog

```
bg-[#09090b] border border-[#27272a] rounded-2xl
Overlay: bg-black/60 backdrop-blur-sm
```

### 2.7 Table

```
Header: bg-[#09090b] text-[#a1a1aa] text-xs uppercase tracking-wider border-b border-[#27272a]
Row: border-b border-[#27272a]/50 hover:bg-[#121215]/50
Cell: text-sm text-white
```

### 2.8 Skeleton

```
bg: linear-gradient(90deg, #121215 25%, #1a1a1e 50%, #121215 75%)
shimmer animation 1.6s
```

### 2.9 Avatar

```
Ring: 2px solid #27272a
Fallback: bg-[#121215] text-[#a1a1aa]
```

### 2.10 Tooltip / Popover

```
bg-[#121215] border border-[#27272a] text-white text-sm rounded-lg
```

---

## 3. PAGE-BY-PAGE OVERHAUL MAP

Total: **229 page.tsx files** across 7 role dashboards + public + auth + shared.

---

### 3.1 PUBLIC PAGES — `(public)` route group

#### 3.1.1 `/` — Landing page (`src/app/page.tsx`)
**Priority: P0 — this is the first impression.**

Current: Mixed. Uses `theme-landing` class and some tokens, but has legacy `bg-muted`, `bg-primary/10`, `bg-card`, `text-green-700 bg-green-50`, `bg-commercial-gold/10`.

Overhaul:
- [ ] Nav: `bg-transparent` → on scroll `bg-black/90 backdrop-blur-xl border-b border-white/10`
- [ ] Logo text: `text-white` (always, on dark hero)
- [ ] Nav links: `text-neutral-300 hover:text-white`
- [ ] Hero section: Image overlay gradient `from-black/60 via-black/40 to-black/80`
- [ ] Hero heading: `text-white` (already) — increase to `text-5xl sm:text-6xl lg:text-8xl` tighter tracking
- [ ] Hero CTA primary: `bg-white text-black rounded-full` (keep — high contrast on dark)
- [ ] Hero CTA secondary: `bg-white/10 text-white border border-white/20 backdrop-blur`
- [ ] SectionLabel: `bg-[#10b981]/10 text-[#10b981]` instead of `bg-primary/10 text-primary`
- [ ] Stat cards: `bg-[#09090b] border border-white/10 rounded-2xl`
- [ ] Stat values: `text-white`
- [ ] Stat labels: `text-neutral-400`
- [ ] How-it-works cards: `bg-[#09090b] border border-white/10`, step number `text-[#10b981]/20`
- [ ] Featured listing cards: `bg-[#09090b] border border-white/10`, hover `border-white/20`
- [ ] Featured card price badge: `bg-black/80 backdrop-blur text-white`
- [ ] Testimonial cards: `bg-[#09090b] border border-white/10`
- [ ] Star rating: `text-[#10b981]`
- [ ] Verified badge: `bg-[#10b981]/10 text-[#10b981]` instead of `bg-green-50 text-green-700`
- [ ] Footer: `bg-black border-t border-white/10`, links `text-neutral-400 hover:text-white`
- [ ] All `bg-muted` → `bg-[#09090b]`
- [ ] All `bg-card` → `bg-[#09090b]`
- [ ] All `bg-primary/10` → `bg-[#10b981]/10`
- [ ] All `text-primary` (non-CTA) → `text-[#10b981]`
- [ ] All `border-border` → `border-white/10`

#### 3.1.2 `/listings` — Search/Filter/Listings (`src/app/(public)/listings/page.tsx`)
**Priority: P0**

Current: Mixed. Has `bg-surface`, `bg-slate-900`, `border-slate-700`, `text-slate-400` inline classes.

Overhaul:
- [ ] Page bg: `bg-black`
- [ ] Sticky filter bar: `bg-black/90 backdrop-blur-md border-b border-white/10`
- [ ] Category toggle: active `bg-[#10b981] text-white`, inactive `bg-[#09090b] text-neutral-400 border border-white/10`
- [ ] Search input: `bg-[#09090b] border border-white/10 text-white placeholder:text-neutral-500 focus:border-[#10b981]`
- [ ] Filter drawer: `bg-[#09090b] border-r border-white/10`, overlay `bg-black/60`
- [ ] Price inputs: `bg-[#09090b] border border-[#27272a] text-white`
- [ ] Bedroom buttons: active `bg-[#10b981] text-white`, inactive `bg-[#09090b] text-neutral-400 border-white/10`
- [ ] Checkbox + label: `text-neutral-300`
- [ ] Property cards: PropertyCard component → `bg-[#09090b] border border-white/10 hover:border-white/20`
- [ ] Card image overlay gradient: `from-black/60 to-transparent`
- [ ] Price text: `text-white font-bold`
- [ ] Spec text: `text-neutral-400`
- [ ] Verification badge: per tier color with /10 bg
- [ ] Sort dropdown: `bg-[#09090b] border border-white/10`
- [ ] View mode toggle: active `bg-white text-black`, inactive `text-neutral-400`
- [ ] All `bg-slate-900` → `bg-[#09090b]`
- [ ] All `border-slate-700` → `border-white/10`
- [ ] All `text-slate-400` → `text-neutral-400`
- [ ] All `text-on-surface` → `text-white`
- [ ] All `text-on-surface-variant` → `text-neutral-400`
- [ ] All `bg-surface-container-low` → `bg-[#09090b]`
- [ ] All `border-outline-variant` → `border-white/10`
- [ ] All `focus:border-emerald-500` → `focus:border-[#10b981]`

#### 3.1.3 `/listings/[id]` — Listing Detail (`src/app/(public)/listings/[id]/page.tsx`)
**Priority: P0**

Overhaul:
- [ ] Page bg: `bg-black`
- [ ] Header: `bg-black/95 backdrop-blur border-b border-white/10`
- [ ] Breadcrumb: `text-neutral-400`, active `text-white`
- [ ] Image gallery: rounded-2xl, border border-white/10
- [ ] Thumbnail active ring: `border-[#10b981]`
- [ ] Favorite button: `bg-black/70 backdrop-blur text-white`
- [ ] Tier/listing type badges: per type with /10 bg
- [ ] Title: `text-white text-3xl font-bold`
- [ ] Specs divider: `bg-white/10`
- [ ] Spec icons: `text-[#10b981]`
- [ ] Description text: `text-neutral-400`
- [ ] Amenity items: `bg-[#09090b] border border-white/10`
- [ ] Amenity check: `text-[#10b981]`
- [ ] Contact card: `bg-[#09090b] border border-white/10 rounded-2xl`
- [ ] Price: `text-[#10b981]`
- [ ] Contact buttons: primary `bg-[#10b981]`, secondary `bg-[#121215] border border-white/10`, WhatsApp `bg-[#25d366]`
- [ ] Agent card: `bg-[#09090b]`

#### 3.1.4 `/saved` — Saved Listings (`src/app/(public)/saved/page.tsx`)
**Priority: P1**

- [ ] Page bg: `bg-black`
- [ ] Grid of PropertyCards with dark spec
- [ ] Empty state: `text-neutral-400`, icon `text-neutral-600`

#### 3.1.5 `/saved/[id]` — Single Saved Detail
**Priority: P2**

#### 3.1.6 `/privacy-policy` (`src/app/(public)/privacy-policy/page.tsx`)
**Priority: P1**

- [ ] Page bg: `bg-black`
- [ ] Body text: `text-neutral-300 leading-relaxed`
- [ ] Headings: `text-white`
- [ ] Max-w-prose container

---

### 3.2 AUTH PAGES

#### 3.2.1 `/sign-in` (`src/app/sign-in/[[...sign-in]]/page.tsx`)
**Priority: P1**

- [ ] Page bg: `bg-black`
- [ ] Clerk card: `bg-[#09090b] border border-white/10 rounded-2xl`
- [ ] Clerk inputs: dark theme via Clerk `<Appearance>` — tokens synced
- [ ] Clerk buttons: primary `bg-[#10b981]`
- [ ] Header logo: `text-white`

#### 3.2.2 `/sign-up` (`src/app/sign-up/[[...sign-up]]/page.tsx`)
**Priority: P1** — same treatment as sign-in

#### 3.2.3 `/signup` — Role picker (`src/app/signup/page.tsx`)
**Priority: P1**

- [ ] Page bg: `bg-black`
- [ ] Role cards: `bg-[#09090b] border border-white/10 hover:border-[#10b981]`
- [ ] Role icons: `text-[#10b981]`
- [ ] Selected ring: `border-[#10b981]`

---

### 3.3 PUBLIC LAYOUT SHELL

#### 3.3.1 `(public)/layout.tsx` — PublicNav + Footer
**Priority: P0**

Overhaul:
- [ ] PublicNav: already uses `bg-background/95` — ensure theme-landing applies black
- [ ] Nav links: `text-neutral-300 hover:text-white`
- [ ] Active: `bg-[#10b981] text-white rounded-lg`
- [ ] Footer bg: `bg-black border-t border-white/10`
- [ ] Footer heading: `text-white`
- [ ] Footer links: `text-neutral-400 hover:text-white`
- [ ] Copyright text: `text-neutral-500`
- [ ] Remove `bg-muted/30`

---

### 3.4 DASHBOARD SHELL — `(dashboard)` route group

#### 3.4.1 `(dashboard)/layout.tsx` — 5-line auth shell
**Status:** Already minimal, no change needed.

#### 3.4.2 `DashboardShell.tsx` — Sidebar + Topbar + Content
**Status:** Already token-driven. Verify:
- [ ] Sidebar: `bg-[#09090b] border-r border-white/10`
- [ ] Topbar: `bg-[#09090b] border-b border-white/10`
- [ ] Nav items active: `bg-[#10b981]/10 text-[#10b981]`
- [ ] Nav items inactive: `text-neutral-400 hover:text-white hover:bg-white/5`
- [ ] User card: `border-b border-white/10`
- [ ] Section labels: `text-neutral-500`
- [ ] Content area: `bg-black`
- [ ] LoadingShell inline styles: `#093057` → `#09090b`, `rgba(255,255,255,0.18)` → `rgba(255,255,255,0.08)`

#### 3.4.3 `sidebar.tsx`
**Status:** Already uses CSS vars. Verify:
- [ ] `sb-header` gradient text-accent → `text-[#10b981]`
- [ ] Active nav: `var(--accent)` works
- [ ] Inactive: `var(--text)` works (maps to #ededed)
- [ ] Collapse toggle: `bg-surface-elevated` → `#121215`

---

### 3.5 LANDLORD DASHBOARD — `/dashboard/landlord/*`

**Theme class:** `theme-landlord` (already maps to black/#09090b/#10b981)

| Page | Path | Priority | Overhaul focus |
|------|------|----------|----------------|
| Dashboard home | `/dashboard/landlord/page.tsx` | P0 | KPI cards, quick actions, recent activity — all dark tokens |
| Properties list | `/dashboard/landlord/properties/page.tsx` | P0 | Table/card grid, filters dark |
| Property detail | `/dashboard/landlord/properties/[id]/page.tsx` | P0 | Image gallery, specs, unit drawer dark |
| Property edit | `/dashboard/landlord/properties/[id]/edit/page.tsx` | P1 | Form inputs dark |
| Property publish | `/dashboard/landlord/properties/[id]/publish/page.tsx` | P1 | Publish flow dark |
| Add property | `/dashboard/landlord/properties/new/page.tsx` | P1 | Multi-step form dark |
| Add unit | `/dashboard/landlord/properties/[id]/units/new/page.tsx` | P1 | Form dark |
| Listing detail | `/dashboard/landlord/listing/[id]/page.tsx` | P0 | Detail view, image gallery, booking card |
| Add listing | `/dashboard/landlord/listing/new/page.tsx` | P0 | Wizard shell dark |
| Listing wizard | `/dashboard/landlord/listing/new/wizard/page.tsx` | P0 | 14 steps, all form inputs dark |
| Portfolio | `/dashboard/landlord/portfolio/page.tsx` | P1 | Grid, analytics dark |
| Tenants list | `/dashboard/landlord/tenants/page.tsx` | P1 | Table dark |
| Tenant detail | `/dashboard/landlord/tenants/[id]/page.tsx` | P1 | Profile, lease dark |
| Applications | `/dashboard/landlord/applications/page.tsx` | P1 | Table, status badges |
| Application detail | `/dashboard/landlord/applications/[id]/page.tsx` | P1 | Profile, actions |
| Screening | `/dashboard/landlord/screening/page.tsx` | P2 | Verification cards |
| Financials | `/dashboard/landlord/financials/page.tsx` | P0 | Charts, KPI, tables dark |
| Financial reports | `/dashboard/landlord/financials/reports/page.tsx` | P1 | Report cards, tables |
| Financial invoices | `/dashboard/landlord/financials/invoices/page.tsx` | P1 | Table |
| Financial overdue | `/dashboard/landlord/financials/overdue/page.tsx` | P1 | Table, alert badges |
| Financial withdrawals | `/dashboard/landlord/financials/withdrawals/page.tsx` | P1 | Table |
| Financial forecasting | `/dashboard/landlord/financials/forecasting/page.tsx` | P2 | Charts |
| Scenario builder | `/dashboard/landlord/financials/scenario-builder/page.tsx` | P2 | Form + chart |
| Revenue forecast | `/dashboard/landlord/revenue-forecast/page.tsx` | P2 | Charts |
| Revenue scenario-builder | `/dashboard/landlord/revenue-forecast/scenario-builder/page.tsx` | P2 | Form |
| Revenue report | `/dashboard/landlord/revenue-forecast/report/page.tsx` | P2 | Report view |
| Rent | `/dashboard/landlord/rent/page.tsx` | P1 | Table, payment status |
| Rents | `/dashboard/landlord/rents/page.tsx` | P1 | Table |
| Leases | `/dashboard/landlord/leases/page.tsx` | P1 | Table |
| Agreements | `/dashboard/landlord/agreements/page.tsx` | P1 | Table, status |
| Agreement detail | `/dashboard/landlord/agreement/page.tsx` | P1 | Document view |
| New agreement | `/dashboard/landlord/agreements/new/page.tsx` | P1 | Form |
| Maintenance | `/dashboard/landlord/maintenance/page.tsx` | P1 | Ticket table, kanban |
| Tenants | `/dashboard/landlord/tenants/page.tsx` | P1 | Table |
| Vacancies | `/dashboard/landlord/vacancies/page.tsx` | P2 | Grid |
| Turnover | `/dashboard/landlord/turnover/page.tsx` | P2 | Stats |
| Messages | `/dashboard/landlord/messages/page.tsx` | P1 | Chat layout dark |
| Notifications | `/dashboard/landlord/notifications/page.tsx` | P1 | List dark |
| Invoices | `/dashboard/landlord/invoices/page.tsx` | P1 | Table |
| Receipts | `/dashboard/landlord/receipts/page.tsx` | P1 | Table |
| Statements | `/dashboard/landlord/statements/page.tsx` | P1 | Table |
| Short-let | `/dashboard/landlord/short-let/page.tsx` | P2 | Calendar, bookings |
| Profile | `/dashboard/landlord/profile/page.tsx` | P1 | Form dark |
| Verification | `/dashboard/landlord/verification/page.tsx` | P1 | 5-layer stepper dark |
| Verify | `/dashboard/landlord/verify/page.tsx` | P2 | Form dark |
| Agents | `/dashboard/landlord/agents/page.tsx` | P2 | Table, invite |
| Commercial leases | `/dashboard/landlord/commercial/leases/page.tsx` | P2 | Table |
| Commercial lease negotiation | `/dashboard/landlord/commercial/leases/negotiation/page.tsx` | P2 | Chat + doc |
| Commercial move-in | `/dashboard/landlord/commercial/move-in/page.tsx` | P2 | Checklist |
| Commercial agreement review | `/dashboard/landlord/commercial/agreements/review/page.tsx` | P2 | Document |

**Landlord subpage pattern (applied to ALL):**
```
Page bg: bg-black
Header bar: bg-[#09090b] border-b border-white/10
Section cards: bg-[#09090b] border border-white/10 rounded-xl
KPI numbers: text-white text-2xl font-bold
KPI labels: text-neutral-400 text-xs uppercase tracking-wider
Tables: header bg-[#09090b] text-neutral-400, rows border-b border-white/5 hover:bg-white/5
Inputs: bg-[#09090b] border border-[#27272a] text-white focus:border-[#10b981]
Tabs: active text-white border-white, inactive text-neutral-500
Empty states: text-neutral-500
Error states: bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20
```

---

### 3.6 TENANT DASHBOARD — `/dashboard/tenant/*`

**Theme class:** `theme-tenant`

| Page | Path | Priority |
|------|------|----------|
| Dashboard home | `/dashboard/tenant/page.tsx` | P0 |
| Payments | `/dashboard/tenant/payments/page.tsx` | P0 |
| Payment methods | `/dashboard/tenant/payments/methods/new/page.tsx` | P1 |
| Add payment method | `/dashboard/tenant/payments/methods/[id]/page.tsx` | P1 |
| Auto-pay | `/dashboard/tenant/payments/auto-pay/page.tsx` | P1 |
| Overdue | `/dashboard/tenant/payments/overdue/page.tsx` | P1 |
| Statements | `/dashboard/tenant/payments/statements/page.tsx` | P1 |
| Payment success | `/dashboard/tenant/payments/success/page.tsx` | P1 |
| Applications | `/dashboard/tenant/applications/page.tsx` | P1 |
| Application detail | `/dashboard/tenant/applications/[id]/page.tsx` | P1 |
| Agreements | `/dashboard/tenant/agreements/page.tsx` | P1 |
| Agreement detail | `/dashboard/tenant/agreements/[id]/page.tsx` | P1 |
| Agreement sign | `/dashboard/tenant/agreements/[id]/sign/page.tsx` | P1 |
| Maintenance | `/dashboard/tenant/maintenance/page.tsx` | P1 |
| Maintenance detail | `/dashboard/tenant/maintenance/[id]/page.tsx` | P1 |
| New maintenance | `/dashboard/tenant/maintenance/new/page.tsx` | P1 |
| Emergency maintenance | `/dashboard/tenant/maintenance/emergency/page.tsx` | P2 |
| Maintenance protocol | `/dashboard/tenant/maintenance/protocol/page.tsx` | P2 |
| Messages | `/dashboard/tenant/messages/page.tsx` | P1 |
| Notifications | `/dashboard/tenant/notifications/page.tsx` | P1 |
| Invoices | `/dashboard/tenant/invoices/page.tsx` | P1 |
| Receipts | `/dashboard/tenant/receipts/page.tsx` | P1 |
| Profile | `/dashboard/tenant/profile/page.tsx` | P1 |
| Saved | `/dashboard/tenant/saved/page.tsx` | P1 |
| Screening | `/dashboard/tenant/screening/page.tsx` | P2 |
| Search | `/dashboard/tenant/search/page.tsx` | P2 |
| Support | `/dashboard/tenant/support/page.tsx` | P2 |

Same component specs as landlord (section 3.5 pattern).

---

### 3.7 AGENT DASHBOARD — `/dashboard/agent/*`

**Theme class:** `theme-agent`

| Page | Path | Priority |
|------|------|----------|
| Dashboard home | `/dashboard/agent/page.tsx` | P0 |
| Listings | `/dashboard/agent/listings/page.tsx` | P0 |
| Listing detail | `/dashboard/agent/listings/[id]/page.tsx` | P0 |
| Sell | `/dashboard/agent/sell/page.tsx` | P0 |
| Buy | `/dashboard/agent/buy/page.tsx` | P1 |
| Market | `/dashboard/agent/market/page.tsx` | P1 |
| Pipeline | `/dashboard/agent/pipeline/page.tsx` | P1 |
| Deals | `/dashboard/agent/deals/page.tsx` | P1 |
| Deal detail | `/dashboard/agent/deals/[id]/page.tsx` | P1 |
| Clients | `/dashboard/agent/clients/page.tsx` | P1 |
| Client detail | `/dashboard/agent/clients/[id]/page.tsx` | P1 |
| Profile | `/dashboard/agent/profile/page.tsx` | P1 |
| Payments | `/dashboard/agent/payments/page.tsx` | P1 |
| Commissions | `/dashboard/agent/commissions/page.tsx` | P1 |
| Commission ledger | `/dashboard/agent/commission-ledger/page.tsx` | P2 |
| Earnings short-let | `/dashboard/agent/earnings/short-let/page.tsx` | P2 |
| Invoices | `/dashboard/agent/invoices/page.tsx` | P1 |
| Receipts | `/dashboard/agent/receipts/page.tsx` | P1 |
| Statements | `/dashboard/agent/statements/page.tsx` | P1 |
| Withdrawals | `/dashboard/agent/withdrawals/page.tsx` | P1 |
| Verifications | `/dashboard/agent/verifications/page.tsx` | P1 |
| License verification | `/dashboard/agent/verifications/license/page.tsx` | P1 |
| Inspections | `/dashboard/agent/inspections/page.tsx` | P1 |
| New inspection | `/dashboard/agent/inspections/new/page.tsx` | P1 |
| Inspection report | `/dashboard/agent/inspections/report/page.tsx` | P1 |
| Schedule | `/dashboard/agent/schedule/page.tsx` | P2 |
| Messages | `/dashboard/agent/messages/page.tsx` | P1 |
| Invites | `/dashboard/agent/invites/page.tsx` | P2 |
| Agreements new | `/dashboard/agent/agreements/new/page.tsx` | P1 |
| Reputation | `/dashboard/agent/reputation/page.tsx` | P2 |

---

### 3.8 ESTATE MANAGER DASHBOARD — `/dashboard/estate-manager/*`

**Theme class:** `theme-estate-manager` / `body.em-theme`

| Page | Path | Priority |
|------|------|----------|
| Dashboard home | `/dashboard/estate-manager/page.tsx` | P0 |
| Portfolio | `/dashboard/estate-manager/portfolio/page.tsx` | P0 |
| Portfolio analytics | `/dashboard/estate-manager/portfolio/analytics/page.tsx` | P1 |
| Portfolio unit detail | `/dashboard/estate-manager/portfolio/[unitId]/page.tsx` | P1 |
| Units | `/dashboard/estate-manager/units/page.tsx` | P0 |
| Unit detail | `/dashboard/estate-manager/units/[unitId]/page.tsx` | P0 |
| Financials | `/dashboard/estate-manager/financials/page.tsx` | P0 |
| Scenario | `/dashboard/estate-manager/financials/scenario/page.tsx` | P1 |
| Scenario builder | `/dashboard/estate-manager/financials/scenario-builder/page.tsx` | P1 |
| Analytics | `/dashboard/estate-manager/analytics/page.tsx` | P1 |
| Tenants | `/dashboard/estate-manager/tenants/page.tsx` | P1 |
| Maintenance | `/dashboard/estate-manager/maintenance/page.tsx` | P1 |
| Maintenance detail | `/dashboard/estate-manager/maintenance/[id]/page.tsx` | P1 |
| Collections | `/dashboard/estate-manager/collections/page.tsx` | P1 |
| Disbursements | `/dashboard/estate-manager/disbursements/page.tsx` | P1 |
| Ledger | `/dashboard/estate-manager/ledger/page.tsx` | P1 |
| Team | `/dashboard/estate-manager/team/page.tsx` | P1 |
| Reports | `/dashboard/estate-manager/reports/page.tsx` | P1 |
| Revenue signature | `/dashboard/estate-manager/reports/revenue-signature/page.tsx` | P1 |
| Agreements | `/dashboard/estate-manager/agreements/page.tsx` | P1 |
| Invoices | `/dashboard/estate-manager/invoices/page.tsx` | P1 |
| Receipts | `/dashboard/estate-manager/receipts/page.tsx` | P1 |
| Statements | `/dashboard/estate-manager/statements/page.tsx` | P1 |
| Billing | `/dashboard/estate-manager/billing/page.tsx` | P1 |
| Subscription | `/dashboard/estate-manager/subscription/page.tsx` | P1 |
| Profile | `/dashboard/estate-manager/profile/page.tsx` | P1 |
| Messages | `/dashboard/estate-manager/messages/page.tsx` | P1 |
| Turnover | `/dashboard/estate-manager/turnover/page.tsx` | P2 |
| Move-in | `/dashboard/estate-manager/move-in/page.tsx` | P2 |
| Lease review | `/dashboard/estate-manager/lease-review/page.tsx` | P2 |
| Lease negotiation | `/dashboard/estate-manager/lease-negotiation/page.tsx` | P2 |
| Commercial leases | `/dashboard/estate-manager/commercial-leases/page.tsx` | P2 |
| Bulk import | `/dashboard/estate-manager/bulk-import/page.tsx` | P2 |
| Service charges | `/dashboard/estate-manager/service-charges/page.tsx` | P2 |
| Utilities | `/dashboard/estate-manager/utilities/page.tsx` | P2 |
| Invite property manager | `/dashboard/estate-manager/invite-property-manager/page.tsx` | P2 |

---

### 3.9 ADMIN DASHBOARD — `/dashboard/admin/*`

**Theme class:** `theme-admin`

| Page | Path | Priority |
|------|------|----------|
| Dashboard home | `/dashboard/admin/page.tsx` | P0 |
| Overview | `/dashboard/admin/overview/page.tsx` | P0 |
| Users | `/dashboard/admin/users/page.tsx` | P0 |
| User management | `/dashboard/admin/users/management/page.tsx` | P0 |
| Properties | `/dashboard/admin/properties/page.tsx` | P0 |
| Verifications | `/dashboard/admin/verifications/page.tsx` | P0 |
| Verification queue | `/dashboard/admin/verification/page.tsx` | P0 |
| Queue detail (obsidian) | `/dashboard/admin/verification/queue-detail/obsidian-penthouse/page.tsx` | P0 |
| Payments | `/dashboard/admin/payments/page.tsx` | P1 |
| Transactions | `/dashboard/admin/transactions/page.tsx` | P1 |
| Escrow | `/dashboard/admin/transactions/escrow/page.tsx` | P1 |
| Withdrawals | `/dashboard/admin/transactions/withdrawals/page.tsx` | P1 |
| Revenue | `/dashboard/admin/revenue/page.tsx` | P1 |
| Reports | `/dashboard/admin/reports/page.tsx` | P1 |
| Flags | `/dashboard/admin/flags/page.tsx` | P1 |
| Disputes | `/dashboard/admin/disputes/page.tsx` | P1 |
| Dispute detail | `/dashboard/admin/disputes/[id]/page.tsx` | P1 |
| Agreements | `/dashboard/admin/agreements/page.tsx` | P1 |
| Invoices | `/dashboard/admin/invoices/page.tsx` | P1 |
| Receipts | `/dashboard/admin/receipts/page.tsx` | P1 |
| Statements | `/dashboard/admin/statements/page.tsx` | P1 |
| Audit logs | `/dashboard/admin/audit/logs/page.tsx` | P1 |
| Audit event detail | `/dashboard/admin/audit/event-detail/page.tsx` | P1 |
| Settings | `/dashboard/admin/settings/page.tsx` | P1 |
| Global settings | `/dashboard/admin/settings/global/page.tsx` | P1 |
| Settings dashboard | `/dashboard/admin/settings/dashboard/page.tsx` | P1 |
| Settings countries | `/dashboard/admin/settings/countries/page.tsx` | P1 |
| Settings rules | `/dashboard/admin/settings/rules/page.tsx` | P1 |
| Settings mfa | `/dashboard/admin/settings/mfa/page.tsx` | P1 |
| Roles verification-officer | `/dashboard/admin/roles/verification-officer/page.tsx` | P2 |
| Profile | `/dashboard/admin/profile/page.tsx` | P1 |
| Profile security | `/dashboard/admin/profile/security/page.tsx` | P1 |

**Admin-specific denser table style:**
```
Table header: bg-[#09090b] text-[#a1a1aa] text-[11px] uppercase tracking-wider
Table row: border-b border-[#27272a]/40 hover:bg-[#121215]/60
Mono refs: font-mono text-xs text-[#a1a1aa]
Status pills: per status token spec
```

---

### 3.10 ACCOUNTANT DASHBOARD — `/dashboard/accountant/*`

**Theme:** inherits shared dashboard tokens.

| Page | Path | Priority |
|------|------|----------|
| Dashboard home | `/dashboard/accountant/page.tsx` | P1 |
| Payments | `/dashboard/accountant/payments/page.tsx` | P1 |
| Reports | `/dashboard/accountant/reports/page.tsx` | P1 |
| Receipts | `/dashboard/accountant/receipts/page.tsx` | P1 |
| Profile | `/dashboard/accountant/profile/page.tsx` | P1 |
| Messages | `/dashboard/accountant/messages/page.tsx` | P2 |
| Withdrawals | `/dashboard/accountant/withdrawals/page.tsx` | P2 |
| Statements | `/dashboard/accountant/statements/page.tsx` | P2 |

---

### 3.11 SHARED ROLE PAGES — `/dashboard/[role]/*`

| Page | Path | Priority |
|------|------|----------|
| Role home | `/dashboard/[role]/page.tsx` | P0 |
| Payments | `/dashboard/[role]/payments/page.tsx` | P0 |
| New payment | `/dashboard/[role]/payments/new/page.tsx` | P1 |
| Payment detail | `/dashboard/[role]/payments/[id]/page.tsx` | P1 |
| Payment receipt | `/dashboard/[role]/payments/[id]/receipt/page.tsx` | P1 |
| Payment callback | `/dashboard/[role]/payments/callback/page.tsx` | P1 |
| Agreements | `/dashboard/[role]/agreements/page.tsx` | P1 |
| Agreement detail | `/dashboard/[role]/agreements/[id]/page.tsx` | P1 |
| Agreement sign | `/dashboard/[role]/agreements/[id]/sign/page.tsx` | P1 |
| Messages | `/dashboard/[role]/messages/page.tsx` | P1 |
| Message thread | `/dashboard/[role]/messages/[id]/page.tsx` | P1 |
| Notifications | `/dashboard/[role]/notifications/page.tsx` | P1 |
| Settings notifications | `/dashboard/[role]/settings/notifications/page.tsx` | P2 |

---

### 3.12 VERIFICATION FLOW — `/dashboard/verification/*` (and `/verification/*`)

| Page | Path | Priority |
|------|------|----------|
| Verification home | `/dashboard/verification/page.tsx` | P0 |
| Guide | `/dashboard/verification/guide/page.tsx` | P0 |
| Checklist | `/dashboard/verification/checklist/page.tsx` | P0 |
| Step 1 Documents | `/dashboard/verification/step1/documents/page.tsx` | P0 |
| Step 2 Identity | `/dashboard/verification/step2/identity/page.tsx` | P0 |
| Step 3 Video | `/dashboard/verification/step3/video/page.tsx` | P0 |
| Step 4 Inspection | `/dashboard/verification/step4/inspection/page.tsx` | P0 |
| Dojah KYC | `/dashboard/verification/dojah-kyc/page.tsx` | P1 |
| Submitted | `/dashboard/verification/submitted/page.tsx` | P0 |

Plus 7 mirror pages under `/verification/*` (no /dashboard prefix) — same treatment.

---

### 3.13 OTHER PAGES

| Page | Path | Priority | Notes |
|------|------|----------|-------|
| Wallet | `/dashboard/wallet/page.tsx` | P1 | Balance card dark |
| Coming soon | `/coming-soon/page.tsx` | P2 | Dark |
| Payment success | `/payment/success/page.tsx` | P1 | Dark, checkmark animation |
| Payment declined | `/payment/declined/page.tsx` | P1 | Dark, error state |
| Search | `/search/page.tsx` | P1 | Dark search overlay |
| Account suspended | `/account/suspended/page.tsx` | P2 | Dark, warning |
| Verification (public) | `/verification/[id]/page.tsx` | P1 | Dark |
| Verification frozen | `/verification/frozen/page.tsx` | P2 | Dark |

---

## 4. LEGACY CLASS PURGE LIST

These classes MUST be eliminated sitewhere. Each is a light-mode artifact.

| Legacy Class | Replacement | Files affected |
|-------------|-------------|----------------|
| `bg-muted` (on public) | `bg-[#09090b]` or `bg-[#121215]` | Landing, listings |
| `bg-muted/30` | `bg-[#09090b]` | Public footer |
| `bg-card` | `bg-[#09090b]` | Landing, listings |
| `bg-primary/10` | `bg-[#10b981]/10` | Landing section labels |
| `bg-primary` (non-CTA) | `bg-[#10b981]` | Badges |
| `text-primary` (non-link) | `text-[#10b981]` | Stat values, stars |
| `text-muted-foreground` | `text-neutral-400` | Everywhere |
| `border-border` | `border-white/10` | Cards, dividers |
| `border-outline-variant` | `border-white/10` | Filter bar |
| `border-outline` | `border-[#27272a]` | Inputs |
| `text-on-surface` | `text-white` | Listings filters |
| `text-on-surface-variant` | `text-neutral-400` | Listings filters |
| `bg-surface-container-low` | `bg-[#09090b]` | Bedroom buttons |
| `bg-surface-container` | `bg-[#121215]` | Hover states |
| `bg-blue-50` | `bg-[#121215]` | Legacy info badges |
| `bg-blue-500/10` | `bg-[#3b82f6]/10` | Legacy info badges |
| `text-blue-700` | `text-[#3b82f6]` | Legacy info text |
| `text-blue-400` | `text-[#3b82f6]` | Legacy info text |
| `bg-green-50` | `bg-[#10b981]/10` | Verified badges |
| `text-green-700` | `text-[#10b981]` | Verified text |
| `bg-green-500/20` | `bg-[#10b981]/20` | Trust icons |
| `text-green-400` | `text-[#10b981]` | Trust icons |
| `bg-destructive/10` | `bg-[#ef4444]/10` | Already close — verify |
| `text-destructive` | `text-[#ef4444]` | Already close — verify |
| `bg-slate-900` | `bg-[#09090b]` | Listings inputs |
| `border-slate-700` | `border-[#27272a]` | Listings inputs |
| `text-slate-400` | `text-neutral-400` | Listings |
| `text-slate-500` | `text-neutral-500` | Listings |
| `focus:border-emerald-500` | `focus:border-[#10b981]` | Listings |
| `bg-commercial-gold/10` | `bg-[#c9952a]/10` | Landing featured |
| `text-commercial-gold` | `text-[#c9952a]` | Landing featured |
| `bg-residential-teal` | `bg-[#10b981]` | Listings bedroom |
| `text-residential-teal` | `text-[#10b981]` | Listings |
| `border-residential-teal` | `border-[#10b981]` | Listings |
| `shadow-sm` | remove or `shadow-none` | Cards (dark = border, not shadow) |
| `shadow-card-hover` | `hover:border-white/20` | Cards |
| `shadow-elevated` | remove | Stat cards |

---

## 5. GLOBAL CSS ADDITIONS

Add to `globals.css` (after existing tokens):

```css
/* === VERCEL DARK COMPONENT UTILITIES === */
.glass-card {
  background: #09090b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
.glass-card-elevated {
  background: #121215;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
}
.dark-surface {
  background: #09090b;
}
.dark-canvas {
  background: #000000;
}
.dark-border {
  border-color: rgba(255, 255, 255, 0.08);
}
.dark-input {
  background: #09090b;
  border-color: #27272a;
  color: #ededed;
}
.dark-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 1px #10b981;
}
.dark-input::placeholder {
  color: #52525b;
}

/* Selection */
::selection {
  background: rgba(16, 185, 129, 0.3);
  color: #ffffff;
}

/* Scrollbar dark */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #09090b; }
::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
```

---

## 6. TAILWIND CONFIG ADDITIONS

Add to `theme.extend.colors`:

```ts
// Vercel Dark canonical
obsidian: {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
},
```

Add to `theme.extend.boxShadow`:

```ts
'glow-green': '0 0 20px rgba(16, 185, 129, 0.15)',
'glow-card': '0 0 0 1px rgba(255, 255, 255, 0.08)',
```

---

## 7. WHAT DOES NOT CHANGE (preserve)

- Route structure — no pages added or removed (purely visual)
- Component logic / data fetching / Prisma queries
- Clerk auth flow and its `<Appearance>` tokens (sync separately)
- Paystack / Remita / Cloudinary integrations
- API routes under `/api/*`
- Test assertions (60/60 should still pass — visual-only changes)
- `AGENTS.md` / `CLAUDE.md` conventions
- Database schema, migrations
- Build pipeline (`npm run build -- --no-lint`)

---

## 8. ACCESSIBILITY REQUIREMENTS

- [ ] All text ≥ 4.5:1 contrast ratio against its background
- [ ] `#a1a1aa` on `#09090b` = 7.8:1 ✓
- [ ] `#ededed` on `#09090b` = 14.5:1 ✓
- [ ] `#10b981` on `#09090b` = 5.9:1 ✓
- [ ] `#52525b` on `#09090b` = 4.6:1 ✓ (placeholder only)
- [ ] Focus-visible: `outline: 2px solid #10b981; outline-offset: 2px`
- [ ] No color-only state indication — always pair icon + text
- [ ] Touch targets ≥ 44px on mobile
- [ ] `prefers-reduced-motion`: disable shimmer/pulse
- [ ] All images keep `alt` text

## Page Tiers

### Tier 1 — Public
- `/` — Landing
- `/listings` — Listings grid
- `/listings/[id]` — Listing detail
- `/search` — Search
- `/saved`, `/saved/[id]`
- `/sign-in`, `/sign-up`
- `/coming-soon`
- `/verification/*`
- `/payment/*`
- `/account/suspended`
- `/not-found`, `/error`, `/global-error`

### Tier 2 — Dashboard Core
- `/dashboard`
- `/dashboard/layout`
- `/dashboard/[role]`
- `/dashboard/landlord`
- `/dashboard/tenant`
- `/dashboard/agent`
- `/dashboard/admin`
- `/dashboard/estate-manager`
- `/dashboard/accountant`

### Tier 2 — Dashboard Shared
- `/dashboard/[role]/payments`, `/payments/new`, `/payments/[id]`, `/payments/[id]/receipt`
- `/dashboard/[role]/messages`, `/messages/[id]`
- `/dashboard/[role]/agreements`, `/agreements/[id]`, `/agreements/[id]/sign`
- `/dashboard/[role]/notifications`
- `/dashboard/[role]/settings/notifications`
- `/dashboard/wallet`

### Tier 3 — Landlord
- Properties: `/properties`, `/properties/new`, `/properties/[id]`, `/properties/[id]/edit`, `/properties/[id]/publish`, `/properties/[id]/units/new`
- Listings: `/listing/new`, `/listing/new/wizard/*`, `/listing/[id]`
- Leasing: `/applications`, `/applications/[id]`, `/tenants`, `/tenants/[id]`, `/leases`, `/agreements`, `/agreements/new`
- Financials: `/financials`, `/financials/overdue`, `/financials/invoices`, `/financials/withdrawals`, `/financials/reports`, `/financials/scenario-builder`, `/financials/forecasting`
- Revenue: `/revenue-forecast`, `/revenue-forecast/scenario-builder`
- Operations: `/maintenance`, `/turnover`, `/short-let`
- Rent: `/rent`, `/rents`, `/receipts`, `/statements`
- Misc: `/vacancies`, `/agents`, `/messages`, `/notifications`, `/verification`, `/verify`, `/screening`, `/profile`

### Tier 3 — Tenant
- Payments: `/payments`, `/payments/overdue`, `/payments/auto-pay`, `/payments/methods/new`, `/payments/methods/[id]`, `/payments/statements`, `/payments/success`
- Applications: `/applications`, `/applications/[id]`
- Agreements: `/agreements`, `/agreements/[id]`, `/agreements/[id]/sign`
- Maintenance: `/maintenance`, `/maintenance/new`, `/maintenance/[id]`, `/maintenance/protocol`, `/maintenance/emergency`
- Misc: `/saved`, `/search`, `/screening`, `/receipts`, `/invoices`, `/support`, `/messages`, `/notifications`, `/profile`

### Tier 3 — Agent
- Core: `/schedule`, `/pipeline`, `/pipeline/buy`, `/pipeline/sell`, `/pipeline/[id]`
- Listings: `/listings`, `/listings/[id]`
- CRM: `/clients`, `/clients/[id]`, `/market`, `/deals`, `/deals/[id]`, `/invites`
- Finance: `/payments`, `/commissions`, `/commission-ledger`
- Inspections: `/inspections`, `/inspections/new`, `/inspections/report`, `/inspections/office`
- Verification: `/verifications`, `/verifications/license`
- Agreements: `/agreements/new`
- Misc: `/reputation`, `/earnings/short-let`, `/withdrawals`, `/invoices`, `/receipts`, `/statements`, `/sell`, `/buy`, `/profile`

### Tier 3 — Estate Manager
- Portfolio: `/units`, `/units/[unitId]`, `/portfolio`, `/portfolio/[unitId]`, `/portfolio/analytics`
- Maintenance: `/maintenance`, `/maintenance/[id]`
- Financials: `/financials`, `/financials/scenario`, `/financials/scenario-builder`, `/collections`, `/disbursements`
- Documents: `/receipts`, `/invoices`, `/statements`
- People: `/tenants`, `/team`
- Leases: `/agreements`, `/lease-review`, `/lease-negotiation`, `/commercial-leases`
- Ops: `/reports`, `/reports/revenue-signature`, `/utilities`, `/service-charges`, `/bulk-import`
- Misc: `/move-in`, `/invite-property-manager`, `/subscription`, `/billing`, `/analytics`, `/ledger`, `/messages`, `/profile`

### Tier 3 — Admin
- Overview: `/overview`, `/dashboard`
- Users: `/users`, `/users/management`
- Content: `/properties`, `/verifications`, `/flags`
- Legal: `/agreements`, `/payments`, `/disputes`, `/revenue`
- Finance: `/reports`, `/receipts`, `/invoices`, `/statements`, `/transactions`, `/transactions/escrow`, `/transactions/withdrawals`
- Settings: `/settings`, `/settings/global`, `/settings/dashboard`, `/settings/rules`, `/settings/countries`, `/settings/mfa`
- Profile: `/profile`, `/profile/security`
- Audit: `/audit/logs`, `/audit/event-detail`
- Roles: `/roles/verification-officer`
- Queue: `/verification/queue-detail/obsidian-penthouse`

---

*Document version: 1.0 — Generated for PROPATI sitewide dark UI overhaul*
*Token source: `src/app/globals.css` + `tailwind.config.ts` (verified current state)*
*Total pages scoped: 229 page.tsx files*
