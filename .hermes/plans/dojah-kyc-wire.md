# Dojah Verification Integration — Wired Profiles + Gating

## Goal
Add Dojah verification surfaces to all role profile pages using reusable client components, and establish a simple client-side gating surface keyed by `UserKyc.status` placeholders.

## Scope
- Verified backend routes:
  - POST `/api/verification/dojah/initiate`
  - GET `/api/verification/dojah/status`
  - POST `/api/verification/dojah/webhook`
- Reusable client components:
  - `src/components/verification/DojahWidgetClient.tsx`
  - `src/components/verification/KycVerificationCard.tsx`
  - `src/components/verification/KycGate.tsx`

## Plan Mode Branch

#1 Wire into Tenant Profile
- Replace tenant KYC inline block with `KycVerificationCard`.
- Add gated actions: [ Pay Rent ] and [ Make a Payment ] wrapped in `KycGate`.

#2 Wire into Landlord Profile
- Add KYC section inside `LandlordProfileClient`.
- Wrap listing creation/publish with `KycGate` placeholder.

#3 Wire into Agent Profile
- Add small KYC card beneath personal details.
- Gate verified-agent actions: submit documents/verification.

#4 Wire into Estate Manager Profile
- Replace `ProfileSecurity` verification content with `KycVerificationCard`.

#5 Wire into Admin Profile
- Add review/approval actions under `KycGate` placeholders.

#6 Existing system checks
- test:
  - `npx next lint --dir src`
  - `npx next build`

#7 Push
- branch: `feature/dojah-verification`
- commits:
  - feat: Add Dojah auth routes + reusable client components
  - feat: Wire KYC into role profile pages + simple gating surface
- push target: `git push github HEAD:main` or user-specified branch
