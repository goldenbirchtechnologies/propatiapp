# PROPATI — Full UI/UX Lift Prompt
_Combine `ui-ux-pro-max` + `emil-design-eng` into one actionable execution brief._

---

## 1. Role & Mission

You are the **UI/UX Lift Lead** for **PROPATI**, a Next.js 14 + Tailwind + shadcn/ui real-estate marketplace for Nigeria.

Your mission: **close the gap between the current codebase and a production-grade UI system** — meaning responsive behavior, motion polish, token discipline, accessibility, SEO, and cross-page consistency.

You operate under two skill systems simultaneously:
- **UI/UX Pro Max** — design intelligence, responsive rules, UX best practices
- **Emil Design Eng** — fluid animation, physical motion, polished micro-interactions, dark/light parity

---

## 2. Project Baseline

| Layer | Current State |
|-------|---------------|
| **Framework** | Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Clerk, Paystack |
| **Design tokens** | Semantic CSS vars in `src/app/globals.css`; shadcn preset `b7PaZO816h` applied |
| **Layout** | `DashboardShell` sidebar + topbar for dashboards; `PublicNav` on selected public pages |
| **Known production bugs** | Homepage narrow left column; listings sidebar visible on mobile; wallet tab labels hidden on small screens; missing `sitemap.xml`, `robots.txt`, `og-image.png` |
| **Motion** | Basic `fade-in-up` keyframes exist; limited press/hover feedback |
| **Accessibility** | Some aria-current, but icon-only buttons lack labels; touch targets inconsistent |
| **Theme** | `theme-landing`, `theme-tenant`, `theme-landlord`, `theme-agent`, `theme-estate-manager`, `theme-admin`; dark mode CSS present but contrast not independently validated |

---

## 3. Skill Overlay: What We Enforce

### 3.1 UI/UX Pro Max Rules (Top 3 Priority Buckets)

**1. Accessibility (CRITICAL)**
- Contrast ≥ 4.5:1 for body text; ≥ 3:1 for secondary icons
- All icon-only buttons have `aria-label`
- Visible focus rings; keyboard nav order preserves visual order
- Heading hierarchy is sequential; no skipped levels
- Skip-link to main content present on every page

**2. Touch & Interaction (CRITICAL)**
- All tappable elements ≥ 44×44px
- 8px+ spacing between adjacent touch targets
- Primary CTA only one per screen; secondary actions visually subordinate
- Press feedback within 80–150ms (ripple, opacity, or elevation change)
- `cursor-pointer` on every clickable element

**3. Layout & Responsive (HIGH)**
- Mobile-first breakpoints: 375 / 768 / 1024 / 1440
- No horizontal scroll on any viewport
- Sidebar hidden on mobile; becomes drawer/bottom-sheet below `lg`
- Content width consistent: `container` utility on outer wrappers, `max-w-7xl` inner sections
- Bottom nav ≤ 5 items, always labeled

### 3.2 Emil Design Eng Polish

**Motion**
- Duration: **150–300ms** micro-interactions; **≤400ms** transitions
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for enter; **60–70% exit duration**
- Transform/opacity only; never animate width/height/top/left
- Stagger list items: **30–50ms** per item
- Shared-element transitions where natural (cards → detail)

**Surfaces**
- Consistent shadow scale: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` only
- Backdrop blur only on fixed overlays, never decorative
- Border radius tokens via `--radius-*`, not ad-hoc values

**Dark/Light Parity**
- Every new surface defines both themes; never assume light values work in dark
- Dividers/borders active in both modes
- Active/focus/disabled states equally visible in both themes

**Input & Feedback**
- Skeleton loaders for >300ms async states
- Error near field, not just top-of-page summary
- Success feedback brief (checkmark + toast, 3–5s auto-dismiss)

---

## 4. Execution Plan

### Task A: Audit & Baseline (1 hour)
Run the baseline audit script against these files:
- `src/app/page.tsx`
- `src/app/(public)/listings/page.tsx`
- `src/app/dashboard/wallet/page.tsx`
- `src/app/(public)/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/DashboardShell.tsx`
- `src/app/layout.tsx`

Output: **Lift Ticket** with exact line/class violations.

### Task B: Layout & Responsive Fixes (2 hours)
1. **Homepage**: outer wrapper uses `container`, inner sections use `max-w-7xl`
2. **Listings**: sidebar `hidden lg:block`, mobile sheet toggled by `Filters` button
3. **Wallet**: tab labels visible on all breakpoints; horizontal scroll if overflow
4. **DashboardShell**: remove redundant shells; ensure single wrapper per route
5. **Public pages**: add `PublicNav` only where missing; remove duplicates

### Task C: SEO & Metadata (1 hour)
1. Create `src/app/(public)/lib/sitemap.xml.ts` with static + dynamic entries
2. Create `src/app/(public)/lib/robots.ts` with public allow/disallow rules
3. Update `src/app/layout.tsx`:
   - `metadataBase` via `process.env.VERCEL_URL || NEXT_PUBLIC_APP_URL`
   - `alternates.canonical` on homepage and key public pages
   - `openGraph.images` using `/og-image.png`
   - Link tags for `sitemap.xml`
4. Generate `public/og-image.png` (1200×630)

### Task D: Motion & Polish (2 hours)
1. Add transition classes to cards: `transition-all duration-200 ease-out`
2. Button press feedback: `active:scale-[0.97] transition-transform duration-150`
3. Sheet/drawer: `transition-transform duration-300 ease-out`
4. Add `@media (prefers-reduced-motion: reduce)` block to `globals.css`
5. Stagger list renders with `style={{ animationDelay }}`

### Task E: Accessibility Sprint (1.5 hours)
1. Pass 1: every `<button>` with icon-only gets `aria-label`
2. Pass 2: every clickable `<div>`/`<a>` has `cursor-pointer`
3. Pass 3: heading audit, add skip-link component
4. Pass 4: touch target audit on mobile breakpoints

### Task F: Color & Theme Parity (1.5 hours)
1. Replace all `bg-white`, `text-black`, `border-gray-*` with semantic tokens
2. Validate dark mode contrast in both themes
3. Ensure sidebar, cards, modals have paired light/dark values

### Task G: Review, Commit, Push (0.5 hour)
1. `git diff --stat` review
2. Squash into one commit: `feat: full UI/UX lift — responsive, motion, SEO, a11y`
3. Push to `origin/main`

---

## 5. Acceptance Checklist

| # | Criteria | Status |
|---|----------|--------|
| 1 | Homepage spans correct responsive width | ☐ |
| 2 | Listings sidebar desktop-only; mobile bottom-sheet works | ☐ |
| 3 | Wallet tab labels visible on all breakpoints | ☐ |
| 4 | All touch targets ≥44×44px with 8px+ spacing | ☐ |
| 5 | All icon-only buttons have `aria-label` | ☐ |
| 6 | Dark mode contrast passes 4.5:1 body / 3:1 secondary | ☐ |
| 7 | `prefers-reduced-motion` respected | ☐ |
| 8 | `sitemap.xml`, `robots.txt`, `og-image.png` exist | ☐ |
| 9 | `alternates.canonical` on homepage + key public pages | ☐ |
| 10 | No double `DashboardShell` or forbidden metadata exports | ☐ |
| 11 | Semantic color tokens everywhere; no raw `bg-white`/`text-black` | ☐ |
| 12 | Press feedback on primary buttons/cards within 150ms | ☐ |

---

## 6. Execution Rules

1. **No broad regex sweeps.** Use surgical `patch` edits with unique context strings.
2. **Verify after each phase.** Run `git diff` + targeted `rg` checks before moving on.
3. **One commit at the end.** Batch all verified changes; no incremental pushes.
4. **Never run `next build` or `prisma generate` on VM.**
5. **If a fix breaks another page** (double shell, missing import), fix the root cause immediately.
6. **Ask before deleting** any file that isn’t clearly dead code.

---

## 7. Output Format

After each phase, deliver:
- What changed (file:line summary)
- What was verified (exact tool output)
- Remaining risks
- Whether to proceed to next phase or stop for review
