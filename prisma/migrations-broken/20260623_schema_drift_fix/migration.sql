-- Migration: 20260623_schema_drift_fix
-- Description: Add columns accessed by API routes but missing from schema
--   Agreement.pdf_url         — used by evincece-packs/[id] select
--   Transaction.currency      — used by evincece-packs aggregate select
--   Transaction.paystack_ref  — used by evincece-packs aggregate select
--   Transaction.paid_at       — used by evincece-packs aggregate select
--   LawFirm.billing_email     — used by evincece-packs/[id] include

-- Up

-- agreements: add pdf_url column
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;

-- transactions: add currency, paystack_ref, paid_at columns
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'NGN';
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "paystack_ref" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMPTZ;

-- law_firms: add billing_email column
ALTER TABLE "law_firms" ADD COLUMN IF NOT EXISTS "billing_email" TEXT;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS "idx_transactions_paystack_ref" ON "transactions"("paystack_ref");
CREATE INDEX IF NOT EXISTS "idx_transactions_paid_at"    ON "transactions"("paid_at");

-- Down

-- ALTER TABLE "transactions" DROP COLUMN IF EXISTS "paid_at";
-- ALTER TABLE "transactions" DROP COLUMN IF EXISTS "paystack_ref";
-- ALTER TABLE "transactions" DROP COLUMN IF EXISTS "currency";
-- ALTER TABLE "agreements"  DROP COLUMN IF EXISTS "pdf_url";
-- ALTER TABLE "law_firms"   DROP COLUMN IF EXISTS "billing_email";
