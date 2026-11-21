CREATE TABLE "verification_attempts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "provider" VARCHAR(30) NOT NULL DEFAULT 'dojah',
  "reference_id" TEXT NOT NULL,
  "flow_id" TEXT,
  "role" "UserRole" NOT NULL,
  "status" VARCHAR(30) NOT NULL,
  "failure_code" VARCHAR(80),
  "failure_reason" TEXT,
  "checks_passed" JSONB,
  "provider_payload_hash" VARCHAR(128),
  "consent_at" TIMESTAMP(3),
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "verification_attempts_reference_id_key" ON "verification_attempts"("reference_id");
CREATE INDEX "idx_verification_attempt_user" ON "verification_attempts"("user_id");
CREATE INDEX "idx_verification_attempt_status" ON "verification_attempts"("status");

ALTER TABLE "verification_attempts"
  ADD CONSTRAINT "verification_attempts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
