# Master Findings Report

Date: July 16, 2026
Scope: Full-project route, role, auth, payment, verification, org, and wallet audit

This document consolidates the confirmed issues found across the project during the deep route and role review. Items are ordered by severity and grouped by system area so the highest-risk defects are easy to triage.

## Critical

- **C1. Any authenticated user can self-promote to admin**
  - Affects: [src/app/api/onboarding/role/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/onboarding/role/route.ts), [src/app/api/users/me/profile/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/users/me/profile/route.ts), [src/lib/api-auth.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/api-auth.ts)
  - Details: Both role update endpoints accept `admin` as a valid role and write it directly to the current user record. Since downstream auth checks trust `user.role`, this is a direct privilege escalation path.
  - Impact: Full admin API access, admin-only routes, and any DB-backed authorization that reads `user.role`.

- **C2. Role-based dashboard access is not enforced consistently**
  - Affects: [src/app/dashboard/landlord/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/landlord/page.tsx), [src/app/dashboard/tenant/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/tenant/page.tsx), [src/app/dashboard/agent/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/agent/page.tsx), [src/app/dashboard/admin/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/admin/page.tsx), [src/app/dashboard/[role]/layout.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/[role]/layout.tsx)
  - Details: Several role dashboards only check authentication, not the actual role. The shared role layout also relies on Clerk `publicMetadata.role`, while other flows update Prisma only. The result is a split-brain authorization model.
  - Impact: Unauthorized dashboard access, stale role checks, flicker/mismatch between DB and Clerk state, and false denials for valid users.

- **C3. Payment agreement binding is incomplete**
  - Affects: [src/app/api/payments/initiate/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/payments/initiate/route.ts)
  - Details: Agreement validation checks only that the requester is the agreement tenant. It does not verify that the agreement belongs to the same listing being charged. The route also creates a pending transaction before external Paystack initialization, leaving orphaned records on gateway failure.
  - Impact: Incorrect charges, inconsistent ledger state, and orphaned payment rows.

- **C4. Paystack webhook can silently drop wallet credits**
  - Affects: [src/app/api/webhook/paystack/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/webhook/paystack/route.ts)
  - Details: The wallet-upsert branch references an undefined `meta` variable and the catch path returns HTTP 200 on failure. That prevents provider retries and can lose crediting events without visible recovery.
  - Impact: Lost deposits, ledger divergence, and hard-to-diagnose payment failures.

- **C5. Escrow release flow is split, inconsistent, and partially non-functional**
  - Affects: [src/app/api/payments/[id]/release/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/payments/[id]/release/route.ts), [src/app/api/payments/release-escrow/[id]/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/payments/release-escrow/[id]/route.ts), [src/app/admin/escrow/EscrowManagementClient.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/admin/escrow/EscrowManagementClient.tsx)
  - Details: One route mostly creates DB records instead of transferring funds; the alternate route does transfer but lets the caller influence payout amount. The admin UI calls the first route with a different body contract than it expects.
  - Impact: Funds can be released incorrectly, recorded without moving money, or paid at the wrong amount.

## High

- **H1. Legacy `realtor` role still exists in code, but not in Prisma**
  - Affects: [prisma/schema.prisma](/home/r2d2c3p0/NEWPROPATI_new/prisma/schema.prisma), [src/lib/auth.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/auth.ts), [src/lib/api-auth.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/api-auth.ts), [src/app/sign-up/[[...sign-up]]/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/sign-up/[[...sign-up]]/page.tsx), [src/app/onboarding/OnboardingClient.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/onboarding/OnboardingClient.tsx), [src/app/api/auth/clerk-webhook/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/auth/clerk-webhook/route.ts)
  - Details: The Prisma enum no longer includes `realtor`, but many redirects, guards, and webhook branches still reference it.
  - Impact: Dead code paths, broken redirects, stale onboarding flows, and potential enum mismatches.

- **H2. Dashboard role source of truth is inconsistent**
  - Affects: [src/lib/auth.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/auth.ts), [src/app/dashboard/[role]/layout.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/[role]/layout.tsx), [src/app/api/users/me/profile/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/users/me/profile/route.ts), [src/app/onboarding/OnboardingClient.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/onboarding/OnboardingClient.tsx)
  - Details: Some code trusts Clerk `unsafeMetadata`, some trusts `publicMetadata`, and some writes only to Prisma. There is no clear sync mechanism.
  - Impact: Users can be locked out of the wrong dashboard, or granted UI state that no longer matches the database.

- **H3. ID format validation rejects valid records in many routes**
  - Affects: [src/lib/validators.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/validators.ts), [src/app/api/invoices/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/invoices/route.ts), [src/app/api/agreements/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/agreements/route.ts), [src/app/api/orgs/[id]/tickets/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/orgs/[id]/tickets/route.ts), [src/app/api/verification/layer4/complete/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/layer4/complete/route.ts), [src/app/api/payments/[id]/release/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/payments/[id]/release/route.ts)
  - Details: Prisma uses CUIDs for many models, but a large number of validators still require UUIDs.
  - Impact: Valid IDs are rejected before query time, creating route failures across payments, verification, orgs, invoices, and agreements.

- **H4. Payment fee calculation is duplicated and inconsistent**
  - Affects: [src/lib/fees.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/fees.ts), [src/lib/payment-utils.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/payment-utils.ts), [src/lib/paystack.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/paystack.ts), [src/app/dashboard/[role]/payments/new/PaymentInitiationClient.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/[role]/payments/new/PaymentInitiationClient.tsx), [src/components/payments/payment-modal.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/components/payments/payment-modal.tsx)
  - Details: Frontend previews use one fee calculator while backend payment creation uses another. Sale commission math also appears to be off relative to the comment.
  - Impact: UI and backend disagree on what the user will pay and what the payee receives.

- **H5. Escrow release amount can be caller-influenced**
  - Affects: [src/app/api/payments/release-escrow/[id]/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/payments/release-escrow/[id]/route.ts)
  - Details: The route allows `validated.amount` to override the payout amount if supplied, rather than forcing the amount from the transaction record.
  - Impact: Wrong payout amount and potential financial loss.

- **H6. Wallet payout balance check is incorrect**
  - Affects: [src/app/api/wallet/payout/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/wallet/payout/route.ts)
  - Details: The balance comparison mixes naira and kobo units, which can allow invalid payouts or reject valid ones.
  - Impact: Incorrect withdrawal authorization.

- **H7. Deposit verification does not appear idempotent**
  - Affects: [src/app/api/wallet/deposit/verify/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/wallet/deposit/verify/route.ts)
  - Details: The route upserts the transaction record but also recalculates and writes wallet balance from the current state without a clear replay guard.
  - Impact: Duplicate verification calls can double-apply funds.

- **H8. Org member invitation can create duplicate pending invites**
  - Affects: [src/app/api/orgs/[id]/members/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/orgs/[id]/members/route.ts)
  - Details: When the invitee does not yet exist in the user table, the route creates a pending membership with `userId: null`. The uniqueness constraint does not prevent multiple pending invites for the same email.
  - Impact: Duplicate invitations and inconsistent membership records.

- **H9. Org ticket creation computes authorization but does not enforce it**
  - Affects: [src/app/api/orgs/[id]/tickets/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/orgs/[id]/tickets/route.ts)
  - Details: `canCreate` is computed but never used in the POST path. The comment says only certain roles should create on behalf, but the guard is missing.
  - Impact: Overbroad ticket creation permissions.

- **H10. Verification flow uses mixed ID rules and mixed permission assumptions**
  - Affects: [src/app/api/verification/request-inspection/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/request-inspection/route.ts), [src/app/api/verification/upload-video/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/upload-video/route.ts), [src/app/api/verification/verify-identity/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/verify-identity/route.ts), [src/app/api/verification/layer4/complete/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/layer4/complete/route.ts), [src/app/api/verification/[id]/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/[id]/route.ts), [src/app/api/verification/[id]/status/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/verification/[id]/status/route.ts)
  - Details: Some routes use CUID validation, others expect UUIDs, and the permission model varies between owner, agent, and admin views.
  - Impact: Route failures and inconsistent access controls across the verification stack.

- **H11. Paystack callback URL depends on an env var without fallback**
  - Affects: [src/app/api/payments/initiate/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/payments/initiate/route.ts)
  - Details: The callback URL is built directly from `NEXT_PUBLIC_APP_URL`. If it is missing or misconfigured, the payment flow breaks.
  - Impact: Broken checkout redirect and payment recovery flow.

## Medium

- **M1. `join` and `sign-up` onboarding flows are disconnected**
  - Affects: [src/app/(public)/join/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/(public)/join/page.tsx), [src/app/onboarding/PublicOnboardingClient.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/onboarding/PublicOnboardingClient.tsx), [src/app/sign-up/[[...sign-up]]/page.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/sign-up/[[...sign-up]]/page.tsx)
  - Details: The public role picker and the Clerk sign-up flow do not share a single authoritative handoff.
  - Impact: Confusing onboarding behavior and role selection that appears to work but is not persisted consistently.

- **M2. `src/app/api/users/me/profile/route.ts` allows admin-only fields to be written by any user**
  - Affects: [src/app/api/users/me/profile/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/users/me/profile/route.ts)
  - Details: The route accepts a `role` field from the request body and writes it into the current user record, with no admin gate.
  - Impact: This is both a privilege-escalation issue and a data consistency issue.

- **M3. `src/lib/rate-limit.ts` is not production-safe**
  - Affects: [src/lib/rate-limit.ts](/home/r2d2c3p0/NEWPROPATI_new/src/lib/rate-limit.ts)
  - Details: The rate limiter uses an in-memory `Map` and timer cleanup. It is not shared across instances and will not behave correctly in serverless or multi-instance deployments.
  - Impact: Weak rate limiting and inconsistent throttling under real traffic.

- **M4. Admin mutation routes are duplicated across two patterns**
  - Affects: [src/app/api/admin/users/[id]/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/admin/users/[id]/route.ts), [src/app/api/admin/users/[id]/change-role/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/admin/users/[id]/change-role/route.ts), [src/app/api/admin/users/[id]/ban/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/admin/users/[id]/ban/route.ts), [src/app/api/admin/users/[id]/suspend/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/admin/users/[id]/suspend/route.ts)
  - Details: There are overlapping admin endpoints with slightly different auth styles and field semantics.
  - Impact: Maintenance drift and a larger chance of one path being fixed while another remains vulnerable.

- **M5. Several routes compute checks but never use them**
  - Affects: [src/app/api/orgs/[id]/tickets/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/orgs/[id]/tickets/route.ts), [src/app/api/orgs/[id]/members/route.ts](/home/r2d2c3p0/NEWPROPATI_new/src/app/api/orgs/[id]/members/route.ts)
  - Details: These routes contain role/seat-limit logic, but the enforcement is incomplete or dependent on indirect branching.
  - Impact: Authorization intent and actual behavior can diverge as the code evolves.

## Build / Quality

- **B1. TypeScript build is blocked by malformed JSX**
  - Affects: [src/app/dashboard/tenant/payments/auto-pay/AutoPayConfigurationClient.tsx](/home/r2d2c3p0/NEWPROPATI_new/src/app/dashboard/tenant/payments/auto-pay/AutoPayConfigurationClient.tsx)
  - Details: The component has a syntax error around the button/card block, which stops `tsc --noEmit` and breaks the build.
  - Impact: Release blocker.

- **B2. Linting is extremely noisy**
  - Evidence: `npm run lint` reported more than one thousand warnings plus one parser error during the audit run.
  - Impact: Real defects are buried under noise, and the project is currently not lint-clean.

## Validation Notes

- Confirmed by direct file inspection and route tracing on July 16, 2026.
- `npm test` passed during the audit run, but that does not cover the route-level security and data-integrity issues above.
- `npx tsc --noEmit` fails on the auto-pay syntax error.
- `npm run lint` still reports a very large number of warnings and at least one parser error.

## Recommended Fix Order

1. Remove admin self-promotion from role/profile endpoints and make a single server-side role source of truth.
2. Fix the dashboard/server route guards so auth is enforced on the server, not only in client hydration.
3. Repair the payment and webhook paths: agreement binding, idempotency, webhook runtime error, and escrow release amount control.
4. Normalize ID validation to match Prisma IDs across all routes.
5. Fix the build blocker in the tenant auto-pay component.
6. Clean up the `realtor` legacy role references and align onboarding flow with one persisted role pipeline.
