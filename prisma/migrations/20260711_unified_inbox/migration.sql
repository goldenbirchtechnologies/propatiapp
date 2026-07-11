-- Migration: unified inbox role-agnostic conversations
-- Safe idempotent SQL for conversations table

-- 1) Add new columns if absent
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS property_id varchar,
  ADD COLUMN IF NOT EXISTS org_id varchar,
  ADD COLUMN IF NOT EXISTS participants jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unread_counts jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2) Drop old unread columns if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'unread_tenant') THEN
    ALTER TABLE conversations DROP COLUMN unread_tenant;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'unread_landlord') THEN
    ALTER TABLE conversations DROP COLUMN unread_landlord;
  END IF;
END $$;

-- 3) Drop old unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'conversations'::regclass
      AND conname = 'cnv_landlord_tenant_listing_key'
  ) THEN
    ALTER TABLE conversations DROP CONSTRAINT cnv_landlord_tenant_listing_key;
  END IF;
END $$;

-- 4) Make landlord/tenant nullable if they aren't already
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'landlord_id' AND is_nullable = 'NO') THEN
    ALTER TABLE conversations ALTER COLUMN landlord_id DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'tenant_id' AND is_nullable = 'NO') THEN
    ALTER TABLE conversations ALTER COLUMN tenant_id DROP NOT NULL;
  END IF;
END $$;

-- 5) Drop existing intersection indexes to avoid name clash
DROP INDEX IF EXISTS idx_conversations_listing;
DROP INDEX IF EXISTS idx_conversations_landlord;
DROP INDEX IF EXISTS idx_conversations_tenant;
DROP INDEX IF EXISTS idx_conversations_org;

-- 6) Create indexes
CREATE INDEX idx_conversations_listing ON conversations(listing_id);
CREATE INDEX idx_conversations_landlord ON conversations(landlord_id);
CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_org ON conversations(org_id);

-- If property_id is heavily queried, index it too
CREATE INDEX idx_conversations_property ON conversations(property_id);
