-- ===========================================================================
-- PROPATI — EVIDENCE PACK FIELDS MIGRATION
-- Adds: firm_id, status, file_urls (renamed from contracts) to evidence_packs
-- ===========================================================================

BEGIN;

-- 1. Rename contracts → file_urls
ALTER TABLE "evidence_packs" RENAME COLUMN "contracts" TO "file_urls";

-- 2. Add firm_id column
ALTER TABLE "evidence_packs" ADD COLUMN IF NOT EXISTS "firm_id" TEXT;

-- 3. Add status column with default
ALTER TABLE "evidence_packs" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'draft';

-- 4. FK: firm_id -> organisations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'evidence_packs_firm_id_fkey'
      AND conrelid = 'evidence_packs'::regclass
  ) THEN
    ALTER TABLE "evidence_packs"
      ADD CONSTRAINT "evidence_packs_firm_id_fkey"
      FOREIGN KEY ("firm_id") REFERENCES "organisations"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Indexes
CREATE INDEX IF NOT EXISTS "idx_evidence_packs_dispute" ON "evidence_packs" ("dispute_id");
CREATE INDEX IF NOT EXISTS "idx_evidence_packs_status"   ON "evidence_packs" ("status");
CREATE INDEX IF NOT EXISTS "idx_evidence_packs_firm"     ON "evidence_packs" ("firm_id");

COMMIT;
