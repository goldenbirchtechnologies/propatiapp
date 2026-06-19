# PROPATI — Frontend Architecture Analysis

Source files: `oldpropati/FRONTEND_GUIDELINES.md`, `oldpropati/APP_FLOW.md`

---

## 1. Design System / Design Tokens

### 1.1 Typography
| Usage | Font Family | Weights |
|-------|-------------|---------|
| Headings / Brand | `Bricolage Grotesque` | 400, 600, 700, 800 |
| UI / Body / Buttons | `Outfit` | 400, 500, 600, 700, 800 |
| Serif / Display (logo, hero) | `DM Serif Display` | 400 |
| Monospace (references, IDs, code) | `DM Mono` | 400, 500 |

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 1.2 Font Scale
| Element | Size | Weight | Font |
|---------|------|--------|------|
| Hero title | `clamp(2rem, 4.5vw, 3.2rem)` | 800 | Bricolage Grotesque |
| Page title | `1.1rem` | 700 | Bricolage Grotesque |
| Card title | `0.87rem` | 700 | Outfit |
| Body text | `0.83–0.88rem` | 400–500 | Outfit |
| Label/meta | `0.72–0.78rem` | 400–600 | Outfit |
| Tag/badge | `0.65–0.70rem` | 700, uppercase | Outfit |
| Mono/ref | `0.62–0.72rem` | 400–500 | DM Mono |

### 1.3 Colour System

#### Shared Semantic Colours (CSS Variables)
```css
--green:      #22c55e;   --green-bg:   rgba(34,197,94,0.1);
--amber:      #f59e0b;   --amber-bg:   rgba(245,158,11,0.1);
--red:        #ef4444;   --red-bg:     rgba(239,68,68,0.1);
--blue:       #3b82f6;   --blue-bg:    rgba(59,130,246,0.1);
```

#### Role Themes (5 roles)

| Role | Class | Background | Surface | Border | Text | Muted | Accent | Accent2 |
|------|-------|------------|---------|--------|------|-------|--------|---------|
| **Landing/Marketplace** | — | `#f5f3ee` (warm sand) | — | — | `#1a1a1a` | — | `#c9952a` (gold) | — |
| **Landlord** | `.theme-landlord` | `#0f0f0f` | `#141414` / `#1a1a1a` | `rgba(255,255,255,0.08)` | `#f8f6f0` | `#888680` | `#d4622a` (rust) | `#c8520a` |
| **Tenant** | `.theme-tenant` | `#f7f5f0` | `#ffffff` | `#e8e5df` | `#111110` | `#7a7870` | `#0e7c6a` (teal) | `#14a88e` |
| **Agent** | `.theme-agent` | `#060d18` | `#0d1b2e` | `rgba(255,255,255,0.07)` | `#e8eef8` | `#4a6480` | `#c9952a` (gold) | `#e0b04a` |
| **Admin** | `.theme-admin` | `#0c0e12` | — | — | — | — | `#00d4c8` (cyan) | — |
| **Estate Manager** | `.em-*` | `#080E18` (deep navy) | `#080E18` (sidebar) | `#1A2A3A` | `#C8D8E8` | `#5A7A9A` | `#6EA8FE` (blue) | — |

### 1.4 Spacing Scale
| Value | Name |
|-------|------|
| `0.2rem` | tight |
| `0.3rem` | very small |
| `0.4rem` | small gap |
| `0.5rem` | small |
| `0.6rem` | base small |
| `0.7rem` | base |
| `0.8rem` | medium-small |
| `0.9rem` | medium |
| `1rem` | **default spacing unit** |
| `1.2rem` | medium-large |
| `1.5rem` | large |
| `1.8rem` | page padding (desktop content) |
| `2rem` | section spacing |
| `3rem` | hero padding |

**Content Area Padding:** `1.6rem 1.8rem` desktop, `1rem` mobile.

### 1.5 Border Radius Scale
| Value | Use Case |
|-------|----------|
| `4px` | tag, small pill |
| `7–8px` | small button, input |
| `9–10px` | standard button, input field |
| `11–12px` | card |
| `14px` | large card |
| `16px` | modal desktop |
| `20px` | modal bottom-sheet mobile |
| `50%` | avatar, circle |
| `100px` | pill / badge |

### 1.6 Animation
- **Fade up on load:** `@keyframes lp-fade-up` (0.5s ease, staggered delays `.fade-up-1`/`fade-up-2`)
- **Shimmer/progress:** `@keyframes shimmer` (background-position animation)
- **Sidebar transition:** `cubic-bezier(0.4,0,0.2,1)` over 0.28s
- **Button hover:** `transform: translateY(-1px)` over 0.18s

---

## 2. Component Library

### 2.1 Card
```html
<div class="card">
  <div class="card-head">
    <span class="card-title">Title</span>
    <span>Action link</span>
  </div>
  <div class="card-body">Content</div>
</div>
```
- Border-radius: 14px
- Border: theme border colour
- Background: theme surface colour
- card-head padding: `1rem 1.3rem`
- card-body padding: `1.1rem 1.3rem`

### 2.2 Buttons
| Variant | Key Styles |
|---------|------------|
| **Primary** | `padding: 0.55rem 1.1rem; border-radius: 9px; font-size: 0.82rem; font-weight: 700; font-family: 'Outfit'; transition: all 0.18s; hover: transform: translateY(-1px)` |
| **Login (large)** | `width: 100%; padding: 0.8rem; background: linear-gradient(135deg, #c9952a, #e0b04a); color: #1a1a1a; border-radius: 10px; font-weight: 800; font-size: 0.92rem` |

### 2.3 Input / Field
```css
.inp-field {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid rgba(255,255,255,0.1); /* or #e5e7eb on light */
  border-radius: 9px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  transition: border-color 0.18s;
}
.inp-field:focus { outline: none; border-color: ACCENT_COLOR; }
```
**Label:** `.inp-label` → `font-size: 0.74rem; font-weight: 600; color: muted`

### 2.4 Tag / Badge
```css
.tag {
  font-size: 0.67rem;
  font-weight: 700;
  padding: 0.16rem 0.5rem;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-block;
}
```
**Variants:** `.tag-green`, `.tag-amber`, `.tag-red`, `.tag-blue`, `.tag-gold`, `.tag-rust`, `.tag-teal` (each with matching bg/color)

### 2.5 Nav Item (Sidebar)
```css
.nav-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.62rem 0.75rem; border-radius: 10px;
  font-size: 0.84rem; font-weight: 500;
  min-height: 44px; /* touch target */
  transition: all 0.18s;
}
.nav-item.active::before { /* left accent bar */ }
```

### 2.6 Toast
Fixed bottom-center, pill-shaped, `transform: translateX(-50%) translateY(...)`, z-index 9999, 0.3s transition.

### 2.7 Avatar / Initials Circle
`38x38px`, 50% border-radius, flex center, `font-weight: 800; font-size: 0.85rem`, gradient background from accent1 to accent2.

### 2.8 Layout — Dashboard Shell
```css
.app-layout { display: flex; height: 100vh; overflow: hidden; }
├── .sidebar { flex-shrink: 0; width: 220–240px; overflow-y: auto; }
│   ├── .sb-header (logo)
│   ├── .sb-user-card (avatar + name + role)
│   ├── .sb-nav (nav items)
│   └── .sb-footer (sign out)
└── .main-area { flex: 1; display: flex; flex-direction: column; }
    ├── .topbar { border-bottom; padding: 0.9rem 1.8rem; }
    └── .content-area { flex: 1; overflow-y: auto; padding: 1.6rem 1.8rem; }
```

### 2.9 Grid Systems
| Pattern | CSS |
|---------|-----|
| 2-col | `grid-template-columns: 1fr 1fr; gap: 1rem;` |
| 3-col KPI | `grid-template-columns: repeat(3, 1fr); gap: 1rem;` |
| 4-col KPI | `grid-template-columns: repeat(4, 1fr); gap: 0.7rem;` |
| Listing cards | `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem;` |

---

## 3. Mobile Patterns & Breakpoints

### 3.1 Breakpoints
| Breakpoint | Changes |
|------------|---------|
| `≤768px` (tablet/mobile) | Sidebar becomes fixed off-canvas (`left: -280px` → `.open { left: 0 }`); content padding `1rem`; 3-col grids → `1fr 1fr`; modals become bottom sheets (`border-radius: 16px 16px 0 0`); hamburger button (`.mob-menu-btn`) in topbar with overlay click-outside-to-close |
| `≤480px` (small phones) | 3-col and 4-col grids → `1fr` |

---

## 4. State Management Approach

### 4.1 Core Pattern: Single State Object + Data-Driven Rendering
- **Global `STATE` object** holds: `view`, `page`, `role`, `purpose`, `user`, `authMode`, `authStep`, `landingQuery`, `toastVisible`, `activeConv`, etc.
- **`render()` is the single entry point** — called on load, after auth checks, after any state change.
- **Never mutate DOM directly** — always `setState({ ... })` then `render()`.

### 4.2 State Update Function
```javascript
function setState(patch) {
  Object.assign(STATE, patch);
  render();
}
```

### 4.3 Conditional Rendering in Template Literals
```javascript
`${user.nin_verified
  ? '<span class="tag tag-green">✅ NIN Verified</span>'
  : ''}`
```

### 4.4 Session Persistence
- **localStorage** stores: `role`, `purpose` (tenant), tokens via `Auth.save()`
- **On page load:** `checkSession()` restores role from localStorage immediately (no flash), then validates via `GET /api/auth/me`
- **Token refresh:** Automatic on 401 — `POST /api/auth/refresh` → retry original request once

### 4.5 Data Layer
- **`DATA` object** caches API responses: `listings`, `conversations`, `emOrg`, `emPortfolio`, `emLedger`, `emTickets`, `emTeam`, `emSubscription`, `verificationSteps`, etc.
- Data loaded on demand per screen, stored in `DATA.*` for reuse.

---

## 5. Event Handling Pattern

### 5.1 Data-Action Delegation
```javascript
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  switch(action) {
    case 'nav':        navigate(el.dataset.page); break;
    case 'goto-login': setState({ view: 'login' }); break;
    case 'toast':      showToast(el.dataset.msg); break;
    // ... etc
  }
});
```
- **Never attach inline `addEventListener`**
- Use `data-action` + `data-*` attributes for static actions
- Use inline `onclick="fn('${id}')"` inside template literals for dynamic values

---

## 6. Template Literal Conventions

1. **Nested templates:** Use single quotes inside, or wrap in a function
2. **Ternary expressions:** `${verified ? 'Verified' : 'Unverified'}` — never nest backticks
3. **Avoid escaped backticks** (`\``) — caused bugs; close templates properly

---

## 7. User Flows for All 5 Roles

### 7.1 Entry Points
| Scenario | Flow |
|----------|------|
| **First visit (not logged in)** | `URL → render() → STATE.view = 'landing' → renderLanding()` |
| **Return visit (logged in)** | `URL → render() → checkSession() → Auth.isLoggedIn() → restore STATE from localStorage → GET /api/auth/me → enterDashboard(user)` |

### 7.2 Landing Page
- Sticky nav: logo, search bar (inline filter), type tabs (All/Buy/Rent/Short-let/Commercial)
- **Logged in:** avatar + "My Dashboard" button
- **Not logged in:** "Sign in" + "List property" → both go to login
- Listing card CTA: "Apply Now" / "Book Now" / "Request Viewing" → `data-action="goto-login"`

### 7.3 Auth Flow
| Step | Details |
|------|---------|
| **Login** | Role picker (landlord/tenant/agent/estate_manager) → email + password → `POST /api/auth/login` → `Auth.save()` → **Tenant**: purpose picker (step 2) → `enterDashboard(user)` |
| **Purpose Picker (tenant only)** | 4 options: Rent / Buy / Short-let / Share → `localStorage.setItem('propati_purpose', purpose)` → `enterDashboard(user)` |
| **Signup** | Role picker → full name + email + phone (opt) + password + confirm → `POST /api/auth/signup` → welcome email + phone OTP (async) → `Auth.save()` → `enterDashboard(user)` |
| **Forgot Password** | Email → `POST /api/auth/forgot-password` → reset link with `?reset=TOKEN&uid=USER_ID` |

### 7.4 Landlord Dashboard
**Sidebar Navigation:**
```
Dashboard (home) → renderLandlordScreen('home')
My Properties → renderLandlordScreen('properties')
Rent Collection → renderLandlordScreen('rent')
Add Listing → renderLandlordScreen('listing')
Screening Calls → renderLandlordScreen('screening')
Agreements → renderLandlordScreen('agreements') → renderAgreementsScreen('landlord')
Messages → renderLandlordScreen('messages')
Verify Property → renderLandlordScreen('verify')
My Profile → renderLandlordScreen('profile')
Sign Out → logout()
```

**Add Listing Flow:**
1. Fill form (title, type, property type, address, price, beds, baths, sqm, description, amenities)
2. Pick photos (up to 10, preview shown)
3. "Submit Listing" → `POST /api/listings` (creates draft, returns listing.id) → `POST /api/listings/:id/images` (FormData to Cloudinary) → navigate to 'properties'

**Property Verification Wizard (5 Steps):**
1. **Documents:** Upload C of O / Deed / Survey / Governor's Consent → `POST /api/verification/upload-doc` each → `POST /api/verification/submit-layer1`
2. **Identity:** Prembly NIN/BVN lookup → `POST /api/verification/verify-identity` → user confirms → `POST /api/verification/confirm-identity`
3. **Live Proof:** Upload video with QR code (unique per user) → `POST` (pending)
4. **Inspection:** Schedule agent visit → `POST /api/verification/inspection`
5. **Certified:** Awaiting admin final review

**Tenant Screening:**
- Tenant applies → conversation starts → landlord views messages → "View Profile" → `GET /api/users/tenant-profile/:userId` → bottom sheet modal (name, employment, income band, verification score, bio, guarantor) → "Message Tenant" → navigate to messages

### 7.5 Tenant Dashboard

**Purpose Switcher (top of home):**
4 buttons: Rent / Buy / Short-let / Share → click → `STATE.purpose = key`, localStorage updated, `render()` — changes sidebar nav, welcome card, quick actions.

**Sidebar (Rent mode — default):**
```
Dashboard → home
Find Property → search
Rent & Payments → payments (loadTransactions)
My Agreements → agreements (loadAgreements)
Maintenance → maintenance
Screening Call → screening
My Profile → profile (loadTenantProfile)
Receipts → receipts (loadReceipts)
Messages → messages
Sign Out → logout()
```

**Search & Apply Flow:**
`navigate('search')` → `loadListings()` → grid of cards → "Apply & Message" → `openConversation(landlordId, listingId, title)` → `POST /api/messages/conversations` (idempotent) → `navigate('messages')` → opens with initial message.

**Profile Completion Flow:**
Home banner "Complete your profile" (if employment/income missing) → navigate 'profile' → `renderTenantProfilePage()` → identity section → edit form (name, phone, bio, employment, income, guarantor) → "Save Profile" → `PATCH /api/users/profile` + `PATCH /api/users/tenant-profile` → phone verification widget (WhatsApp OTP send/verify).

**Agreements Flow:**
`navigate('agreements')` → `loadAgreements()` → `renderAgreementsScreen('tenant')` → list with status badges → "View/Download" → `viewAgreementPDF(id)` (new tab) → "Sign Agreement" → `POST /api/agreements/:id/sign {consent: true}` → records signer_id, timestamp, IP, consent_text, checksum → status: tenant_signed / fully_signed.

### 7.6 Agent Dashboard
```
Dashboard → home (pipeline stats)
Deal Pipeline → pipeline
Managed Listings → listings
Inspections → inspections
Commissions → commissions
My Clients → clients
Reputation → reputation
My Profile → profile (identity verification)
Messages → messages
Sign Out → logout()
```

### 7.7 Admin Console
```
Admin logs in → STATE.role = 'admin' → renderAdmin()
Sidebar: Overview / Verification Queue / Flags / Disputes / Users / Revenue / Settings
```

**Verification Queue:**
`loadAdminVerifQueue()` → `GET /api/verification/admin/queue` → `renderAdminVerifQueue()` → per listing: layer badges, doc links, approve/reject buttons
- "Approve Layer N" → `adminReviewLayer(listingId, layer, 'approved', '')` → `POST /api/verification/admin/review` → owner notified
- "Reject" → prompt reason → `adminReviewLayer(..., 'rejected', reason)`
- "Grant Certified" → approves Layer 5

### 7.8 Estate Manager Dashboard

**First Login (No Org) — Onboarding Wizard:**
1. `loadEmOrg()` → `GET /api/orgs/mine` → 404 → `DATA.emOrg = false` → `renderEstateManager()` → wizard
2. **Step 1 Create Org:** name, billing_email, address, cac_number → `POST /api/orgs` → org created, user added as manager
3. **Step 2 Choose Plan:** Starter/Growth/Enterprise → `POST /api/orgs/:id/subscribe` → Paystack checkout URL opened
4. **Step 3 Done:** `emPage = 'home'`

**EM Sidebar:**
```
Home (overview KPIs)
Portfolio → loadEmPortfolio() → GET /api/orgs/:id/portfolio
Rent Ledger → loadEmLedger() → GET /api/orgs/:id/ledger
Maintenance → loadEmTickets() → GET /api/orgs/:id/tickets
Bulk Import → bulk-upload screen
Agreements → org agreements
Team → loadEmTeam() → GET /api/orgs/:id/team
Billing → loadEmSubscription() → GET /api/orgs/:id/subscription
Reports → month picker → GET /api/orgs/:id/reports/:month
Sign Out → logout()
```

**Maintenance Ticket Flow:**
Filter tabs: All / Open / Assigned / In Progress / Resolved
- Create ticket: title, category, priority, property, tenant → `POST /api/orgs/:id/tickets`
- Update ticket: click status → `emUpdateTicket(orgId, ticketId, {status})` → `PATCH /api/orgs/:id/tickets/:tid`
- If resolved: SMS sent to tenant

---

## 8. Messaging System

```
loadConversations() → GET /api/messages/conversations
Left panel: conversation list with unread badges
Click conversation → DATA.activeConv = conv
  GET /api/messages/conversations/:id (marks read)
  startMsgPolling(convId):
    every 4s: GET /api/messages/conversations/:id/messages?since=LAST_TIMESTAMP
    New messages appended, scroll to bottom

Send message:
  Type in input → Enter or Send button
  POST /api/messages/conversations/:id/messages {content: '...'}
  Optimistic UI: message added immediately, then confirmed by poll

Start new conversation (from listing):
  openConversation(landlordId, listingId, title)
  POST /api/messages/conversations {landlord_id, listing_id, initial_message}
  navigate('messages')
```

---

## 9. Error States Handling

| Situation | Response |
|-----------|----------|
| API unreachable | toast "Connection failed" |
| 401 (expired token) | silent refresh + retry |
| 401 (refresh expired) | logout → landing |
| 403 (wrong role) | toast error message |
| 404 (not found) | inline empty state in component |
| 422 (validation) | inline error below form |
| 500 (server error) | toast "Something went wrong" |
| EM org not found | show onboarding wizard |
| No listings | empty state card with CTA |

---

## 10. Architecture Summary

| Aspect | Approach |
|--------|----------|
| **File Structure** | Single `index.html` — all CSS in `<style>`, all JS in one `<script>` at bottom of `<body>`; no imports, modules, or build step |
| **Rendering** | State-driven, single `render()` function, template literals for HTML generation |
| **State** | Global `STATE` object + `DATA` cache; `setState(patch)` triggers re-render |
| **Events** | Delegated `data-action` click handler on `document`; `data-*` attributes for params |
| **Auth** | JWT access/refresh tokens in localStorage via `Auth` module; auto-refresh on 401 |
| **Theming** | Role-based CSS classes on `body` (`.theme-landlord`, `.theme-tenant`, `.theme-agent`, `.theme-admin`, `.em-*`) defining CSS custom properties |
| **Mobile** | Off-canvas sidebar, bottom-sheet modals, responsive grid collapse at 768px/480px |
| **API Layer** | `apiCall(method, url, body)` wrapper handles auth headers, 401 refresh, error normalization |

---

## 11. Key Files Referenced (for Implementation)

| File | Purpose |
|------|---------|
| `index.html` | Single-page app entry point |
| `STATE` | Global state object (view, role, purpose, user, auth, UI state) |
| `DATA` | API response cache (listings, conversations, org data, etc.) |
| `Auth` module | Token storage, `save()`, `clear()`, `isLoggedIn()`, `getAccessToken()` |
| `apiCall()` | Centralized fetch wrapper with auth + refresh logic |
| `render()` | Main render dispatcher — switches on `STATE.view` / `STATE.page` |
| `setState()` | State mutation + render trigger |
| `navigate(page)` | Sets `STATE.page` / `STATE.view` and renders |
| `checkSession()` | Boot-time auth validation + token refresh |

---

*Generated from analysis of `oldpropati/FRONTEND_GUIDELINES.md` and `oldpropati/APP_FLOW.md`*