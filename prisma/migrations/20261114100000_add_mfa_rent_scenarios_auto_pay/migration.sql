-- TOTP MFA, saved rent-forecast scenarios, and auto-pay mandates.
--
-- All three were previously faked in the dashboard UI: the security tab listed
-- invented sessions, the scenario builder discarded what you typed, and the
-- auto-pay switch was local state. These tables give each one somewhere real to
-- live.
--
-- Every statement is guarded so the migration applies cleanly to environments
-- created with `prisma db push` as well as ones that ran the baseline.

-- Second factor. The shared secret and the recovery-code hashes are written by
-- src/lib/mfa/totp.ts; nothing here is ever read back in plaintext.
CREATE TABLE IF NOT EXISTS "user_mfa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "secret_enc" TEXT NOT NULL,
    "totp_verified" BOOLEAN NOT NULL DEFAULT false,
    "recovery_code_hashes" JSONB NOT NULL DEFAULT '[]',
    "last_used_at" TIMESTAMP(3),
    "enabled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_mfa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_mfa_user_id_key" ON "user_mfa"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_mfa_user" ON "user_mfa"("user_id");

DO $$ BEGIN
  ALTER TABLE "user_mfa"
    ADD CONSTRAINT "user_mfa_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Saved forecast scenarios. `assumptions` holds the builder state verbatim so
-- a scenario survives the builder growing new fields.
CREATE TABLE IF NOT EXISTS "rent_scenarios" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "assumptions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_scenarios_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_rent_scenarios_user" ON "rent_scenarios"("user_id");

DO $$ BEGIN
  ALTER TABLE "rent_scenarios"
    ADD CONSTRAINT "rent_scenarios_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-pay mandates. This records the instruction a tenant submitted; it is not
-- a live Paystack Direct-Debit subscription, which is why `status` starts at
-- 'requested' and there is no happy-path that writes 'active'.
CREATE TABLE IF NOT EXISTS "auto_pay_mandates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "agreement_id" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "exec_day" INTEGER NOT NULL DEFAULT 1,
    "amount_strategy" TEXT NOT NULL DEFAULT 'fixed',
    "threshold" BIGINT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'requested',
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_pay_mandates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_auto_pay_mandates_user" ON "auto_pay_mandates"("user_id");

DO $$ BEGIN
  ALTER TABLE "auto_pay_mandates"
    ADD CONSTRAINT "auto_pay_mandates_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "auto_pay_mandates"
    ADD CONSTRAINT "auto_pay_mandates_agreement_id_fkey"
    FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
