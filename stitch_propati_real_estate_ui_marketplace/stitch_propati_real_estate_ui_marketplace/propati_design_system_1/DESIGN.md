---
name: Propati Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d4daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#e3e8f9'
  surface-container-highest: '#dde2f3'
  on-surface: '#161c27'
  on-surface-variant: '#43474d'
  inverse-surface: '#2a303d'
  inverse-on-surface: '#ecf0ff'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#49607e'
  primary: '#000f22'
  on-primary: '#ffffff'
  primary-container: '#0a2540'
  on-primary-container: '#768dad'
  inverse-primary: '#b0c8eb'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#001209'
  on-tertiary: '#ffffff'
  tertiary-container: '#002a1b'
  on-tertiary-container: '#009e6f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#b0c8eb'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#314865'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#71fbc0'
  tertiary-fixed-dim: '#50dea5'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f9f9ff'
  on-background: '#161c27'
  surface-variant: '#dde2f3'
typography:
  headline-xl:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Bricolage Grotesque
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-xl-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The brand personality is rooted in unwavering trust, premium accessibility, and the sophisticated energy of the modern Nigerian fintech landscape. It bridges the gap between high-stakes real estate transactions and seamless digital experiences.

The design style is **Corporate Modern with Tactile Refinement**. It utilizes a systematic grid, high-quality typography, and subtle depth to evoke a sense of security. The aesthetic is clean and professional, prioritizing clarity and "verified" status indicators to eliminate user anxiety in the property marketplace.

## Colors
The palette is led by **Deep Navy (#0A2540)**, a color chosen to project institutional stability and authority. **Warm Gold (#F5A623)** is used sparingly as an accent to highlight premium listings and "Inspected" status, creating a sense of exclusivity.

**Emerald (#00B37E)** serves as the primary indicator for "Verified" statuses and successful actions. The neutral scale is carefully balanced to ensure high legibility, using slightly blue-tinted grays for borders and muted text to maintain harmony with the primary navy.

## Typography
**Bricolage Grotesque** is the voice of the brand—expressive, modern, and confident. It is reserved for headings to create a distinct editorial feel. **Inter** is the functional workhorse for all body copy and UI elements, ensuring maximum readability across varying screen densities.

**JetBrains Mono** is utilized for technical data points, property IDs, and price-per-square-meter breakdowns, reinforcing the "verified" and data-driven nature of the marketplace.

## Layout & Spacing
The design system employs a **4px base grid** for all internal component spacing and a **12-column fluid grid** for page layouts. 

- **Desktop:** 12 columns with 24px gutters and 64px outer margins.
- **Tablet:** 8 columns with 16px gutters and 32px outer margins.
- **Mobile:** 4 columns with 16px gutters and 16px outer margins.

Spacing should be applied using the defined increments to maintain a consistent vertical rhythm. Components like property cards should use `lg` (24px) padding to feel airy and premium.

## Elevation & Depth
Depth is achieved through **Ambient Shadows** and **Tonal Layering**. Surfaces are primarily white or light gray, with depth used to indicate interactivity and hierarchy.

- **Level 1 (Default):** Flat with a 1px border (#E2E8F0).
- **Level 2 (Cards/Inputs):** Subtle shadow `0 2px 8px rgba(0,0,0,0.08)`.
- **Level 3 (Hover/Modals):** Enhanced shadow `0 10px 20px rgba(0,0,0,0.12)` with a slight `translateY(-2px)` transition for property cards.
- **Active State:** Elements like sidebar navigation items use high-contrast tonal shifts (Navy background with Gold accents) rather than shadows to show focus.

## Shapes
The shape language is structured yet approachable.
- **Cards & Major Containers:** 12px (`rounded-lg`) for a soft, professional container.
- **Buttons & Inputs:** 8px (`rounded-md`) to maintain a precise, functional look.
- **Status Badges & Pills:** 999px (full radius) to distinguish them from interactive containers.

## Components
### Buttons
Standard height is 44px. The Primary button uses Deep Navy background with white text. The Secondary button uses a ghost style with a Navy border. All buttons use 12px radius.

### Verification Badges
A core element of the system. They use a pill shape (999px) and JetBrains Mono for labels:
- **Basic:** Gray background, dark text.
- **Verified:** Emerald green background, white text.
- **Inspected:** Warm Gold background, Navy text.
- **Certified:** Purple gradient with a subtle shimmer animation to denote top-tier listings.

### Input Fields
Inputs are 44px high with an 8px radius and a 1px border (#E2E8F0). On focus, the border shifts to Deep Navy with a 2px outer glow in light blue.

### Property Cards
Cards use a 12px radius and Level 2 elevation. On hover, the card lifts (Level 3 shadow + translate) and the image slightly scales up (1.05x).

### Navigation
The dashboard uses a fixed sidebar with a #0A2540 (Navy) background. Active links feature a 4px Gold vertical bar on the left edge and Gold text/iconography.