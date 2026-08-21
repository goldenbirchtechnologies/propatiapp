-- CreateEnum
CREATE TYPE "PrivacyType" AS ENUM ('entire_place', 'private_room', 'shared_room');

-- CreateEnum
CREATE TYPE "PropertyStructure" AS ENUM ('house', 'apartment', 'barn', 'bed_and_breakfast', 'boat', 'cabin', 'camper_rv', 'casa_particular', 'castle', 'cave', 'container', 'cycladic_home', 'dammuso', 'dome', 'earth_home', 'farm', 'guesthouse', 'hotel', 'houseboat', 'minsu', 'riad', 'ryokan', 'shepherds_hut', 'tent', 'tiny_home', 'tower', 'treehouse', 'trullo', 'windmill', 'yurt');

-- CreateEnum
CREATE TYPE "BookingModel" AS ENUM ('review_first_3_then_instant', 'instant_book');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "beds_count" INTEGER DEFAULT 1,
ADD COLUMN     "booking_model" "BookingModel",
ADD COLUMN     "discounts" JSONB,
ADD COLUMN     "guests_count" INTEGER DEFAULT 1,
ADD COLUMN     "highlights" JSONB,
ADD COLUMN     "house_rules" JSONB,
ADD COLUMN     "kyc_compliance" JSONB,
ADD COLUMN     "privacy_type" "PrivacyType",
ADD COLUMN     "property_structure" "PropertyStructure",
ADD COLUMN     "safety_disclosures" JSONB,
ADD COLUMN     "weekend_pricing" DECIMAL(5,2);
