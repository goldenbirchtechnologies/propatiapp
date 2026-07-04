# DESIGN.md – PROPATI Platform Design System

---

## 1. Project Overview

**PROPATI** is a modern real‑estate marketplace that serves multiple user roles (Admin, Agent, Landlord, Tenant, Support, and executive leadership).  The platform is built with **Next.js**, **Tailwind CSS**, **Prisma** (PostgreSQL) and a **role‑based access control** system that drives both backend APIs and front‑end UI variations.

---

## 2. Brand Identity

- **Primary Gradient:** `linear-gradient(135deg, #0ea5e9, #a78bfa)` (teal → purple) used for hero sections, buttons, and accent borders.
- **Secondary Colors:**
  - `#121212` – Dark surface (background)
  - `rgba(255,255,255,0.04)` – Card surface (glass‑morphism)
  - `#22c55e` – Success
  - `#ef4444` – Error
- **Typography:**
  - **Headings:** *Inter* – Weight 800 – 24‑32 px
  - **Body:** *Roboto* – Weight 400 – 14‑16 px
- **Iconography:** Feather icons (via `react-icons`) with custom SVG fills matching the primary gradient.

---

## 3. Layout & Responsiveness

| Breakpoint | Description |
|------------|-------------|
| `≥1440px` | Full‑width 12‑column grid, side navigation visible, hero banners at max width.
| `1024‑1439px` | 10‑column grid, side navigation collapses to icons‑only, cards become 3‑column.
| `768‑1023px` | Tablet layout – side navigation hidden behind a hamburger, 2‑column cards, charts resize fluidly.
| `<768px` | Mobile – vertical stack, drawer navigation, touch‑optimized controls.

All components use **CSS variables** for spacing (`--space-1` … `--space-8`) and **layered Z‑indexes** (`--z‑modal`, `--z‑tooltip`).

---

## 4. Navigation System

- **Header (`publicNavLinks`):**  `Search`, `Find Property`, `Compare` – minimal primary actions.
- **Footer:** Full company link list in the required order (Company → Mortgage Calculator → … → Contact).
- **Side Nav (Authenticated):** Role‑specific sections, dynamically generated from a `roles` constant defined in `src/app/(public)/how-it-works/page.tsx`.
- **Mobile Drawer:** Slides from the left, contains the same items as the side nav.

---

## 5. UI Components Library (`design-system/`)

| Component | Description | Key Props |
|-----------|-------------|----------|
| `Button` | Primary / secondary styles with gradient hover, disabled state. | `variant`, `size`, `loading` |
| `Card` | Glass‑morphism container, shadow, optional header/footer slots. | `title`, `children` |
| `KPIChart` | Combines a line chart (via `recharts`) and a bar overlay, accepts `data`, `key`.
| `DataTable` | Striped rows, sortable columns, sticky header, pagination. | `columns`, `rows`, `onRowClick` |
| `Toast` | Auto‑dismiss, slide‑in from top‑right, supports `type` (success, error, info). |
| `Modal` | Focus‑trapped, reusable, animates scale‑in. |
| `Avatar` | Shows user picture or initials, supports role‑badge overlay. |

All components are **theme‑aware** – they read the CSS custom properties defined in `design-system/tokens.css`.

---

## 6. Dashboard Designs per Role

Each role receives a bespoke dashboard page (`/dashboard/[role]`).  The design follows the same layout skeleton but swaps out:

- **KPI cards** – metrics relevant to the role (see `src/app/(public)/how-it-works/page.tsx` for the `roles` array).
- **Data table columns** – reflect the fields returned by the backend for that role.
- **Action Center** – quick‑form buttons (e.g., *Add Property* for Landlord, *Create Ticket* for Support).
- **Recent Activity Timeline** – pulls the last five events via the role‑specific API endpoint.

The design system ensures visual consistency while the **content** is driven entirely by the backend role context (`user?.publicMetadata?.role`).

---

## 7. Backend‑Frontend Contract

### Role Determination
- The frontend reads `user?.publicMetadata?.role` (Supabase auth) and stores it in a React context (`RoleContext`).
- All API routes (`/api/**`) accept a `role` query param or derive it from the session token and return JSON shaped for that role.

### Example Endpoints
| Endpoint | Returns | Used By |
|----------|---------|---------|
| `/api/dashboard/landlord` | `{ portfolio, tickets, leaseExpiries }` | Landlord dashboard cards & tables |
| `/api/dashboard/agent` | `{ leads, commissions, schedule }` | Agent KPI cards |
| `/api/dashboard/admin` | `{ users, systemHealth, pendingApprovals }` | Admin overview |

All responses follow the **PascalCase** naming convention defined in the Prisma schema (`prisma/schema.prisma`).

---

## 8. Accessibility (WCAG AA)

- Minimum contrast ratio 4.5:1 for text, 3:1 for UI components.
- Focus outlines (`outline: 2px solid var(--primary)`), visible on keyboard navigation.
- ARIA labels for all interactive elements (`aria‑label`, `role="button"`, etc.).
- Skip‑link at the top of each page.

---

## 9. Motion & Micro‑Interactions

- **GSAP** used for panel expansion, toast entrance, and button press ripple.
- All easing uses `easeOutCubic` with a 300 ms duration.
- Animations respect the `prefers-reduced-motion` media query – they are disabled for users who opt‑out.

---

## 10. Development Workflow

1. **Design → Code**: Run `npm run dev` → open `http://localhost:3000`.  The design system lives in `design-system/` and is imported via absolute imports (`@/design-system/*`).
2. **Component Storybook** (optional): `npm run storybook` to view isolated component states.
3. **Testing**: Unit tests with **Vitest** (`tests/`), end‑to‑end with **Playwright** focused on role‑based routing.
4. **CI/CD**: Vercel deploys on push to `main`; preview URLs are generated for every PR.

---

## 11. Future Enhancements

- **Dark‑mode toggle** (currently hard‑coded to dark for premium look).
- **Dynamic theme generation** per tenant using CSS custom properties.
- **Role‑driven feature flags** managed via Supabase `features` table.
- **Exportable dashboards** (PDF/CSV) for executive reporting.

---

*This DESIGN.md serves as the single source of truth for UI/UX, branding, component guidelines, and the role‑aware contract between the backend and frontend.*
