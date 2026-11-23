-- A unit-level listing is independent from the property/building listing.
-- Nullable preserves existing property listings and historical records.
ALTER TABLE "listings" ADD COLUMN "unit_id" TEXT;

CREATE INDEX "idx_listings_unit" ON "listings"("unit_id");

ALTER TABLE "listings"
  ADD CONSTRAINT "listings_unit_id_fkey"
  FOREIGN KEY ("unit_id") REFERENCES "units"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
