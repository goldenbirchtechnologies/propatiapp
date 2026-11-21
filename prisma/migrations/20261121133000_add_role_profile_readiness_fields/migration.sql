ALTER TABLE "landlord_profiles"
  ADD COLUMN IF NOT EXISTS "owns_properties" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "property_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "portfolio_categories" JSONB,
  ADD COLUMN IF NOT EXISTS "services" JSONB;

ALTER TABLE "agent_profiles"
  ADD COLUMN IF NOT EXISTS "services" JSONB;

ALTER TABLE "estate_manager_profiles"
  ADD COLUMN IF NOT EXISTS "management_type" TEXT,
  ADD COLUMN IF NOT EXISTS "capabilities" JSONB,
  ADD COLUMN IF NOT EXISTS "manages_on_behalf" BOOLEAN;
