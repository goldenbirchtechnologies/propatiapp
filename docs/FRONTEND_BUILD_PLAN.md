# PROPATI — Frontend Build Plan (UI Layer)
**Version:** 1.0  
**Style Direction:** Spatial UI (chosen over clay/glass for PropTech trust + depth)  
**Stack:** Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui  
**Design System:** `design-system/MASTER.md` (ui-ux-pro-max applied)

---

## 1. Style Decision

**Chosen: Spatial UI** (depth via elevation, layered surfaces, subtle parallax, z-axis motion)  
- Better suited to a high-trust PropTech OS than clay/glass  
- Supports Nigerian legal-grade UX (serious, layered, authoritative)  
- Easier dark/light pairings without ceramic/glare artifacts

Fallbacks noted:
- Claymorphism: soft blob shapes, signage feel → too playful for legal/financial flows
- Glassmorphism: blur + translucency → risky against property photos + screens

---

## 2. Expanded Sitemap

### 2.1 Public Gaps (not yet in codebase)
- `/about-us` — company, founders, mission, NBA compliance, backing
- `/contact-us` — form, office locations, phone/email
- `/faq` — categorized accordion by role
- `/privacy-policy` — legal page (GDPR/PDPA-aligned)
- `/terms-of-service` — actionable terms
- `/terms-of-agreement` — tenancy terms + stamp duty reference
- `/pricing` — subscription tiers (Free / Pro / Enterprise)
- `/testimonials` — social proof hub (optional landing section)

### 2.2 State Screens Needed
- `/loading/[flow]` — generic async states
- `/error/[flow]` — failure screen with retry + support link
- `/payment/success` — confirmation with receipt preview
- `/payment/declined` — retry path + bank pickup guidance
- `/verification/frozen` — legal hold / verification paused screen
- `/suspended` — account frozen state

### 2.3 Auth / Signup
- `/sign-in` ✅ exists (`[[...sign-in]]`)
- `/sign-up` ✅ exists (`[[...sign-up]]`)
- `/onboarding` ✅ exists
- `/business` ✅ exists

### 2.4 Dashboard Profile Pages (role variants)
Current: each role has `/dashboard/[role]/profile` ✅  
Add unified variant: `/dashboard/profile?role=x` route metadata only; keep role paths.

### 2.5 Final Route Count (post-gap fill)

| Domain | Count |
|---|---|
| Public static / legal | 7 |
| Public dynamic | 4 |
| Auth / onboarding | 3 |
| Pricing / subscriptions | 1 |
| Payment states | 2 success + 1 declined + 1 frozen + 1 suspended + 1 error = 6 |
| Dashboard shared `[role]` | 11 |
| Dashboard landlord | 14 |
| Dashboard tenant | 14 |
| Dashboard agent | 8 |
| Dashboard realtor | 6 |
| Dashboard estate-manager | 12 |
| Dashboard admin | 15 |
| Dashboard sub-admin role pages | 1 |
| Admin root | 22 |
| Business page | 1 |
| Documents | 1 |
| Total (estimate) | ~130 unique route patterns |

---

## 3. JSON Layer Definitions

### 3.1 `sitemap/sitemap.json`
```json
[
  { "route": "/about-us", "role": "public", "sectionRefs": ["hero", "mission", "team", "compliance", "cta"] },
  { "route": "/contact-us", "role": "public", "sectionRefs": ["hero", "contact-form", "offices", "map", "faq-teaser"] }
]
```

### 3.2 `sitemap/sections.json`
```json
{
  "hero": { "type": "hero", "slots": ["eyebrow", "headline", "subhead", "primaryCta", "secondaryCta", "bgImage"] },
  "mission": { "type": "stats", "slots": ["items[]"] },
  "contact-form": { "type": "formStack", "slots": ["fields[]", "submit"] },
  "payment-confirmation": { "type": "confirmation", "slots": ["status", "receiptLink", "timeline"] }
}
```

### 3.3 `sitemap/wireframes.json`
```json
{
  "hero": { "layout": "split", "columns": 2, "breakpoints": { "mobile": 1, "desktop": 2 } },
  "formStack": { "layout": "stack", "columns": 1 }
}
```

### 3.4 `sitemap/tokens.json` (Spatial UI)
```json
{
  "surface": { "base": "#FFFFFF", "raised": "#FFFFFF", "overlay": "rgba(255,255,255,0.78)" },
  "background": { "base": "#F5F3EF", "gradient": "radial-gradient(circle at 20% 10%, #EDE9E3, #F7F5F1)" },
  "primary": { "value": "#1B4332", "onPrimary": "#FFFFFF" },
  "secondary": { "value": "#B45309", "onSecondary": "#FFFFFF" },
  "muted": { "value": "#9CA3AF" },
  "shadow": { "sm": "0 1px 2px rgba(0,0,0,0.06)", "md": "0 8px 24px rgba(0,0,0,0.10)", "lg": "0 24px 56px rgba(0,0,0,0.14)", "xl": "0 32px 80px rgba(0,0,0,0.18)" },
  "radius": { "sm": "0.5rem", "md": "0.75rem", "lg": "1.25rem", "xl": "1.75rem", "full": "9999px" },
  "elevation": { 1: "0 1px 2px rgba(0,0,0,0.06)", 2: "0 8px 24px rgba(0,0,0,0.10)", 3: "0 24px 56px rgba(0,0,0,0.14)" },
  "motion": { "ease": "cubic-bezier(0.22, 1, 0.36, 1)", "duration-fast": "150ms", "duration-default": "280ms", "duration-slow": "420ms" }
}
```

### 3.5 `sitemap/blocks.json`
```json
{
  "hero": { "props": ["eyebrow", "headline", "subhead", "primaryCta", "secondaryCta", "bgImage"] },
  "stats": { "props": ["items[]", "columns"] },
  "formStack": { "props": ["fields[]", "submitLabel", "afterSubmit"] },
  "confirmation": { "props": ["status", "title", "description", "actions[]"] },
  "frozen": { "props": ["title", "description", "ticketLink", "appealLink"] },
  "failure": { "props": ["error", "retry", "support"] }
}
```

---

## 4. Build Phases

### Phase A — Design System + JSON Foundations
Deliverables:
- `design-system/MASTER.md`
- `design-system/pages/public.md`
- `design-system/pages/dashboard.md`
- `sitemap/*.json` (5 files)

Blockers: none

### Phase B — Public Pages
1. `app/(public)/about-us/page.tsx`
2. `app/(public)/contact-us/page.tsx`
3. `app/(public)/faq/page.tsx`
4. `app/(public)/privacy-policy/page.tsx`
5. `app/(public)/terms-of-service/page.tsx`
6. `app/(public)/terms-of-agreement/page.tsx`
7. `app/(public)/pricing/page.tsx`
8. `app/(public)/testimonials/page.tsx`

### Phase C — State / Error / Payment Screens
1. `app/payment/success/page.tsx`
2. `app/payment/declined/page.tsx`
3. `app/verification/frozen/page.tsx`
4. `app/account/suspended/page.tsx`
5. `app/error/[flow]/page.tsx`
6. Shared `components/feedback/LoadingState.tsx`
7. Shared `components/feedback/FailureState.tsx`
8. Shared `components/feedback/FrozenState.tsx`

### Phase D — Layout / Section Block Library
1. `components/sections/SpatialSection.tsx`
2. `components/sections/SpatialHero.tsx`
3. `components/sections/SpatialStats.tsx`
4. `components/sections/SpatialFormStack.tsx`
5. `components/sections/SpatialConfirmation.tsx`
6. `components/sections/SpatialFrozenState.tsx`
7. `components/sections/SpatialFailureState.tsx`
8. `components/sections/SpatialPricingTable.tsx`

### Phase E — Dashboard Profile Unification
1. `app/dashboard/[role]/profile/layout.tsx` (shared chrome)
2. `components/profiles/ProfileHeader.tsx`
3. `components/profiles/ProfileSecurity.tsx`
4. `components/profiles/ProfileNotifications.tsx`
5. `components/profiles/ProfileSubscription.tsx`

### Phase F — Admin / Legal Workflows
- Wire agreement signature status screens
- Wire evidence pack download / preview screens
- Wire conflict-check workflow screens

### Phase G — Verification Quality Gates
- Layer 1–5 queue screens in admin
- QR code view / share screen
- Inspection complete flow screen

---

## 5. Component Priorities (Top 20)

1. SpatialShell — global layout with elevated surfaces
2. SpatialNav — sidebar with双层 elevation
3. SpatialCard — base unit for all cards
4. SpatialDataTable — data-dense table with row hover elevation
5. SpatialButton — shadow variants for primary/secondary/ghost
6. SpatialInput — floating label + focus glow
7. SpatialModal — bottom sheet mobile / centered desktop
8. SpatialToast — status feedback
9. SpatialSkeleton — shimmer with spatial pulse
10. SpatialEmptyState — ilustration + CTA
11. PricingToggle (monthly/annual)
12. PaymentStatusStepper
13. AgreementViewer (PDF preview in layout)
14. PropertyGallery (image grid with LQIP)
15. VerificationTimeline
16. MessagingThread (inbox + composer)
17. RentLedger (table + summary)
18. ShortletCalendar (date grid + rules editor)
19. SubscriptionPlanSelector
20. ComplianceBadge (NBA/verified/escrow mix)

---

## 6. Enforcement Rules (Strict)

1. **No creative UI invention** — every section type must exist in `blocks.json` first
2. **JSON-only handoff between stages** — A produces JSON, B consumes JSON, no cross-talk
3. **No hand-edits to generated pages** — only `scripts/generate-pages.ts` writes page.tsx
4. **Style consistency** — all UI must use tokens.json values; no raw hex in .tsx
5. **Accessibility parity** — every screen has loading, error, empty, and frozen states

---

## 7. Verification Checklist (per screen)

- Renders at 320, 375, 768, 1024, 1440
- Loading / error / empty / frozen states implemented
- `prefers-reduced-motion` respected
- Semantic color tokens only (no raw hex)
- All forms have visible labels + inline errors
- All CTAs have primary / secondary distinction

---

## 8. Risk Notes

- `design-system/` writes are safe; no `.env` or route logic touched
- New pages under `src/app/` must preserve Next.js 14 App Router file conventions
- All legal pages must be marked noindex until legal review
