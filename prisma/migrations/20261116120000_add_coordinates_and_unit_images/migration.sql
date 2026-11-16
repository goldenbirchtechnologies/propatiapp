-- Add coordinates to listings and create unit_images table

-- AlterTable listings - add coordinates column
ALTER TABLE "listings" ADD COLUMN "coordinates" JSON;

-- CreateTable unit_images
CREATE TABLE "unit_images" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "unit_images" ADD CONSTRAINT "unit_images_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
