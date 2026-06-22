# 05 – Navigation Maps

## 1. Public Navigation

| Item | Destination | Visibility |
|------|-------------|------------|
| Logo | `/` | Always |
| Search | `/listings` | Always |
| Sign In | `/sign-in` | Unauthenticated |
| Sign Up | `/sign-up` | Unauthenticated |

## 2. Role Navigation Configs

Defined in `src/lib/navigation.tsx`:

- `LANDLORD_NAVIGATION` — 9 items
- `TENANT_NAVIGATION` — 9 items
- `AGENT_NAVIGATION` — 9 items
- `ADMIN_NAVIGATION` — 6 items
- `ESTATE_MANAGER_NAVIGATION` — 9 items

Dispatch via `getNavigationForRole(role)`.

## 3. Tenant Navigation

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/dashboard/tenant` | Home |
| Find Property | `/dashboard/tenant/search` | Search |
| Rent & Payments | `/dashboard/tenant/payments` | DollarSign |
| My Agreements | `/dashboard/tenant/agreements` | FileText |
| Maintenance | `/dashboard/tenant/maintenance` | Wrench |
| Screening Calls | `/dashboard/tenant/screening` | Phone |
| My Profile | `/dashboard/tenant/profile` | User |
| Receipts | `/dashboard/tenant/receipts` | Receipt |
| Messages | `/dashboard/tenant/messages` | MessageSquare |

## 4. Landlord Navigation

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/dashboard/landlord` | Home |
| My Properties | `/dashboard/landlord/properties` | Building2 |
| Rent Collection | `/dashboard/landlord/rent` | DollarSign |
| Add Listing | `/dashboard/landlord/listing/new` | Plus |
| Screening Calls | `/dashboard/landlord/screening` | Phone |
| Agreements | `/dashboard/landlord/agreements` | FileText |
| Messages | `/dashboard/landlord/messages` | MessageSquare |
| Verify Property | `/dashboard/landlord/verify` | Shield |
| My Profile | `/dashboard/landlord/profile` | User |

## 5. Agent Navigation

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/dashboard/agent` | Home |
| Deal Pipeline | `/dashboard/agent/pipeline` | BarChart2 |
| Managed Listings | `/dashboard/agent/listings` | Building2 |
| Inspections | `/dashboard/agent/inspections` | Eye |
| Commissions | `/dashboard/agent/commissions` | DollarSign |
| My Clients | `/dashboard/agent/clients` | Users |
| Reputation | `/dashboard/agent/reputation` | Star |
| My Profile | `/dashboard/agent/profile` | User |
| Messages | `/dashboard/agent/messages` | MessageSquare |

## 6. Estate Manager Navigation

| Label | Route | Icon |
|-------|-------|------|
| Home | `/dashboard/estate-manager` | Home |
| Portfolio | `/dashboard/estate-manager/portfolio` | Building2 |
| Rent Ledger | `/dashboard/estate-manager/ledger` | DollarSign |
| Maintenance | `/dashboard/estate-manager/maintenance` | Wrench |
| Bulk Import | `/dashboard/estate-manager/bulk-import` | Plus |
| Agreements | `/dashboard/estate-manager/agreements` | FileText |
| Team | `/dashboard/estate-manager/team` | Users |
| Billing | `/dashboard/estate-manager/billing` | Receipt |
| Reports | `/dashboard/estate-manager/reports` | BarChart2 |

## 7. Admin Navigation

| Label | Route | Icon |
|-------|-------|------|
| Dashboard | `/admin` | ChartNoAxesCombined |
| Verifications | `/admin/verifications` | Shield |
| Flagged Listings | `/admin/flagged-listings` | Flag |
| Users | `/admin/users` | Users |
| Agreements | `/admin/agreements` | FileText |
| Revenue | `/admin/revenue` | DollarSign |
| Audit Logs | `/admin/audit-logs` | FileText |
| Disputes | `/admin/disputes` | Gavel |
| Escrow | `/admin/escrow` | Lock |

## 8. Mobile Behavior

- Sidebar collapses to off-canvas drawer triggered by hamburger button
- Active nav item highlighted with role color
- Nested items collapsed by default
- Bottom sheets for modals at ≤768px
