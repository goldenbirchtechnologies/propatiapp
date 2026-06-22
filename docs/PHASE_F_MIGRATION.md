# Phase F: Estate Manager B2B - Database Migration Guide

## Overview

This document outlines the database schema changes required for Phase F (Estate Manager B2B) implementation.

## New Enums

### UnitStatus
```prisma
enum UnitStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
  UNAVAILABLE
}
```

### UnitOccupancy
```prisma
enum UnitOccupancy {
  VACANT
  OCCUPIED
  NOTICE_GIVEN
}
```

## New Tables

### units
Primary table for tracking individual units within estate management portfolios.

```prisma
model Unit {
  id                String        @id @default(cuid())
  organizationId    String
  organization      Organisation  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Location
  listingId         String?
  listing           Listing?      @relation(fields: [listingId], references: [id], onDelete: SetNull)
  buildingName      String?
  unitNumber        String

  // Details
  type              PropertyType
  bedrooms          Int
  bathrooms         Int
  sizeSqm           Decimal?      @db.Decimal(10, 2)

  // Financial
  rent              Decimal       @db.Decimal(10, 2)
  cautionDeposit    Decimal?      @db.Decimal(10, 2)
  serviceCharge     Decimal?      @db.Decimal(10, 2)

  // Status
  status            UnitStatus    @default(AVAILABLE)
  occupancy         UnitOccupancy @default(VACANT)

  // Tenant
  currentTenantId   String?
  currentTenant     User?         @relation("UnitCurrentTenant", fields: [currentTenantId], references: [id], onDelete: SetNull)
  leaseStartDate    DateTime?
  leaseEndDate      DateTime?

  // Maintenance
  lastMaintenanceDate DateTime?
  nextMaintenanceDate DateTime?

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([organizationId])
  @@index([status])
  @@index([occupancy])
  @@unique([organizationId, buildingName, unitNumber])
  @@map("units")
}
```

## Modified Tables

### User
Added relation for current tenants renting units:
```prisma
currentlyRentingUnits Unit[] @relation("UnitCurrentTenant")
```

### Organisation
Added relation for units:
```prisma
units Unit[]
```

### Listing
Added relation for units:
```prisma
units Unit[]
```

## Migration Steps

### 1. Generate Prisma Migration

```bash
npx prisma migrate dev --name add_units_for_estate_managers
```

### 2. Run Migration

```bash
npx prisma migrate deploy
```

### 3. Regenerate Prisma Client

```bash
npx prisma generate
```

### 4. Verify Migration

Check that the following are present in your database:
- `units` table
- `UnitStatus` enum
- `UnitOccupancy` enum
- Foreign key constraints:
  - `units.organizationId` → `organisations.id`
  - `units.listingId` → `listings.id` (nullable)
  - `units.currentTenantId` → `users.id` (nullable)

### 5. Seed Test Data (Optional)

```typescript
// Example seed data
await prisma.unit.createMany({
  data: [
    {
      organizationId: 'org_test123',
      unitNumber: '101',
      buildingName: 'Building A',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      sizeSqm: 85,
      rent: 150000,
      cautionDeposit: 300000,
      serviceCharge: 15000,
      status: 'AVAILABLE',
      occupancy: 'VACANT',
    },
    // ... more units
  ],
});
```

## Rollback Plan

If you need to rollback this migration:

```bash
# Revert the migration
npx prisma migrate resolve --rolled-back add_units_for_estate_managers

# Drop the units table manually if needed
# DROP TABLE units;
# DROP TYPE "UnitStatus";
# DROP TYPE "UnitOccupancy";
```

## Data Integrity Checks

After migration, verify:

1. **Unique Constraint**: No duplicate unit numbers within the same building/organization
```sql
SELECT organization_id, building_name, unit_number, COUNT(*)
FROM units
GROUP BY organization_id, building_name, unit_number
HAVING COUNT(*) > 1;
```

2. **Orphaned Units**: All units belong to valid organizations
```sql
SELECT u.*
FROM units u
LEFT JOIN organisations o ON u.organization_id = o.id
WHERE o.id IS NULL;
```

3. **Invalid Tenants**: All tenant references point to valid users
```sql
SELECT u.*
FROM units u
LEFT JOIN users usr ON u.current_tenant_id = usr.id
WHERE u.current_tenant_id IS NOT NULL AND usr.id IS NULL;
```

## Performance Considerations

### Indexes
The following indexes are created automatically:
- `idx_units_org` on `organizationId`
- `idx_units_status` on `status`
- `idx_units_occupancy` on `occupancy`

### Query Optimization
For large portfolios (1000+ units), consider:
1. Pagination on all unit lists (default: 20 per page)
2. Caching portfolio statistics (Redis)
3. Database connection pooling (Prisma built-in)

## Testing Checklist

After migration, test:

- [ ] Create unit via API
- [ ] Update unit details
- [ ] Delete unit
- [ ] Bulk upload CSV (10 units)
- [ ] Portfolio overview loads correctly
- [ ] Rent ledger displays unit data
- [ ] Unit filtering and search
- [ ] Tenant assignment
- [ ] Occupancy tracking
- [ ] Export CSV ledger

## Support

For migration issues:
- Check Prisma logs: `prisma migrate status`
- Review database logs for errors
- Verify environment variables (DATABASE_URL, DIRECT_URL)
- Contact: tech@propati.ng

## Related Files

- Schema: `prisma/schema.prisma`
- API Routes: `src/app/api/orgs/[id]/units/**/*.ts`
- React Hooks: `src/hooks/useUnits.ts`
- CSV Parser: `src/lib/csv-parser.ts`
- Documentation: `docs/UNITS_CSV_FORMAT.md`

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
