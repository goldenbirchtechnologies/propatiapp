# PROPATI Database Seed Script

## Overview

The seed script (`prisma/seed.ts`) generates comprehensive test data for PROPATI development, including all 5 user roles, diverse listings, organizations, agreements, and more.

## Prerequisites

Before running the seed script:

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Set up environment variables** in `.env`:
   ```env
   DATABASE_URL="postgresql://..."
   NODE_ENV="development"
   ```

3. **Run migrations** to ensure the database schema is up to date:
   ```bash
   npm run db:migrate
   ```

## Running the Seed

### Option 1: Using npm script (recommended)
```bash
npm run db:seed
```

### Option 2: After migrations (automatic)
The seed script will run automatically after `prisma migrate dev`:
```bash
npm run db:migrate
```

### Option 3: Direct execution
```bash
npx tsx prisma/seed.ts
```

## What Gets Seeded

### 1. **5 Test Users** (one per role)

| Role            | Email                  | Password     | Full Name          |
|-----------------|------------------------|--------------|-------------------|
| Landlord        | landlord@propati.ng    | Propati123@  | Chukwudi Okonkwo  |
| Tenant          | tenant@propati.ng      | Propati123@  | Amina Bello       |
| Agent           | agent@propati.ng       | Propati123@  | Tunde Adeyemi     |
| Admin           | admin@propati.ng       | Propati123@  | Ngozi Eze         |
| Estate Manager  | manager@propati.ng     | Propati123@  | Oluwaseun Adeleke |

**Tenant Profile Features:**
- Employment: Senior Banking Officer at Zenith Bank PLC
- Yearly Income: ₦7.2M (verified)
- Guarantor: Ibrahim Bello (Brother)

**Agent Profile Features:**
- Tier: Senior
- Status: Approved
- Areas: Lekki, Victoria Island, Ikoyi, Ikeja

### 2. **3 Organizations**

1. **Lagos Prime Estates Limited**
   - Plan: Growth (50 units, 5 seats)
   - Owner: Estate Manager
   - CAC: RC1234567

2. **Victoria Gardens Management**
   - Plan: Starter (20 units, 1 seat)
   - Owner: Landlord
   - CAC: RC2345678

3. **Mainland Property Solutions**
   - Plan: Enterprise (200 units, 15 seats)
   - Owner: Estate Manager
   - CAC: RC3456789

### 3. **10 Diverse Listings**

#### By Verification Tier:
- **Basic (3)**: Ikeja apartment, Yaba room share, Apapa warehouse
- **Verified (4)**: Lekki duplex, Lekki shortlet, Surulere shop, + 1 more
- **Inspected (2)**: Victoria Island apartment, Ikeja office
- **Certified (1)**: Ibeju-Lekki beachfront land

#### By Type:
- **Rent (4)**: Various apartments and duplexes
- **Sale (3)**: Duplex, land, mansion (draft)
- **Short-let (1)**: 1-bedroom apartment
- **Share (1)**: Room in shared flat
- **Commercial (3)**: Office, shop, warehouse

#### By Property Type:
- Apartments, duplexes, houses, land, offices, shops, warehouses

#### Featured Listings:
- Luxury 4-bedroom duplex (Lekki) - ₦85M
- Premium 3-bedroom apartment (VI) - ₦4.5M/year
- Prime beachfront land - ₦120M

### 4. **2 Agreements**

1. **Fully Signed Agreement**
   - Property: Premium 3-bedroom apartment (VI)
   - Parties: Landlord ↔ Tenant (via Agent)
   - Term: Aug 2025 - Jul 2026
   - Rent: ₦4.5M/year
   - Status: Both parties signed

2. **Pending Agreement**
   - Property: 2-bedroom apartment (Ikeja)
   - Parties: Landlord ↔ Tenant
   - Term: Jul 2025 - Jun 2026
   - Rent: ₦1.2M/year
   - Status: Landlord signed, awaiting tenant

### 5. **2 Transactions**

1. **Released Rent Payment**
   - Amount: ₦4.5M
   - Platform Fee: ₦225k (5%)
   - Agent Commission: ₦450k (10%)
   - Status: Released to landlord

2. **Escrowed Caution Deposit**
   - Amount: ₦2.25M
   - Status: Held in escrow

### 6. **2 Conversations with 7 Messages**

- Tenant inquiries about available properties
- Real-world conversation flow
- Mixed read/unread status for testing

### 7. **Additional Test Data**

- 4 Notifications (message alerts, agreement reminders)
- 3 Saved Listings (tenant favorites)
- 1 Screening Call (scheduled)
- 1 Maintenance Ticket (AC issue)
- Verification records for all tiers
- Organization-listing associations

## Test Data Features

### Realistic Nigerian Context
- Lagos addresses (Lekki, VI, Ikeja, Ikoyi, etc.)
- Nigerian phone numbers (+234...)
- Local property prices and rent patterns
- CAC registration numbers
- Common amenities (generator, security, etc.)

### Complete Verification Pipeline
- Basic tier: No verification
- Verified: Documents + ID verified
- Inspected: + Video tour + physical inspection
- Certified: + Admin approval with notes

### Diverse Property Portfolio
- Price range: ₦300k/year (room share) to ₦250M (mansion)
- All major Lagos areas covered
- Residential, commercial, and land listings
- Rent, sale, short-let, and shared accommodations

## Cleanup

The seed script automatically cleans up existing data in development/test environments before seeding. It will NOT run cleanup in production.

To manually reset and re-seed:

```bash
# Option 1: Run seed again (auto-cleanup in dev)
npm run db:seed

# Option 2: Reset database completely
npx prisma migrate reset
# This will drop the database, run migrations, and run the seed script
```

## Troubleshooting

### Error: "Invalid clerkId format"
The seed script generates random Clerk IDs. If you need specific Clerk IDs, update the `generateClerkId()` function in `seed.ts`.

### Error: "Unique constraint violation"
This usually means the database wasn't cleaned up. Try running:
```bash
npx prisma migrate reset
```

### Error: "tsx not found"
Install the missing dependency:
```bash
npm install -D tsx
```

### Error: "Cannot connect to database"
Check your `DATABASE_URL` in `.env` and ensure PostgreSQL/Supabase is running.

## Development Tips

### Using Seeded Data
After seeding, you can log in with any of the test accounts to explore different user experiences:

```typescript
// Example: Login as tenant
email: "tenant@propati.ng"
password: "Propati123@"
```

### Prisma Studio
View and edit seeded data visually:
```bash
npm run db:studio
```

### Customizing Seed Data
Edit `prisma/seed.ts` to:
- Add more users/listings
- Change property details
- Adjust prices and locations
- Add custom scenarios

## Next Steps

After seeding:

1. ✅ Start the development server: `npm run dev`
2. ✅ Open Prisma Studio: `npm run db:studio`
3. ✅ Test authentication with seeded users
4. ✅ Test listing search and filters
5. ✅ Test messaging between users
6. ✅ Test agreement workflow
7. ✅ Test payment flows (use Paystack test keys)

## Notes

- All passwords are hashed with bcrypt (cost factor 12)
- Clerk IDs are randomly generated (replace with real Clerk IDs in production)
- Transaction amounts are in kobo (smallest Nigerian currency unit)
- All dates are in ISO format with timezone info
- Images use Unsplash demo URLs (replace with real Cloudinary URLs in production)

---

**Need help?** Check `BUILD_PLAN.md` for the complete development roadmap.
