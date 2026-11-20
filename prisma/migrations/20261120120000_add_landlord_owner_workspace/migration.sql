-- AlterTable
ALTER TABLE "landlord_profiles" ADD COLUMN     "company_registration_number" TEXT,
ADD COLUMN     "company_address" TEXT,
ADD COLUMN     "representative_name" TEXT,
ADD COLUMN     "representative_phone" TEXT,
ADD COLUMN     "representative_email" TEXT,
ADD COLUMN     "country_code" TEXT,
ADD COLUMN     "state_region" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "street_address" TEXT,
ADD COLUMN     "postal_code" TEXT,
ADD COLUMN     "tax_jurisdiction" TEXT,
ADD COLUMN     "management_fee_type" TEXT,
ADD COLUMN     "management_fee_value" INTEGER;

-- CreateTable
CREATE TABLE "landlord_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "review_note" TEXT,
    "expires_at" TIMESTAMP(3),
    "access_control" TEXT NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landlord_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_landlord_documents_user_category" ON "landlord_documents"("user_id", "category");

-- AddForeignKey
ALTER TABLE "landlord_documents" ADD CONSTRAINT "landlord_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
