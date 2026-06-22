# 12 – Accessibility System

## 1. Baseline

- WCAG 2.1 AA target
- shadcn/ui components built with Radix primitives (focus management, ARIA)
- Color contrast meets 4.5:1 minimum for text

## 2. Keyboard Navigation

- All interactive elements reachable via Tab
- Focus indicators visible (`--ring` token)
- Modals trap focus; Escape closes

## 3. Screen Readers

- Semantic HTML (`nav`, `main`, `header`, `button`)
- ARIA labels on icon-only buttons
- Live regions for dynamic notifications

## 4. Forms

- Labels associated with inputs via `htmlFor`
- Error messages linked via `aria-describedby`
- Required fields marked with `aria-required`

## 5. Images

- `alt` text on all meaningful images
- Decorative images use empty `alt=""`
- Cloudinary URLs include `alt` metadata where possible

## 6. Responsive Text

- Base font size 16px
- Scalable up to 125% without truncation
- No fixed-height containers for text content

## 7. Motion

- Respects `prefers-reduced-motion`
- Animations limited to 200ms for UI state changes

## 8. Testing

- Manual axe DevTools scans on key pages
- Planned: automated a11y tests in CI
