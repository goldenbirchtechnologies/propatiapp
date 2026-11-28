-- Additive multi-type unit architecture.
-- Existing legacy fields remain in place so current listings and reports keep working.
ALTER TABLE "units"
  ADD COLUMN IF NOT EXISTS "unit_category" TEXT NOT NULL DEFAULT 'apartment',
  ADD COLUMN IF NOT EXISTS "rental_arrangement" TEXT NOT NULL DEFAULT 'long_term',
  ADD COLUMN IF NOT EXISTS "listing_method" TEXT NOT NULL DEFAULT 'single_unit',
  ADD COLUMN IF NOT EXISTS "occupancy_model" TEXT NOT NULL DEFAULT 'long_term',
  ADD COLUMN IF NOT EXISTS "occupancy_state" TEXT NOT NULL DEFAULT 'vacant',
  ADD COLUMN IF NOT EXISTS "category_attributes" JSONB,
  ADD COLUMN IF NOT EXISTS "parent_unit_id" TEXT;

CREATE INDEX IF NOT EXISTS "idx_units_category" ON "units" ("unit_category");
CREATE INDEX IF NOT EXISTS "idx_units_rental_arrangement" ON "units" ("rental_arrangement");
CREATE INDEX IF NOT EXISTS "idx_units_parent" ON "units" ("parent_unit_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'units_parent_unit_id_fkey'
  ) THEN
    ALTER TABLE "units"
      ADD CONSTRAINT "units_parent_unit_id_fkey"
      FOREIGN KEY ("parent_unit_id") REFERENCES "units"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
