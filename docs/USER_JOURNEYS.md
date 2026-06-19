# PROPATI — User Journey Flows

**Version:** 1.0  
**Source:** `oldpropati/APP_FLOW.md`, `oldpropati/FRONTEND_GUIDELINES.md`  
**Roles:** Landlord, Tenant, Agent, Admin, Estate Manager

---

## 1. Journey Mapping Methodology

Each journey follows: **Entry → Core Flow → Decision Points → Exit → Success Metrics**

---

## 2. Global Entry Flows

### 2.1 First Visit (Unauthenticated)

```mermaid
flowchart TD
    A[Visit propati.ng] --> B[renderLanding()]
    B --> C{Action?}
    C -->|Search/Filter| D[Browse listings]
    C -->|Click CTA| E[goto-login → renderLogin()]
    C -->|Sign In| E
    D --> F{Logged in?}
    F -->|No| E
    F -->|Yes| G[checkSession() → Dashboard]
```

### 2.2 Return Visit (Authenticated)

```mermaid
flowchart TD
    A[Visit propati.ng] --> B[render() → checkSession()]
    B --> C{valid token?}
    C -->|Yes| D[GET /api/auth/me → restore STATE]
    C -->|No, refresh valid| E[POST /api/auth/refresh → retry]
    C -->|Expired| F[logout → landing]
    D --> G[enterDashboard(user)]
    E --> G
    G --> H[Role-specific dashboard]
```

### 2.3 Authentication Flow

```mermaid
flowchart TD
    A[renderLogin()] --> B{Mode?}
    B -->|Login| C[Role Picker → Email+Password]
    B -->|Signup| D[Role Picker → Full Form]
    B -->|Forgot| E[Email → Reset Link]
    C --> F[POST /api/auth/login]
    D --> G[POST /api/auth/signup]
    F --> H{Success?}
    G --> H
    H -->|Yes| I[Auth.save() tokens]
    H -->|No| J[Inline error]
    I --> K{Role == tenant?}
    K -->|Yes| L[Purpose Picker: Rent/Buy/Short-let/Share]
    K -->|No| M[enterDashboard(user)]
    L --> M
    M --> N[Dashboard]
```

---

## 3. Landlord Journeys

### 3.1 Dashboard Overview

```mermaid
flowchart TD
    A[enterDashboard(user: role=landlord)] --> B[renderDashboard()]
    B --> C[renderLandlordScreen('home')]
    C --> D[KPI Cards: Properties, Tenants, Rent Due, Verification]
    D --> E[Quick Actions: Add Listing, Verification, Messages]
    E --> F[Recent Activity Feed]
```

### 3.2 Add Property Listing

```mermaid
flowchart TD
    A[Nav: Add Listing] --> B[renderLandlordScreen('listing')]
    B --> C[Step 1: Form]
    C --> C1[Title, Type, Property Type]
    C --> C2[Address, Area, State]
    C --> C3[Price, Period, Deposit]
    C --> C4[Beds, Baths, Sqm, Floor]
    C --> C5[Description, Amenities]
    C1 --> D[Next → Photos]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    D --> E[Multi-photo upload (max 10, preview)]
    E --> F[Submit Listing]
    F --> G[POST /api/listings → draft + id]
    G --> H[POST /api/listings/:id/images]
    H --> I{Upload success?}
    I -->|Yes| J[alert → navigate('properties')]
    I -->|No| K[Toast error → retry]
    J --> L[renderLandlordScreen('properties')]
```

### 3.3 Property Verification Wizard (5 Layers)

```mermaid
flowchart TD
    A[Nav: Verify Property] --> B[renderLandlordScreen('verify')]
    B --> C{Verification exists?}
    C -->|No| D[Start Wizard: Layer 1]
    C -->|Yes| E[Show current layer + status]
    
    subgraph Layer1 [Layer 1: Documents]
        D --> D1[Upload: C of O / Deed / Survey / Gov Consent]
        D1 --> D2[POST /api/verification/upload-doc each]
        D2 --> D3[POST /api/verification/submit-layer1]
        D3 --> L1S{L1 Approved?}
        L1S -->|Pending| E
        L1S -->|Rejected| R1[Toast reason → resubmit]
    end
    
    subgraph Layer2 [Layer 2: Identity]
        L1S -->|Approved| L2A[Prembly NIN/BVN Lookup]
        L2A --> L2B[POST /api/verification/verify-identity]
        L2B --> L2C[Show result → User confirms]
        L2C --> L2D[POST /api/verification/confirm-identity]
        L2D --> L2S{L2 Approved?}
        L2S -->|Pending| E
        L2S -->|Rejected| R2[Resubmit ID]
    end
    
    subgraph Layer3 [Layer 3: Live Video]
        L2S -->|Approved| L3A[Record video with QR code]
        L3A --> L3B[POST /api/verification/upload-video]
        L3B --> L3S{Admin Review}
        L3S -->|Pending| E
    end
    
    subgraph Layer4 [Layer 4: Inspection]
        L3S -->|Approved| L4A[Schedule agent visit]
        L4A --> L4B[POST /api/verification/request-inspection]
        L4B --> L4S{Inspection Done?}
        L4S -->|Pending| E
    end
    
    subgraph Layer5 [Layer 5: Certification]
        L4S -->|Done| L5A[Admin Final Review]
        L5A --> L5B[Admin: Grant Certified]
        L5B --> L5C[listing.verification_tier = 'certified']
        L5C --> L5D[Badge: CERTIFIED 🏆]
    end
```

### 3.4 Rent Collection

```mermaid
flowchart TD
    A[Nav: Rent Collection] --> B[renderLandlordScreen('rent')]
    B --> C[loadTransactions('rent')]
    C --> D[Table: Tenant | Property | Amount | Due | Status | Actions]
    D --> E{Status?}
    E -->|Upcoming| F[Wait for payment]
    E -->|In Escrow| G[Admin releases]
    E -->|Paid| H[View receipt]
    E -->|Overdue| I[Send reminder]
```

### 3.5 Tenant Screening

```mermaid
flowchart TD
    A[Messages → Conversation] --> B[View Profile button]
    B --> C[GET /api/users/tenant-profile/:userId]
    C --> D[Bottom Sheet Modal]
    D --> D1[Name, Avatar, Verification Badges]
    D --> D2[Employment: Status, Type, Employer, Title]
    D --> D3[Income Band: ₦X–Y/yr (encrypted)]
    D --> D4[Verification Score: 0-4]
    D --> D5[Bio + Guarantor]
    D5 --> E[Message Tenant → navigate('messages')]
```

### 3.6 Agreements Management

```mermaid
flowchart TD
    A[Nav: Agreements] --> B[renderAgreementsScreen('landlord')]
    B --> C[loadAgreements()]
    C --> D[List: Status badges, Preview, Sign, PDF]
    D --> E{Action?}
    E -->|Create| F[Link Listing + Tenant + Terms → POST /api/agreements]
    E -->|Preview| G[GET /api/agreements/:id/preview → new tab]
    E -->|Sign| H[POST /api/agreements/:id/sign {consent:true}]
    E -->|PDF| I[GET /api/agreements/:id/pdf]
    H --> J{Both signed?}
    J -->|Yes| K[status: fully_signed → rent_schedule generated]
```

---

## 4. Tenant Journeys

### 4.1 Purpose Switcher (Unique to Tenant)

```mermaid
flowchart TD
    A[Dashboard Home] --> B[Purpose Switcher: 4 buttons]
    B --> C{Rent|Buy|Short-let|Share}
    C -->|Rent| D[STATE.purpose='rent' → sidebar=Rent mode]
    C -->|Buy| E[STATE.purpose='buy' → sidebar=Buy mode]
    C -->|Short-let| F[STATE.purpose='short_let' → SSR mode]
    C -->|Share| G[STATE.purpose='share' → Share mode]
    D --> H[localStorage.setItem('propati_purpose')]
    E --> H
    F --> H
    G --> H
    H --> I[render() → updated nav + welcome card]
```

### 4.2 Property Search & Apply

```mermaid
flowchart TD
    A[Nav: Find Property] --> B[renderTenantScreen('search')]
    B --> C[loadListings() with filters]
    C --> D[Grid: Listing cards with trust badge]
    D --> E{Card CTA}
    E -->|Apply & Message| F[openConversation(landlordId, listingId)]
    E -->|Save| G[POST /api/listings/:id/save]
    E -->|Book (short-let)| H[Similar flow]
    F --> I[POST /api/messages/conversations (idempotent)]
    I --> J[navigate('messages')]
    J --> K[Conversation opens with initial message]
```

### 4.3 Profile Completion (Screening Data)

```mermaid
flowchart TD
    A[Home: Profile banner] --> B{Complete?}
    B -->|No| C[Nav: My Profile]
    C --> D[renderTenantProfilePage()]
    D --> E[Identity Section: NIN/BVN/DL/PVC]
    D --> F[Edit Form: Name, Phone, Bio]
    D --> G[Employment: Status, Type, Employer, Title]
    D --> H[Income: Yearly amount (encrypted)]
    D --> I[Guarantor: Name, Phone, Relationship]
    E --> J[Phone Verification: WhatsApp OTP]
    J --> K[POST /api/auth/send-phone-otp]
    K --> L[Enter 6-digit → verify]
    F --> M[PATCH /api/users/profile]
    G --> N[PATCH /api/users/tenant-profile]
    H --> N
    I --> N
    M --> O{Success?}
    N --> O
    O -->|Yes| P[Toast → Home banner removed]
    O -->|No| Q[Inline errors]
```

### 4.4 Agreements & E-Signature

```mermaid
flowchart TD
    A[Nav: My Agreements] --> B[renderTenantScreen('agreements')]
    B --> C[loadAgreements()]
    C --> D[List: draft/pending_tenant/tenant_signed/fully_signed]
    D --> E{Action}
    E -->|View/Download| F[viewAgreementPDF(id) → new tab]
    E -->|Sign| G[Modal: Consent text + checkbox]
    G --> H[POST /api/agreements/:id/sign {consent:true}]
    H --> I[Records: signer_id, timestamp, IP, UA, checksum]
    I --> J{Status?}
    J -->|tenant_signed| K[Wait for landlord]
    J -->|fully_signed| L[Rent schedule visible]
```

### 4.5 Rent Payments (Paystack)

```mermaid
flowchart TD
    A[Nav: Rent & Payments] --> B[renderTenantScreen('payments')]
    B --> C[loadTransactions()]
    C --> D[Table: Property | Amount | Due | Status | Pay]
    D --> E{Status: upcoming/overdue}
    E --> F[Pay Now button]
    F --> G[POST /api/payments/initiate {listing_id, type:'rent'}]
    G --> H{Success?}
    H -->|Yes| I[window.location = authorization_url]
    H -->|No| J[Toast error]
    I --> K[Paystack Checkout]
    K --> L{Payment?}
    L -->|Success| M[Webhook: charge.success → in_escrow]
    L -->|Failed| N[status: failed]
    M --> O[Move-in → Admin releases escrow]
```

### 4.6 Maintenance Requests

```mermaid
flowchart TD
    A[Nav: Maintenance] --> B[renderTenantScreen('maintenance')]
    B --> C[Create Ticket Form]
    C --> C1[Title, Category, Priority]
    C --> C2[Property, Description, Photos]
    C1 --> D[POST /api/orgs/:id/tickets (if EM unit)]
    C2 --> D
    D --> E[Tickets list: Open/Assigned/In Progress/Resolved]
    E --> F{Status: Resolved?}
    F -->|Yes| G[SMS sent to tenant]
```

---

## 5. Agent Journeys

### 5.1 Deal Pipeline

```mermaid
flowchart TD
    A[Nav: Deal Pipeline] --> B[renderAgentScreen('pipeline')]
    B --> C[loadAgentPipeline()]
    C --> D[Kanban: Enquiry → Viewing → Offer → Agreement → Completed]
    D --> E[Drag-drop or click to advance]
    E --> F[POST /api/agreements?agent_id=...]
```

### 5.2 Managed Listings

```mermaid
flowchart TD
    A[Nav: Managed Listings] --> B[renderAgentScreen('listings')]
    B --> C[GET /api/listings?agent_id=:uid]
    C --> D[Grid: My managed listings + commission data]
    D --> E[Actions: Edit, Verification assist, View stats]
```

### 5.3 Inspections Calendar

```mermaid
flowchart TD
    A[Nav: Inspections] --> B[renderAgentScreen('inspections')]
    B --> C[loadAgentInspections()]
    C --> D[Calendar view: Scheduled, Completed, Pending]
    D --> E[Actions: Complete, Reschedule, Add notes]
```

### 5.4 Commissions Tracker

```mermaid
flowchart TD
    A[Nav: Commissions] --> B[renderAgentScreen('commissions')]
    B --> C[loadAgentCommissions()]
    C --> D[Table: Deal | Type | Platform Fee | My Commission | Status]
    D --> E[Summary: Total earned, Pending, Paid]
```

### 5.5 Client Management

```mermaid
flowchart TD
    A[Nav: My Clients] --> B[renderAgentScreen('clients')]
    B --> C[List: Tenants + Landlords]
    C --> D[Profile: Contact, Properties, Deal stage]
    D --> E[Actions: Message, Schedule viewing, Add note]
```

### 5.6 Reputation Score

```mermaid
flowchart TD
    A[Nav: Reputation] --> B[renderAgentScreen('reputation')]
    B --> C[Score: 1-100 based on]
    C --> C1[Deals closed]
    C --> C2[Response time]
    C --> C3[Client ratings]
    C --> C4[Verification assists]
    C1 --> D[Badge: Bronze/Silver/Gold/Platinum]
```

---

## 6. Admin Journeys

### 6.1 Verification Queue (Core Admin Task)

```mermaid
flowchart TD
    A[Nav: Verification Queue] --> B[renderAdminScreen('verification')]
    B --> C[GET /api/verification/admin/queue]
    C --> D[Table: Listing | Owner | Current Layer | Docs | Actions]
    D --> E{Per listing}
    E -->|Approve Layer N| F[POST /api/verification/admin/review {layer, approved}]
    E -->|Reject Layer N| G[Prompt reason → POST {layer, rejected, reason}]
    E -->|View Docs| H[Open Cloudinary URLs]
    E -->|Grant Certified| I[Layer 5 approve → listing.tier = 'certified']
    F --> J[Owner notified via email/in-app]
    G --> J
    I --> K[Badge updated on listing card]
```

### 6.2 Flagged Listings Review

```mermaid
flowchart TD
    A[Nav: Flags] --> B[renderAdminScreen('flags')]
    B --> C[GET /api/listings?flagged=true]
    C --> D[List: Flag type, Reporter, Description, Status]
    D --> E{Action}
    E -->|Review| F[View listing + flag details]
    E -->|Dismiss| G[PATCH status=dismissed]
    E -->|Suspend| H[PATCH listing.status=suspended]
    E -->|Ban User| I[POST /api/users/admin/:id/suspend]
```

### 6.3 Dispute Resolution

```mermaid
flowchart TD
    A[Nav: Disputes] --> B[renderAdminScreen('disputes')]
    B --> C[GET /api/disputes]
    C --> D[List: Type, Parties, Amount, Status]
    D --> E{Action}
    E -->|Mediate| F[View evidence, messages, transactions]
    E -->|Rule| G[POST resolution → update transaction/refund]
    E -->|Close| H[status=resolved]
```

### 6.4 User Management

```mermaid
flowchart TD
    A[Nav: Users] --> B[renderAdminScreen('users')]
    B --> C[GET /api/users/admin/all]
    C --> D[Table: Name, Email, Role, Status, Actions]
    D --> E{Action}
    E -->|Suspend/Unsuspend| F[POST /api/users/admin/:id/suspend]
    E -->|Approve Agent| G[POST /api/users/admin/:id/approve-agent]
    E -->|View Details| H[Profile + activity]
```

### 6.5 Revenue Dashboard

```mermaid
flowchart TD
    A[Nav: Revenue] --> B[renderAdminScreen('revenue')]
    B --> C[GET /api/users/admin/stats]
    C --> D[KPIs: GMV, Platform Revenue, Agent Commissions, Subscriptions]
    D --> E[Charts: Daily/Weekly/Monthly]
    E --> F[Export CSV]
```

---

## 7. Estate Manager Journeys (B2B SaaS)

### 7.1 Onboarding Wizard (First Login)

```mermaid
flowchart TD
    A[Login as estate_manager] --> B[checkSession() → GET /api/orgs/mine]
    B --> C{404 / No Org?}
    C -->|Yes| D[Wizard Step 1: Create Org]
    C -->|No| E[Dashboard]
    D --> D1[Name, Billing Email, Address, CAC Number]
    D1 --> D2[POST /api/orgs → org created, user=manager]
    D2 --> F[Wizard Step 2: Choose Plan]
    F --> F1[Starter ₦25k (20 units, 1 seat)]
    F --> F2[Growth ₦60k (100 units, 5 seats)]
    F --> F3[Enterprise ₦150k (unlimited)]
    F1 --> G[POST /api/orgs/:id/subscribe → Paystack URL]
    F2 --> G
    F3 --> G
    G --> H[Paystack Checkout → subscription created]
    H --> I[Wizard Step 3: Done → emPage='home']
```

### 7.2 Portfolio Management

```mermaid
flowchart TD
    A[Nav: Portfolio] --> B[renderEstateManagerScreen('portfolio')]
    B --> C[GET /api/orgs/:id/portfolio]
    C --> D[Grid: Properties with Units summary]
    D --> E[Unit status: Vacant / Occupied / Maintenance]
    E --> F[Actions: Add unit, Edit, View ledger]
```

### 7.3 Rent Ledger

```mermaid
flowchart TD
    A[Nav: Rent Ledger] --> B[renderEstateManagerScreen('ledger')]
    B --> C[GET /api/orgs/:id/ledger]
    C --> D[Table: Unit | Tenant | Rent | Due | Status | Payments]
    D --> E[Filters: Month, Status, Property]
    E --> F[Actions: Record manual payment, Send reminder, Export]
```

### 7.4 Maintenance Tickets

```mermaid
flowchart TD
    A[Nav: Maintenance] --> B[renderEstateManagerScreen('maintenance')]
    B --> C[GET /api/orgs/:id/tickets]
    C --> D[Tabs: All / Open / Assigned / In Progress / Resolved]
    D --> E{Create Ticket}
    E --> F[Title, Category, Priority, Property, Tenant]
    F --> G[POST /api/orgs/:id/tickets]
    G --> H[Assign to team member]
    H --> I[status=assigned]
    I --> J[Team member updates: in_progress → resolved]
    J --> K[Resolved → SMS to tenant]
```

### 7.5 Bulk CSV Import

```mermaid
flowchart TD
    A[Nav: Bulk Import] --> B[renderEstateManagerScreen('bulk-upload')]
    B --> C[Download template CSV]
    C --> D[Upload CSV → POST /api/orgs/:id/bulk-upload]
    D --> E[Backend validates: columns, unit limits]
    E --> F{Valid?}
    F -->|Yes| G[Units created → results summary]
    F -->|No| H[Row-by-row errors → download report]
```

### 7.6 Team Management

```mermaid
flowchart TD
    A[Nav: Team] --> B[renderEstateManagerScreen('team')]
    B --> C[GET /api/orgs/:id/team]
    C --> D[Table: Member | Role | Status | Seat]
    D --> E[Invite: Email + Role (manager/accountant/maintenance/owner_view)]
    E --> F[POST /api/orgs/:id/team/invite]
    F --> G[Email sent with invite token]
    G --> H[Seat limit enforced per plan]
    H --> I[Actions: Resend, Revoke, Change role]
```

### 7.7 Billing & Subscription

```mermaid
flowchart TD
    A[Nav: Billing] --> B[renderEstateManagerScreen('billing')]
    B --> C[GET /api/orgs/:id/subscription]
    C --> D[Current Plan: Tier, Price, Renewal Date, Status]
    D --> E[Actions: Upgrade/Downgrade, Update payment method]
    E --> F[Paystack Customer Portal]
```

### 7.8 Monthly Reports

```mermaid
flowchart TD
    A[Nav: Reports] --> B[renderEstateManagerScreen('reports')]
    B --> C[Month Picker]
    C --> D[GET /api/orgs/:id/reports/:month]
    D --> E[JSON: Revenue, Occupancy, Maintenance, Arrears]
    E --> F[Phase 5: PDF export]
```

---

## 8. Shared Cross-Role Flows

### 8.1 Messaging (Universal)

```mermaid
flowchart TD
    A[Any Role: Nav → Messages] --> B[renderMessagesScreen()]
    B --> C[GET /api/messages/conversations]
    C --> D[Left Panel: Conversation list + unread badges]
    D --> E[Click conversation]
    E --> F[GET /api/messages/conversations/:id → marks read]
    F --> G[Right Panel: Messages + Input]
    G --> H[startMsgPolling(4s)]
    H --> I[GET /api/messages/conversations/:id/messages?since=...]
    I --> J{New?}
    J -->|Yes| K[Append + scroll]
    J -->|No| H
    G --> L[Send: POST /api/messages/conversations/:id/messages]
    L --> M[Optimistic UI → confirm via poll]
```

### 8.2 Notifications Bell

```mermaid
flowchart TD
    A[Topbar: Bell icon + badge] --> B[Click → Dropdown]
    B --> C[GET /api/users/notifications]
    C --> D[List: Type, Title, Time, Read status]
    D --> E[Click → Mark read + Navigate]
    E --> F[PATCH /api/users/notifications/:id/read]
    F --> G[Unread count updates badge]
    G --> H[Poll 30s for new]
```

---

## 9. Error & Edge Case Flows

| Scenario | Flow | Recovery |
|----------|------|----------|
| Token expired mid-flow | 401 → silent refresh → retry once | Logout → landing if refresh fails |
| Network offline | Toast "Connection failed" | Retry button / auto-retry on reconnect |
| 403 wrong role | Toast error message | Redirect to appropriate dashboard |
| 404 not found | Inline empty state + CTA | "Create listing" / "Search again" |
| 422 validation | Inline field errors | Fix + resubmit |
| 500 server error | Toast "Something went wrong" | Log to Winston, retry |
| EM org not found | Onboarding wizard | Complete wizard |
| Verification rejected | Toast with reason | Resubmit layer |

---

## 10. Success Metrics per Journey

| Journey | Target | Measurement |
|---------|--------|-------------|
| Landlord: Add listing → active | < 5 min | Time-to-first-photo-upload |
| Landlord: Verification → Certified | < 14 days | Layer completion rate |
| Tenant: Search → Apply | < 3 clicks | Funnel drop-off |
| Tenant: Profile completion | > 80% | Profile_completed flag |
| Tenant: Pay rent | > 99% success | Paystack webhook status |
| Agent: Pipeline advance | < 48 hrs | Stage dwell time |
| Admin: Verification review | < 24 hrs | Queue SLA |
| EM: Onboarding → paid | < 30 min | Wizard completion |

---

*These journeys map directly to the PRD features and TRD API endpoints. Use for QA test planning and onboarding.*