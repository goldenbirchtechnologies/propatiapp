# Property360 Competitor Scope vs Propati

_Read-only benchmark. No code/build changes made._

## Source
- Reviewed live pages: `https://property360.africa`, Landlords, Tenants, Agents

---

## 1. Property360 Public Scope

### 1.1 Positioning
- Tagline: Property management software for Nigerian landlords
- Market: built in Lagos, Nigeria-first rent workflows

### 1.2 Landing / Public flows
- Marketing site with role landing sections: Landlords, Tenants, Agents
- Search homes by location on public landing
- Sign-up funnel: 60s sign-up → add property/join → lease/rent schedule → pay → wallet payout
- Waitlist / founding-landlord early access mechanic

### 1.3 Pricing model shown
- Solo: up to 2 properties
- Pro: up to 30 properties, AI-drafted agreements, WhatsApp delivery, manager seats
- Agency: up to 100 properties, bulk lease/invoice ops
- Custom: unlimited, SLA, migration assistance
- Annual with ~20% discount, 7-day free trial

### 1.4 Landlord capabilities
- Rent collection via Paystack/card/bank transfer/USSD
- Wallet with instant payouts to bank
- Automated recurring invoices and instant receipts
- Tenancy agreements in-app with e-sign, timestamp, IP, document hash
- Maintenance triage with photos/priority and audit trail
- Agent access with per-property permissions and revocation
- In-app chat replacing WhatsApp
- Reports: P&L, balance sheet, cash-flow exports
- Multi-property and multi-agent management
- Smart notifications

### 1.5 Tenant capabilities
- Browse listings tied to verified landlords
- Reserve in two taps
- Pay deposit and rent via Paystack with receipts
- In-app tenancy agreement signing
- Maintenance requests with photos and status tracking
- No browsing charge; sign up when ready to reserve

### 1.6 Agent capabilities
- Invite-only access to landlord properties
- Scoped permissions per property
- Add tenants, record payments, manage maintenance, upload agreements
- Action attribution/audit trail under agent name
- Single inbox across multiple landlords
- Commissions logged against lease; collected via Paystack; payout to bank

### 1.7 Non-functional claims
- Nigerian data residency focus
- KYC for every account
- WhatsApp delivery for invoices/reminders
- Mobile apps: App Store and Google Play

---

## 2. Propati Current Scope

### 2.1 Positioning
- Nigeria's first verified property marketplace
- Roles: landlord, tenant, agent, estate_manager, admin
- Additional role present in repo: realtor

### 2.2 Public surfaces
- `(public)/listings` search page with filters, mobile sheet, empty state
- `(public)/short-let` page
- Marketing/docs repo includes ARCHITECTURE, TRD, USER_JOURNEYS

### 2.3 Payments / finance
- Paystack integration with HMAC-SHA512 webhook
- Remita stamp duty / FIRS e-certificate workflow
- Evidence packs, subscriptions, revenue, and escrow-related admin surfaces
- Turnover task flow
- Payment initiation, callback, receipt, transaction detail pages for tenant
- `DIRECT_URL` vs pooler `DATABASE_URL` migration setup

### 2.4 Verification / trust
- 5-layer verification system documented
- Verification tiers: basic, verified, inspected, certified
- Admin verifications queue, evidence packs, business verifications
- CAC/business verification paths
- Document uploads via API

### 2.5 Roles and navigation
- Landlord: properties, rent, short-let calendar, screening, agreements, messages, verification, turnover, profile
- Tenant: find property, rent/payments, agreements, maintenance, screening, receipts, messages
- Agent: pipeline, listings, inspections, commissions, clients, reputation, messages
- Realtor: buy/sell pipeline, listings, profile, messages
- Estate manager: portfolio, service charges, utilities, ledger, maintenance, bulk import, agreements, team, billing, reports, turnover
- Admin: verifications, flagged listings, users, disputes, evidence packs, revenue, audit logs

### 2.6 Ops/Enterprise
- Admin auding logs
- Admin disputes, escrow, revenue
- Evidence packs
- Flagged listings
- Business subscriptions and subscription plans
- Documents/versioning surfaces

---

## 3. Gap Analysis

| Capability | Property360 | Propati | Notes |
|---|---|---|---|
| Public listing search + reserve flow | Yes | Yes | Propati has listings + search; reserve/booking flow less explicit |
| Wallet / instant payout | Yes | No direct wallet module | Propati uses Paystack payouts/webhooks, not an internal wallet |
| Automated invoices + receipts | Yes | Partial | Invoices/receipts exist in dashboard payment flows |
| In-app e-sign tenancy agreement | Yes | Yes | Agreement + PDF/sign routes present |
| Maintenance with photos + status | Yes | Yes | Present in tenant/landlord paths |
| Agent invite-only, scoped permissions | Yes | Partial | Agent role exists; permission model simpler than P360 |
| Single inbox / chat across properties | Yes | Partial | Messages exist per role, not clearly cross-property unified |
| Smart notifications | Yes | Partial | Notifications page exists |
| KYC for every account | Yes | Partial | 5-layer verification + Prembly/identity flows |
| Reports: P&L, balance sheet, cash flow | Yes | Partial | Revenue reports exist; no clear P&L/balance-sheet exports |
| Multi-property, multi-agent | Yes | Yes | Explicit in landlord and estate-manager areas |
| Estate communities | Yes | Partial | Estate manager role exists; community layer not clear |
| AI-drafted tenancy agreements | Yes | No | Agreements present; no AI-generation step surfaced |
| WhatsApp delivery | Yes | No | Termii exists; WhatsApp/Twilio not shown active |
| Valuation tooling | No public signal | No | Neither side shows this strongly |
| Marketplace listing feed | Yes | Yes | Public listings + short-let |
| Mobile apps | Yes | Not evidenced | Propati is web/Next only |
| Founding/early access campaign | Yes | No | Launch mechanics not documented here |
| Disputes / evidence packs | No public signal | Yes | Propati deeper here |

### 3.1 Differentiation opportunities
- Propati is already stronger on trust/admin: verification tiers, evidence packs, disputes, audit logs, business verification, document versioning, stamp duty/FIRS compliance
- Propati is broader role-wise with estate manager and realtor
- Property360 is stronger on landlord UX flow: wallet/payouts, reports, AI agreements, WhatsApp notifications
- Property360’s invite-only agent model is clearer; Propati agent flows look more self-serve

---

## 4. Recommended Next Steps
1. Write formal competitive scope doc from this analysis
2. Prioritize wallet/payout abstraction, accountant-friendly reports, and unified inbox
3. Validate whether mobile app/web app split matters for launch
4. Compare actual PRD/USER_JOURNEYS docs for missing flows before building
