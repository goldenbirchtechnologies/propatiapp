-- Paystack subaccount routing on the paystack_accounts row.
--
-- A dedicated virtual account (`account_number` / `dedicated_account_id`) and a
-- subaccount are not alternatives: the DVA is the number the payer transfers
-- into, and `subaccount_code` decides which split that money settles against.
-- Storing both lets an agent hold their own virtual account while the platform
-- still takes its percentage.
--
-- Additive and guarded, so it applies cleanly to environments created with
-- `prisma db push` as well as ones that ran the baseline migration.

ALTER TABLE "paystack_accounts" ADD COLUMN IF NOT EXISTS "subaccount_code" TEXT;
ALTER TABLE "paystack_accounts" ADD COLUMN IF NOT EXISTS "percentage_charge" DECIMAL(5, 2);

CREATE UNIQUE INDEX IF NOT EXISTS "paystack_accounts_subaccount_code_key"
    ON "paystack_accounts"("subaccount_code");
