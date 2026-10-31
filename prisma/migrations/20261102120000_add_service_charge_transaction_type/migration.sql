-- Service charge as a payable transaction type.
--
-- The payment UI, payment-utils fee table and the payment modal all already
-- offered `service_charge`, but the enum, the request validator and the fee
-- calculator did not know it — so choosing it failed validation before a
-- Paystack call was ever made. This adds the missing value.
--
-- Additive only: no existing rows are touched and the new label cannot collide
-- (guarded with IF NOT EXISTS so the migration is re-runnable on an environment
-- seeded via `prisma db push`).

ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'service_charge';
