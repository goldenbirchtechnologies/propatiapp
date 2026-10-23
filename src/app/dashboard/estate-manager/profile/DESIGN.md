# Estate Manager — Profile Page Design

## Overview
The Estate Manager profile page lets an estate manager manage their personal account
details, company / firm information, verification status, notification preferences,
and password security. It lives at `/dashboard/estate-manager/profile` and is
guarded by the estate-manager layout (role === `estate_manager`).

## Context in product
- Part of the `estate-manager` dashboard shell.
- Listed in `src/lib/navigation.tsx` → `ESTATE_MANAGER_NAVIGATION` → "My Profile".
- Uses shared profile components under `src/components/profiles/` (`ProfileShell`,
  `ProfileHeader`, `ProfileForm`, `ProfileSecurity`, `ProfileNotifications`).

## Layout (desktop ≥ 1024px)
```
┌─────────────────────────────────────────────────────────────┐
│ Root: ProfileShell                                            │
│   ┎────────── 64px sidebar ┓  ┎── Main (max-w-6xl) ───────┓  │
│   │ Propati logo           │  │ Page header               │  │
│   │ [Home]                 │  │   My Profile / subtitle   │  │
│   │ [Rent & Payments]      │  │                           │  │
│   │ [Portfolio]            │  │  ┌─ Grid lg:grid-cols-3 ─┐ │  │
│   │ [Units]                │  │  │ LEFT (col 1)           │  │  │
│   │ [Maintenance]          │  │  │   ProfileHeader        │  │  │
│   │ [Team]                 │  │  │   (avatar, name, role) │  │  │
│   │ [Agreements]           │  │  │   ──────────────────   │  │  │
│   │ [Messages]             │  │  │   quick actions        │  │  │
│   │ [Invitations]          │  │  │   (edit avatar, etc.)  │  │  │
│   │ [My Profile]  (active) │  │  └────────────────────────┘  │  │
│   │                        │  │ RIGHT (col 2)              │  │
│   │                        │  │   ┌──────────────────────┐ │  │
│   │                        │  │   │ Company Information  │ │  │
│   │                        │  │   │ (form)               │ │  │
│   │                        │  │   └──────────────────────┘ │  │
│   │                        │  │   ┌──────────────────────┐ │  │
│   │                        │  │   │ Firm Verification    │ │  │
│   │                        │  │   │ (security/verification)│ │  │
│   │                        │  │   └──────────────────────┘ │  │
│   │                        │  │   ┌──────────────────────┐ │  │
│   │                        │  │   │ Notification Settings│ │  │
│   │                        │  │   │ (toggles)            │ │  │
│   │                        │  │   └──────────────────────┘ │  │
│   │                        │  │   ┌──────────────────────┐ │  │
│   │                        │  │   │ Password Security    │ │  │
│   │                        │  │   │ (change password)    │ │  │
│   │                        │  │   └──────────────────────┘ │  │
│   └────────────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

Mobile (< 1024px): sidebar collapses to top nav; main content becomes single-column
with ProfileHeader stacked above the form cards.

## Data model
Profile fields are sourced from the `User` model in `prisma/schema.prisma`:

| Field               | Source                | Notes |
|---------------------|-----------------------|-------|
| fullName            | `User.fullName`       | Editable |
| email               | `User.email`          | Read-only (auth-managed by Clerk) |
| phone               | `User.phone`          | Editable |
| avatarUrl           | `User.avatarUrl`      | Clerk-managed; show / clear |
| company / firmName  | new field `User.company` or org name | Editable |
| role                | `User.role`           | Display-only, `estate_manager` |
| createdAt / updatedAt | `User.createdAt`    | Display-only |
| idVerified / phoneVerified | `User.idVerified` / `User.phoneVerified` | Display |
| UserKyc.status       | `UserKyc.status`      | Via `useKycStatus()` hook |

### Verification (estate-manager specific)
Estate managers are verified as **business entities**, not individuals:
- Verification tier comes from `ProfileSecurity` component (tier_2 / pending).
- Next action: "Submit CAC documents to complete verification."
- A `KycVerificationCard` sits below for identity-level KYC.

## Visual design tokens
Per `docs/06_Design_Tokens.md`:

- **Role color**: Estate Manager → `--em` = `#3b82f6` (blue-500).
  Sidebar active item and profile accent use this.
- **Accent**: `--accent` (emerald `#10b981`) used for success / verified badges.
- **Surfaces**: `--bg-base` (page), `--bg-raised` (cards), `--surface-elevated`.
- **Borders**: `--border-default`, plus dark-mode `dark:border-white/[0.08]`.
- **Text**: `--text-primary`, `--text-secondary`, `--text-muted`.
- **Glass cards**: `glass-card` class on surface containers.
- **Typography**: `font-display` for headings, `font-label-sm` (uppercase,
  tracking-wider) for card metadata labels.
- **Radii**: `--radius-md` (cards), `--radius-full` (avatar).

## Components used
| Component | File | Purpose |
|-----------|------|---------|
| ProfileShell | `src/components/profiles/ProfileShell.tsx` | Outer layout: sidebar + main |
| ProfileHeader | `src/components/profiles/ProfileHeader.tsx` | Avatar, name, role badge, join date |
| ProfileForm | `src/components/profiles/ProfileForm.tsx` | Editable form fields + submit |
| ProfileSecurity | `src/components/profiles/ProfileSecurity.tsx` | Verification tier, status, next action |
| ProfileNotifications | `src/components/profiles/ProfileNotifications.tsx` | Toggle list |
| KycVerificationCard | `src/components/verification/KycVerificationCard.tsx` | Identity KYC status |

## Interaction spec
1. **Company Information form**: inline-edit full name, phone, company name.
   Email is shown read-only (greyed, helper text: "Managed by Clerk").
   "Save Changes" button → PATCH `/api/user/profile` (or existing user-update route).
   Success toast + revert to read view on save.
2. **ProfileHeader**: camera icon on avatar → opens avatar-upload modal (stub,
   "Change avatar" not yet wired to backend).
3. **Firm Verification card**: tier badge `tier_2`, status `pending` (amber),
   "Next step" text + optional "Verify Phone" action button (if `onVerify` prop).
4. **Notification toggles** (estate-manager specific):
   - Maintenance tickets (on)
   - Service charge reminders (on)
   - Utility reports (off)
   - Tenant onboarding (on)
   Toggles persist to user notification preferences (stub write-ok for now).
5. **KycVerificationCard**: standard identity KYC flow via Dojah.
6. **Password Security** (new section, not in current stub):
   - "Change password" link → opens modal with current / new / confirm fields.
   - (Clerk-hosted password change URL as fallback.)

## Accessibility
- All toggle buttons use `role="switch"` + `aria-checked`.
- Avatar change button has `aria-label="Change avatar"`.
- Color is never the sole indicator — status badges pair icon + text.
- Focus ring: `focus:ring-2 focus:ring-[var(--primary)]/40`.

## States
- **Loading**: skeleton cards (`Skeleton` from shadcn) while user data resolves.
- **No user / wrong role**: redirected by layout to `/sign-in` or role path.
- **Save success**: inline green toast "Profile updated successfully".
- **Save error**: inline red toast with message, button re-enables.

## File map
```
src/app/dashboard/estate-manager/profile/
  page.tsx       ← client component (entry point)
  DESIGN.md      ← this file
```
