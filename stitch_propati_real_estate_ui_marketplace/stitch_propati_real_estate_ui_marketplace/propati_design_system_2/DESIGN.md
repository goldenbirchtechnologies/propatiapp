---
name: Propati Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3e4946'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6e7a76'
  outline-variant: '#bdc9c4'
  surface-tint: '#006b5b'
  primary: '#006152'
  on-primary: '#ffffff'
  primary-container: '#0e7c6a'
  on-primary-container: '#bdffed'
  inverse-primary: '#7bd7c2'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#fcc355'
  on-secondary-container: '#725000'
  tertiary: '#88412f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a65845'
  on-tertiary-container: '#ffeeea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#98f4dd'
  primary-fixed-dim: '#7bd7c2'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#f6bd50'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0801'
  on-tertiary-fixed-variant: '#753222'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
  residential-teal: '#0e7c6a'
  residential-teal-soft: rgba(14, 124, 106, 0.1)
  commercial-gold: '#c9952a'
  commercial-gold-soft: rgba(201, 149, 42, 0.1)
  type-rent: '#3b82f6'
  type-lease: '#8b5cf6'
  type-sale: '#10b981'
  type-shortlet: '#f59e0b'
  type-roomshare: '#ec4899'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base-unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
---

## Brand & Style
The brand personality is professional, authoritative, and transaction-oriented, tailored for a high-trust real estate marketplace. The design system adopts a **Corporate / Modern** aesthetic, prioritizing clarity, efficiency, and data density. It focuses on functional minimalism to ensure that property imagery and key financial data remain the focal points. The UI evokes a sense of reliability and transparency, utilizing structured grids and a refined color application to guide users through complex search and listing workflows.

## Colors
The color strategy employs semantic categorization to differentiate property sectors and listing statuses immediately. 

- **Sector Categories:** "Residential" utilizes the primary Teal for a grounded, trustworthy feel, while "Commercial" uses Gold to signal high-value investment and business utility. Both include a 10% opacity "soft" variant for large-surface backgrounds like card containers or section headers.
- **Listing Types:** Distinct chromatic tokens are assigned to transaction types (Rent, Lease, Sale, etc.) to ensure rapid scanning in search results. 
- **Contrast & Accessibility:** All semantic colors are calibrated to maintain a minimum 4.5:1 contrast ratio against white surfaces. For the Amber and Gold tones, use darker text overlays (Neutral-900) when used as solid backgrounds to ensure legibility.

## Typography
The system uses **Hanken Grotesk** for all primary communication, offering a sharp, contemporary feel that balances professional rigor with modern warmth. For technical data—such as square footage, pricing units, or listing IDs—**JetBrains Mono** is used in a "label-caps" style to provide a distinct, data-driven secondary layer. This typographic contrast helps users distinguish between descriptive marketing copy and hard property specifications.

## Layout & Spacing
This design system utilizes a **Fixed Grid** layout for desktop (1280px max-width) to maintain control over high-density property grids, transitioning to a **Fluid Grid** for mobile devices. 

- **Grid Logic:** A 12-column system is used for desktop listings. Properties are typically displayed in 3 or 4-column spans.
- **Rhythm:** An 8px linear scale (built on a 4px base unit) governs all padding and margins. 
- **Breakpoints:** 
  - Mobile (<768px): 4-column fluid, 16px margins.
  - Tablet (768px - 1024px): 8-column fluid, 24px margins.
  - Desktop (>1024px): 12-column fixed, 48px margins.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and precise **Low-Contrast Outlines**. Instead of heavy shadows, surfaces use subtle 1px borders (Neutral-200) to define boundaries. 

- **Surface Levels:** The base background is white. Secondary containers (like filters or sidebars) use a very light gray.
- **Interactive Elevation:** Elevated property cards use a "Soft Ambient Shadow" (0px 4px 20px rgba(0,0,0,0.05)) only on hover to provide feedback without cluttering the visual field. 
- **Floating Elements:** Primary Action Buttons and Map Markers use a slightly higher elevation with a more pronounced shadow to indicate priority.

## Shapes
The design system employs a **Soft** shape language. Standard UI components like input fields, buttons, and property cards use a 0.25rem (4px) corner radius. This choice reflects the "Corporate" brand personality—less playful than "Rounded" but more approachable than "Sharp." Large elements like modal containers or hero images may scale up to a "rounded-lg" (8px) radius to maintain visual proportion.

## Components
- **Buttons:** Primary buttons use the Residential Teal (#0e7c6a). Transactional buttons (e.g., "Book Viewing") utilize the bold weight of the headline font.
- **Chips (Listing Types):** Small, high-contrast badges with white text on the listing type colors (Sale, Rent, etc.). Use "label-caps" typography for maximum legibility.
- **Cards:** Property cards use a white background with a 1px Neutral-200 border. The top-right corner is reserved for the "Listing Type" chip.
- **Input Fields:** Search bars and filters use a 4px radius with a 1px stroke. The active state uses a 2px Teal border.
- **Category Indicators:** Use the "Residential Teal Soft" or "Commercial Gold Soft" as full-width section backgrounds to categorize search results visually without overwhelming the user.
- **Price Tags:** Always rendered in JetBrains Mono to emphasize numerical accuracy and distinguish from property titles.