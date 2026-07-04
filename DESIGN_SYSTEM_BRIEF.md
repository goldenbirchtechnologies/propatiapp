# PROPATI Design System — Concise Design Brief

## 1. Color Palette
- **Primary**: `#000f22` (deep black-navy) / **Primary Container**: `#0a2540` (deep navy)
- **On Primary / Text on dark**: `#ffffff`
- **Secondary / Gold accent**: `#835500` (dark gold) → **Secondary Container**: `#feae2c` / `#F5A623` (amber-gold) used for CTAs & active states
- **Surface / Background**: `#f9f9ff` (cool off-white)
- **Surface Container**: `#e8eeff`, **Surface Container High**: `#e3e8f9`, **Surface Container Low**: `#f1f3ff`, **Surface Container Lowest**: `#ffffff`
- **Surface Variant**: `#dde2f3`
- **On Surface**: `#161c27` (dark charcoal); **On Surface Variant**: `#43474d`
- **Outline**: `#74777e`; **Outline Variant**: `#c4c6ce`
- **Tertiary / Trust Green**: `#001209` (deep) / **Tertiary Container**: `#002a1b`; **On Tertiary Container**: `#009e6f`
- **Success/Emerald**: `#00B37E`
- **Error**: `#ba1a1a` / `#93000a`; **Error Container**: `#ffdad6`
- **Fixed shades**: `primary-fixed: #d2e4ff`, `secondary-fixed-dim: #ffb955`, `tertiary-fixed: #71fbc0`

## 2. Typography Scale
- **Headlines**: *Bricolage Grotesque* (600, 700, 800)
  - Xxl: 48px / 56px / -0.02em / 800
  - Xl-mobile: 36–48px
  - Lg: 32px / 40px / -0.01em / 700
  - Md: 24px / 32px / 700
  - Sm: 20px / 28px / 600
- **Body**: *Inter* (400, 500, 600)
  - Lg: 18px / 28px / 400
  - Md: 16px / 24px / 400
  - Sm: 14px / 20px / 400
- **Labels / Mono**: *JetBrains Mono* (500)
  - Md: 14px / 20px / 0.02em
  - Sm: 12px / 16px / 0.05em
- **Icons**: *Material Symbols Outlined* (FILL modulated 0–1, 400–700)

## 3. Spacing Rhythm
- Base grid: **4px** (`base` / `xs`)
- `sm`: 8px, `md`: 16px, `lg`: 24px, `xl`: 32px
- `gutter`: 24px
- `margin-mobile`: 16px, `margin-desktop`: 64px
- Cards/padding consistently use `p-lg` (24px), `p-md` (16px), `p-xl` (32px)
- Grid gaps: `gap-lg` (24px), `gap-md` (16px), `gap-gutter` (24px)

## 4. Border Radius
- `DEFAULT`: 4px (0.25rem)
- `lg`: 12px (cards, inputs)
- `xl`: 16px (large cards)
- `full`: 9999px (pills, badges)

## 5. Card Styles
- **Base**: `bg-surface-container-lowest` or `bg-white`, `border border-outline-variant`, `rounded-lg` or `rounded-xl`, `shadow-sm`
- **Hover**: `hover:shadow-md hover:-translate-y-1 transition-all duration-300`
- **Image deck**: `h-40`–`h-56` container, `overflow-hidden`, inner image `group-hover:scale-110 transition-transform duration-500`
- **Bento / Financial**: solid navies or elevated whites with large type, sometimes gradient backgrounds
- **Glass variant**: `rgba(255,255,255,0.7)` / `0.8` + `backdrop-filter: blur(8–12px)` + border `#E2E8F0`
- Decorative elements: large faded Material Symbols in bottom-right corners (`opacity-10`)

## 6. Sidebar / Dashboard Shell
- **Sidebar**: fixed left, `w-64` or `w-[280px]`, `bg-primary-container`, full height, `shadow-xl`, z-40; hidden on mobile (`hidden lg:flex`)
- **Sidebar nav item**: icon + `font-label-md`, py-3 px-4, `hover:bg-white/10` + rounded-r-lg
- **Active item**: `.active-gold` → `border-left: 4px solid #F5A623`, `color: #F5A623`, `background: rgba(245,166,35,0.1)`
- **Top app bar**: sticky, h-16, `bg-surface`, `border-b outline-variant`, z-40
- **Topbar search**: pill input with icon → `bg-surface-container-low`, `border outline-variant`, `rounded-full`
- **Topbar right cluster**: icon buttons (notifications, help, settings) + avatar + logout
- **Mobile fallback**: fixed bottom nav bar (64px, 4 icons + labels), fixed FAB (`secondary-container`, bottom-20 right-4)

## 7. Button Styles
- **Primary CTA**: `bg-primary-container text-white py-3 rounded-lg hover:opacity-90`
- **Secondary / Gold**: `bg-secondary-container text-primary-container font-bold py-3 rounded-xl hover:scale-95 transition-transform`
- **Outline**: `border border-primary-container text-primary-container rounded-lg hover:bg-primary-container/5`
- **Ghost icon**: `p-sm rounded-full hover:bg-surface-container`
- **Icon buttons in tables**: `text-primary hover:scale-110 transition-transform`
- **Size pattern**: px-md / py-2 to px-lg / py-3; `font-label-md` (14px) for labels

## 8. Table Styles
- **Header row**: `bg-surface-container-high/50`, text-[10px], uppercase, tracking-wider, text-on-surface-variant
- **Cell padding**: px-lg py-4
- **Row separator**: `divide-y divide-outline-variant/30`
- **Row hover**: `hover:bg-surface-container/30 transition-colors`
- **Alternate**: striped not used; minimal clean rows
- **Actions**: right-aligned icon buttons or text links with icons

## 9. Form Inputs
- **Floating / top label**: text-[10px], uppercase, font-bold, text-on-surface-variant, `mb-xs ml-1`
- **Input**: `bg-surface-container-low border outline-variant rounded-lg px-md py-sm`, `focus:ring-2 focus:ring-primary-container`
- **Input with prefix/suffix**: absolute left text for NGN prefix (`₦`)
- **Select**: same base, `appearance-none`, custom icon (`expand_more`) absolute right-3
- **Checkbox / Radio**: consistent with Tailwind forms plugin; rounded-sm

## 10. Verified / Badge / Pill Design
- **Green verified pill**: `bg-success-emerald` or `bg-[#009e6f]`, white text, `px-3 py-1 rounded-full`, uppercase, tracking-widest, text-[10px], font-bold
- **Gold inspected pill**: `bg-secondary-container text-primary-container`, same shape
- **Pending pill**: `bg-on-secondary-container/10 text-on-secondary-container`
- **Positioning**: absolute top-2/3 left-2 or right-2 on media cards; `backdrop-blur-md` + border for glass pills
- **Icon inline**: Material `verified` with `font-variation-settings: 'FILL' 1` for filled check

## 11. Header / Topbar Layout
- **Left**: brand mark (`font-headline-md` + `font-black`), breadcrumbs or page title
- **Center-left**: search input in `bg-surface-container-low`, `rounded-full`, left icon
- **Right**: notification bell (with red dot `w-2 h-2 bg-error rounded-full`), help circle, settings, avatar, logout
- **Divider**: `h-8 w-[1px] bg-outline-variant mx-xs` between groups

## 12. Bento / Dashboard Grid Pattern
- 12-column grid: `lg:col-span-8`, `lg:col-span-4`, `md:col-span-2`, etc.
- KPI cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, each card `p-lg rounded-xl border shadow-sm`
- KPI value: `font-headline-md`
- KPI label: text-body-sm text-on-surface-variant
- Progress bars: `h-1 bg-surface-container rounded-full overflow-hidden`, fill `bg-primary`

## 13. Motion / Animations
- **Card hover**: `hover:shadow-lg hover:-translate-y-1 transition-all duration-300`
- **Image zoom**: `group-hover:scale-110 transition-transform duration-500`
- **Button scale**: `active:scale-95`, `hover:scale-[1.02]`
- **Shimmer loaders**: linear-gradient animation on "Certified" badge
  - `background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 2s infinite`
- **Micro**: table row `mousedown → scale-[0.99]`, icon button `hover:scale-110`
- **Transitions**: general `transition-all duration-300`, `ease-out`

## 14. Nigerian-Localized UI Conventions
- **Currency**: NGN `₦` hardcoded everywhere (property prices, GTV, balances, inputs); large Nigerian denominations (₦M/₦B)
- **Locations**: Lekki Phase 1, Victoria Island (VI), Ikoyi, Ikeja GRA, Eko Atlantic, VGC
- **Names**: Chidi Okafor, Chief Adebayo, Funke Akindele
- **Verification trust stack**:
  - NIMC biometric check (NIN)
  - CAC registry lookup
  - C of O & Governor's Consent
  - Lagos Land Registry
  - "Omonile Issues" (local land-owner/chieftaincy risk)
- **Escrow & security language**: "Encrypted Ledger", "Secure", `shield_lock` icon, "bank-grade security"
- **Tier system**: "Tier 3 Verified Account", verification stage pipeline (KYC → Docs → Inspection → Certification)
- **Transaction conventions**: Ref/ID prefixes like `EV-TX-`, `#TRX-`, payout limits (`Min: ₦1,000 | Max: ₦1,000,000/day`)
- **Help/support phrasing**: "Chat with verified agent", "Tenant Rights & FAQs", "Report a maintenance issue"
- **Status copy**: "Action required immediately", "Expected within 48 hours"

## 15. Recognized Design System Influences
- **Tailwind CSS** with `forms` + `container-queries` plugins
- **Material Design 3 / Material You**: token naming strongly mirrors M3 (`primary-container`, `surface-container-lowest`, `on-tertiary-container`, etc.)
- **shadcn/ui aesthetic**: clean borders, consistent radius, muted surfaces, compact pills
- **Bento grid**: Apple-style 12-col asymmetric grids with large numeric KPIs
- **Glassmorphism**: subtle sticky/filter bar + search cards
- **Icons**: Google Material Symbols Outlined (variable font)

---
## Recommended Next.js Implementation Notes
- Define the Tailwind `theme.extend` block once in `tailwind.config.ts` using the exact color/spacing tokens above.
- Use `Bricolage Grotesque` + `Inter` + `JetBrains Mono` via `next/font`.
- Use `lucide-react` or Material Symbols for icons.
- Card, button, badge, table, and input components should consume the shared token classes rather than inline styles.
- Maintain NGN locale formatting (` Intl.NumberFormat('en-NG', ...)`).
