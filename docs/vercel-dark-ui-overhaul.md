# Full Site-Wide Vercel Dark UI Overhaul

## Goal
Unify PROPATI into a single Vercel-inspired dark experience across public marketing surfaces and all role-based dashboards. No orange. White primary text. Green accent only. Consistent borders, surfaces, and typography.

## Canonical Design Tokens

```css
--background: #000000;
--surface: #09090b;
--surface-elevated: #121215;
--border: #27272a;
--border-subtle: rgba(255, 255, 255, 0.08);
--foreground: #ededed;
--muted-foreground: #a1a1aa;
--primary: #10b981;
--primary-hover: #059669;
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
--verified: #06b6d4;
```

## Layout Tokens

```css
--topbar-height: 60px;
--sidebar-width: 260px;
--sidebar-collapsed: 68px;
--radius-card: 12px;
--radius-modal: 16px;
--radius-pill: 9999px;
--transition-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1);
```

## Typography Scale

- Display: `headline-lg` / `title-md`
- Body: `body-md`
- Labels: `label-sm` uppercase tracking-wide
- Mono: `body-lg-mono`

## Interaction Rules

- Hover: brightness +10%
- Active: `scale(0.99)`
- Focus: `2px solid var(--primary)` with inset glow
- Transitions: `cubic-bezier(0.16, 1, 0.3, 1)`

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

## Component Overhaul Spec

### DashboardShell
- Sidebar: `background: #000000`, active item `border-left: 2px solid #ffffff`, text `#ededed`, inactive `#a1a1aa`
- Collapsed sidebar: `width: 68px`, icons only, tooltip on hover
- Topbar: `height: 60px`, `background: #09090b`, `border-bottom: 1px solid #27272a`
- Search trigger: `background: #121215`, border `#27272a`

### GlobalSearch
- Modal backdrop: `rgba(0, 0, 0, 0.8)`
- Input: `background: #121215`, border `#27272a`, focus border `#10b981`
- Results hover: `background: #18181b`

### PropertyCard / Listings
- Card: `background: #09090b`, `border: 1px solid #27272a`, hover border `#10b981`
- Image overlay gradient: `from-black/60 to-transparent`
- Verified badge: `background: rgba(6, 182, 212, 0.15)`, text `#06b6d4`
- Price chip: `background: #121215`, text `#10b981`

### Tables / DataGrid
- Header: `background: #121215`, text `#a1a1aa`
- Row hover: `background: #18181b`
- Border row: `border-bottom: 1px solid #27272a`
- Sort indicator: `#10b981`

### WizardShell / Forms
- Step track: `background: #27272a`
- Active step: `background: #10b981`, text `#ffffff`
- Input: `background: #09090b`, border `#27272a`, focus `#10b981`
- Error: `border: #ef4444`, text `#ef4444`

### Payments / Receipts
- Amounts: `color: #ededed`, `font-weight: 700`
- Success indicator: `#10b981`
- Receipt surface: `background: #121215`, border `#27272a`

### Notifications / Chat
- Unread indicator: `border-left: 2px solid #10b981`
- Hover: `background: #18181b`
- Timestamp: `color: #71717a`

### Auth / Clerk
- Full-bleed background: `#000000`
- Card: `background: #09090b`, border `#27272a`
- Primary button: `background: #10b981`, text `#ffffff`
- Secondary button: `background: #121215`, border `#27272a`

## Implementation Order

1. `globals.css` — normalize all role themes to single dark map
2. `DashboardShell.tsx` — sidebar + topbar tokens
3. `PublicNav.tsx` — public nav dark tokens
4. `PropertyCard.tsx` — card surfaces + verified chips
5. Listing page filters — dark inputs + tabs
6. Listing detail — gallery + contact card
7. Admin tables — header + row hover states
8. Wizard/form components — step track + inputs
9. Payments/receipts — amount typography + success states
10. Notifications/chat — unread states + timestamps

## Preview

See the visual preview at:
- `/home/r2d2c3p0/NEWPROPATI_new/docs/vercel-dark-ui-preview.png`

The preview shows wireframe concepts for:
1. **Landing Page** — hero, stats, steps, featured cards
2. **Listings Page** — nav, filter bar, card grid
3. **Listing Detail** — gallery, specs, contact card
4. **Dashboard Shell** — sidebar, topbar, stat cards, data table
5. **Listing Wizard / Forms** — step track, form fields, actions

## Verification

- Run `npm run build -- --no-lint`
- Verify no orange accents remain
- Verify active sidebar border is white, not green
- Verify all cards use `#09090b` or `#121215`
- Verify all borders use `#27272a` or `rgba(255,255,255,0.08)`
