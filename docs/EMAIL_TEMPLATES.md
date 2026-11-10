# PropatiBox — Email Notification Catalog (Resend)

Every notification the app can emit, what triggers it, who receives it, and what
variables a Resend template needs. Derived from the code on
`feat/identity-paystack-provisioning`.

---

## 1. Current state

| Fact | Value |
|---|---|
| Provider | Resend (`resend` SDK) |
| Entry point | `src/lib/email.ts` → `sendEmail()` |
| Compat re-export | `src/lib/email/email-service.ts` |
| Mock mode | Active automatically when `RESEND_API_KEY` is unset — logs to console, returns `true` |
| From address | `process.env.EMAIL_FROM \|\| 'PropatiBox <noreply@resend.dev>'` |
| App URL | `process.env.NEXT_PUBLIC_APP_URL \|\| 'https://propati.ng'` |
| Multi-channel orchestrator | `src/lib/notification-service.ts` (`notifyUsersForEvent`) |

**Important architectural fact:** `notifyUsersForEvent()` supports
`'inapp' | 'email' | 'sms' | 'whatsapp'`, but **every single call site passes
`channels: ['inapp']`**. So today the only real emails leaving the system are
verification updates, invitations, password resets, and the contact form. Every
payment, agreement and maintenance notification exists only in the in-app bell.

That is the gap your Resend templates should close.

Three env vars to set:

```
RESEND_API_KEY=re_...
EMAIL_FROM=PropatiBox <notifications@propati.ng>
NEXT_PUBLIC_APP_URL=https://propati.ng
```

> Any `@resend.dev` address is Resend's sandbox: it only delivers to your own
> Resend account email. You need a verified domain (`propati.ng`) before any of
> this reaches real users.

---

## 2. Emails that send today (build these first)

14 live send scenarios, collapsing to **7 distinct templates**.

| # | Template key | Trigger | Recipient | Subject line | Variables |
|---|---|---|---|---|---|
| 1 | `verification-update` | Layer 1 approved | Listing owner | `Verification Update: {{listing_title}} - Layer 1 Approved` | `name`, `listing_title`, `layer`, `status`, `next_steps` |
| 2 | `verification-update` | Layer 1 rejected | Listing owner | `Verification Update: {{listing_title}} - Layer 1 Rejected` | same |
| 3 | `verification-update` | Layer 2 rejected | Listing owner | `Verification Update: {{listing_title}} - Layer 2 Rejected` | same |
| 4 | `verification-update` | Fully certified | Listing owner | `🎉 Verification Certified: {{listing_title}}` | same |
| 5 | `verification-update` | Verification frozen | Listing owner | `Verification Frozen: {{listing_title}}` | same |
| 6 | `verification-update` | Inspection completed | Listing owner | `Inspection Completed: {{listing_title}}` / `Inspection Results: {{listing_title}}` | same |
| 7 | `agent-invite` | Landlord invites an agent | Agent's email | `You've been invited to join PropatiBox as an agent` | `agent_name`, `landlord_name`, `accept_url`, `listing_title` (opt), `message` (opt) |
| 8 | `password-reset` | Admin forces a reset | Target user | `Password Reset Request` | `user_name`, `reset_url` |
| 9 | `org-invite` | Invite to an org / estate | Invitee | `Invitation to join {{org_name}} on PropatiBox` | `inviter_name`, `org_name`, `accept_url` |
| 10 | `org-invite` | Property manager invited | Invitee | `Invitation to join {{org_name}} on PropatiBox` | same as #9 |
| 11 | `org-reinvite` | Removed member re-invited | Member | `You're invited back to {{org_name}} on PropatiBox` | `inviter_name`, `org_name`, `accept_url` |
| 12 | `org-reinvite` | Property manager re-invited | Member | `You've been invited back to {{org_name}} on PropatiBox` | same as #11 |
| 13 | `owner-claim-invite` | Estate manager invites an owner to claim a property | Owner's email | `Property ownership invitation from {{inviter_name}} on PropatiBox` | `inviter_name`, `listing_title`, `accept_url` |
| 14 | `contact-form` | Public contact form submitted | Support inbox | `[PropatiBox Contact] {{subject}} — {{name}}` | `name`, `email`, `subject`, `message` |

Source files:
- #1–6 → `src/lib/verification.ts`, `src/app/api/verification/inspections/[id]/complete/route.ts`
- #7 → `src/app/api/agent-invites/route.ts` → `sendAgentInviteEmail()`
- #8 → `src/app/api/admin/users/[id]/reset-password/route.ts`
- #9, #11 → `src/app/api/orgs/[id]/members/route.ts`
- #10, #12 → `src/app/api/dashboard/estate-manager/property-manager-invites/route.ts`
- #13 → `src/app/api/orgs/[id]/owner-invites/route.ts`
- #14 → `src/app/api/contact/route.ts`

Note: #9–#13 build their HTML inline in the route file rather than using
`emailTemplates`. Moving them into Resend removes that duplication.

---

## 3. In-app only — reactivate as emails (highest value)

These write a `Notification` row and never email. Each is a candidate for
`channels: ['inapp', 'email']` once a template exists.

### Payments

| Notification title | Trigger | Recipient | Body variables |
|---|---|---|---|
| `Payment Initiated` | Tenant/landlord starts a Paystack payment | Payee + agent | `amount`, `listing_title`, `manager_note`, `agent_note`, `reference` |
| `Payment Verified` | Paystack verification succeeds | Payer | `amount`, `listing_title`, `transaction_id` |
| `Payment Received in Escrow` | Same event | Payee | `amount`, `listing_title`, `transaction_id` |
| `Commission Pending` | Same event, agent attached | Agent | `amount`, `listing_title` |
| `Payment Verification Failed` | Paystack verification fails | Payer | `gateway_response`, `reference` |
| `Funds Released` | Escrow released | Payee | `amount`, `account_number`, `transfer_reference` |
| `Escrow Released` | Escrow released | Payer | `amount`, `listing_title` |
| `Commission Available` | Escrow released, commission > 0 | Agent | `amount`, `listing_title` |
| `Commission Released` | Split release to agent | Agent | `amount`, `listing_title` |
| `Invoice Sent` | Landlord sends an invoice | Tenant | `invoice_type`, `invoice_number`, `listing_title`, `currency`, `amount` |
| `Invoice Paid` | Landlord marks invoice paid | Tenant | `invoice_number`, `listing_title` |

Sources: `src/app/api/payments/initiate/route.ts`,
`src/app/api/payments/verify/[reference]/route.ts`,
`src/app/api/payments/release-escrow/[id]/route.ts`,
`src/app/api/payments/[id]/release/route.ts`,
`src/app/api/invoices/[id]/send/route.ts`,
`src/app/api/invoices/[id]/mark-paid/route.ts`

### Agreements

| Notification title | Trigger | Recipient | Body variables |
|---|---|---|---|
| `New Agreement Draft` | Agreement created | Tenant | `agreement_type`, `listing_title`, `agreement_url` |
| `Agreement Fully Signed` | All parties signed | Landlord, tenant, agent | `listing_title`, `agreement_url` |

Sources: `src/app/api/agreements/route.ts`, `src/app/api/agreements/[id]/sign/route.ts`

### Maintenance

| Notification title | Trigger | Recipient | Body variables |
|---|---|---|---|
| `Maintenance Ticket Created` | Ticket raised | Assignees | `listing_title`, `priority`, `ticket_url` |
| `Maintenance Ticket Assigned` | Assignee changed | Assignee | `listing_title`, `ticket_url` |
| `Maintenance Ticket In Progress` | Status → `in_progress` | Parties | `listing_title`, `ticket_url` |
| `Maintenance Ticket Resolved` | Status → `resolved` | Parties | `listing_title`, `ticket_url` |
| `Maintenance Ticket Closed` | Status → `closed` | Parties | `listing_title`, `ticket_url` |
| `Maintenance Ticket Updated` | Any other edit | Parties | `listing_title`, `ticket_url` |

Sources: `src/app/api/orgs/[id]/tickets/route.ts`,
`src/app/api/orgs/[id]/tickets/[ticketId]/route.ts`

### Agent lifecycle

| Notification title | Trigger | Recipient | Body variables |
|---|---|---|---|
| `Agent Invite Sent` | Invite dispatched | Landlord | `agent_email`, `listing_title` |
| `Agent Invite Accepted` | Agent accepts | Landlord + agent | `listing_count`, `invite_id` |
| `Agent Access Revoked` | Landlord revokes | Landlord + agent | `listing_count` |

Source: `src/lib/notifications.ts`

### Admin oversight

| Notification title | Trigger | Recipient | Body variables |
|---|---|---|---|
| Verification event (title-cased event name) | Any verification transition | All admins | `event`, arbitrary metadata |

Source: `src/lib/verification.ts` → `notifyAdmins()`

---

## 4. Dormant templates already written

These exist in `emailTemplates` in `src/lib/email.ts` but **nothing calls them**.
Either wire them up and convert to Resend, or delete them as dead code.

| Template key | Signature | Intended trigger |
|---|---|---|
| `welcome` | `name, loginUrl` | Post-onboarding |
| `rentDue` | `name, propertyTitle, amount, dueDate, payUrl` | Rent reminder (cron) |
| `paymentConfirmed` | `name, amount, propertyTitle, receiptUrl` | Escrow release / payment success |
| `agreementReady` | `name, agreementTitle, signUrl` | Counterparty signature needed |
| `orgInvite` | `inviterName, orgName, acceptUrl` | Superseded by inline org invite |
| `maintenanceUpdate` | `name, ticketTitle, status, details` | Superseded by in-app only |
| `listingApproved` | `name, listingTitle, viewUrl` | Admin approves listing |
| `listingRejected` | `name, listingTitle, reason, editUrl` | Admin rejects listing |
| `offerReceived` | `name, propertyTitle, offerAmount, offerUrl, message` | Tenant submits offer |
| `documentExpiring` | `name, documentTitle, expiresAt, renewUrl` | Compliance doc expiry (cron) |
| `reviewRequested` | `name, propertyTitle, ratingUrl` | Post-tenancy review |
| `messageNotification` | `recipientName, senderName, messagePreview, messageUrl` | New chat message |
| `inspectionScheduled` | `name, propertyTitle, scheduledAt, address, inspectorName` | Inspection booked |

---

## 5. Not implemented at all — no notification, no email

Worth deciding on before you build templates, since these are real user journeys:

- **Tenant applications** — `src/app/api/applications/` creates no notification when an application is submitted, accepted, or rejected.
- **Screening calls** — `src/app/api/screening-calls/` is silent.
- **Listing moderation** — approval/rejection is not wired to the existing dormant templates.
- **In-app messaging** — `messageNotification` template is dormant; DMs send no email.
- **Onboarding completion** — no welcome email is sent.
- **Document / compliance expiry** — `documentExpiring` is dormant; needs a cron.
- **Rent due reminders** — `rentDue` is dormant; needs a cron.

---

## 6. Recommended Resend build order

**Wave 1 — already sending, just migrate (7 templates)**
`verification-update`, `agent-invite`, `password-reset`, `org-invite`,
`org-reinvite`, `owner-claim-invite`, `contact-form`

**Wave 2 — money, because silence here costs trust (5 templates)**
`payment-initiated`, `payment-verified-escrow`, `escrow-released`,
`payment-failed`, `invoice-sent`

**Wave 3 — lifecycle (4 templates)**
`agreement-ready`, `agreement-fully-signed`, `maintenance-ticket-updated`,
`listing-approved-or-rejected`

**Wave 4 — growth / retention (3 templates)**
`welcome`, `review-requested`, `rent-due-reminder`

---

## 7. Variable convention

Use snake_case in Resend so the mapping to Prisma fields is obvious:

| Resend variable | Source (Prisma / derived) |
|---|---|
| `name` / `user_name` | `User.fullName` |
| `listing_title` | `Listing.title` |
| `org_name` | `Organization.name` |
| `inviter_name` | `User.fullName` of actor |
| `amount` | Pre-formatted `₦1,250,000` — format server-side, not in the template |
| `amount_raw` | Numeric kobo/NGN for any logic |
| `currency` | `Invoice.currency` |
| `accept_url` / `action_url` | Absolute URL built from `NEXT_PUBLIC_APP_URL` |
| `listing_url` | `{{app_url}}/listings/{{listing_id}}` |

Two rules that will save you debugging:

1. **Format money before it reaches the template.** The codebase does this
   everywhere with `new Intl.NumberFormat('en-NG', { style: 'currency',
   currency: 'NGN' })`, sometimes dividing kobo by 100 first. Resend templates
   have no arithmetic — pass `amount` already formatted.
2. **Always pass `accept_url` fully absolute.** Every inline template in the repo
   builds these from `NEXT_PUBLIC_APP_URL`, and a relative URL in an email is a
   dead link.

---

## 8. Suggested branding baseline

Every existing template uses the same shell — replicate it so Resend emails match
the product:

| Token | Value |
|---|---|
| Body font | `Inter, system-ui, sans-serif` |
| Container | `max-width: 600px; margin: 0 auto` |
| Heading colour | `#1e3a5f` (PropatiBox navy) |
| Button background | `#1e3a5f`, white text |
| Button padding | `12px 24px`, radius `6px` |
| Muted text | `#74777e`, 12px |
| Divider / quote rule | `3px solid #1e3a5f` |

Reminder: emails need inline styles and table-based layout — Tailwind classes in
`src/app` do not carry over to email clients.
