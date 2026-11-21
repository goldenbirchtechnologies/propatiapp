-- Legal subjects separate the person signing in from the individual, joint
-- ownership group, or company that owns property and receives money.
CREATE TABLE "legal_subjects" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registration_number" TEXT,
    "primary_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "legal_subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "legal_subject_members" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "ownership_percent" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'invited',
    "verified_at" TIMESTAMP(3),
    "invite_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "legal_subject_members_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "paystack_accounts" ADD COLUMN "legal_subject_id" TEXT;
ALTER TABLE "landlord_profiles" ADD COLUMN "joint_owner_emails" TEXT;
ALTER TABLE "agent_profiles" ADD COLUMN "agency_name" TEXT;
ALTER TABLE "agent_profiles" ADD COLUMN "agency_registration_number" TEXT;

CREATE UNIQUE INDEX "uq_legal_subject_primary_type" ON "legal_subjects"("primary_user_id", "type");
CREATE INDEX "idx_legal_subject_primary_user" ON "legal_subjects"("primary_user_id");
CREATE INDEX "idx_legal_subject_registration" ON "legal_subjects"("registration_number");
CREATE UNIQUE INDEX "uq_legal_subject_member_invite_token" ON "legal_subject_members"("invite_token");
CREATE UNIQUE INDEX "uq_legal_subject_member_email" ON "legal_subject_members"("subject_id", "email");
CREATE INDEX "idx_legal_subject_members_status" ON "legal_subject_members"("subject_id", "status");
CREATE UNIQUE INDEX "uq_paystack_accounts_legal_subject_id" ON "paystack_accounts"("legal_subject_id");

ALTER TABLE "legal_subjects"
    ADD CONSTRAINT "legal_subjects_primary_user_id_fkey"
    FOREIGN KEY ("primary_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_subject_members"
    ADD CONSTRAINT "legal_subject_members_subject_id_fkey"
    FOREIGN KEY ("subject_id") REFERENCES "legal_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "legal_subject_members"
    ADD CONSTRAINT "legal_subject_members_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "paystack_accounts"
    ADD CONSTRAINT "paystack_accounts_legal_subject_id_fkey"
    FOREIGN KEY ("legal_subject_id") REFERENCES "legal_subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
