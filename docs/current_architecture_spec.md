# Architecture Spec: DOC-001 — Technical Requirements Document (TRD)

**Task ID:** DOC-001
**Phase:** Documentation
**Priority:** Critical
**Assigned to:** SoftwareArchitectAgent → CoreDeveloperAgent

---

## 1. Document Purpose
Create a comprehensive Technical Requirements Document for the PROPATI platform that serves as the single source of truth for architecture, APIs, data models, security, and infrastructure. Must be production-ready and enterprise-grade.

---

## 2. Source Materials (from oldpropati folder)
- `BACKEND_STRUCTURE.md` — Complete DB schema (22 tables), all API endpoints, indexes
- `TECH_STACK.md` — Frontend (vanilla JS, no framework), Backend (Node/Express/pg), Infra (Railway/Vercel/Supabase), 3rd party APIs, Security, Env vars
- `PRD.md` — Product requirements, features, revenue model, success metrics
- `APP_FLOW.md` — Complete user flows for all 5 roles, auth, messaging, sessions
- `FRONTEND_GUIDELINES.md` — Design system: typography, colors, components, layout, mobile, animations
- `IMPLEMENTATION_PLAN.md` — 10 phases with checkboxes, file change reference

---

## 3. TRD Structure (12 Sections)

### 3.1 System Overview
- High-level architecture diagram (mermaid)
- Technology stack table (from TECH_STACK.md)
- Deployment topology (Railway + Vercel + Supabase + Cloudinary)
- Data flow: request → middleware → handler → DB → response

### 3.2 Database Schema (Complete)
- All 22 tables with columns, types, constraints, indexes
- ERD diagram (mermaid)
- ID format conventions (usr_, lst_, cnv_, msg_, agr_, txn_, org_, tkt_)
- Migration strategy

### 3.3 API Specification (Complete)
- All endpoints grouped by domain (Auth, Listings, Verification, Agreements, Transactions, Users, Messages, Orgs, Admin, Payments, Webhooks)
- Request/response schemas with examples
- Auth requirements per endpoint
- Rate limiting rules

### 3.4 Authentication & Authorization
- JWT access (15min) + refresh (7d, bcrypt-hashed in DB)
- Silent token refresh flow
- Role-based access control matrix (5 roles × resources)
- Session persistence (localStorage + /api/auth/me)

### 3.5 Core Business Logic
- 5-layer property verification state machine
- Agreement signing flow (draft → pending → signed)
- Payment/escrow flow (Paystack webhook → in_escrow → release)
- Rent schedule generation (from agreement terms)
- Fee computation (rent 10%, sale 1-2%, agent commission)
- Notification triggers (email/SMS/in-app)

### 3.6 Third-Party Integrations
- Paystack: payments, subscriptions, transfers, webhooks
- Prembly IdentityPass: NIN/BVN/DL/PVC verification
- Termii: Nigerian SMS (OTP, rent reminders)
- Twilio: WhatsApp OTP
- Cloudinary: image/document storage (upload_stream)
- Nodemailer/Gmail: transactional email

### 3.7 Frontend Architecture
- Single-file SPA (index.html, ~420KB, ~7000 lines)
- State machine: STATE → setState → render() → bindEvents()
- Role-based theming (5 themes via CSS variables)
- Data-action delegated event handling
- Mobile-first responsive (sidebar → drawer, modals → bottom sheets)

### 3.8 Security Implementation
- Password hashing (bcrypt cost 12)
- NIN/BVN encryption (AES-256-GCM, random IV per value)
- HMAC-SHA256 for NIN lookup deduplication
- Helmet CSP, HSTS, noSniff, frameguard
- Rate limiting (global 300/15min, auth 10/15min)
- Input sanitization (express-mongo-sanitize, hpp)
- Parameterized queries only ($1, $2)
- Paystack webhook HMAC-SHA512 verification

### 3.9 Infrastructure & DevOps
- Railway: backend hosting, auto-deploy on push
- Vercel: frontend hosting, auto-deploy on push
- Supabase: PostgreSQL 15, connection pooler (port 5432)
- Cloudinary: CDN, folders propati/images, propati/documents
- GitHub: two repos (propati-backend, propati-frontend)
- Logging: Winston (error, warn, info, debug, security, auth)
- Cron: node-cron daily rent reminders (07:00 UTC)

### 3.10 Environment Configuration
- Complete .env schema (required + optional)
- Secret management (JWT_SECRET, ENCRYPTION_KEY, etc.)
- Feature flags via env vars

### 3.11 Testing & Quality
- No automated tests currently (gap)
- Manual QA checklist per role
- Console error audit process
- Mobile testing matrix

### 3.12 Future Extensibility
- WebSocket migration path (polling → WS)
- White-label Enterprise (org themes, custom domains)
- React Native mobile app (shared API)
- Multi-region deployment

---

## 4. Deliverable
**File:** `/mnt/c/Users/USER/Documents/NEWPROPATI/TRD.md`
**Format:** Markdown with mermaid diagrams, code blocks, tables
**Length:** ~8,000-10,000 words (production-grade detail)

---

## 5. Acceptance Criteria
- [ ] All 22 tables documented with columns, constraints, indexes
- [ ] All 100+ API endpoints specified with auth, params, responses
- [ ] Security implementation details complete
- [ ] Infrastructure topology documented
- [ ] Frontend architecture patterns explained
- [ ] Third-party integration specs with mock modes
- [ ] Mermaid diagrams for ERD, architecture, flows
- [ ] Cross-references to PRD features and APP_FLOW

---

*This spec is ready for CoreDeveloperAgent to write the TRD.md file.*
## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer
