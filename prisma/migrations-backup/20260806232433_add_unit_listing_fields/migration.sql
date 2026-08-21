ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "listing_type" TEXT NOT NULL DEFAULT 'rent';
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "price_period" TEXT;
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "minimum_stay" INTEGER;
ALTER TABLE "units" ADD COLUMN IF NOT EXISTS "is_listed" BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_units_updated_at ON "units";
CREATE TRIGGER set_units_updated_at BEFORE UPDATE ON "units" FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();
