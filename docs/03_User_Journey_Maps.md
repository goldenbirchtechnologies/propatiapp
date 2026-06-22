# 03 – User Journey Maps

## Journey Map Index

| # | Role | Journey Name | Status |
|---|------|--------------|--------|
| J1 | Tenant | Find and rent a property | Built |
| J2 | Tenant | Pay rent and manage tenancy | Built |
| J3 | Tenant | Raise maintenance and communicate | Built |
| J4 | Landlord | List a property and get certified | Built |
| J5 | Landlord | Manage tenants and collect rent | Built |
| J6 | Landlord | Resolve disputes and manage listings | Built |
| J7 | Agent | Onboard and manage listings | Built |
| J8 | Agent | Run deal pipeline and earn commission | Partial |
| J9 | Estate Manager | Onboard org and import portfolio | Built |
| J10 | Estate Manager | Operate ledger, maintenance, and billing | Built |
| J11 | Admin | Review verifications and moderate platform | Built |
| J12 | Short-let Guest | Instant booking and stay | Planned |
| J13 | Realtor | List and transact property sales | Planned |
| J14 | Law Firm | Review agreements and resolve disputes | Planned |

---

## J1 — Find and Rent a Property (Tenant)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Signs up as tenant | Clerk account created; role persisted to DB | Clear |
| 2 | Completes onboarding | `/onboarding` wizard persists preferences | Guided |
| 3 | Searches listings | `GET /api/listings` with filters | Empowered |
| 4 | Refines by type/price/bedrooms | Re-query with filter params | Efficient |
| 5 | Opens listing detail | Gallery, specs, verification badge, CTA | Informed |
| 6 | Saves listing | `POST /api/listings/[id]/save` | Interested |
| 7 | Applies to listing | `POST /api/applications` creates application + notifies landlord | Committed |
| 8 | Receives landlord message | Conversation created; notification sent | Connected |
| 9 | Accepts screening call | Scheduled via `ScreeningCall` record | Collaborative |
| 10 | Signs agreement | `POST /api/agreements/[id]/sign` with audit trail | Formal |
| 11 | Pays first rent | `POST /api/payments/initiate` → Paystack checkout | Secure |
| 12 | Enters tenancy | Rent schedule active; reminders scheduled | Stable |

**Success Metrics:** Time from sign-up to first application < 15 minutes.

---

## J2 — Pay Rent and Manage Tenancy (Tenant)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Opens Rent & Payments | Tenant dashboard shows active agreements | Organized |
| 2 | Views rent schedule | `RentSchedule` entries by agreement | Clear |
| 3 | Taps Pay | `POST /api/payments/initiate` returns authorization URL | Trusted |
| 4 | Completes payment | Paystack redirects; webhook sets `in_escrow` | Confirmed |
| 5 | Receives receipt | Email + in-app receipt generated | Reliable |
| 6 | Sees updated balance | Schedule marks entry `paid` | Settled |
| 7 | Renews or vacates | Next cycle or end-of-tenancy flow | Flexible |

**Success Metrics:** Webhook-to-receipt time < 60 seconds.

---

## J3 — Raise Maintenance and Communicate (Tenant)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Opens Maintenance | Lists tenant's tickets and Create button | In control |
| 2 | Submits ticket | `POST /api/orgs/[id]/tickets` or landlord-linked ticket | Heard |
| 3 | Uploads photo | Attachment saved to storage | Evidenced |
| 4 | Receives status update | Notification on assignment/resolution | Informed |
| 5 | Messages landlord | Conversation tied to listing | Collaborative |

---

## J4 — List a Property and Get Certified (Landlord)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Signs up as landlord | Role persisted; redirect to landlord dashboard | Ready |
| 2 | Starts Add Listing form | Multi-step creation flow | Directed |
| 3 | Uploads images | Cloudinary media upload | Visual |
| 4 | Submits listing | `POST /api/listings` creates Listing + Verification record | Live |
| 5 | Submits Layer 1 documents | `POST /api/verification/upload-document` | Compliant |
| 6 | Completes identity layer | `POST /api/verification/verify-identity` | Verified |
| 7 | Records Layer 3 video | QR-coded upload | Authenticated |
| 8 | Requests inspection | Agent scheduled; Layer 4 completes | Physical |
| 9 | Receives certification | Admin approves; listing gets `certified` badge | Trusted |
| 10 | Sees certified listing | Search and detail show badge | Validated |

**Success Metrics:** Landlord time-to-certified < 10 days.

---

## J5 — Manage Tenants and Collect Rent (Landlord)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Views My Properties | Paginated list with status | Organized |
| 2 | Reviews applications | `GET /api/applications` filtered by landlord | Screening |
| 3 | Schedules screening call | `ScreeningCall` created; both parties notified | Collaborative |
| 4 | Generates agreement | `POST /api/agreements` from template_vars | Formal |
| 5 | Sends agreement to tenant | Notification and conversation message | Signing |
| 6 | Signs agreement | Audit trail created; state advances to `fully_signed` | Executed |
| 7 | Receives rent payment | Webhook confirms; transaction `released` after escrow | Paid |
| 8 | Responds to maintenance | Ticket queue; assignment and resolution | Managed |

---

## J6 — Resolve Disputes and Manage Listings (Landlord)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Reviews flagged listing | Admin context not shown to landlord | N/A |
| 2 | Raises dispute | `POST /api/disputes` with description | Protected |
| 3 | Provides evidence | Attachments linked to dispute record | Evidenced |
| 4 | Participates in mediation | Admin routes; final ruling issued | Resolved |

---

## J7 — Onboard and Manage Listings (Agent)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Signs up as agent | Agent role created; onboarding completes | Validated |
| 2 | Views Managed Listings | Filtered by `agentId` | Focused |
| 3 | Creates or updates listing | Creates/updates on landlord/org behalf | Productive |
| 4 | Requests inspection | Assigned to agent; inspection scheduled | Operational |
| 5 | Submits inspection report | Cloudinary PDF uploaded to Verification record | Active |

---

## J8 — Run Deal Pipeline and Earn Commission (Agent)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Opens Deal Pipeline | Kanban or list of active deals | Motivated |
| 2 | Advances deal stage | Local state update; server-side status optional | Progressing |
| 3 | Generates commission view | Commission from linked Transaction | Informed |
| 4 | Requests payout | Admin or automated release flow | Rewarded |

---

## J9 — Onboard Org and Import Portfolio (Estate Manager)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Signs up as estate_manager | Role persisted; onboarding completes | Started |
| 2 | Creates Organisation | `POST /api/orgs` with CAC, plan tier | Organized |
| 3 | Subscribes | `POST /api/orgs/[id]/subscribe` via Paystack | Secured |
| 4 | Invites team members | `POST /api/orgs/[id]/team` with pending invite | Scaled |
| 5 | Bulk imports units | `POST /api/orgs/[id]/bulk-upload` with CSV validation | Efficient |
| 6 | Links listings | `OrgListing` associations by org | Connected |

---

## J10 — Operate Ledger, Maintenance, and Billing (Estate Manager)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Reviews portfolio stats | Grouped unit + listing metrics | Strategic |
| 2 | Filters rent ledger | `GET /api/orgs/[id]/ledger` by period/status | Controlled |
| 3 | Exports ledger | CSV download from server | Transferable |
| 4 | Manages tickets | Create / assign / resolve via maintenance API | Operational |
| 5 | Reviews billing | Subscription status and next billing date | Predictable |
| 6 | Views reports | `GET /api/orgs/[id]/reports/[month]` | Insightful |

---

## J11 — Review Verifications and Moderate Platform (Admin)

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Opens Admin Dashboard | Stats cards: GMV, users, listings, revenue | Aware |
| 2 | Reviews verification queue | `GET /api/admin/verification-queue` | Disciplined |
| 3 | Approves or rejects | `POST /api/admin/verifications/[id]/approve` | Decisive |
| 4 | Reviews flagged listings | `GET /api/admin/flagged-listings` | Protective |
| 5 | Suspends or bans user | `POST /api/admin/users/[id]/suspend` | Enforcing |
| 6 | Mediates dispute | `POST /api/disputes/[id]/action` | Balanced |
| 7 | Reviews audit log | `GET /api/admin/audit-logs` | Accountable |

---

## J12 — Instant Booking and Stay (Short-let Guest) — Planned

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Searches short-let | Filter by dates, property type, price | Curious |
| 2 | Selects dates | Calendar validations and pricing | Confident |
| 3 | Books instantly | `POST /api/bookings` with instant result | Fast |
| 4 | Pays booking fee | Paystack checkout with deposit hold | Secure |
| 5 | Checks in | Agent or self check-in verification | Welcomed |
| 6 | Checks out | Review prompt and deposit release | Finished |

---

## J13 — List and Transact Property Sales (Realtor) — Planned

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Onboards as realtor | Distinct realtor role | Focused |
| 2 | Lists for sale | Sale agreement template | Professional |
| 3 | Manages buyer pipeline | Offers and negotiations | Active |
| 4 | Closes sale | Payment split + transfer + agreement | Complete |

---

## J14 — Review Agreements and Resolve Disputes (Law Firm) — Planned

| Step | Action | System Response | Emotion / Notes |
|------|--------|-----------------|-----------------|
| 1 | Joins law firm network | Verified firm profile | Accredited |
| 2 | Receives routed agreement | Proposed contract routed via `LawFirmCase` | Engaged |
| 3 | Reviews and approves | Amendment or certification | Validated |
| 4 | Handles arbitration | Dispute routed to firm | Reliable |
| 5 | Generates evidence pack | Exportable court-ready file | Authoritative |
