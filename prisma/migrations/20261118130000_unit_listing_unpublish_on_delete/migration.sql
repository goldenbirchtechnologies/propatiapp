-- Keep units when a building listing is removed; the API unpublishes them instead.
ALTER TABLE "units" DROP CONSTRAINT "units_listing_id_fkey";
ALTER TABLE "units" ADD CONSTRAINT "units_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "listings" ADD COLUMN "agreement_fee" DECIMAL(15,2);
ALTER TABLE "listings" ADD COLUMN "agency_fee" DECIMAL(15,2);
ALTER TABLE "listings" ADD COLUMN "stamp_duty" DECIMAL(15,2);
