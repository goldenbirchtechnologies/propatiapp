CREATE TABLE "payment_methods" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" VARCHAR(20) NOT NULL,
  "provider" VARCHAR(30) NOT NULL DEFAULT 'paystack',
  "email_used" TEXT NOT NULL,
  "authorization_code" TEXT,
  "authorization_signature" VARCHAR(120),
  "card_brand" VARCHAR(40),
  "card_type" VARCHAR(40),
  "card_last4" VARCHAR(4),
  "card_exp_month" VARCHAR(2),
  "card_exp_year" VARCHAR(4),
  "bank_name" VARCHAR(120),
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "setup_reference" VARCHAR(120),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_methods_setup_reference_key" ON "payment_methods"("setup_reference");
CREATE INDEX "idx_payment_methods_user_status" ON "payment_methods"("user_id", "status");

ALTER TABLE "payment_methods"
  ADD CONSTRAINT "payment_methods_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
