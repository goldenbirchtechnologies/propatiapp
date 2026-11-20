ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "adults" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "children" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS "inspection_bookings" (
  "id" TEXT NOT NULL,
  "listing_id" TEXT NOT NULL,
  "visitor_id" TEXT NOT NULL,
  "owner_id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time_slot" TEXT NOT NULL,
  "inspection_type" TEXT NOT NULL DEFAULT 'in_person',
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inspection_bookings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "inspection_bookings_listing_id_date_time_slot_key" ON "inspection_bookings"("listing_id", "date", "time_slot");
CREATE INDEX IF NOT EXISTS "inspection_bookings_visitor_id_idx" ON "inspection_bookings"("visitor_id");
CREATE INDEX IF NOT EXISTS "inspection_bookings_owner_id_idx" ON "inspection_bookings"("owner_id");
DO $$ BEGIN ALTER TABLE "inspection_bookings" ADD CONSTRAINT "inspection_bookings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "inspection_bookings" ADD CONSTRAINT "inspection_bookings_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "users"("id") ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "inspection_bookings" ADD CONSTRAINT "inspection_bookings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
