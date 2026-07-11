# Propati — Execution Plan v2
Competitive-mapped scope additions. No code/build changes made yet.

## Objective
Close the UX/feature gaps against Property360 while doubling down on Propati’s existing strengths: trust/verification, compliance, ops/admin surfaces, and role breadth.

---

## 1. Mobile App Readiness

**Short answer: it is easy because the web is already the product.**

- **PWA path (fastest, 1–2 days):**
  - Add `public/manifest.json`
  - Add `/sw.js` for offline cache + basic stale-while-revalidate
  - Add `<meta name="theme-color">` and Apple touch icons
  - Enable web-push if needed; otherwise skip push for v1
- **Capacitor wrapper (1–2 weeks each platform):**
  - Wrap existing Next.js output into native App/Play binaries
  - Auth + webview compatibility with Clerk
- **React Native Web:** viable later if you need a separate mobile client; keep API routes shared

Recommendation: ship PWA now, then do native wrappers only if distribution requires App Store/Play presence.

---

## 2. Priority Matrix

| Feature | Priority | Effort | Dependencies | Wins |
|---|---|---|---|---|
| Wallet balance + payout requests | P0 | Medium | Paystack Transfers API | Core landlord monetization UX |
| Accountant-friendly exports | P0 | Low–Medium | Existing payment/transaction tables | Fastest visible ROI |
| Unified inbox | P0 | Medium | Conversations schema exists | Cross-property messaging |
| Smart notification orchestration | P1 | Medium | Termii/Twilio configured, notification-service exists | Churn reduction |
| Invite-only agent onboarding | P1 | Medium | Agent role exists | Parity with Property360 agent UX |
| Automated invoices + PDF receipts | P1 | Medium | Paystack webhook, PDF lib | Landlord productivity |
| Estate community layer | P2 | Larger | Estate manager role exists | Estate manager unlock |
| AI agreement draft polish | P2 | Medium | Agreement generation exists | Differentiator |
| WhatsApp delivery | P2 | Low | Twilio/Cloud API | Nigeria channel fit |

---

## 3. Timeline (4 Weeks, 2 Devs)

### Week 1 — Wallet + Payouts
- **Schema:** `Wallet`, `WalletTransaction`, `PayoutRequest`
- **API:** `POST /api/wallet/payout-request`, `GET /api/wallet/balance`
- **UI:** landlord wallet widget, payout history page

### Week 1–2 — Accountant Reports
- **API:** `GET /api/reports/export?type=p&l|csv|pdf`
- **Models:** read from existing `Transaction`, `Subscription`, `Agreement` tables
- **UI:** download buttons in landlord/estate-manager finance pages

### Week 2 — Unified Inbox
- **Schema:** extend `Conversation` to be role-agnostic; add `propertyId`, `participants`
- **API:** unify under `/api/conversations`
- **UI:** single inbox per role regardless of property count

### Week 3 — Notification Orchestration
- **Service:** wire `notification-service` to domain events: payment, agreement, verification, maintenance
- **UI:** notification preferences per channel, bell dropdown improvements

### Week 3 — Invite-Only Agents
- **Schema:** `AgentInvite` model; statuses: `pending`, `accepted`, `revoked`
- **APIs:** invite creation/accept/revoke; gate agent CRUD on invitation row
- **UI:** landlord agent management page, agent inbox invitation card

### Week 4 — Automated Invoices + PDF Receipts
- **Job:** cron/queue to generate rent invoices 24h before due
- **PDF:** receipt generation on successful Paystack webhook
- **UI:** landlord invoice list, tenant receipt history

### Week 4–5 — Estate Community Layer
- **Schema:** `EstateCommunity`, `EstateAnnouncement`, `SharedMaintenance`, `CommunityLedger`
- **APIs:** estate-only CRUD
- **UI:** estate notice board, shared maintenance tracker

### Ongoing / Backlog
- AI agreement polish
- WhatsApp delivery template + config
- PWA manifest + offline + push

---

## 4. Acceptance Criteria

### Wallet
- Landlord sees current wallet balance on dashboard
- Payout request form validates amount/account
- Payout status visible in history
- Failure path: insufficient balance, invalid account

### Reports
- CSV export parses correctly in Excel/Sheets
- PDF income statement shows property-level P&L
- Download endpoint protected by role/ownership

### Unified Inbox
- One conversation thread per property + user pair
- Unread counts accurate across all properties
- Navigation shows single Messages entry regardless of book size

### Notifications
- In-app bell badge updates without refresh
- SMS delivered for payment events
- Preferences toggle respected per channel

### Agent Invite
- Landlord can invite agent to specific property
- Agent cannot act until accepted
- Revocation blocks future actions immediately

### Invoices + Receipts
- Invoice generated 24h before rent due
- PDF receipt attached in-app and email
- Receipt searchable from tenant dashboard

---

## 5. What Propati Keeps Over Property360

- Trust/verification: 5-layer system, evidence packs, CAC/business verification
- Compliance: stamp duty/FIRS workflow, document versioning, audit logs
- Role breadth: estate manager + realtor
- Admin depth: disputes, escrow, flagged listings, revenue

---

## 6. Docs Gaps Found
- Reservation/booking state machine not documented end-to-end
- Wallet/payout journey missing
- Landlord financial report stories missing
- Agent invite journey missing
- Estate community journey missing
- Invoice/receipt automation journey not documented

Fix these narratives in `docs/USER_JOURNEYS.md` and `docs/PRD.md` before building to avoid scope drift.

---

## 7. Recommended Next Decision

Start with either:
1. **Wallet + Payouts** — biggest landlord UX gap vs Property360
2. **Unified Inbox** — unblocks multi-property agents/landlords immediately
3. **Accountant Reports** — fastest shipped value

Pick one and I’ll break it into actionable tickets.
