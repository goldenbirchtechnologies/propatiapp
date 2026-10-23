# DESIGN.md — PropatiBox Design System

Single source of truth for brand, bichrome light/dark tokens, type, icons, layout chrome, and role-dashboard patterns. Matches the shipped codebase, not a concept spec.

## 1. Brand

- **Name:** PropatiBox — Nigeria's verified property marketplace.
- **Logo:** `src/components/brand/PropatiBoxLogo.tsx` (`PropatiBoxLogo` + `PropatiBoxIcon`, `variant: horizontal | iconOnly`, `size: sm | md | lg`, optional `TM`, link-wrapped by default). Static vector: `public/brand/propatibox-logo.svg`.
- **Mark colors:** house blue `#1565C0` (shade `#0E4DA0`), key lime `#8CC63F` (stroke `#7AB334`), wordmark `#8CC63F`.
- **Primary action color:** emerald `#10B981`, hover `#059669`. Never Zillow blue `#006AFF`; legacy `#2563eb` theme-color is replaced by `#8CC63F` in manifests.
- **Consumers:** `public-nav` header, `DashboardShell` sidebar (iconOnly when collapsed), `(public)/layout` footer, `signup` / `sign-up` / `sign-in`, `coming-soon`, metadata/OG/manifests.

## 2. Bichrome light/dark

- **Mechanism:** `src/components/providers/ThemeProvider.tsx` — `html.dark` class, `localStorage propati-theme`, system fallback, default `light`. Toggle lives in `PublicNav` and `DashboardShell` topbar (Sun/Moon + Light/Dark label).
- **Tailwind:** `darkMode: ['class']`; shadcn tokens via CSS vars (`tailwind.config.ts` maps `background/foreground/primary/card` to `var(--*)`).
- **Grounds:** page `bg-[#F8FAFC] dark:bg-black`; header/sidebar `bg-white dark:bg-[#09090b]` with `border-zinc-200 dark:border-white/[0.07]`.
- **Cards:** `bg-white dark:bg-zinc-900` (alt elevated `dark:bg-zinc-950/50`), `border-zinc-200 dark:border-zinc-800` or `dark:border-white/[0.08]`, `rounded-xl`, `shadow-sm`.
- **Text:** headings `text-zinc-900 dark:text-white`; body `text-zinc-600 dark:text-zinc-400`; faint `text-zinc-500`; placeholders `placeholder:text-zinc-500`. Never bare `text-white` or `bg-zinc-950/50` without its `dark:` pair.
- **Nav states:** inactive `text-zinc-600 dark:text-zinc-400`; active `bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`. Pills (`View All`, filters): `rounded-full`, active `bg-blue-50 border-blue-700 text-blue-700` where cloning Zillow, else emerald active.
- **Inputs/search:** `bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white`.
- **Canonical dark vars (`globals.css`):** `--theme-dark-bg #000000`, `--theme-dark-surface #09090b`, `--theme-dark-surface-elevated #121215`, `--theme-dark-border #27272a`, `--theme-dark-accent #10b981`. Status: `--green #10b981`, `--amber #f59e0b`, `--red #ef4444`, `--blue #3b82f6`.

## 3. Typography, icons, motion

- **Type:** Inter via `next/font/local` (`--font-inter`), `--font-heading`/`--font-body` fall back to system. Page title `1.25rem` bold; hero `clamp(2.2rem, 5vw, 3.8rem)` black.
- **Icons:** Lucide only. `src/components/icons/app-icon.tsx` maps legacy names to Lucide; unknown names fall back to `HelpCircle`, never `?` placeholders.
- **Motion:** `tailwindcss-animate` + CSS transitions (150–300ms). No GSAP. Respect `prefers-reduced-motion`.

## 4. Layout chrome

- **Routes:** `(public)/` (home, listings, find-agent) with `PublicNav` + footer; `(dashboard)/layout.tsx` stays a thin auth-only server component; `DashboardShell.tsx` owns sidebar + topbar + `GlobalSearch` + `content-area`.
- **Sidebar:** `bg-white dark:bg-[#09090b]`, collapsible with iconOnly tooltips, padded toggle, section titles `text-zinc-500 dark:text-zinc-400`.
- **Topbar (56px):** `GlobalSearch` (`bg-white dark:bg-zinc-900`), theme toggle, help/messages/invites icons, `NotificationsBell`, avatar dropdown (Profile, Settings, Sign Out via `/api/auth/sign-out`).
- **Zillow patterns:** listings 3-col (pills top bar, left scroll `PropertyCard` list on `F8FAFC`, right sticky Mapbox with emerald pins + hover sync); messages `Messages 34px font-black` header + Filters/Inbox popovers + pills outside a full-width card wrapping list/thread/details; find-agent hero (`A great agent makes all the difference`) + agent grid + dark FAQ.

## 5. Components and badges

- **Primitives:** shadcn/ui (`button`, `card`, `badge`, `dialog`, `select`, `input`, `avatar`, `scroll-area`) + `StatCard` (`bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800`) + `PageHeader`.
- **Badge taxonomy (5 states):** DRAFT/UNLISTED gray, NOT STARTED outline, IN REVIEW amber, VERIFIED green, REJECTED red — `rounded-full`, `flex-shrink-0`, counts sanitized (`All (6)`).
- **Verification layers 1–5:** Layer 5 is a `0 of 4` progress banner, not a task card; unsubmitted shows `Not Started`, never misleading `PENDING`.

## 6. Accessibility and workflow

- **WCAG 2.1 AA:** 4.5:1 text minimum; visible focus rings; skip-link `#main-content`; icon buttons carry `aria-label`.
- **Verify a change:** toggle light/dark in both navs and confirm no invisible text; `npx tsc --noEmit --skipLibCheck`, then `npx prisma generate && next build`. Never commit `.env`.
