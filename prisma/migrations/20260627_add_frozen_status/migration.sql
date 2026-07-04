-- AddEnum VerificationOverallStatus frozen value
-- This migration adds the "frozen" value to VerificationOverallStatus enum
-- and adds frozen_reason, frozen_at, frozen_by columns to Verification table

-- Add frozen value to enum
ALTER TYPE "VerificationOverallStatus" ADD VALUE IF NOT EXISTS 'frozen';

-- Add frozen columns to Verification table
ALTER TABLE "verifications" ADD COLUMN IF NOT EXISTS "frozen_reason" TEXT;
ALTER TABLE "verifications" ADD COLUMN IF NOT EXISTS "frozen_at" TIMESTAMP(3);
ALTER TABLE "verifications" ADD COLUMN IF NOT EXISTS "frozen_by" TEXT;
