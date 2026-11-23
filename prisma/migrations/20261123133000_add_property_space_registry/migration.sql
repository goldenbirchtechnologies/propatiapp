CREATE TYPE "PropertyCategory" AS ENUM ('residential', 'commercial', 'industrial', 'hospitality', 'outdoor_recreation', 'mixed_use');
CREATE TYPE "PropertyOnboardingStatus" AS ENUM ('draft', 'submitted', 'verified', 'archived');
CREATE TYPE "SpaceOperationalStatus" AS ENUM ('available', 'occupied', 'reserved', 'unavailable', 'maintenance');

CREATE TABLE "properties" (
  "id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "category" "PropertyCategory" NOT NULL,
  "subtype" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "intended_use" TEXT,
  "description" TEXT,
  "country" TEXT NOT NULL DEFAULT 'Nigeria',
  "state" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "landmarks" TEXT,
  "coordinates" JSONB,
  "physical_attributes" JSONB,
  "facilities" JSONB,
  "ownership_refs" JSONB,
  "verification_status" TEXT NOT NULL DEFAULT 'not_started',
  "onboarding_status" "PropertyOnboardingStatus" NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "space_categories" (
  "id" TEXT NOT NULL,
  "property_id" TEXT NOT NULL,
  "category_name" TEXT NOT NULL,
  "space_type" TEXT NOT NULL,
  "configuration" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "space_categories_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "spaces" (
  "id" TEXT NOT NULL,
  "property_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "attributes" JSONB,
  "amenities" JSONB,
  "capacity" INTEGER,
  "operational_status" "SpaceOperationalStatus" NOT NULL DEFAULT 'available',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "listings" ADD COLUMN "property_id" TEXT;
ALTER TABLE "listings" ADD COLUMN "space_id" TEXT;
CREATE INDEX "idx_properties_owner" ON "properties"("owner_id");
CREATE INDEX "idx_properties_category" ON "properties"("category");
CREATE INDEX "idx_properties_onboarding_status" ON "properties"("onboarding_status");
CREATE UNIQUE INDEX "uq_space_categories_property_type" ON "space_categories"("property_id", "category_name", "space_type");
CREATE INDEX "idx_space_categories_property" ON "space_categories"("property_id");
CREATE UNIQUE INDEX "uq_spaces_property_identifier" ON "spaces"("property_id", "identifier");
CREATE INDEX "idx_spaces_property" ON "spaces"("property_id");
CREATE INDEX "idx_spaces_category" ON "spaces"("category_id");
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "space_categories" ADD CONSTRAINT "space_categories_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "space_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill the new registry from legacy property anchors without deleting or
-- changing their listing/unit records. Child unit listings remain untouched.
INSERT INTO "properties" ("id", "owner_id", "category", "subtype", "name", "description", "country", "state", "city", "address", "physical_attributes", "onboarding_status", "created_at", "updated_at")
SELECT
  'prop_' || substr(md5(l."id"), 1, 24),
  l."owner_id",
  CASE l."property_type"::text
    WHEN 'office' THEN 'commercial'::"PropertyCategory"
    WHEN 'shop' THEN 'commercial'::"PropertyCategory"
    WHEN 'warehouse' THEN 'industrial'::"PropertyCategory"
    WHEN 'land' THEN 'outdoor_recreation'::"PropertyCategory"
    ELSE 'residential'::"PropertyCategory"
  END,
  coalesce(l."property_type"::text, 'legacy property'),
  l."title",
  l."description",
  coalesce(c."name", 'Nigeria'),
  coalesce(l."state", 'Lagos'),
  coalesce(l."city", l."area", 'Unknown'),
  l."address",
  jsonb_build_object('floors', l."floors", 'bedrooms', l."bedrooms", 'bathrooms', l."bathrooms", 'sizeSqm', l."size_sqm"),
  CASE WHEN l."status" = 'active' THEN 'submitted'::"PropertyOnboardingStatus" ELSE 'draft'::"PropertyOnboardingStatus" END,
  l."created_at",
  now()
FROM "listings" l
LEFT JOIN "countries" c ON c."code" = l."country_id"
WHERE l."property_id" IS NULL AND l."unit_id" IS NULL;

UPDATE "listings" l
SET "property_id" = 'prop_' || substr(md5(l."id"), 1, 24)
WHERE l."property_id" IS NULL AND l."unit_id" IS NULL;

INSERT INTO "space_categories" ("id", "property_id", "category_name", "space_type", "created_at", "updated_at")
SELECT 'scat_' || substr(md5(p."id"), 1, 24), p."id", 'Legacy inventory', 'Registered unit', now(), now()
FROM "properties" p
WHERE NOT EXISTS (SELECT 1 FROM "space_categories" sc WHERE sc."property_id" = p."id");

INSERT INTO "spaces" ("id", "property_id", "category_id", "name", "identifier", "attributes", "operational_status", "created_at", "updated_at")
SELECT DISTINCT ON (l."property_id", u."unit_number")
  'space_' || substr(md5(u."id"), 1, 24),
  l."property_id",
  sc."id",
  coalesce(u."building_name", 'Legacy unit') || ' ' || u."unit_number",
  u."unit_number",
  jsonb_build_object('type', u."type"::text, 'bedrooms', u."bedrooms", 'bathrooms', u."bathrooms", 'sizeSqm', u."size_sqm"),
  CASE WHEN u."occupancy"::text = 'OCCUPIED' THEN 'occupied'::"SpaceOperationalStatus" ELSE 'available'::"SpaceOperationalStatus" END,
  u."created_at",
  now()
FROM "units" u
JOIN "listings" l ON l."id" = u."listing_id" AND l."property_id" IS NOT NULL
JOIN "space_categories" sc ON sc."property_id" = l."property_id"
WHERE NOT EXISTS (SELECT 1 FROM "spaces" s WHERE s."property_id" = l."property_id" AND s."identifier" = u."unit_number")
ORDER BY l."property_id", u."unit_number", u."created_at";
