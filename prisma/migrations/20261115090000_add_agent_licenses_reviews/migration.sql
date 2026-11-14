-- Agent credential and review tables.
--
-- `AgentLicense` and `AgentReview` were added to schema.prisma after the 20260821
-- baseline but never got a migration, so `agent_licenses` and `agent_reviews` do not
-- exist in any database built from the migration history. Three code paths already
-- query them and therefore fail at runtime:
--   * /api/agent/licenses        (GET, agent-scoped credential list)
--   * /api/agent/reputation      (GET, ratings + escrow volume)
--   * /api/public/agents         (GET, the public verified-agent directory)
-- This migration creates both tables to match schema.prisma exactly.

-- CreateEnum
CREATE TYPE "AgentLicenseBoard" AS ENUM ('LASRERA', 'ESVARBON', 'NIESV', 'EAR');

-- CreateEnum
CREATE TYPE "AgentLicenseStatus" AS ENUM ('draft', 'under_review', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AgentReviewStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateTable
CREATE TABLE "agent_licenses" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "board" "AgentLicenseBoard" NOT NULL,
    "license_type" TEXT NOT NULL,
    "registration_no" TEXT NOT NULL,
    "issuing_body" TEXT NOT NULL,
    "valid_until" TIMESTAMP(3),
    "status" "AgentLicenseStatus" NOT NULL DEFAULT 'draft',
    "reference_id" TEXT,
    "document_url" TEXT,
    "document_name" TEXT,
    "document_bytes" INTEGER,
    "channel" TEXT,
    "entity_name" TEXT,
    "entity_rc_number" TEXT,
    "reviewer_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_reviews" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" "AgentReviewStatus" NOT NULL DEFAULT 'pending',
    "comment" TEXT,
    "agreement_id" TEXT,
    "listing_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_agent_licenses_agent" ON "agent_licenses"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_licenses_status" ON "agent_licenses"("status");

-- CreateIndex
CREATE INDEX "idx_agent_licenses_board" ON "agent_licenses"("board");

-- CreateIndex
CREATE UNIQUE INDEX "uq_agent_reviews_agreement_reviewer" ON "agent_reviews"("agreement_id", "reviewer_id");

-- CreateIndex
CREATE INDEX "idx_agent_reviews_agent" ON "agent_reviews"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_reviews_reviewer" ON "agent_reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "idx_agent_reviews_status" ON "agent_reviews"("status");

-- AddForeignKey
ALTER TABLE "agent_licenses" ADD CONSTRAINT "agent_licenses_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reviews" ADD CONSTRAINT "agent_reviews_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reviews" ADD CONSTRAINT "agent_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reviews" ADD CONSTRAINT "agent_reviews_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reviews" ADD CONSTRAINT "agent_reviews_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
