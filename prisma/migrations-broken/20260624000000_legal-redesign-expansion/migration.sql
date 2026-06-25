-- Migration: legal-redesign-expansion
-- Description: Add legal redesign models (Agreement+StampDuty integrity fields, DocumentVersion, DocumentAccessLog, EvidenceExhibit, EvidenceCustodyEntry, Engagement, ConflictCheck, LawyerProfile, LawyerDocument) and related enums

-- ============================================================
-- 1. NEW ENUMS
-- ============================================================

CREATE TYPE "ShortletStatus" AS ENUM ('pending', 'approved', 'rejected', 'revoked', 'withdrawn');
CREATE TYPE "DocumentAccessAction" AS ENUM ('view', 'download', 'print', 'share');
CREATE TYPE "EvidencePackSealStatus" AS ENUM ('draft', 'pending_review', 'sealed', 'revoked');
CREATE TYPE "AgreementLockStatus" AS ENUM ('mutable', 'locked', 'immutable');
CREATE TYPE "LawyerVerificationStatus" AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'suspended');
CREATE TYPE "EngagementType" AS ENUM ('full_representation', 'advisory_only', 'document_review', 'limited_scope');
CREATE TYPE "EngagementStatus" AS ENUM ('draft', 'sent_to_client', 'consent_pending', 'consent_rejected', 'consent_accepted', 'active', 'completed', 'withdrawn');
CREATE TYPE "ConflictCheckStatus" AS ENUM ('not_checked', 'clear', 'conflict', 'waived');

-- ============================================================
-- 2. ALTER EXISTING TABLES
-- ============================================================

-- listings
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "allow_shortlet" BOOLEAN NOT NULL DEFAULT false;

-- transactions
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'NGN';
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "paystack_ref" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMPTZ;

-- agreements
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "pdf_url" TEXT;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "risk_tier" TEXT DEFAULT 'review_required';
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "jurisdiction_state" TEXT;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "governing_statute" TEXT;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "head_tenant_verified" BOOLEAN DEFAULT false;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "pdf_content_hash" TEXT;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "finalized_at" TIMESTAMPTZ;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "lock_status" "AgreementLockStatus" DEFAULT 'mutable';
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "integrity_chain_hash" TEXT;
ALTER TABLE "agreements" ADD COLUMN IF NOT EXISTS "locked_by" TEXT;

-- agreement_signatures
ALTER TABLE "agreement_signatures" ADD COLUMN IF NOT EXISTS "document_hash" TEXT;
ALTER TABLE "agreement_signatures" ADD COLUMN IF NOT EXISTS "binding_hash" TEXT;

-- stamp_duty
ALTER TABLE "stamp_duty" ADD COLUMN IF NOT EXISTS "agreement_pdf_hash" TEXT;
ALTER TABLE "stamp_duty" ADD COLUMN IF NOT EXISTS "certificate_hash" TEXT;
ALTER TABLE "stamp_duty" ADD COLUMN IF NOT EXISTS "linkage_hash" TEXT;

-- ============================================================
-- 3. NEW TABLES
-- ============================================================

-- tenant_shortlets
CREATE TABLE IF NOT EXISTS "tenant_shortlets" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "listing_id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "landlord_id" TEXT NOT NULL,
  "status" "ShortletStatus" NOT NULL DEFAULT 'pending',
  "approved_at" TIMESTAMPTZ,
  "rejected_at" TIMESTAMPTZ,
  "revoked_at" TIMESTAMPTZ,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "tenant_shortlets" ADD CONSTRAINT "tenant_shortlets_pkey" PRIMARY KEY ("id");
ALTER TABLE "tenant_shortlets" ADD CONSTRAINT "tenant_shortlets_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "tenant_shortlets_listing_id_tenant_id_key" ON "tenant_shortlets"("listing_id", "tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_shortlets_listing" ON "tenant_shortlets"("listing_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_shortlets_tenant" ON "tenant_shortlets"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_shortlets_landlord" ON "tenant_shortlets"("landlord_id");

-- document_versions
CREATE TABLE IF NOT EXISTS "document_versions" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "document_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "size_bytes" BIGINT,
  "mime_type" TEXT,
  "content_hash" TEXT NOT NULL,
  "chain_hash" TEXT,
  "approved_by" TEXT,
  "approved_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id");
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");
CREATE INDEX IF NOT EXISTS "idx_doc_versions_document" ON "document_versions"("document_id");
CREATE INDEX IF NOT EXISTS "idx_doc_versions_hash" ON "document_versions"("content_hash");

-- document_access_logs
CREATE TABLE IF NOT EXISTS "document_access_logs" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "document_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "action" "DocumentAccessAction" NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_pkey" PRIMARY KEY ("id");
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "idx_doc_access_doc_user" ON "document_access_logs"("document_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_doc_access_document" ON "document_access_logs"("document_id");

-- evidence_exhibits
CREATE TABLE IF NOT EXISTS "evidence_exhibits" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "pack_id" TEXT NOT NULL,
  "exhibit_number" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "content_hash" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "url" TEXT,
  "source_record_id" TEXT,
  "source_table" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "created_by" TEXT
);

ALTER TABLE "evidence_exhibits" ADD CONSTRAINT "evidence_exhibits_pkey" PRIMARY KEY ("id");
ALTER TABLE "evidence_exhibits" ADD CONSTRAINT "evidence_exhibits_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "evidence_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "evidence_exhibits_pack_id_exhibit_number_key" ON "evidence_exhibits"("pack_id", "exhibit_number");
CREATE INDEX IF NOT EXISTS "idx_exhibits_pack_order" ON "evidence_exhibits"("pack_id", "sort_order");

-- evidence_custody_entries
CREATE TABLE IF NOT EXISTS "evidence_custody_entries" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "pack_id" TEXT NOT NULL,
  "actor_id" TEXT,
  "actor_type" TEXT NOT NULL DEFAULT 'user',
  "action" TEXT NOT NULL,
  "state_hash" TEXT NOT NULL,
  "exhibit_ref" TEXT,
  "note" TEXT,
  "ip_address" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "evidence_custody_entries" ADD CONSTRAINT "evidence_custody_entries_pkey" PRIMARY KEY ("id");
ALTER TABLE "evidence_custody_entries" ADD CONSTRAINT "evidence_custody_entries_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "evidence_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "idx_custody_pack" ON "evidence_custody_entries"("pack_id");

-- engagements
CREATE TABLE IF NOT EXISTS "engagements" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "case_id" TEXT NOT NULL UNIQUE,
  "type" "EngagementType" NOT NULL,
  "status" "EngagementStatus" NOT NULL DEFAULT 'draft',
  "scope_of_work" TEXT NOT NULL,
  "fee_model" JSONB NOT NULL,
  "disbursements" JSONB,
  "estimated_duration" TEXT,
  "advance_payment_required" BOOLEAN NOT NULL DEFAULT false,
  "advance_payment_amount" DECIMAL(12,2),
  "client_consent_text" TEXT NOT NULL,
  "client_consented_at" TIMESTAMPTZ,
  "client_consent_ip" TEXT,
  "client_consent_user_agent" TEXT,
  "lawyer_review_status" TEXT NOT NULL DEFAULT 'pending',
  "lawyer_review_notes" TEXT,
  "lawyer_reviewed_at" TIMESTAMPTZ,
  "firm_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "engagements" ADD CONSTRAINT "engagements_pkey" PRIMARY KEY ("id");
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "law_firm_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "law_firms"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- conflict_checks
CREATE TABLE IF NOT EXISTS "conflict_checks" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "case_id" TEXT NOT NULL UNIQUE,
  "law_firm_id" TEXT NOT NULL,
  "lawyer_profile_id" TEXT,
  "status" "ConflictCheckStatus" NOT NULL DEFAULT 'not_checked',
  "adverse_party_type" TEXT NOT NULL,
  "adverse_party_id" TEXT NOT NULL,
  "adverse_party_name" TEXT NOT NULL,
  "previous_work" JSONB,
  "conflict_rationale" TEXT,
  "reviewed_by_admin_id" TEXT,
  "reviewed_at" TIMESTAMPTZ,
  "waiver_approved" BOOLEAN NOT NULL DEFAULT false,
  "waiver_approved_by" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_pkey" PRIMARY KEY ("id");
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "law_firm_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_lawyer_profile_id_fkey" FOREIGN KEY ("lawyer_profile_id") REFERENCES "lawyer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "idx_conflict_checks_firm" ON "conflict_checks"("law_firm_id");
CREATE INDEX IF NOT EXISTS "idx_conflict_checks_status" ON "conflict_checks"("status");

-- lawyer_profiles
CREATE TABLE IF NOT EXISTS "lawyer_profiles" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "user_id" TEXT NOT NULL UNIQUE,
  "law_firm_id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "call_to_bar_number" TEXT NOT NULL UNIQUE,
  "year_of_call" INTEGER NOT NULL,
  "nba_number" TEXT UNIQUE,
  "nba_year" INTEGER,
  "specialization_areas" JSONB NOT NULL,
  "is_principal_partner" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "idx_lawyer_profiles_firm" ON "lawyer_profiles"("law_firm_id");

-- lawyer_documents
CREATE TABLE IF NOT EXISTS "lawyer_documents" (
  "id" TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  "engagement_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "review_status" TEXT NOT NULL DEFAULT 'pending',
  "lawyer_notes" TEXT,
  "redlined_url" TEXT,
  "approved_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "lawyer_documents" ADD CONSTRAINT "lawyer_documents_pkey" PRIMARY KEY ("id");
ALTER TABLE "lawyer_documents" ADD CONSTRAINT "lawyer_documents_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lawyer_documents" ADD CONSTRAINT "lawyer_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS "lawyer_documents_engagement_id_document_id_key" ON "lawyer_documents"("engagement_id", "document_id");

-- ============================================================
-- 4. INDEXES FOR NEW/UPDATED COLUMNS
-- ============================================================

CREATE INDEX IF NOT EXISTS "idx_transactions_paystack_ref" ON "transactions"("paystack_ref");
CREATE INDEX IF NOT EXISTS "idx_transactions_paid_at" ON "transactions"("paid_at");
CREATE INDEX IF NOT EXISTS "idx_agreements_lock_status" ON "agreements"("lock_status");
CREATE INDEX IF NOT EXISTS "idx_agreements_status" ON "agreements"("status");
