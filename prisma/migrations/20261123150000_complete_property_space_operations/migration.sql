CREATE TABLE "property_photos" (
  "id" TEXT NOT NULL,
  "property_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "public_id" TEXT,
  "is_cover" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "property_photos_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "space_photos" (
  "id" TEXT NOT NULL,
  "space_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "public_id" TEXT,
  "is_cover" BOOLEAN NOT NULL DEFAULT false,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "space_photos_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "spaces" ADD COLUMN "current_tenant_id" TEXT;
ALTER TABLE "spaces" ADD COLUMN "lease_start_date" TIMESTAMP(3);
ALTER TABLE "spaces" ADD COLUMN "lease_end_date" TIMESTAMP(3);
ALTER TABLE "transactions" ADD COLUMN "property_id" TEXT;
ALTER TABLE "transactions" ADD COLUMN "space_id" TEXT;
ALTER TABLE "maintenance_tickets" ADD COLUMN "space_id" TEXT;
CREATE INDEX "idx_property_photos_property" ON "property_photos"("property_id");
CREATE INDEX "idx_space_photos_space" ON "space_photos"("space_id");
CREATE INDEX "idx_transactions_property" ON "transactions"("property_id");
CREATE INDEX "idx_transactions_space" ON "transactions"("space_id");
CREATE INDEX "idx_maintenance_tickets_space" ON "maintenance_tickets"("space_id");
ALTER TABLE "property_photos" ADD CONSTRAINT "property_photos_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "space_photos" ADD CONSTRAINT "space_photos_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_current_tenant_id_fkey" FOREIGN KEY ("current_tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
