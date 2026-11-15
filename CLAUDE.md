# PropatiBox — Claude Instructions

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

## Global Header, Notification System, Popovers & Overlay Management

All header chrome and overlays live in `src/components/layout/` (shell) and `src/components/notifications/`. The rule that fixes every overlap/clipping complaint is **mutual exclusion through a single overlay context**.

### Overlay coordination (`HeaderOverlayProvider`)
- `src/components/layout/header-overlay-context.tsx` exports `HeaderOverlayProvider` (holds one `open: 'notifications' | 'profile' | null`) and `useHeaderOverlay(key)` returning `{ isOpen, setOpen, ctx }` with a local-state fallback when no provider is mounted.
- `TenantRailShell.tsx` mounts `HeaderOverlayProvider` around its header cluster and renders both `NotificationsBell` (`useHeaderOverlay('notifications')`) and the profile `DropdownMenu` (`useHeaderOverlay('profile')`) inside it. Opening the bell auto-closes the profile menu, and vice versa.
- `src/components/layout/topbar.tsx` is legacy dead code: it is not imported by any page and its `UserMenu` uses a plain (uncoordinated) `DropdownMenu`. If it is ever re-activated, the profile trigger must call `useHeaderOverlay('profile')` and the header must render inside `HeaderOverlayProvider`, otherwise the bell and profile menu can overlap.

### Notifications panel (`notifications-bell.tsx`)
- Panel anchors directly beneath the bell: `absolute top-full mt-2`, `right-0`/`left-0` by `position` prop, `w-96 max-w-[calc(100vw-2rem)]`, `z-50`.
- Height is viewport-aware: `max-h-[calc(100dvh-14rem)] overflow-y-auto` so the list scrolls independently of the header.
- Panel has a visible heading (`<h2>Notifications</h2>`), refresh button, and `X` close button; footer has "Mark all read" + "View all →".
- **Theme-awareness:** use shadcn semantic tokens only (`bg-popover`, `text-popover-foreground`, `border-border`, `bg-surface-elevated`, `text-foreground`, `text-muted-foreground`, `bg-accent`/`text-accent`, `hover:bg-accent/10`). Never hardcode `bg-zinc-900`/`text-white`/`border-zinc-800` — the bell and panel must render correctly in both light and dark mode.
- Bell trigger button and all icon colors must inherit from the button's `text-foreground` / `text-muted-foreground`, not hardcoded zinc.

### z-index layering
- Notifications panel: `z-50` (above the header, below heavier overlays).
- Onboarding overlay (`OnboardingOverlay.tsx`): `z-[80]` — covers the dashboard, intentionally above notifications so the dossier reads as a modal panel, not a route.
- Mobile bottom nav: `z-50`.

### Dismissal
- Outside-click and Escape-key dismissal are handled by the shadcn `DropdownMenu` primitives for the profile menu. The notifications panel exposes an explicit `X` close button and closes on navigation ("View all") and on "Mark all read" flow completion. If a custom popover is added without a `DropdownMenu` root, it must implement its own `document.addEventListener('mousedown')` outside-click handler and `keydown` Escape listener.

### Key files
- `src/components/layout/header-overlay-context.tsx` — overlay state + hook
- `src/components/layout/TenantRailShell.tsx` — mounts provider, renders bell + coordinated profile menu
- `src/components/layout/DashboardShell.tsx` — thin wrapper: `DashboardShell(props) => <TenantRailShell hideGlobalSearch {...props} />`
- `src/components/notifications/notifications-bell.tsx` — live bell + panel
- `src/components/notifications/notifications-dropdown.tsx` — `NotificationsPanel` used by the bell; the separate `NotificationsDropdown` is dead/unused

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
