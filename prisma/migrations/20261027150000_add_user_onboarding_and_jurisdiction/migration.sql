-- User onboarding, jurisdiction mapping, and tenant rental application dossier.
--
-- Written defensively with IF NOT EXISTS guards because the checked-in
-- baseline migration (20260821_baseline_full_schema) predates the
-- multi-country work: some environments have the countries/jurisdictions
-- tables (created via `prisma db push`) and some do not. This migration is
-- safe to apply to either.

-- ===========================================================================
-- Enums
-- ===========================================================================

DO $$ BEGIN
    CREATE TYPE "OnboardingStatus" AS ENUM ('not_started', 'in_progress', 'blocked', 'completed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================================
-- Countries & jurisdictions
-- ===========================================================================

CREATE TABLE IF NOT EXISTS "countries" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "active" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

CREATE TABLE IF NOT EXISTS "jurisdictions" (
    "id" TEXT NOT NULL,
    "country_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'state',
    "code" TEXT,
    "metadata" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "jurisdictions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_jurisdictions_country" ON "jurisdictions"("country_id");

DO $$ BEGIN
    ALTER TABLE "jurisdictions" ADD CONSTRAINT "jurisdictions_country_id_fkey"
        FOREIGN KEY ("country_id") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================================
-- New columns on users
-- ===========================================================================

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "jurisdiction_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_line_1" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_line_2" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "id_number_hash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_required" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_status" "OnboardingStatus" NOT NULL DEFAULT 'not_started';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed_at" TIMESTAMP(3);

DO $$ BEGIN
    CREATE UNIQUE INDEX "users_id_number_hash_key" ON "users"("id_number_hash");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_country_id_fkey"
        FOREIGN KEY ("country_id") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_jurisdiction_id_fkey"
        FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================================
-- Onboarding tables
-- ===========================================================================

CREATE TABLE IF NOT EXISTS "user_onboardings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'not_started',
    "current_step" TEXT NOT NULL DEFAULT 'location',
    "location_done" BOOLEAN NOT NULL DEFAULT false,
    "contact_done" BOOLEAN NOT NULL DEFAULT false,
    "identity_done" BOOLEAN NOT NULL DEFAULT false,
    "employment_done" BOOLEAN NOT NULL DEFAULT false,
    "guarantor_done" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_onboardings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_onboardings_user_id_key" ON "user_onboardings"("user_id");

DO $$ BEGIN
    ALTER TABLE "user_onboardings" ADD CONSTRAINT "user_onboardings_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "rental_application_dossiers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "country_id" TEXT,
    "jurisdiction_id" TEXT,
    "employment_status" "EmploymentStatus",
    "employment_type" "EmploymentType",
    "employer_name" TEXT,
    "job_title" TEXT,
    "yearly_income" BIGINT,
    "years_in_employment" TEXT,
    "guarantor_name" TEXT,
    "guarantor_phone" TEXT,
    "guarantor_relationship" TEXT,
    "guarantor_address" TEXT,
    "guarantor_occupation" TEXT,
    "id_type" "IdType",
    "id_number_enc" TEXT,
    "id_doc_url" TEXT,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "preferred_listing_type" "ListingType",
    "monthly_budget" BIGINT,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewer_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "rental_application_dossiers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "rental_application_dossiers_user_id_key" ON "rental_application_dossiers"("user_id");
CREATE INDEX IF NOT EXISTS "idx_rental_dossier_status" ON "rental_application_dossiers"("status");

DO $$ BEGIN
    ALTER TABLE "rental_application_dossiers" ADD CONSTRAINT "rental_application_dossiers_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "rental_application_dossiers" ADD CONSTRAINT "rental_application_dossiers_country_id_fkey"
        FOREIGN KEY ("country_id") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "rental_application_dossiers" ADD CONSTRAINT "rental_application_dossiers_jurisdiction_id_fkey"
        FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
