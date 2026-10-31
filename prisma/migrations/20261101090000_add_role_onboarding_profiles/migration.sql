-- Role-specific onboarding profiles.
--
-- The wizard already defined landlord / agent / estate-manager steps, but had
-- nowhere to store them: only the tenant steps had backing columns. These
-- tables (plus the per-step analytics flags on user_onboardings) let every role
-- finish onboarding. Written with IF NOT EXISTS guards so it can be applied to
-- an environment seeded via `prisma db push`.

-- ===========================================================================
-- landlord_profiles
-- ===========================================================================

CREATE TABLE IF NOT EXISTS "landlord_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    "legal_entity_type" TEXT,
    "legal_name" TEXT,
    "joint_owner_names" TEXT,
    "company_name" TEXT,
    "primary_phone" TEXT,
    "contact_email" TEXT,
    "mailing_address" TEXT,
    "tax_id_type" TEXT,
    "tax_number" TEXT,

    "account_name" TEXT,
    "bank_name" TEXT,
    "account_number_enc" TEXT,
    "bvn_enc" TEXT,
    "target_monthly_rent" BIGINT,
    "target_annual_rent" BIGINT,
    "security_deposit" BIGINT,
    "preferred_lease_duration" TEXT,
    "commission_consent" BOOLEAN NOT NULL DEFAULT false,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landlord_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "landlord_profiles_user_id_key"
    ON "landlord_profiles" ("user_id");

DO $$ BEGIN
    ALTER TABLE "landlord_profiles"
        ADD CONSTRAINT "landlord_profiles_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================================
-- agent_profiles
-- ===========================================================================

CREATE TABLE IF NOT EXISTS "agent_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    "legal_name" TEXT,
    "date_of_birth" TEXT,
    "home_address" TEXT,
    "business_phone" TEXT,
    "corporate_email" TEXT,
    "nin_or_bvn_or_tin_enc" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relationship" TEXT,

    "board" TEXT,
    "license_number" TEXT,
    "certificate_file_name" TEXT,
    "is_agency" BOOLEAN NOT NULL DEFAULT false,
    "cac_document_file_name" TEXT,
    "indemnity_policy_number" TEXT,
    "indemnity_expiry_date" TEXT,
    "code_of_conduct_consent" BOOLEAN NOT NULL DEFAULT false,

    "operational_territories" JSONB,
    "focus_areas" JSONB,
    "active_listings_count" INTEGER,

    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number_enc" TEXT,
    "commission_split_percent" INTEGER,
    "subscription_tier" TEXT,
    "primary_device_os" TEXT,
    "crm_notes" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "agent_profiles_user_id_key"
    ON "agent_profiles" ("user_id");

DO $$ BEGIN
    ALTER TABLE "agent_profiles"
        ADD CONSTRAINT "agent_profiles_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================================
-- estate_manager_profiles
-- ===========================================================================

CREATE TABLE IF NOT EXISTS "estate_manager_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    "legal_entity_name" TEXT,
    "is_corporate" BOOLEAN NOT NULL DEFAULT false,
    "cac_tin_number" TEXT,
    "professional_credential_number" TEXT,
    "professional_credential_board" TEXT,
    "office_address" TEXT,
    "business_phone" TEXT,
    "emergency_hotline" TEXT,

    "has_management_agreement" BOOLEAN NOT NULL DEFAULT false,
    "agreement_file_name" TEXT,
    "eviction_authority" BOOLEAN NOT NULL DEFAULT false,
    "eviction_authority_note" TEXT,
    "min_income_threshold" BIGINT,
    "guarantor_requirement_note" TEXT,
    "authority_submitted_at" TIMESTAMP(3),

    "trust_bank_name" TEXT,
    "trust_account_name" TEXT,
    "trust_account_number_enc" TEXT,
    "remittance_cycle" TEXT,
    "management_fee_type" TEXT,
    "management_fee_value" INTEGER,
    "wht_instruction_acknowledged" BOOLEAN NOT NULL DEFAULT false,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estate_manager_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "estate_manager_profiles_user_id_key"
    ON "estate_manager_profiles" ("user_id");

DO $$ BEGIN
    ALTER TABLE "estate_manager_profiles"
        ADD CONSTRAINT "estate_manager_profiles_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================================
-- user_onboardings: per-step flags for the new role-specific steps
-- ===========================================================================

ALTER TABLE "user_onboardings"
    ADD COLUMN IF NOT EXISTS "landlord_profile_done"    BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "landlord_settlement_done" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "agent_profile_done"       BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "agent_license_done"       BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "agent_territory_done"     BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "agent_settlement_done"    BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "estate_profile_done"      BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "estate_authority_done"    BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "estate_remittance_done"   BOOLEAN NOT NULL DEFAULT false;
