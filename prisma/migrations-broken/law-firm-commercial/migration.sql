BEGIN;

-- LAW FIRM NETWORK

CREATE TABLE IF NOT EXISTS "law_firms" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  name TEXT NOT NULL,
  "cac_number" TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  jurisdiction JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2),
  "review_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "law_firms" ADD CONSTRAINT "law_firms_pkey" PRIMARY KEY ("id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_law_firms_cac" ON "law_firms" ("cac_number");
CREATE INDEX IF NOT EXISTS "idx_law_firms_verified" ON "law_firms" (verified);

CREATE TABLE IF NOT EXISTS "law_firm_cases" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "dispute_id" TEXT NOT NULL UNIQUE,
  "firm_id" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  fee NUMERIC(12,2),
  "fee_currency" TEXT NOT NULL DEFAULT 'NGN',
  "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
  "resolved_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "law_firm_cases" ADD CONSTRAINT "law_firm_cases_pkey" PRIMARY KEY ("id");
CREATE INDEX IF NOT EXISTS "idx_law_firm_cases_firm" ON "law_firm_cases" ("firm_id");
CREATE INDEX IF NOT EXISTS "idx_law_firm_cases_status" ON "law_firm_cases" (status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'law_firm_cases_firm_id_fkey' AND conrelid = 'law_firm_cases'::regclass) THEN
    ALTER TABLE "law_firm_cases" ADD CONSTRAINT "law_firm_cases_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "law_firms"("id");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'law_firm_cases_dispute_id_fkey' AND conrelid = 'law_firm_cases'::regclass) THEN
    ALTER TABLE "law_firm_cases" ADD CONSTRAINT "law_firm_cases_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id");
  END IF;
END $$;

-- COMMERCIAL / OFFICE BILLING

CREATE TABLE IF NOT EXISTS "service_charges" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "listing_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "estate_manager_id" TEXT,
  period TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  "due_date" TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  "paid_at" TIMESTAMP,
  "transaction_id" TEXT UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_pkey" PRIMARY KEY ("id");
CREATE INDEX IF NOT EXISTS "idx_service_charges_org" ON "service_charges" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_service_charges_listing" ON "service_charges" ("listing_id");
CREATE INDEX IF NOT EXISTS "idx_service_charges_status" ON "service_charges" (status);

CREATE TABLE IF NOT EXISTS "utility_allocations" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "unit_id" TEXT NOT NULL,
  type TEXT NOT NULL,
  reading NUMERIC(10,2),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  "billing_period" TEXT NOT NULL,
  "due_date" TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  "paid_at" TIMESTAMP,
  "transaction_id" TEXT UNIQUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "utility_allocations" ADD CONSTRAINT "utility_allocations_pkey" PRIMARY KEY ("id");
CREATE INDEX IF NOT EXISTS "idx_utility_allocations_unit" ON "utility_allocations" ("unit_id");
CREATE INDEX IF NOT EXISTS "idx_utility_allocations_status" ON "utility_allocations" (status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_charges_listing_id_fkey' AND conrelid = 'service_charges'::regclass) THEN
    ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_charges_organization_id_fkey' AND conrelid = 'service_charges'::regclass) THEN
    ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organisations"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_charges_estate_manager_id_fkey' AND conrelid = 'service_charges'::regclass) THEN
    ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_estate_manager_id_fkey" FOREIGN KEY ("estate_manager_id") REFERENCES "users"("id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_charges_transaction_id_fkey' AND conrelid = 'service_charges'::regclass) THEN
    ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'utility_allocations_unit_id_fkey' AND conrelid = 'utility_allocations'::regclass) THEN
    ALTER TABLE "utility_allocations" ADD CONSTRAINT "utility_allocations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'utility_allocations_transaction_id_fkey' AND conrelid = 'utility_allocations'::regclass) THEN
    ALTER TABLE "utility_allocations" ADD CONSTRAINT "utility_allocations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL;
  END IF;
END $$;

COMMIT;
