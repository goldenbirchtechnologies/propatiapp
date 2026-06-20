## When to Apply

Use this skill when the task involves **UI layout, interaction patterns, visual design, or user experience quality checks**.

### Must Use
- Designing new pages (Dashboard, Admin console, Landing page)
- Creating or editing UI components (buttons, cards, forms, modals)
- Selecting color palettes, typography, spacing, or grids
- Reviewing UI code for responsiveness or accessibility (WCAG AA compliance)
- Implementing animations or interaction transitions

### Recommended
- UI looks generic or unprofessional
- Upgrading layouts for mobile devices
- Setting up reusable component libraries (Tailwind + shadcn/ui)

### Skip
- Pure backend queries or data sync scripts
- System config, DevOps, or deployment setups

---

## Rule Categories by Priority

| Priority | Category | Impact | Domain | Key Checks (Must Have) | Anti-Patterns (Avoid) |
|----------|----------|--------|--------|------------------------|------------------------|
| 1 | Accessibility | CRITICAL | `ux` | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | `ux` | Min size 44×44px, 8px+ spacing, Loading feedback | Reliance on hover only, Instant state changes (0ms) |
| 3 | Performance | HIGH | `ux` | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | `style` | Match product type, Consistency, SVG icons (no emoji) | Mixing styles, Emojis as system icons |
| 5 | Layout & Responsive | HIGH | `ux` | Mobile-first breakpoints, Viewport meta, No horizontal scroll | Horizontal scroll on mobile, Fixed px container widths |
| 6 | Typography & Color | MEDIUM | `typography` | Base 16px, Line-height 1.5, Semantic color tokens | Text < 12px, Gray-on-gray text, Raw hex in code |
| 7 | Animation | MEDIUM | `ux` | Duration 150–300ms, Motion conveys meaning, Easing | Decorative-only motion, Animating layout bounds |
| 8 | Forms & Feedback | MEDIUM | `ux` | Visible labels, Error near field, Progressive disclosure | Placeholder-only label, Errors only at top |
| 9 | Navigation Patterns | HIGH | `ux` | Predictable back, Bottom nav ≤5, Deep linking | Overloaded navigation, Broken back gesture |
| 10 | Charts & Data | LOW | `chart` | Legends, Tooltips, Accessible colors | Relying on color alone to convey meaning |

---

## Quick Reference

### 1. Accessibility (CRITICAL)
- **color-contrast**: Minimum 4.5:1 ratio for body text, 3:1 for large text.
- **focus-states**: Highly visible focus indicators (2-4px rings) for keyboard users.
- **alt-text**: Descriptive image alt text on all functional graphics.
- **aria-labels**: Use `aria-label` for icon-only buttons (or `accessibilityLabel` in native).
- **heading-hierarchy**: Single `<h1>` per page, sequential nested structure `<h2>` to `<h6>`.
- **reduced-motion**: Honor `prefers-reduced-motion` preferences.

### 2. Touch & Interaction (CRITICAL)
- **touch-target-size**: Minimum 44×44pt on mobile; expand interactive areas with padding or hitSlop.
- **touch-spacing**: Minimum 8px gap between adjacent touch targets.
- **hover-vs-tap**: Use tap/click for primary actions; don't make critical content hover-dependent.
- **loading-buttons**: Disable buttons and show spinners on submit/async events.
- **press-feedback**: Visual interaction confirmation (opacity/ripple) within 150ms.

### 3. Performance (HIGH)
- **image-dimension**: Define explicit dimensions to avoid Cumulative Layout Shift (CLS < 0.1).
- **lazy-loading**: Lazy load images below the fold (`loading="lazy"`) and code split routes.
- **skeleton-loaders**: Use skeleton UI screens instead of blocking spinners for loads >1s.
- **input-latency**: Maintain input latency <100ms for high interaction responsiveness.

### 4. Style Selection (HIGH)
- **style-match**: Align UI aesthetics with the brand (e.g., Glassmorphism, Bento Grid, Sleek Dark Mode).
- **no-emoji-icons**: Use SVG icons (e.g. Lucide, Phosphor, Heroicons), never emojis as nav indicators.
- **primary-action**: One prominent CTA per visual region; make secondary actions subordinate.
- **icon-consistency**: Use a single icon set family with matched weights and radiuses.

### 5. Layout & Responsive (HIGH)
- **mobile-first**: Design layouts mobile-first, reflowing to multi-column grids at larger breakpoints.
- **horizontal-scroll**: Prevent accidental horizontal document scroll (always use responsive widths).
- **spacing-scale**: Align spacing to an 8dp / 4dp rhythm (margins, paddings, gaps).
- **fixed-element-offset**: Fixed bars (topbars, headers, floating bars) must reserve content margins so content isn't obscured.

### 6. Typography & Color (MEDIUM)
- **line-height**: Maintain 1.5–1.75 line-height for optimal reading density.
- **color-semantic**: Use standard semantic tokens (`primary`, `success`, `error`, `border`, `background`).
- **color-dark-mode**: Build dark themes using desaturated tones rather than pure color inversions.
- **tabular-nums**: Use tabular figures for columns, prices, and timers to stop layout shifts.

### 7. Animation (MEDIUM)
- **duration-timing**: 150-300ms for micro-actions; 300-400ms for complex screens; avoid animations >500ms.
- **easing**: Use ease-out (entering elements) and ease-in (exiting elements). Avoid linear movement.
- **exit-faster**: Exiting elements animate out faster than entering ones (~65% of enter duration).

### 8. Forms & Feedback (MEDIUM)
- **input-labels**: Avoid placeholder-only labeling; input labels must remain visible when text is entered.
- **inline-validation**: Validate fields on blur, displaying errors directly below the affected inputs.
- **input-type**: Select correct input types (`email`, `tel`, `number`) to invoke appropriate mobile keyboards.
- **undo-toast**: Allow undo for deletion or destructive workflows (e.g., "Item deleted. Undo?").

### 9. Navigation Patterns (HIGH)
- **bottom-nav-limit**: Max 5 icons in bottom navigation bar; always include text labels.
- **back-behavior**: Back actions must be consistent, return users to previous screen scroll states, and not drop state.
- **nav-state-active**: Current tab/location must be clearly selected visually.
- **modal-escape**: Provide close indicators or swipe-down gestures to close sheets on mobile.

### 10. Charts & Data (LOW)
- **chart-type**: Line for trends, Bar for comparison, Donut/Pie for proportions.
- **tooltips**: Enable rich tooltips on hover or tap to show absolute numbers.
- **legend-interactive**: Allow users to click legends to toggle data series displays.
