# 06 – Design Tokens

## 1. Color System

### 1.1 Role Colors

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| Landlord | `--landlord` | `#22c55e` (green-500) | Sidebar active, buttons, accents |
| Tenant | `--tenant` | `#14b8a6` (teal-500) | Sidebar active, buttons, accents |
| Agent | `--agent` | `#eab308` (yellow-500) | Sidebar active, buttons, accents |
| Estate Manager | `--em` | `#3b82f6` (blue-500) | Sidebar active, buttons, accents |
| Admin | `--admin` | `#8b5cf6` (violet-500) | Sidebar active, buttons, accents |

### 1.2 Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#0f172a` | Primary text |
| `--muted` | `#f1f5f9` | Secondary backgrounds |
| `--muted-foreground` | `#64748b` | Secondary text |
| `--primary` | `#0f172a` | Primary buttons, headings |
| `--primary-foreground` | `#ffffff` | Text on primary |
| `--secondary` | `#f1f5f9` | Secondary buttons |
| `--secondary-foreground` | `#0f172a` | Text on secondary |
| `--accent` | `#f1f5f9` | Hover, focus rings |
| `--destructive` | `#ef4444` | Errors, delete actions |
| `--success` | `#22c55e` | Verified, success states |
| `--warning` | `#f59e0b` | Pending, caution states |
| `--border` | `#e2e8f0` | Card, input borders |
| `--ring` | `#0f172a` | Focus ring |

### 1.3 Verification Tier Colors

| Tier | Token | Usage |
|------|-------|-------|
| `basic` | slate | Default badge |
| `verified` | blue | L1-L2 complete |
| `inspected` | amber | L3-L4 complete |
| `certified` | emerald | L5 complete |

## 2. Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Inter', sans-serif` | Body, UI |
| `--font-display` | `'Inter', sans-serif` | Headings |
| `--text-xs` | `0.75rem` | Captions, badges |
| `--text-sm` | `0.875rem` | Secondary text |
| `--text-base` | `1rem` | Body |
| `--text-lg` | `1.125rem` | Lead paragraphs |
| `--text-xl` | `1.25rem` | Card titles |
| `--text-2xl` | `1.5rem` | Section headings |
| `--text-3xl` | `1.875rem` | Page titles |

## 3. Spacing

Base unit: `0.25rem` (4px)

| Scale | Token | Value |
|-------|-------|-------|
| 1 | `--space-1` | `0.25rem` |
| 2 | `--space-2` | `0.5rem` |
| 3 | `--space-3` | `0.75rem` |
| 4 | `--space-4` | `1rem` |
| 6 | `--space-6` | `1.5rem` |
| 8 | `--space-8` | `2rem` |
| 12 | `--space-12` | `3rem` |
| 16 | `--space-16` | `4rem` |

## 4. Breakpoints

| Name | Token | Value |
|------|-------|-------|
| Mobile | `--bp-sm` | `640px` |
| Tablet | `--bp-md` | `768px` |
| Laptop | `--bp-lg` | `1024px` |
| Desktop | `--bp-xl` | `1280px` |

## 5. Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.25rem` | Buttons, inputs |
| `--radius-md` | `0.375rem` | Cards |
| `--radius-lg` | `0.5rem` | Modals, sheets |
| `--radius-full` | `9999px` | Pills, avatars |

## 6. Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |

## 7. Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease` | Hover states |
| `--transition-base` | `200ms ease` | Modals, drawers |
| `--transition-slow` | `300ms ease` | Page transitions |

## 8. Implementation

Tokens are expressed via Tailwind utility classes and CSS variables in:
- `tailwind.config.ts`
- `src/components/ui/card.tsx`
- `src/components/ui/button.tsx`
- `src/components/layout/DashboardShell.tsx`
