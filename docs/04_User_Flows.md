# 04 – User Flows

## Flow Index

| # | Flow | Status |
|---|------|--------|
| F1 | Tenant search and apply | Built |
| F2 | Tenant pay rent | Built |
| F3 | Tenant raise maintenance | Built |
| F4 | Landlord create listing | Built |
| F5 | Landlord verify property | Built |
| F6 | Landlord collect rent | Built |
| F7 | Agent manage listings | Built |
| F8 | Agent deal pipeline | Partial |
| F9 | Estate manager onboarding | Built |
| F10 | Estate manager portfolio ops | Built |
| F11 | Admin verification review | Built |
| F12 | Admin dispute mediation | Built |
| F13 | Agreement e-signature | Built |
| F14 | Short-let instant booking | Planned |
| F15 | Realtor sale pipeline | Planned |
| F16 | Law firm review | Planned |

## F1 — Tenant Search and Apply

1. Tenant signs in → Clerk auth → Prisma `User` lookup
2. Opens `/dashboard/tenant/search` (or public `/listings`)
3. `GET /api/listings` with query params (`q`, `listingType`, `propertyType`, `minPrice`, `maxPrice`, `bedrooms`, `area`, `state`, `verificationTier`)
4. Results render `ListingCard` grid with cover image, price, address, verification badge
5. Tenant opens listing detail → `/listings/[id]`
6. Actions: Save (`POST /api/listings/[id]/save`), Flag (`POST /api/listings/[id]/flag`), Apply (`POST /api/applications`)
7. On apply: `Application` created, landlord notified, conversation auto-created

## F2 — Tenant Pay Rent

1. Tenant opens Rent & Payments → `/dashboard/tenant/payments`
2. Views rent schedule from `RentSchedule` entries tied to `Agreement`
3. Taps Pay → `POST /api/payments/initiate` creates `Transaction` (status `pending`) and returns Paystack `authorization_url`
4. Tenant completes checkout → Paystack redirects
5. Paystack webhook `POST /api/webhook/paystack` validates HMAC-SHA512, updates `Transaction.status = in_escrow`, generates receipt
6. Tenant sees receipt in app and email

## F3 — Tenant Raise Maintenance

1. Tenant opens Maintenance → `/dashboard/tenant/maintenance`
2. Submits form → `POST /api/orgs/[id]/tickets` (or landlord-linked maintenance)
3. Uploads photo → stored via Cloudinary
4. Ticket status: `open → assigned → in_progress → resolved → closed`
5. Tenant receives notification on status change

## F4 — Landlord Create Listing

1. Landlord opens Add Listing → `/dashboard/landlord/listing/new`
2. Multi-step form: property details, pricing, amenities, images
3. `POST /api/listings` creates `Listing` + `Verification` record
4. Images uploaded to Cloudinary
5. Listing status: `draft` until activated

## F5 — Landlord Verify Property

1. Landlord opens Verify Property → `/dashboard/landlord/verify`
2. Runs 5-layer wizard: Documents → Identity → Video → Inspection → Certification
3. Each layer calls corresponding verification API route
4. Admin reviews and approves/rejects at each step
5. Final: `certified` badge on listing

## F6 — Landlord Collect Rent

1. Landlord views active agreements
2. Rent schedule auto-generated on `fully_signed`
3. Tenant pays via flow F2
4. Landlord sees transaction in history
5. Escrow release: Admin or automated → `Transaction.status = released`

## F7 — Agent Manage Listings

1. Agent opens Managed Listings → `/dashboard/agent/listings`
2. Filtered by `agentId`
3. Create/edit listings on behalf of landlord
4. Request inspections → `POST /api/verification/request-inspection`

## F8 — Agent Deal Pipeline

1. Agent opens Deal Pipeline → `/dashboard/agent/pipeline`
2. Kanban or list view of deals by stage
3. Advance stages: Enquiry → Viewing → Offer → Agreement → Completed
4. Commission auto-calculated from linked `Transaction`

## F9 — Estate Manager Onboarding

1. Signs up as estate_manager → role persisted
2. Creates Organisation → `POST /api/orgs`
3. Subscribes → `POST /api/orgs/[id]/subscribe` via Paystack
4. Invites team → `POST /api/orgs/[id]/members`
5. Bulk imports units → `POST /api/orgs/[id]/bulk-upload`

## F10 — Estate Manager Portfolio Ops

1. Views portfolio → `/dashboard/estate-manager/portfolio`
2. Reviews stats: total units, occupancy rate, monthly rent
3. Manages rent ledger → `/dashboard/estate-manager/ledger`
4. Exports CSV
5. Manages maintenance tickets → `/dashboard/estate-manager/maintenance`

## F11 — Admin Verification Review

1. Admin opens `/admin/verifications`
2. Reviews queue → `GET /api/admin/verification-queue`
3. Approves/rejects per layer → `POST /api/admin/verifications/[id]/approve`
4. Listing tier updates automatically

## F12 — Admin Dispute Mediation

1. Admin opens `/admin/disputes`
2. Reviews dispute details and evidence
3. Issues ruling → `POST /api/disputes/[id]/action`
4. Status: `open → investigating → mediated → resolved → closed`

## F13 — Agreement E-Signature

1. Agreement created → `POST /api/agreements` (status `draft`)
2. Landlord signs → `POST /api/agreements/[id]/sign`
3. Tenant signs → `POST //api/agreements/[id]/sign`
4. State machine: `draft → pending_landlord → pending_tenant → tenant_signed/landlord_signed → fully_signed`
5. On `fully_signed`: rent schedule generated, notification sent
6. PDF generated → uploaded to Cloudinary → served via `/api/agreements/[id]/pdf`

## F14–F16 — Planned Flows

See `docs/PROPTECH.md` and `docs/03_User_Journey_Maps.md` for planned journeys J12–J14.
