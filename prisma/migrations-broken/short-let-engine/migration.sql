-- ===========================================================================
-- PROPATI SHORT-LET ENGINE MIGRATION
-- Adds 3 tables: calendar_slots, pricing_rules, bookings
-- Run against Supabase (Postgres) once
-- ===========================================================================

BEGIN;

-- 1. calendars
CREATE TABLE IF NOT EXISTS "calendar_slots" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  listing_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  price NUMERIC(12,2),
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "calendar_slots" ADD CONSTRAINT "calendar_slots_pkey" PRIMARY KEY ("id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_calendar_listing_date" ON "calendar_slots" ("listing_id","date");
CREATE INDEX IF NOT EXISTS "idx_calendar_listing" ON "calendar_slots" ("listing_id");

-- 2. pricing rules
CREATE TABLE IF NOT EXISTS "pricing_rules" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  listing_id TEXT NOT NULL,
  name TEXT,
  rule_type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  multiplier NUMERIC(5,2),
  fixed_price NUMERIC(12,2),
  day_of_week INTEGER,
  min_nights INTEGER,
  max_nights INTEGER,
  advance_days INTEGER,
  start_date TEXT,
  end_date TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id");
CREATE INDEX IF NOT EXISTS "idx_pricing_listing" ON "pricing_rules" ("listing_id");
CREATE INDEX IF NOT EXISTS "idx_pricing_rule_type" ON "pricing_rules" ("rule_type");

-- 3. bookings
CREATE TABLE IF NOT EXISTS "bookings" (
  id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  listing_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  nights INTEGER NOT NULL,
  base_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  special_requests TEXT,
  cancelled_at TIMESTAMP,
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");
CREATE INDEX IF NOT EXISTS "idx_bookings_listing" ON "bookings" ("listing_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_guest" ON "bookings" ("guest_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_status" ON "bookings" ("status");
CREATE INDEX IF NOT EXISTS "idx_bookings_dates" ON "bookings" ("check_in","check_out");

-- FK: calendar_slots -> listings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'calendar_slots_listing_id_fkey' AND conrelid = 'calendar_slots'::regclass) THEN
    ALTER TABLE "calendar_slots"
      ADD CONSTRAINT "calendar_slots_listing_id_fkey"
      FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- FK: pricing_rules -> listings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pricing_rules_listing_id_fkey' AND conrelid = 'pricing_rules'::regclass) THEN
    ALTER TABLE "pricing_rules"
      ADD CONSTRAINT "pricing_rules_listing_id_fkey"
      FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- FK: bookings -> listings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_listing_id_fkey' AND conrelid = 'bookings'::regclass) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_listing_id_fkey"
      FOREIGN KEY ("listing_id") REFERENCES "listings"("id");
  END IF;
END $$;

-- FK: bookings -> users (guest)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_guest_id_fkey' AND conrelid = 'bookings'::regclass) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_guest_id_fkey"
      FOREIGN KEY ("guest_id") REFERENCES "users"("id");
  END IF;
END $$;

-- FK: bookings -> transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_transaction_id_fkey' AND conrelid = 'bookings'::regclass) THEN
    ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_transaction_id_fkey"
      FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id");
  END IF;
END $$;

COMMIT;
