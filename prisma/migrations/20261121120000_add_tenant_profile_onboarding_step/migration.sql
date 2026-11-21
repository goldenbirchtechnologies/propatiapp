ALTER TABLE "user_onboardings"
ADD COLUMN IF NOT EXISTS "tenant_profile_done" BOOLEAN NOT NULL DEFAULT false;
