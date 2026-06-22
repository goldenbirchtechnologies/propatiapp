# Short-Let Engine — Implementation Summary

## Schema models added (prisma/schema.prisma)
- `CalendarSlot` — per-date availability and price overrides
- `PricingRule` — dynamic pricing per listing (seasonal, weekend, last-minute, early-bird, custom)
- `Booking` — guest booking with nights, total price, status, payment status, check-in/out

## Migration
- `prisma/migrations/short-let-engine/migration.sql` — raw SQL migration for Supabase/Postgres
- Run manually or via `psql` against `DATABASE_URL` when ready

## API routes added
- `GET /api/bookings` — list bookings (landlord=own, tenant=own, admin=all)
- `POST /api/bookings` — create booking (tenant/admin); checks overlap and listing status
- `GET /api/bookings/[id]` — get booking detail
- `PATCH /api/bookings/[id]` — update booking status/check-in-out
- `DELETE /api/bookings/[id]` — cancel booking
- `GET /api/listings/[id]/calendar` — list calendar slots for listing
- `POST /api/listings/[id]/calendar` — create/bulk upsert calendar slots
- `GET /api/listings/[id]/pricing` — list pricing rules for listing
- `POST /api/listings/[id]/pricing` — create pricing rule
- `PATCH /api/listings/[id]/pricing/[ruleId]` — update pricing rule
- `DELETE /api/listings/[id]/pricing/[ruleId]` — remove pricing rule

## Pages added
- `src/app/(public)/short-let/page.tsx` — public short-let browse/search
- `src/app/(public)/short-let/[id]/page.tsx` — short-let detail + reserve form
- `src/app/dashboard/landlord/short-let/page.tsx` — landlord calendar + pricing

## Validators added
- `src/lib/validators.short-let.ts` — booking, calendar slot, pricing rule schemas

## Navigation
- Added "Short-let Calendar" to `LANDLORD_NAVIGATION` in `src/lib/navigation.tsx`

## Next steps
1. Run the migration against Supabase
2. Generate Prisma client: `npx prisma generate`
3. Connect booking creation to Paystack initiation
4. Add tenant short-let trips view ("My Bookings")
5. Extend public short-let page with real API data instead of mock data
