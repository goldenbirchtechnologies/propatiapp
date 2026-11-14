-- Tenant profile sections: personal, next of kin, rental preferences,
-- financial, residential history and emergency contacts.
--
-- The tenant profile could only carry address + employment + a guarantor,
-- which is not enough for a landlord to screen an applicant. The missing
-- fields are added to the dossier (which already *is* the tenant's standing
-- profile), and the two repeating ones — previous addresses and emergency
-- contacts — get their own tables.
--
-- `rental_application_dossiers` predates this and is created by the baseline,
-- so the widenings use ADD COLUMN IF NOT EXISTS. Every new column is nullable:
-- prisma/seed.ts and the auth webhook both create users without a dossier, and
-- existing dossiers must survive the migration untouched.
--
-- Money on the dossier is Naira (BigInt). `transactions.amount` is kobo — the
-- two units are deliberately not reconciled here.

-- Personal
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "date_of_birth" TIMESTAMP(3);
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "nationality" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "state_of_residence" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "lga" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "marital_status" TEXT;

-- Next of kin
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "nok_name" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "nok_phone" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "nok_relationship" TEXT;

-- Guarantor (extends the existing name/phone/relationship/address/occupation)
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "guarantor_email" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "guarantor_employer" TEXT;

-- Financial
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "other_income_sources" TEXT;

-- Rental preferences. `monthly_budget` already exists; `max_monthly_budget`
-- is the field the new preferences section writes.
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "preferred_state" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "preferred_bedrooms" INTEGER;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "max_monthly_budget" BIGINT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "preferred_move_in_date" TIMESTAMP(3);
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "pending_lease_duration" TEXT;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "occupants" INTEGER;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "has_pets" BOOLEAN;
ALTER TABLE "rental_application_dossiers" ADD COLUMN IF NOT EXISTS "pets_detail" TEXT;

-- Residential history. One row per previous address; `sequence` 1 is the most
-- recent, and `is_current` marks where the tenant lives today.
CREATE TABLE IF NOT EXISTS "tenant_addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "sequence" INTEGER NOT NULL,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country_id" TEXT,
    "move_in_date" TIMESTAMP(3),
    "move_out_date" TIMESTAMP(3),
    "landlord_name" TEXT,
    "landlord_phone" TEXT,
    "reason_for_leaving" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_addresses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_tenant_addresses_user" ON "tenant_addresses"("user_id");

DO $$ BEGIN
  ALTER TABLE "tenant_addresses"
    ADD CONSTRAINT "tenant_addresses_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "tenant_addresses"
    ADD CONSTRAINT "tenant_addresses_country_id_fkey"
    FOREIGN KEY ("country_id") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Emergency contacts. The profile page already rendered these inputs but
-- dropped the values on save; now they persist.
CREATE TABLE IF NOT EXISTS "emergency_contacts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_emergency_contacts_user" ON "emergency_contacts"("user_id");

DO $$ BEGIN
  ALTER TABLE "emergency_contacts"
    ADD CONSTRAINT "emergency_contacts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
