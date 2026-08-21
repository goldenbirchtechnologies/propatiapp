-- CreateEnum
CREATE TYPE "AgentInviteStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('rent', 'service', 'utility', 'agreement', 'other');

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_landlord_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_tenant_id_fkey";

-- DropIndex
DROP INDEX "conversations_landlord_id_tenant_id_listing_id_key";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "unread_landlord",
DROP COLUMN "unread_tenant",
ADD COLUMN     "org_id" TEXT,
ADD COLUMN     "participants" JSONB DEFAULT '[]',
ADD COLUMN     "property_id" TEXT,
ADD COLUMN     "unread_counts" JSONB DEFAULT '{}',
ALTER COLUMN "landlord_id" DROP NOT NULL,
ALTER COLUMN "tenant_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "push_subscription" JSONB,
ALTER COLUMN "agent_approved" SET DEFAULT true;

-- CreateTable
CREATE TABLE "agent_invites" (
    "id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "AgentInviteStatus" NOT NULL DEFAULT 'pending',
    "accepted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "listing_id" TEXT,
    "agreement_id" TEXT,
    "type" "InvoiceType" NOT NULL DEFAULT 'rent',
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "items" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_invites_token_key" ON "agent_invites"("token");

-- CreateIndex
CREATE INDEX "idx_agent_invites_landlord" ON "agent_invites"("landlord_id");

-- CreateIndex
CREATE INDEX "idx_agent_invites_agent" ON "agent_invites"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_invites_email" ON "agent_invites"("email");

-- CreateIndex
CREATE INDEX "idx_agent_invites_status" ON "agent_invites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_agreement_id_key" ON "invoices"("agreement_id");

-- CreateIndex
CREATE INDEX "idx_invoices_landlord" ON "invoices"("landlord_id");

-- CreateIndex
CREATE INDEX "idx_invoices_tenant" ON "invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_invoices_listing" ON "invoices"("listing_id");

-- CreateIndex
CREATE INDEX "idx_invoices_status" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "idx_invoices_due_date" ON "invoices"("due_date");

-- CreateIndex
CREATE INDEX "idx_conversations_listing" ON "conversations"("listing_id");

-- CreateIndex
CREATE INDEX "idx_conversations_org" ON "conversations"("org_id");

-- CreateIndex
CREATE INDEX "idx_listings_title" ON "listings"("title");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_invites" ADD CONSTRAINT "agent_invites_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_invites" ADD CONSTRAINT "agent_invites_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

