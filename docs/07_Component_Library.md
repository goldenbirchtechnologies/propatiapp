# 07 – Component Library

## 1. UI Primitives (`src/components/ui/`)

| Component | File | Variants / Notes |
|-----------|------|------------------|
| Button | `button.tsx` | primary, secondary, outline, ghost, danger, loading |
| Input | `input.tsx` | default, error, success |
| Card | `card.tsx` | default, listing, dashboard |
| Badge | `badge.tsx` | verification (4 tiers), status (8), role (5) |
| Avatar | `avatar.tsx` | initials, image, fallback |
| Modal | `modal.tsx` | Desktop + mobile bottom sheet |
| DataTable | `data-table.tsx` | Sortable, filterable, paginated |
| Action Card Skeleton | `action-card-skeleton.tsx` | Loading placeholder |

## 2. Layout Components (`src/components/layout/`)

| Component | File | Purpose |
|-----------|------|---------|
| DashboardShell | `DashboardShell.tsx` | Sidebar + topbar chrome for authenticated routes |
| DashboardTopbar | `topbar.tsx` | Bell, avatar, purpose switch |

## 3. Feature Components

| Component | File | Purpose |
|-----------|------|---------|
| ListingCard | `components/listings/listing-card.tsx` | Grid + list view |
| ListingGrid | `components/listings/listing-grid.tsx` | Responsive grid |
| SearchFilters | `components/listings/search-filters.tsx` | Filter sidebar |
| ImageUpload | `components/listings/image-upload.tsx` | Cloudinary multi-upload |
| VerificationWizard | `components/verification/wizard.tsx` | 5-step with progress |
| AgreementPreview | `components/agreements/preview.tsx` | HTML render + sign button |
| NotificationBell | `components/notifications/notification-bell.tsx` | Dropdown + unread count |

## 4. Admin Components

| Component | File |
|-----------|------|
| VerificationQueue | `components/admin/verification-queue.tsx` |
| FlaggedListingsClient | `app/admin/flagged-listings/FlaggedListingsClient.tsx` |
| ActionConfirmationDialog | `components/admin/action-confirmation-dialog.tsx` |

## 5. Design System Source

- `stitch_propati_real_estate_ui_marketplace/` — Excalidraw/Stitch design system exports
- `src/app/stitch_propati_real_estate_ui_marketplace/propati_design_system_1/DESIGN.md`
- `src/app/stitch_propati_real_estate_ui_marketplace/propati_design_system_2/DESIGN.md`

## 6. Usage Pattern

Components use:
- `class-variance-authority` for variants
- `tailwind-merge` + `clsx` for class composition
- `lucide-react` for icons
- `sonner` for toasts
