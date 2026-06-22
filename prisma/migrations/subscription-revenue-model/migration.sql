-- ===========================================================================
-- PROPATI SUBSCRIPTION REVENUE MODEL MIGRATION
-- Upgrades SubscriptionPlan and UserSubscription to full revenue model
-- ===========================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. SubscriptionPlan — upgrade to dual pricing + quotas
-- ---------------------------------------------------------------------------

ALTER TABLE "subscription_plans"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "price_monthly" NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "price_yearly" NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "max_listings" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "max_users" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "max_properties" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "support_level" TEXT;

-- Migrate existing data onto new columns (baseline both prices to old single price)
UPDATE "subscription_plans"
SET
  "price_monthly" = COALESCE("price", 0),
  "price_yearly"  = COALESCE("price", 0);

ALTER TABLE "subscription_plans"
  ALTER COLUMN "price_monthly" DROP DEFAULT,
  ALTER COLUMN "price_yearly"  DROP DEFAULT;

ALTER TABLE "subscription_plans"
  DROP COLUMN IF EXISTS "price",
  DROP COLUMN IF EXISTS "interval";

-- ---------------------------------------------------------------------------
-- 2. UserSubscription — full period + paystack fields
-- ---------------------------------------------------------------------------

ALTER TABLE "user_subscriptions"
  ADD COLUMN IF NOT EXISTS "current_period_start" TIMESTAMP NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "ended_at" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "paystack_customer_id" TEXT,
  ADD COLUMN IF NOT EXISTS "paystack_subscription_code" TEXT;

-- Migrate old Paystack sub id to new field
UPDATE "user_subscriptions"
SET "paystack_subscription_code" = "paystack_sub_id"
WHERE "paystack_sub_id" IS NOT NULL;

ALTER TABLE "user_subscriptions"
  DROP COLUMN IF EXISTS "paystack_sub_id";

-- Remap old status values that no longer exist in the enum (expired -> cancelled)
UPDATE "user_subscriptions"
SET "status" = 'cancelled'
WHERE "status" = 'expired';

-- Cast status column from text to enum SubscriptionStatus
ALTER TABLE "user_subscriptions"
  ALTER COLUMN "status" TYPE "SubscriptionStatus" USING "status"::"SubscriptionStatus";

-- ---------------------------------------------------------------------------
-- 3. Extend SubscriptionStatus enum with new values used by the model
-- ---------------------------------------------------------------------------

ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'trialing';
ALTER TYPE "SubscriptionStatus" ADD VALUE IF NOT EXISTS 'past_due';

COMMIT;
