# PROPATI — Agent Invite & Cross-Dashboard Flow Fix Plan

**Status:** Draft  
**Target:** Fix agent invite flow, connect agent ↔ landlord ↔ tenant dashboards  
**Scope:** Schema, API, Server Components, Client Components, Notifications  

---

## 1. Current State Audit

### What exists today
- `prisma/schema.prisma`: `AgentInvite` model with `id, landlordId, agentId, email, token, status, acceptedAt, revokedAt`
- `src/app/api/agent-invites/route.ts`: GET list + POST create
- `src/app/api/agent-invites/[id]/accept/route.ts`: Accept only updates `AgentInvite.status = accepted`
- `src/app/api/agent-invites/[id]/revoke/route.ts`: Revoke only updates `AgentInvite.status = revoked`
- `src/app/dashboard/landlord/agents/page.tsx`: Lists properties, renders `AgentInviteManagementClient`
- `src/app/dashboard/landlord/agents/AgentInviteManagementClient.tsx`: Collects email, permissions, scope, listingIds but POST drops permissions/scope/listingIds
- `src/app/dashboard/agent/invites/page.tsx`: Shows pending invites for agent’s email
- `src/components/agent-invites/AgentInvitationCard.tsx`: Accept button
- `src/app/dashboard/agent/listings/page.tsx`: Queries `listing.agentId === user.id`

### Root causes
1. **Schema under-specified**: `AgentInvite` has no `permissions`, `scope`, or `listingIds` storage.
2. **Accept has no side effects**: Does not update `Listing.agentId`, does not create assignments, does not notify landlord.
3. **Email not sent**: Token generated but never delivered.
4. **No cross-role data model**: `Conversation` lacks `agentId`; tenant dashboard has no agent visibility.
5. **Agent dashboard is blind to invites**: Only `listings?agentId=me` works; no fallback via `AgentInvite`.
6. **Landlord dashboard lacks assignment view**: No live “agent ↔ listing” mapping.

---

## 2. Goals

1. **Functional invite flow**: landlord invites → agent accepts → listings assigned.
2. **Permission-aware access**: permissions stored and enforced at API layer.
3. **Cross-dashboard visibility**: landlord sees assigned agents; agent sees managed properties; tenant can see agent context.
4. **Email delivery**: real invite links via email provider.
5. **Backward compatible**: existing invite records and pages keep working.

---

## 3. Phased Fix Plan

### PHASE A — Schema & Data Model (Prisma)
*Goal: Persist what the UI already collects; introduce assignment link.*

| Task | File | Change |
|------|------|--------|
| A.1 | `prisma/schema.prisma` | Add `permissions Json`, `scope String`, `listingIds Json`, `message Text` to `AgentInvite`. |
| A.2 | `prisma/schema.prisma` | Add `AgentAssignment` model: `id, inviteId, agentId, listingId, permissions Json, scope, status, createdAt`. Unique on `agentId + listingId`. |
| A.3 | `prisma/schema.prisma` | Add `agentId` nullable to `Conversation` (if missing). |
| A.4 | Migration | Generate migration, verify Supabase apply (`prisma migrate dev` or `db execute` fallback). |
| A.5 | `prisma/seed.ts` | Add seed data for invite + assignment if needed for tests. |

### PHASE B — Backend API
*Goal: Make endpoints mutate the right data and enforce permissions.*

| Task | File | Change |
|------|------|--------|
| B.1 | `src/app/api/agent-invites/route.ts` | POST: store `permissions`, `scope`, `listingIds`, `message` in `AgentInvite`. |
| B.2 | `src/app/api/agent-invites/[id]/accept/route.ts` | On accept: create `AgentAssignment` rows for scoped listings, update `Listing.agentId` where applicable, emit notifications. |
| B.3 | `src/app/api/agent-invites/[id]/revoke/route.ts` | On revoke: null out `Listing.agentId` for assigned listings, delete assignments, notify. |
| B.4 | `src/app/api/agent-invites/[id]/route.ts` | Add GET for single invite detail (permissions, listing scope). |
| B.5 | `src/app/api/agent/listings/route.ts` | New endpoint: listings accessible via `AgentAssignment` + direct `agentId`. |
| B.6 | `src/lib/api-auth.ts` | Add permission gate helper: `requireAgentPermission(user, listingId, permission)`. |
| B.7 | `src/lib/notifications.ts` | Add `notifyAgentInviteSent`, `notifyAgentInviteAccepted`, `notifyAgentRevoked`. |

### PHASE C — Email Delivery
*Goal: Send actual invite emails with accept links.*

| Task | File | Change |
|------|------|--------|
| C.1 | `src/lib/email.ts` | Add `sendAgentInviteEmail({ to, landlordName, acceptUrl })` using existing provider. |
| C.2 | `src/app/api/agent-invites/route.ts` | Call email service after creating invite. |
| C.3 | Env vars | Document required mail provider env vars (`EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM`). |

### PHASE D — Landlord Dashboard Integration
*Goal: Show real assignment state, not just invites.*

| Task | File | Change |
|------|------|--------|
| D.1 | `src/app/dashboard/landlord/agents/page.tsx` | Query `AgentInvite` + `AgentAssignment` to show status of each agent per listing. |
| D.2 | `src/app/dashboard/landlord/agents/AgentInviteManagementClient.tsx` | Show accepted/revoked invites, show which listings assigned, allow reassignment. |
| D.3 | `src/app/dashboard/landlord/properties/PropertiesClient.tsx` | Show assigned agent avatar/name per property card. |
| D.4 | `src/app/dashboard/landlord/properties/[id]/page.tsx` | Add “Assigned Agent” panel with permissions. |

### PHASE E — Agent Dashboard Integration
*Goal: Agent sees managed properties and landlords regardless of direct `agentId`.*

| Task | File | Change |
|------|------|--------|
| E.1 | `src/app/dashboard/agent/listings/page.tsx` | Query via `AgentAssignment` fallback: where `agentId = user.id OR assignments.agentId = user.id`. |
| E.2 | `src/app/dashboard/agent/page.tsx` | Add counters: Managed Properties, Active Listings, Pending Invites. |
| E.3 | `src/app/dashboard/agent/invites/page.tsx` | After accept, redirect to `/dashboard/agent/listings` with toast. |
| E.4 | `src/app/dashboard/agent/clients/page.tsx` | Surface landlords from `AgentInvite.sender` + `AgentAssignment`, not just conversations. |

### PHASE F — Tenant Dashboard Integration
*Goal: Tenant can see agent context in relevant flows.*

| Task | File | Change |
|------|------|--------|
| F.1 | `src/app/dashboard/tenant/agreements/page.tsx` | If agreement listing has `agentId`, show agent card. |
| F.2 | `src/app/dashboard/tenant/messages/page.tsx` | If conversation has `agentId`, show agent in thread header. |
| F.3 | `src/app/api/messages/route.ts` | Ensure agent can read/write when `conversation.agentId === user.id`. |

### PHASE G — Permission Enforcement
*Goal: Prevent unauthorized agent actions.*

| Task | File | Change |
|------|------|--------|
| G.1 | `src/lib/api-auth.ts` | Add `withAgentAccess(request, listingId, requiredPermission)` helper. |
| G.2 | Listing mutation APIs | Wrap edit/delete/image-upload endpoints with agent permission check. |
| G.3 | Frontend | Hide/show action buttons based on `hasPermission('edit_listings')`. |

### PHASE H — Testing & Verification
*Goal: Confirm end-to-end flow works.*

| Task | File | Change |
|------|------|--------|
| H.1 | Unit test | Agent invite create + accept creates assignments. |
| H.2 | Integration test | Agent can fetch listings via assignment. |
| H.3 | E2E smoke test | Landlord invites → agent accepts → agent sees listings. |
| H.4 | Manual QA | All 3 dashboards show correct agent/landlord/tenant context. |

---

## 4. Acceptance Criteria

1. Landlord invites agent → agent receives email → agent accepts → agent sees managed listings.
2. Revoking invite removes agent access and clears `Listing.agentId` for scoped listings.
3. Agent dashboard shows managed properties even without direct `Listing.agentId`.
4. Tenant agreements/messages show assigned agent when present.
5. Permissions from invite are enforced on listing mutation APIs.
6. No breaking changes to existing invite records.

---

## 5. File Inventory

### New files
- `src/app/api/agent-assignments/route.ts`
- `src/app/api/agent/listings/route.ts`
- `src/lib/agent-access.ts`

### Modified files
- `prisma/schema.prisma`
- `src/app/api/agent-invites/route.ts`
- `src/app/api/agent-invites/[id]/accept/route.ts`
- `src/app/api/agent-invites/[id]/revoke/route.ts`
- `src/app/dashboard/landlord/agents/page.tsx`
- `src/app/dashboard/landlord/agents/AgentInviteManagementClient.tsx`
- `src/app/dashboard/landlord/properties/PropertiesClient.tsx`
- `src/app/dashboard/agent/listings/page.tsx`
- `src/app/dashboard/agent/page.tsx`
- `src/app/dashboard/agent/invites/page.tsx`
- `src/app/dashboard/agent/clients/page.tsx`
- `src/app/dashboard/tenant/agreements/page.tsx`
- `src/app/dashboard/tenant/messages/page.tsx`
- `src/lib/api-auth.ts`
- `src/lib/email.ts`
- `src/lib/notifications.ts`

---

## 6. Open Questions / Decisions Needed

1. Should an agent be auto-added as `OrgMember` when invited? Likely yes for org properties, no for individual landlord properties.
2. Should `Listing.agentId` be set on accept for all scoped listings, or should assignments be the source of truth? Recommendation: set `Listing.agentId` for backward compatibility; use `AgentAssignment` for scope/permissions.
3. Email provider: use existing `src/lib/email.ts` or add Resend/SendGrid? Recommendation: extend existing if it already wraps an SMTP provider.
4. Should tenants be able to see agent contact info? Recommendation: yes, masked phone/email only after agreement is signed.
