-- Rent-collection settings on the landlord profile row.
--
-- These four columns replace the client-side toggles that used to live only in
-- React state on /dashboard/landlord/profile, so a switch now survives a reload.
-- They sit beside the settlement columns the onboarding step already writes
-- rather than on the shared User row: a landlord's invoicing preference has no
-- meaning for a tenant, and keeping it here means a read can never pick up
-- another user's value.
--
-- Defaults reproduce the behaviour of the old hardcoded UI (all three features
-- on, 10% escrow split), so existing rows read the same after the migration.
-- Additive and guarded, so it applies cleanly to environments created with
-- `prisma db push` as well as ones that ran the baseline migration.

ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "paystack_invoicing_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "payment_reminders_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "stamp_duty_surcharge_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "landlord_profiles" ADD COLUMN IF NOT EXISTS "escrow_split_percent" INTEGER NOT NULL DEFAULT 10;
