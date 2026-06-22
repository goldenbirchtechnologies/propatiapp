# PROPATI — UI/UX Design Brief

**Version:** 1.0  
**Source:** `oldpropati/FRONTEND_GUIDELINES.md`, `oldpropati/APP_FLOW.md`  
**Status:** Production-Ready Design System

---

## 1. Design Philosophy

> **Nigerian Property Trust Platform** — Clean, trustworthy, role-aware interfaces that reduce friction in a high-fraud market. Five distinct visual identities reinforce role context switching.

---

## 2. Brand Identity

### 2.1 Logo & Wordmark
- **Primary:** "PROPATI" in Bricolage Grotesque 800
- **Accent:** Gold (#c9952a) on warm sand (#f5f3ee) for landing
- **Favicon:** Gold initial "P" on dark rust circle

### 2.2 Colour Psychology
| Role | Theme | Psychology |
|------|-------|------------|
| Landing | Warm Sand + Gold | Approachable, premium, trustworthy |
| Landlord | Dark Rust | Authority, ownership, seriousness |
| Tenant | Light Teal | Calm, fresh, search-oriented |
| Agent | Dark Gold | Professional, deal-focused, energetic |
| Admin | Dark Cyan | Technical, oversight, clarity |
| Estate Manager | Deep Navy | Enterprise, stability, B2B trust |

---

## 3. Design Tokens

### 3.1 Typography System

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=Outfit:wght@400;500;600;700;800&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
```

| Usage | Font Family | Weights | CSS Variable |
|-------|-------------|---------|--------------|
| **Headings / Brand** | Bricolage Grotesque | 400, 600, 700, 800 | `--font-heading` |
| **UI / Body / Buttons** | Outfit | 400, 500, 600, 700, 800 | `--font-ui` |
| **Serif / Display (Logo, Hero)** | DM Serif Display | 400 | `--font-serif` |
| **Monospace (IDs, Refs, Code)** | DM Mono | 400, 500 | `--font-mono` |

### 3.2 Font Scale

| Element | Size | Weight | Font | Example |
|---------|------|--------|------|---------|
| Hero Title | `clamp(2rem, 4.5vw, 3.2rem)` | 800 | Bricolage | Landing H1 |
| Page Title | `1.1rem` | 700 | Bricolage | Dashboard headers |
| Card Title | `0.87rem` | 700 | Outfit | Listing cards |
| Body Text | `0.83–0.88rem` | 400–500 | Outfit | Paragraphs |
| Label/Meta | `0.72–0.78rem` | 400–600 | Outfit | Form labels |
| Tag/Badge | `0.65–0.70rem` | 700, uppercase | Outfit | Status tags |
| Mono/Ref | `0.62–0.72rem` | 400–500 | DM Mono | IDs, references |

### 3.3 Colour System — Semantic Variables

```css
/* Shared Semantic Colours */
--green:      #22c55e;   --green-bg:   rgba(34,197,94,0.1);
--amber:      #f59e0b;   --amber-bg:   rgba(245,158,11,0.1);
--red:        #ef4444;   --red-bg:     rgba(239,68,68,0.1);
--blue:       #3b82f6;   --blue-bg:    rgba(59,130,246,0.1);
```

### 3.4 Role Themes (CSS Custom Properties)

```css
/* LANDING / MARKETPLACE (default, no body class) */
:root {
  --bg:        #f5f3ee;   /* warm sand */
  --surface:   #ffffff;
  --border:    #e8e5df;
  --text:      #1a1a1a;
  --muted:     #7a7870;
  --accent:    #c9952a;   /* gold */
  --accent2:   #e0b04a;
}

/* LANDLORD — Dark Rust */
body.theme-landlord {
  --bg:        #0f0f0f;
  --surface:   #141414;
  --surface2:  #1a1a1a;
  --border:    rgba(255,255,255,0.08);
  --text:      #f8f6f0;
  --muted:     #888680;
  --accent:    #d4622a;   /* rust */
  --accent2:   #c8520a;
}

/* TENANT — Light Teal */
body.theme-tenant {
  --bg:        #f7f5f0;
  --surface:   #ffffff;
  --border:    #e8e5df;
  --text:      #111110;
  --muted:     #7a7870;
  --accent:    #0e7c6a;   /* teal */
  --accent2:   #14a88e;
}

/* AGENT — Dark Gold */
body.theme-agent {
  --bg:        #060d18;
  --surface:   #0d1b2e;
  --border:    rgba(255,255,255,0.07);
  --text:      #e8eef8;
  --muted:     #4a6480;
  --accent:    #c9952a;   /* gold */
  --accent2:   #e0b04a;
}

/* ADMIN — Dark Cyan */
body.theme-admin {
  --bg:        #0c0e12;
  --surface:   #111317;
  --border:    rgba(255,255,255,0.06);
  --text:      #e8eef8;
  --muted:     #6a7a8a;
  --accent:    #00d4c8;   /* cyan */
  --accent2:   #00e8d8;
}

/* ESTATE MANAGER — Deep Navy */
body.em-* {
  --bg:        #080E18;   /* deep navy */
  --surface:   #080E18;   /* sidebar */
  --surface2:  #1A2A3A;   /* cards */
  --border:    #1A2A3A;
  --text:      #C8D8E8;
  --muted:     #5A7A9A;
  --accent:    #6EA8FE;   /* blue */
  --accent2:   #8EC5FE;
}
```

### 3.5 Spacing Scale

| Value | Name | Use Case |
|-------|------|----------|
| `0.2rem` | tight | Icon gaps |
| `0.3rem` | very small | Inline elements |
| `0.4rem` | small gap | Button internal |
| `0.5rem` | small | Stack small |
| `0.6rem` | base small | Form field gap |
| `0.7rem` | base | Default gap |
| `0.8rem` | medium-small | Card internal |
| `0.9rem` | medium | Section gap |
| `1rem` | **default** | **Base unit** |
| `1.2rem` | medium-large | Component gap |
| `1.5rem` | large | Section divider |
| `1.8rem` | page padding | Desktop content |
| `2rem` | section spacing | Major sections |
| `3rem` | hero padding | Landing hero |

**Content Area Padding:** `1.6rem 1.8rem` (desktop), `1rem` (mobile)

### 3.6 Border Radius Scale

| Value | Use Cases |
|-------|-----------|
| `4px` | Tags, small pills |
| `7–8px` | Small buttons, inputs |
| `9–10px` | Standard buttons, input fields |
| `11–12px` | Cards |
| `14px` | Large cards |
| `16px` | Desktop modals |
| `20px` | Mobile bottom sheets |
| `50%` | Avatars, circles |
| `100px` | Pill badges |

### 3.7 Animation Tokens

| Name | CSS | Duration | Easing | Use |
|------|-----|----------|--------|-----|
| `fade-up` | `@keyframes lp-fade-up` | 0.5s | ease | Page load stagger |
| `shimmer` | `@keyframes shimmer` | 1.5s | linear | Loading skeletons |
| `sidebar` | `cubic-bezier(0.4,0,0.2,1)` | 0.28s | — | Drawer transition |
| `hover-lift` | `transform: translateY(-1px)` | 0.18s | ease | Button hover |

---

## 4. Component Library

### 4.1 Card

```html
<div class="card">
  <div class="card-head">
    <span class="card-title">Title</span>
    <span>Action link</span>
  </div>
  <div class="card-body">Content</div>
</div>
```

```css
.card {
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
}
.card-head { padding: 1rem 1.3rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
.card-title { font-size: 0.87rem; font-weight: 700; font-family: var(--font-ui); color: var(--text); }
.card-body { padding: 1.1rem 1.3rem; }
```

### 4.2 Buttons

| Variant | CSS |
|---------|-----|
| **Primary** | `padding: 0.55rem 1.1rem; border-radius: 9px; font-size: 0.82rem; font-weight: 700; font-family: var(--font-ui); background: var(--accent); color: var(--bg); transition: all 0.18s; cursor: pointer;` |
| **Primary Hover** | `transform: translateY(-1px); box-shadow: 0 4px 12px var(--accent-bg);` |
| **Login (Large)** | `width: 100%; padding: 0.8rem; background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #1a1a1a; border-radius: 10px; font-weight: 800; font-size: 0.92rem; font-family: var(--font-heading);` |
| **Ghost** | `background: transparent; border: 1px solid var(--border); color: var(--text);` |
| **Danger** | `background: var(--red); color: white;` |

### 4.3 Input Field

```css
.inp-field {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--text);
  background: var(--surface);
  transition: border-color 0.18s, box-shadow 0.18s;
}
.inp-field:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-bg); }
.inp-field::placeholder { color: var(--muted); opacity: 0.6; }

.inp-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.35rem;
}
```

### 4.4 Tag / Badge (7 Variants)

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

/* Variants */
.tag-green    { background: var(--green-bg); color: var(--green); }
.tag-amber    { background: var(--amber-bg); color: var(--amber); }
.tag-red      { background: var(--red-bg); color: var(--red); }
.tag-blue     { background: var(--blue-bg); color: var(--blue); }
.tag-gold     { background: rgba(201,149,42,0.15); color: #c9952a; }
.tag-rust     { background: rgba(212,98,42,0.15); color: #d4622a; }
.tag-teal     { background: rgba(14,124,106,0.15); color: #0e7c6a; }
```

**Usage by Role:**
| Role | Primary Tag | Verified | Pending | Rejected |
|------|-------------|----------|---------|----------|
| Landlord | `.tag-rust` | `.tag-green` | `.tag-amber` | `.tag-red` |
| Tenant | `.tag-teal` | `.tag-green` | `.tag-amber` | `.tag-red` |
| Agent | `.tag-gold` | `.tag-green` | `.tag-amber` | `.tag-red` |
| Admin | `.tag-blue` | `.tag-green` | `.tag-amber` | `.tag-red` |
| EM | `.tag-blue` | `.tag-green` | `.tag-amber` | `.tag-red` |

### 4.5 Nav Item (Sidebar)

```css
.nav-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.62rem 0.75rem; border-radius: 10px;
  font-size: 0.84rem; font-weight: 500; color: var(--text);
  min-height: 44px; /* Touch target */
  transition: all 0.18s;
  cursor: pointer;
}
.nav-item:hover { background: var(--accent-bg); }
.nav-item.active { background: var(--accent-bg); }
.nav-item.active::before {
  content: ''; width: 3px; height: 20px;
  background: var(--accent); border-radius: 0 2px 2px 0;
  margin-right: 0.5rem;
}
.nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }
```

### 4.6 Toast

```css
.toast {
  position: fixed; bottom: 1.5rem; left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: 0.7rem 1.2rem;
  border-radius: 100px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 9999;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.toast.visible { transform: translateX(-50%) translateY(0); }
```

### 4.7 Avatar / Initials Circle

```css
.avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.85rem; font-family: var(--font-heading);
  color: #1a1a1a;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
}
```

### 4.8 Layout — Dashboard Shell

```css
.app-layout { display: flex; height: 100vh; overflow: hidden; }

.sidebar {
  flex-shrink: 0; width: 240px; overflow-y: auto;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.sb-header { padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); }
.sb-user-card { padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.75rem; align-items: center; }
.sb-nav { flex: 1; padding: 0.75rem; overflow-y: auto; }
.sb-footer { padding: 1rem 1.2rem; border-top: 1px solid var(--border); }

.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.topbar {
  padding: 0.9rem 1.8rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  display: flex; align-items: center; justify-content: space-between;
}
.content-area {
  flex: 1; overflow-y: auto;
  padding: 1.6rem 1.8rem;
  background: var(--bg);
}
```

### 4.9 Grid Systems

```css
/* 2 Column */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

/* 3 Column KPI */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

/* 4 Column KPI */
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.7rem; }

/* Listing Cards (Responsive) */
.grid-listings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.2rem;
}
```

---

## 5. Mobile Patterns & Breakpoints

### 5.1 Breakpoint Definitions

```css
/* Tablet / Mobile ≤ 768px */
@media (max-width: 768px) {
  .sidebar {
    position: fixed; top: 0; left: -280px; bottom: 0;
    z-index: 100; width: 280px;
    transition: left 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .sidebar.open { left: 0; }
  .sidebar-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 99; opacity: 0; pointer-events: none;
    transition: opacity 0.2s;
  }
  .sidebar-overlay.visible { opacity: 1; pointer-events: auto; }
  .content-area { padding: 1rem; }
  .grid-3, .grid-4 { grid-template-columns: 1fr 1fr; }
  
  /* Modals → Bottom Sheets */
  .modal {
    position: fixed; bottom: 0; left: 0; right: 0;
    border-radius: 16px 16px 0 0;
    max-height: 85vh; overflow-y: auto;
    transform: translateY(100%);
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .modal.open { transform: translateY(0); }
  .modal-handle { /* drag indicator */ }
}

/* Small Phones ≤ 480px */
@media (max-width: 480px) {
  .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .topbar { padding: 0.75rem 1rem; }
  .card-head, .card-body { padding: 0.85rem 1rem; }
}
```

### 5.2 Mobile Navigation

```html
<!-- Hamburger in topbar (mobile only) -->
<button class="mob-menu-btn" data-action="toggle-sidebar" aria-label="Menu">
  <svg><!-- hamburger icon --></svg>
</button>

<!-- Sidebar overlay -->
<div class="sidebar-overlay" data-action="close-sidebar"></div>
```

### 5.3 Touch Targets
- **Minimum:** 44×44px (enforced on `.nav-item`, buttons, interactive elements)
- **Spacing:** 8px minimum between touch targets

---

## 6. Screen Inventory

### 6.1 Landing / Public

| Screen | Key Components | States |
|--------|---------------|--------|
| Landing Hero | Search bar, Type tabs, Trust badge legend | Authenticated / Guest |
| Listing Grid | Cards (image, price, specs, trust badge), Filters sidebar, Sort | Empty / Loading / Results |
| Listing Detail | Gallery, Specs, Map, Verification layers, CTA | Owner / Tenant / Agent |
| Auth: Login | Role picker, Email/password, Forgot link | Error / Loading / Success |
| Auth: Signup | Role picker, Full form, Password strength | Validation / Submitting |
| Auth: Purpose Picker (Tenant) | 4 cards: Rent/Buy/Short-let/Share | Selected / Hover |

### 6.2 Landlord Dashboard (9 Screens)

| Screen | Key Components |
|--------|---------------|
| Home | KPI cards (4), Quick actions, Recent activity, Verification status |
| Properties | Grid of listings with status badges, Actions (edit, verify, delete) |
| Rent Collection | Transaction table, Status filters, Receipt links |
| Add Listing | 2-step: Form → Photos, Preview, Submit |
| Screening Calls | Scheduled calls list, Tenant profile modal, Notes |
| Agreements | List with status badges, Preview, Sign, PDF |
| Messages | Conversation list (left) + Thread (right), 4s polling |
| Verify Property | 5-step wizard, Layer status, Document upload, QR video |
| Profile | Identity verification, Personal info, Password, Notifications |

### 6.3 Tenant Dashboard (10 Screens × 4 Purposes)

| Purpose | Screens |
|---------|---------|
| **Rent** | Home, Find Property, Rent & Payments, My Agreements, Maintenance, Screening Call, My Profile, Receipts, Messages, Settings |
| **Buy** | Home, Find Property, My Offers, Agreements, My Profile, Messages |
| **Short-let** | Home, Find Property, Bookings, My Profile, Messages |
| **Share** | Home, Find Roommates, My Listings, My Profile, Messages |

**Shared Components:** Purpose switcher (top), Sidebar (context-aware), Trust badge on all listings

### 6.4 Agent Dashboard (7 Screens)

| Screen | Key Components |
|--------|---------------|
| Home | Pipeline stats (4 KPIs), Recent activity |
| Deal Pipeline | Kanban: Enquiry → Viewing → Offer → Agreement → Completed |
| Managed Listings | Grid with commission %, Verification assist buttons |
| Inspections | Calendar, Scheduled/Completed, Notes |
| Commissions | Table: Deal, Type, Platform Fee, My Commission, Status |
| My Clients | List: Tenants + Landlords, Contact, Deal Stage |
| Reputation | Score 1-100, Badge, Breakdown factors |
| Messages | Shared component |
| Profile | Identity, Agent bio, Areas, Tier |

### 6.5 Admin Console (7 Screens)

| Screen | Key Components |
|--------|---------------|
| Overview | Platform KPIs (Users, Listings, GMV, Revenue), Charts |
| Verification Queue | Table: Listing, Owner, Layer badges, Docs, Approve/Reject per layer |
| Flags | Flagged listings, Type, Reporter, Actions (dismiss/suspend/ban) |
| Disputes | List, Evidence viewer, Mediation, Ruling |
| Users | Table, Filters, Suspend, Approve Agent |
| Revenue | GMV, Platform fees, Agent commissions, Subscriptions, Export |
| Settings | Platform config, Feature flags |

### 6.6 Estate Manager Dashboard (9 Screens)

| Screen | Key Components |
|--------|---------------|
| Home (Onboarding Wizard if no org) | Step 1: Org details, Step 2: Plan selection, Step 3: Done |
| Portfolio | Properties grid, Unit status (vacant/occupied/maintenance), Add unit |
| Rent Ledger | Table: Unit, Tenant, Rent, Due, Status, Payments, Filters, Export |
| Maintenance | Tabs (All/Open/Assigned/In Progress/Resolved), Create ticket, Assign |
| Bulk Import | Template download, CSV upload, Validation results, Error report |
| Agreements | Org agreements list, Status, Preview |
| Team | Members table, Invite (email + role), Seat limits, Change role/revoke |
| Billing | Current plan, Upgrade/downgrade, Paystack portal, Invoices |
| Reports | Month picker, JSON data (Phase 5: PDF) |

---

## 7. Interaction Patterns

### 7.1 State-Driven Rendering

```javascript
// NEVER mutate DOM directly
// ALWAYS: setState(patch) → render()

function setState(patch) {
  Object.assign(STATE, patch);
  render();
}

// Template literal conditional rendering
const html = `${user.nin_verified 
  ? '<span class="tag tag-green">✅ NIN Verified</span>' 
  : '<span class="tag tag-amber">⏳ NIN Pending</span>'}`;
```

### 7.2 Event Delegation

```javascript
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  switch (action) {
    case 'nav': navigate(el.dataset.page); break;
    case 'goto-login': setState({ view: 'login' }); break;
    case 'toast': showToast(el.dataset.msg); break;
    // Dynamic actions use inline onclick in templates
  }
});

// For dynamic values inside templates:
// onclick="openConversation('${landlordId}', '${listingId}')"
```

### 7.3 Optimistic UI (Messaging)

```javascript
// Send message
async function sendMessage(convId, content) {
  const tempId = 'msg_' + Date.now();
  // 1. Optimistic add
  DATA.messages[convId].push({ id: tempId, content, sender_id: STATE.user.id, is_read: true, created_at: new Date().toISOString() });
  renderMessagesPanel(convId);
  
  // 2. Actual API
  const res = await apiCall('POST', `/api/messages/conversations/${convId}/messages`, { content });
  if (!res.success) {
    // Rollback
    DATA.messages[convId] = DATA.messages[convId].filter(m => m.id !== tempId);
    showToast('Failed to send');
  }
  renderMessagesPanel(convId);
}
```

### 7.4 Polling Pattern (Messages)

```javascript
function startMsgPolling(convId) {
  if (STATE.pollingIntervals[convId]) return;
  STATE.pollingIntervals[convId] = setInterval(async () => {
    const lastMsg = DATA.messages[convId]?.slice(-1)[0];
    const since = lastMsg?.created_at || '';
    const res = await apiCall('GET', `/api/messages/conversations/${convId}/messages?since=${since}`);
    if (res.success && res.data.length) {
      DATA.messages[convId].push(...res.data);
      renderMessagesPanel(convId);
    }
  }, 4000);
}
```

---

## 8. Error & Empty States

### 8.1 Error State Components

| Situation | Component | Message |
|-----------|-----------|---------|
| Network down | Toast | "Connection failed. Check internet." |
| 401 (refresh valid) | Silent | Auto-refresh + retry |
| 401 (refresh expired) | Redirect | "Session expired. Please sign in." |
| 403 | Toast | "You don't have permission for this action." |
| 404 | Inline Empty State | Illustration + "Not found" + CTA |
| 422 | Inline Field Errors | Red border + message below field |
| 500 | Toast | "Something went wrong. Try again." |

### 8.2 Empty State Pattern

```html
<div class="empty-state">
  <svg class="empty-icon"><!-- relevant icon --></svg>
  <h3 class="empty-title">No listings yet</h3>
  <p class="empty-desc">Get started by adding your first property.</p>
  <button class="btn-primary" data-action="nav" data-page="listing">Add Listing</button>
</div>
```

---

## 9. Accessibility

### 9.1 Implemented
- Semantic HTML5 (`<main>`, `<nav>`, `<section>`, `<button>`, `<label>`)
- Focus visible states on all interactive elements
- ARIA labels on icon-only buttons (`aria-label`)
- Color contrast: WCAG AA minimum (tested per theme)
- Touch targets ≥ 44px
- Form labels linked via `for` / `id`

### 9.2 To Improve
- Keyboard navigation for all modals/drawers
- Screen reader announcements for toast/polling updates
- Reduced motion preference (`prefers-reduced-motion`)
- Focus trap in modals/bottom sheets

---

## 10. Performance Considerations

### 10.1 Current Optimizations
- Single HTML file — no build step, no bundle
- CSS in `<style>` — no flash of unstyled content
- Google Fonts with `display=swap`
- Cloudinary auto-format/quality (`f_auto,q_auto`)
- Delegated events — single listener
- Template literal rendering — no VDOM overhead

### 10.2 Known Issues
- `index.html` ~420KB, ~7000 lines — large initial payload
- All JS parsed on load — no code splitting
- No service worker / offline support
- Images not lazy-loaded (add `loading="lazy"`)

### 10.3 Phase 9 Optimizations (Planned)
- Skeleton loading states (CSS-only)
- Cloudinary transformations enabled
- Code splitting → migrate to build step (Vite/Next.js)
- SEO: Dynamic meta tags, Open Graph

---

## 11. Design Handoff Checklist

| Item | Status | Notes |
|------|--------|-------|
| Design tokens (colours, spacing, type, radius) | ✅ Complete | In CSS custom properties |
| Role themes (5) | ✅ Complete | Body class switching |
| Component library (8 components) | ✅ Complete | Documented with specs |
| Screen inventory (34 screens) | ✅ Complete | Per role + purpose |
| Mobile breakpoints (768px, 480px) | ✅ Complete | Off-canvas, bottom sheets |
| Interaction patterns | ✅ Complete | State-driven, delegation |
| Error/empty states | ✅ Complete | Toast, inline, empty state |
| Accessibility audit | ⚠️ Partial | WCAG AA colours, need keyboard |
| Performance baseline | ✅ Measured | 420KB, no build step |

---

## 12. Future Design Work

| Initiative | Effort | Priority |
|------------|--------|----------|
| Design system documentation site | 1 week | Medium |
| Figma component library sync | 3 days | Medium |
| Dark mode for landing/tenant | 2 days | Low |
| React Native design tokens export | 1 week | Future (mobile app) |
| White-label theme builder (EM Enterprise) | 2 weeks | Post-launch |

---

*This brief is the single source of truth for PROPATI visual design. All screens, components, and tokens derive from these specifications.*
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
