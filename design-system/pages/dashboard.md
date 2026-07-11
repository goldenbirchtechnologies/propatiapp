# PROPATI — Dashboard Page Design Overrides
Overrides `design-system/MASTER.md` for authenticated dashboard routes.

## Rules
- No full-bleed photographic backgrounds.
- Sidebar persistent on `lg:`; drawer on mobile with backdrop overlay.
- Tables use compact row height (`h-11`) with `hover:bg-raised` elevation change.
- Primary actions: max one per screen, placed top-right or bottom-fixed on mobile.
- Skeleton loaders use `animate-pulse bg-border-default rounded` (no spinner for >1s content loads).

## Role chrome
- Admin: denser, monospace numbers, more borders.
- Landlord/Agent/Realtor: imagery-forward where listings appear.
- Tenant: action-first (pay, apply, book) with clear next-step CTA.
- Estate Manager: portfolio-first with financial emphasis.
