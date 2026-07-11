# PROPATI — Master Design System
**Style:** Spatial UI  
**Stack:** Next.js 14 · React Server Components · Tailwind · shadcn/ui  
**Audience:** Nigerian PropTech marketplace (landlord, tenant, agent, realtor, estate manager, admin)

---

## 1. Visual Language

- **Depth over decoration:** use elevation/z-axis to separate surfaces.
- **Surfaces:** cream/ecru base, white raised cards, translucent overlays only on hero bands.
- **Accent:** deep forest green `#1B4332` (trust, land, growth) + warm amber `#B45309` (call-to-action, alerts).
- **Motion:** purposeful only. Entrance: fade + translateY 12–24px, 280–420ms, ease-out. No bounce, no spring.
- **Typography:** Inter for body, Plus Jakarta Sans for display headings. Scale: 14/16/18/24/32/40/56.

---

## 2. Color Tokens (semantic)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg-base` | `#F5F3EF` | `#0F1115` | Page background |
| `bg-raised` | `#FFFFFF` | `#161920` | Card / panel |
| `bg-overlay` | `rgba(255,255,255,0.78)` | `rgba(15,17,21,0.78)` | Sticky header / modal scrim |
| `border-default` | `#E7E5E0` | `#262A33` | Sidebar, cards, inputs |
| `text-primary` | `#111827` | `#F3F4F6` | Headings / body |
| `text-secondary` | `#4B5563` | `#9CA3AF` | Supporting text |
| `primary` | `#1B4332` | `#22C55E` | Primary CTA, active state |
| `on-primary` | `#FFFFFF` | `#022C22` | Text on primary |
| `secondary` | `#B45309` | `#F59E0B` | Secondary CTA, warnings |
| `on-secondary` | `#FFFFFF` | `#7C2D12` | Text on secondary |
| `success` | `#15803D` | `#16A34A` | Verified, paid |
| `error` | `#B91C1C` | `#EF4444` | Declined, failed |
| `frozen` | `#6B7280` | `#D1D5DB` | Paused / suspended |

---

## 3. Elevation Scale

| Level | Shadow | Usage |
|---|---|---|
| 1 | `0 1px 2px rgba(0,0,0,0.06)` | Flat cards |
| 2 | `0 8px 24px rgba(0,0,0,0.10)` | Dropdowns, modals |
| 3 | `0 24px 56px rgba(0,0,0,0.14)` | Sticky headers, overlays |
| 4 | `0 32px 80px rgba(0,0,0,0.18)` | Full-screen sheets |

---

## 4. Spacing Scale

Use 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

---

## 5. Motion Tokens

- `ease-out`: `cubic-bezier(0.22, 1, 0.36, 1)`
- `duration-fast`: `150ms`
- `duration-default`: `280ms`
- `duration-slow`: `420ms`
- `translateY-enter`: `12px` (mobile), `24px` (desktop)
- Respect `prefers-reduced-motion: reduce` → disable transforms.

---

## 6. Component Rules

- No raw hex in `.tsx`. Use semantic tokens only.
- No emoji icons. Use Lucide icons.
- Cards: `bg-raised border border-default rounded-lg shadow-1`
- Primary button: `bg-primary text-on-primary`
- Secondary button: `bg-white text-primary border border-primary` (light), `bg-transparent text-secondary border border-secondary` (dark)
- Focus ring: `ring-2 ring-primary/40 ring-offset-2`

---

## 7. Page Patterns

- Public pages: full-bleed hero with darkened photo overlay, floating stat cards, section spacing `py-16 md:py-24`.
- Dashboard: sidebar `bg-raised border-r border-default`, content `bg-base`.
- Admin: denser data tables, higher information hierarchy, monospace figures for money.
- Legal pages: single-column readable measure, max-w-3xl, generous line-height 1.75.

---

## 8. Anti-Patterns

- No purple/indigo defaults.
- No gradient-heavy backgrounds on functional screens.
- No `rounded-2xl` everything — use `rounded-lg` for cards, `rounded-full` for pills/badges.
- No decorative animation without cause.
- No color-only state indication (always pair icon/text).
