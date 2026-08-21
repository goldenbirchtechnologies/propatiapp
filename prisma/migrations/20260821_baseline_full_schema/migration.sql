-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('landlord', 'tenant', 'agent', 'admin', 'estate_manager');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('rent', 'sale', 'short_let', 'share', 'commercial');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse');

-- CreateEnum
CREATE TYPE "PrivacyType" AS ENUM ('entire_place', 'private_room', 'shared_room');

-- CreateEnum
CREATE TYPE "PropertyStructure" AS ENUM ('house', 'apartment', 'barn', 'bed_and_breakfast', 'boat', 'cabin', 'camper_rv', 'casa_particular', 'castle', 'cave', 'container', 'cycladic_home', 'dammuso', 'dome', 'earth_home', 'farm', 'guesthouse', 'hotel', 'houseboat', 'minsu', 'riad', 'ryokan', 'shepherds_hut', 'tent', 'tiny_home', 'tower', 'treehouse', 'trullo', 'windmill', 'yurt');

-- CreateEnum
CREATE TYPE "BookingModel" AS ENUM ('review_first_3_then_instant', 'instant_book');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'active', 'suspended', 'deleted');

-- CreateEnum
CREATE TYPE "ShortletStatus" AS ENUM ('pending', 'approved', 'rejected', 'revoked', 'withdrawn');

-- CreateEnum
CREATE TYPE "VerificationTier" AS ENUM ('basic', 'verified', 'inspected', 'certified');

-- CreateEnum
CREATE TYPE "VerificationLayerStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "VerificationOverallStatus" AS ENUM ('not_started', 'in_progress', 'certified', 'rejected', 'frozen');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('property', 'identity', 'company', 'professional');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('rent', 'caution', 'sale', 'short_let', 'subscription');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'in_escrow', 'commission_held', 'released', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('rental', 'sale', 'short_let', 'share');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('draft', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed', 'fully_signed', 'terminated', 'expired');

-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('fraud', 'duplicate', 'misleading', 'wrong_price', 'harassment', 'other');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('open', 'reviewed', 'dismissed');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('active', 'archived', 'blocked');

-- CreateEnum
CREATE TYPE "MessageAttachmentType" AS ENUM ('image', 'document', 'video');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('rent_due', 'payment', 'message', 'verification', 'agreement', 'maintenance', 'screening', 'system', 'agent_invite_sent', 'agent_invite_accepted', 'agent_revoked');

-- CreateEnum
CREATE TYPE "OrgPlanTier" AS ENUM ('starter', 'growth', 'enterprise');

-- CreateEnum
CREATE TYPE "OrgMemberRole" AS ENUM ('manager', 'accountant', 'maintenance', 'owner_view');

-- CreateEnum
CREATE TYPE "OrgMemberStatus" AS ENUM ('pending', 'active', 'removed');

-- CreateEnum
CREATE TYPE "BusinessVerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "MaintenanceCategory" AS ENUM ('plumbing', 'electrical', 'structural', 'security', 'cleaning', 'other');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'trialing', 'past_due', 'cancelled', 'paused');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('deposit', 'withdrawal', 'transfer', 'refund', 'adjustment', 'escrow_credit');

-- CreateEnum
CREATE TYPE "WalletTransactionStatus" AS ENUM ('pending', 'success', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "PaystackAccountStatus" AS ENUM ('pending', 'active', 'failed');

-- CreateEnum
CREATE TYPE "AgentInviteStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- CreateEnum
CREATE TYPE "DisputeType" AS ENUM ('tenancy_non_delivery', 'tenancy_habitability', 'tenancy_illegal_eviction', 'tenancy_rent_dispute', 'tenancy_utility_dispute', 'tenancy_security_deposit', 'tenancy_disturbance', 'sale_agreement_breach', 'sale_fraudulent_misrepresentation', 'sale_title_dispute', 'sale_payment_dispute', 'paystack_chargeback', 'other');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'investigating', 'routed', 'consent_required', 'consent_granted', 'conflict_check', 'engaged', 'mediated', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "DocumentAccessAction" AS ENUM ('view', 'download', 'print', 'share');

-- CreateEnum
CREATE TYPE "EvidencePackSealStatus" AS ENUM ('draft', 'pending_review', 'sealed', 'revoked');

-- CreateEnum
CREATE TYPE "AgreementLockStatus" AS ENUM ('mutable', 'locked', 'immutable');

-- CreateEnum
CREATE TYPE "LawyerVerificationStatus" AS ENUM ('pending', 'under_review', 'verified', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('full_representation', 'advisory_only', 'document_review', 'limited_scope');

-- CreateEnum
CREATE TYPE "EngagementStatus" AS ENUM ('draft', 'sent_to_client', 'consent_pending', 'consent_rejected', 'consent_accepted', 'active', 'completed', 'withdrawn');

-- CreateEnum
CREATE TYPE "ConflictCheckStatus" AS ENUM ('not_checked', 'clear', 'conflict', 'waived');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'under_review', 'accepted', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "StampDutyStatus" AS ENUM ('pending', 'payment_pending', 'payment_failed', 'paid', 'processing', 'issued', 'failed');

-- CreateEnum
CREATE TYPE "ScreeningCallStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('sent', 'failed', 'bounced');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('nin', 'bvn', 'passport', 'drivers_licence', 'voters_card');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('employed', 'self_employed', 'business_owner', 'student', 'retired', 'unemployed');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');

-- CreateEnum
CREATE TYPE "AgentTier" AS ENUM ('standard', 'senior', 'probation');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "UnitOccupancy" AS ENUM ('VACANT', 'OCCUPIED', 'NOTICE_GIVEN');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('not_started', 'in_progress', 'approved', 'rejected', 'requires_review');

-- CreateEnum
CREATE TYPE "LawFirmCaseStatus" AS ENUM ('assigned', 'in_progress', 'resolved', 'cancelled');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('rent', 'service', 'utility', 'agreement', 'other');

-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('electricity', 'water', 'waste', 'security', 'other');

-- CreateEnum
CREATE TYPE "TurnoverTaskStatus" AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "TurnoverTaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "nin_encrypted" TEXT,
    "nin_hash" TEXT,
    "nin_verified" BOOLEAN NOT NULL DEFAULT false,
    "bvn_encrypted" TEXT,
    "id_type" "IdType",
    "id_number_enc" TEXT,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "id_doc_url" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "employment_status" "EmploymentStatus",
    "employment_type" "EmploymentType",
    "employer_name" TEXT,
    "job_title" TEXT,
    "yearly_income" BIGINT,
    "income_verified" BOOLEAN NOT NULL DEFAULT false,
    "profile_bio" TEXT,
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "guarantor_name" TEXT,
    "guarantor_phone" TEXT,
    "guarantor_relationship" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "ban_reason" TEXT,
    "agent_tier" "AgentTier" NOT NULL DEFAULT 'standard',
    "agent_approved" BOOLEAN NOT NULL DEFAULT true,
    "agent_bio" TEXT,
    "agent_areas" JSONB,
    "notification_preferences" JSONB DEFAULT '{"email":true,"sms":true,"whatsapp":false,"inapp":true,"types":{"verification":true,"agreement":true,"payment":true,"message":true,"rent_due":true,"maintenance":true,"screening":true,"system":true}}',
    "push_subscription" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_kyc" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'not_started',
    "level" INTEGER NOT NULL DEFAULT 1,
    "dojah_ref" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "listing_type" "ListingType" NOT NULL,
    "property_type" "PropertyType",
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Lagos',
    "city" TEXT,
    "postal_code" TEXT,
    "floors" INTEGER,
    "price" DECIMAL(15,2) NOT NULL,
    "price_period" TEXT,
    "caution_deposit" DECIMAL(15,2),
    "service_charge" DECIMAL(15,2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "toilets" INTEGER,
    "size_sqm" DECIMAL(10,2),
    "floor_level" INTEGER,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "parking_spaces" INTEGER NOT NULL DEFAULT 0,
    "amenities" JSONB,
    "available_from" TIMESTAMP(3),
    "minimum_stay" INTEGER,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "allow_shortlet" BOOLEAN NOT NULL DEFAULT false,
    "guests_count" INTEGER DEFAULT 1,
    "beds_count" INTEGER DEFAULT 1,
    "privacy_type" "PrivacyType",
    "property_structure" "PropertyStructure",
    "booking_model" "BookingModel",
    "weekend_pricing" DECIMAL(5,2),
    "discounts" JSONB,
    "highlights" JSONB,
    "house_rules" JSONB,
    "safety_disclosures" JSONB,
    "kyc_compliance" JSONB,
    "verification_tier" "VerificationTier" NOT NULL DEFAULT 'basic',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_listings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_flags" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "flagged_by" TEXT NOT NULL,
    "type" "FlagType" NOT NULL,
    "description" TEXT,
    "status" "FlagStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL DEFAULT 'property',
    "listing_id" TEXT,
    "owner_id" TEXT NOT NULL,
    "l1_status" "VerificationLayerStatus" NOT NULL DEFAULT 'pending',
    "l1_doc_url" TEXT,
    "l1_submitted_at" TIMESTAMP(3),
    "l2_status" "VerificationLayerStatus" NOT NULL DEFAULT 'pending',
    "l2_id_type" "IdType",
    "l2_verified_at" TIMESTAMP(3),
    "l3_status" "VerificationLayerStatus" NOT NULL DEFAULT 'pending',
    "l3_video_url" TEXT,
    "l3_qr_code" TEXT,
    "l4_status" "VerificationLayerStatus" NOT NULL DEFAULT 'pending',
    "l4_agent_id" TEXT,
    "l4_scheduled_at" TIMESTAMP(3),
    "l4_completed_at" TIMESTAMP(3),
    "l4_report_url" TEXT,
    "l5_status" "VerificationLayerStatus" NOT NULL DEFAULT 'pending',
    "current_layer" INTEGER NOT NULL DEFAULT 1,
    "overall_status" "VerificationOverallStatus" NOT NULL DEFAULT 'not_started',
    "admin_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "frozen_reason" TEXT,
    "frozen_at" TIMESTAMP(3),
    "frozen_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_documents" (
    "id" TEXT NOT NULL,
    "verification_id" TEXT NOT NULL,
    "listing_id" TEXT,
    "document_type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reference" TEXT,
    "listing_id" TEXT,
    "payer_id" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" BIGINT NOT NULL,
    "currency" TEXT DEFAULT 'NGN',
    "platform_fee" BIGINT NOT NULL DEFAULT 0,
    "agent_commission" BIGINT NOT NULL DEFAULT 0,
    "payee_amount" BIGINT,
    "paystack_ref" TEXT,
    "agent_commission_status" TEXT DEFAULT 'pending',
    "commission_hold_reason" TEXT,
    "agent_commission_released_at" TIMESTAMP(3),
    "buyer_confirmed_at" TIMESTAMP(3),
    "seller_confirmed_at" TIMESTAMP(3),
    "confirmation_status" TEXT DEFAULT 'pending',
    "description" TEXT,
    "paystack_data" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "type" "AgreementType" NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "rent_amount" DECIMAL(15,2),
    "rent_period" TEXT,
    "caution_deposit" DECIMAL(15,2),
    "service_charge" DECIMAL(15,2),
    "notice_period_days" INTEGER NOT NULL DEFAULT 30,
    "special_clauses" TEXT,
    "landlord_signed_at" TIMESTAMP(3),
    "tenant_signed_at" TIMESTAMP(3),
    "pdf_url" TEXT,
    "template_vars" JSONB,
    "risk_tier" TEXT DEFAULT 'review_required',
    "jurisdiction_state" TEXT,
    "governing_statute" TEXT,
    "head_tenant_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pdf_content_hash" TEXT,
    "finalized_at" TIMESTAMP(3),
    "lock_status" "AgreementLockStatus" NOT NULL DEFAULT 'mutable',
    "integrity_chain_hash" TEXT,
    "locked_by" TEXT,

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_signatures" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "signer_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "consent_text" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksum" TEXT,
    "document_hash" TEXT,
    "binding_hash" TEXT,

    CONSTRAINT "agreement_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_schedule" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "paid_at" TIMESTAMP(3),
    "transaction_id" TEXT,
    "reminder_sent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rent_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT,
    "property_id" TEXT,
    "org_id" TEXT,
    "landlord_id" TEXT,
    "tenant_id" TEXT,
    "agent_id" TEXT,
    "participants" JSONB DEFAULT '[]',
    "subject" TEXT,
    "last_message" TEXT,
    "last_message_at" TIMESTAMP(3),
    "unread_counts" JSONB DEFAULT '{}',
    "status" "ConversationStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachment_url" TEXT,
    "attachment_type" "MessageAttachmentType",
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "billing_email" TEXT,
    "address" TEXT,
    "cac_number" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "plan_tier" "OrgPlanTier" NOT NULL DEFAULT 'starter',
    "max_units" INTEGER NOT NULL DEFAULT 20,
    "max_seats" INTEGER NOT NULL DEFAULT 1,
    "paystack_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_members" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "role" "OrgMemberRole" NOT NULL,
    "status" "OrgMemberStatus" NOT NULL DEFAULT 'pending',
    "invited_by" TEXT,
    "invite_token" TEXT,
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_listings" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tickets" (
    "id" TEXT NOT NULL,
    "org_id" TEXT,
    "listing_id" TEXT,
    "tenant_id" TEXT,
    "raised_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "MaintenanceCategory" NOT NULL,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'medium',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'open',
    "assigned_to" TEXT,
    "photo_urls" TEXT[],
    "resolution_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_subscriptions" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "paystack_sub_id" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "amount" BIGINT NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "next_billing_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT,
    "raised_by" TEXT NOT NULL,
    "type" "DisputeType" NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screening_calls" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "ScreeningCallStatus" NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "screening_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_log" (
    "id" TEXT NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,

    CONSTRAINT "email_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "building_name" TEXT,
    "unit_number" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "size_sqm" DECIMAL(10,2),
    "listing_type" "ListingType" NOT NULL,
    "price_period" TEXT,
    "minimum_stay" INTEGER,
    "is_listed" BOOLEAN NOT NULL DEFAULT false,
    "rent" DECIMAL(10,2) NOT NULL,
    "caution_deposit" DECIMAL(10,2),
    "service_charge" DECIMAL(10,2),
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "occupancy" "UnitOccupancy" NOT NULL DEFAULT 'VACANT',
    "current_tenant_id" TEXT,
    "lease_start_date" TIMESTAMP(3),
    "lease_end_date" TIMESTAMP(3),
    "last_maintenance_date" TIMESTAMP(3),
    "next_maintenance_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "landlord_notes" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "requested_info_at" TIMESTAMP(3),
    "stage" TEXT DEFAULT 'submitted',
    "screening_status" JSONB DEFAULT '{}',
    "guarantor_data" JSONB DEFAULT '{}',
    "applicant_documents" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stamp_duty" (
    "id" TEXT NOT NULL,
    "agreement_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "remita_rrr" TEXT,
    "transaction_id" TEXT,
    "certificate_number" TEXT,
    "certificate_url" TEXT,
    "status" "StampDutyStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "issued_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "agreement_pdf_hash" TEXT,
    "certificate_hash" TEXT,
    "linkage_hash" TEXT,

    CONSTRAINT "stamp_duty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_slots" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "price" DECIMAL(12,2),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "name" TEXT,
    "rule_type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "multiplier" DECIMAL(5,2),
    "fixed_price" DECIMAL(12,2),
    "day_of_week" INTEGER,
    "min_nights" INTEGER,
    "max_nights" INTEGER,
    "advance_days" INTEGER,
    "start_date" TEXT,
    "end_date" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "check_in" TEXT NOT NULL,
    "check_out" TEXT NOT NULL,
    "nights" INTEGER NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT,
    "guest_name" TEXT,
    "guest_phone" TEXT,
    "guest_email" TEXT,
    "special_requests" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "checked_in_at" TIMESTAMP(3),
    "checked_out_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_shortlets" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "landlord_id" TEXT NOT NULL,
    "status" "ShortletStatus" NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_shortlets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "law_firms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cac_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "billing_email" TEXT,
    "jurisdiction" JSONB NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" "LawyerVerificationStatus" NOT NULL DEFAULT 'pending',
    "call_to_bar_number" TEXT,
    "yearOfCall" INTEGER,
    "nba_enrollment_number" TEXT,
    "nba_enrollment_year" INTEGER,
    "principal_partner_name" TEXT,
    "principal_partner_call_number" TEXT,
    "specializations" JSONB,
    "feeStructure" JSONB,
    "rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "law_firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "law_firm_cases" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "firm_id" TEXT NOT NULL,
    "status" "LawFirmCaseStatus" NOT NULL DEFAULT 'assigned',
    "engagement_type" "EngagementType" NOT NULL DEFAULT 'limited_scope',
    "engagement_id" TEXT,
    "feeModel" JSONB NOT NULL,
    "conflict_check_id" TEXT,
    "fee" DECIMAL(12,2),
    "fee_currency" TEXT DEFAULT 'NGN',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "law_firm_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_charges" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "estate_manager_id" TEXT,
    "period" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "description" TEXT,
    "paid_at" TIMESTAMP(3),
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_allocations" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "type" "UtilityType" NOT NULL,
    "reading" DECIMAL(10,2),
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "billing_period" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'draft',
    "paid_at" TIMESTAMP(3),
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utility_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnover_tasks" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT,
    "property_id" TEXT,
    "listing_id" TEXT,
    "assigned_to_user_id" TEXT,
    "status" "TurnoverTaskStatus" NOT NULL DEFAULT 'pending',
    "priority" "TurnoverTaskPriority" NOT NULL DEFAULT 'medium',
    "scheduled_start" TIMESTAMP(3),
    "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_end" TIMESTAMP(3),
    "notes" TEXT,
    "checklist" JSONB,
    "photos" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnover_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cac_number" TEXT NOT NULL,
    "rc_number" TEXT,
    "company_name" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_verifications" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "status" "BusinessVerificationStatus" NOT NULL DEFAULT 'pending',
    "cac_number" TEXT NOT NULL,
    "company_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address" TEXT,
    "documents" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_packs" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "law_firm_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fileUrls" JSONB NOT NULL,
    "payments" JSONB NOT NULL,
    "messages" JSONB NOT NULL,
    "auditLogs" JSONB NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "exhibit_prefix" TEXT DEFAULT 'EX',
    "exhibit_count" INTEGER NOT NULL DEFAULT 0,
    "seal_hash" TEXT,
    "sealed_at" TIMESTAMP(3),
    "sealed_by" TEXT,
    "chain_hash" TEXT,

    CONSTRAINT "evidence_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" BIGINT,
    "access_control" TEXT NOT NULL DEFAULT 'private',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "current_version" INTEGER DEFAULT 1,
    "legal_hold" BOOLEAN NOT NULL DEFAULT false,
    "chain_hash" TEXT,
    "locked_by" TEXT,
    "locked_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "size_bytes" BIGINT,
    "mime_type" TEXT,
    "content_hash" TEXT NOT NULL,
    "chain_hash" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_access_logs" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" "DocumentAccessAction" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_exhibits" (
    "id" TEXT NOT NULL,
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "evidence_exhibits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_custody_entries" (
    "id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_type" TEXT NOT NULL DEFAULT 'user',
    "action" TEXT NOT NULL,
    "state_hash" TEXT NOT NULL,
    "exhibit_ref" TEXT,
    "note" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_custody_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagements" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "type" "EngagementType" NOT NULL,
    "status" "EngagementStatus" NOT NULL DEFAULT 'draft',
    "scope_of_work" TEXT NOT NULL,
    "feeModel" JSONB NOT NULL,
    "disbursements" JSONB,
    "estimated_duration" TEXT,
    "advance_payment_required" BOOLEAN NOT NULL DEFAULT false,
    "advance_payment_amount" DECIMAL(12,2),
    "client_consent_text" TEXT NOT NULL,
    "client_consented_at" TIMESTAMP(3),
    "client_consent_ip" TEXT,
    "client_consent_user_agent" TEXT,
    "lawyer_review_status" TEXT NOT NULL DEFAULT 'pending',
    "lawyer_review_notes" TEXT,
    "lawyer_reviewed_at" TIMESTAMP(3),
    "firm_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engagements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conflict_checks" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "law_firm_id" TEXT NOT NULL,
    "lawyer_profile_id" TEXT,
    "status" "ConflictCheckStatus" NOT NULL DEFAULT 'not_checked',
    "adverse_party_type" TEXT NOT NULL,
    "adverse_party_id" TEXT NOT NULL,
    "adverse_party_name" TEXT NOT NULL,
    "previousWork" JSONB,
    "conflict_rationale" TEXT,
    "reviewed_by_admin_id" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "waiver_approved" BOOLEAN NOT NULL DEFAULT false,
    "waiver_approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conflict_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "law_firm_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "call_to_bar_number" TEXT NOT NULL,
    "yearOfCall" INTEGER NOT NULL,
    "nba_number" TEXT,
    "nbaYear" INTEGER,
    "specializationAreas" JSONB NOT NULL,
    "is_principal_partner" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lawyer_documents" (
    "id" TEXT NOT NULL,
    "engagement_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "review_status" TEXT NOT NULL DEFAULT 'pending',
    "lawyer_notes" TEXT,
    "redlined_url" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lawyer_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "price_yearly" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "features" JSONB NOT NULL,
    "max_listings" INTEGER NOT NULL DEFAULT 0,
    "max_users" INTEGER NOT NULL DEFAULT 1,
    "max_properties" INTEGER NOT NULL DEFAULT 0,
    "support_level" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "current_period_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelled_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "paystack_customer_id" TEXT,
    "paystack_subscription_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

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
    "permissions" JSONB DEFAULT '[]',
    "scope" TEXT,
    "listingIds" JSONB DEFAULT '[]',
    "message" TEXT,

    CONSTRAINT "agent_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_assignments" (
    "id" TEXT NOT NULL,
    "invite_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "scope" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_assignments_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "lock_version" INTEGER NOT NULL DEFAULT 1,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMP(3),
    "lockedReason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "reference" TEXT,
    "type" "WalletTransactionType" NOT NULL,
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "fee" DECIMAL(14,2) DEFAULT 0,
    "channel" TEXT DEFAULT 'paystack',
    "provider_ref" TEXT,
    "description" TEXT,
    "meta" JSONB,
    "opening_balance" DECIMAL(14,2) NOT NULL,
    "closing_balance" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paystack_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "customer_code" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "status" "PaystackAccountStatus" NOT NULL DEFAULT 'pending',
    "bank_name" TEXT,
    "account_number" TEXT,
    "account_name" TEXT,
    "dedicated_account_id" TEXT,
    "recipient_code" TEXT,
    "collectBelow" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paystack_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TransactionAgreements" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_nin_hash_key" ON "users"("nin_hash");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_nin_hash" ON "users"("nin_hash");

-- CreateIndex
CREATE UNIQUE INDEX "user_kyc_user_id_key" ON "user_kyc"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_kyc_dojah_ref_key" ON "user_kyc"("dojah_ref");

-- CreateIndex
CREATE INDEX "idx_user_kyc_user" ON "user_kyc"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_user_id_key" ON "password_resets"("user_id");

-- CreateIndex
CREATE INDEX "idx_listings_owner" ON "listings"("owner_id");

-- CreateIndex
CREATE INDEX "idx_listings_title" ON "listings"("title");

-- CreateIndex
CREATE INDEX "idx_listings_status" ON "listings"("status");

-- CreateIndex
CREATE INDEX "idx_listings_type" ON "listings"("listing_type");

-- CreateIndex
CREATE INDEX "idx_listings_area" ON "listings"("area");

-- CreateIndex
CREATE UNIQUE INDEX "saved_listings_user_id_listing_id_key" ON "saved_listings"("user_id", "listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_listing_id_key" ON "verifications"("listing_id");

-- CreateIndex
CREATE INDEX "idx_verification_owner" ON "verifications"("owner_id");

-- CreateIndex
CREATE INDEX "idx_verification_docs_verification" ON "verification_documents"("verification_id");

-- CreateIndex
CREATE INDEX "idx_verification_docs_listing" ON "verification_documents"("listing_id");

-- CreateIndex
CREATE INDEX "idx_verification_docs_type" ON "verification_documents"("document_type");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "rent_schedule_transaction_id_key" ON "rent_schedule"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_conversations_listing" ON "conversations"("listing_id");

-- CreateIndex
CREATE INDEX "idx_conversations_landlord" ON "conversations"("landlord_id");

-- CreateIndex
CREATE INDEX "idx_conversations_tenant" ON "conversations"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_conversations_agent" ON "conversations"("agent_id");

-- CreateIndex
CREATE INDEX "idx_conversations_org" ON "conversations"("org_id");

-- CreateIndex
CREATE INDEX "idx_conversations_property" ON "conversations"("property_id");

-- CreateIndex
CREATE INDEX "idx_messages_conv" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_messages_sender" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE UNIQUE INDEX "org_members_invite_token_key" ON "org_members"("invite_token");

-- CreateIndex
CREATE UNIQUE INDEX "org_members_org_id_user_id_key" ON "org_members"("org_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_listings_org_id_listing_id_key" ON "org_listings"("org_id", "listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_subscriptions_org_id_key" ON "org_subscriptions"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_subscriptions_paystack_sub_id_key" ON "org_subscriptions"("paystack_sub_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_admin" ON "admin_audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_target" ON "admin_audit_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_created" ON "admin_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_units_org" ON "units"("organization_id");

-- CreateIndex
CREATE INDEX "idx_units_status" ON "units"("status");

-- CreateIndex
CREATE INDEX "idx_units_occupancy" ON "units"("occupancy");

-- CreateIndex
CREATE INDEX "idx_units_listing" ON "units"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_organization_id_building_name_unit_number_key" ON "units"("organization_id", "building_name", "unit_number");

-- CreateIndex
CREATE INDEX "applications_tenant_id_idx" ON "applications"("tenant_id");

-- CreateIndex
CREATE INDEX "applications_landlord_id_idx" ON "applications"("landlord_id");

-- CreateIndex
CREATE INDEX "applications_listing_id_idx" ON "applications"("listing_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "stamp_duty_agreement_id_key" ON "stamp_duty"("agreement_id");

-- CreateIndex
CREATE INDEX "stamp_duty_status_idx" ON "stamp_duty"("status");

-- CreateIndex
CREATE INDEX "stamp_duty_remita_rrr_idx" ON "stamp_duty"("remita_rrr");

-- CreateIndex
CREATE INDEX "idx_calendar_listing" ON "calendar_slots"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_slots_listing_id_date_key" ON "calendar_slots"("listing_id", "date");

-- CreateIndex
CREATE INDEX "idx_pricing_listing" ON "pricing_rules"("listing_id");

-- CreateIndex
CREATE INDEX "idx_pricing_rule_type" ON "pricing_rules"("rule_type");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_transaction_id_key" ON "bookings"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_bookings_listing" ON "bookings"("listing_id");

-- CreateIndex
CREATE INDEX "idx_bookings_guest" ON "bookings"("guest_id");

-- CreateIndex
CREATE INDEX "idx_bookings_status" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "idx_bookings_dates" ON "bookings"("check_in", "check_out");

-- CreateIndex
CREATE INDEX "idx_tenant_shortlets_listing" ON "tenant_shortlets"("listing_id");

-- CreateIndex
CREATE INDEX "idx_tenant_shortlets_tenant" ON "tenant_shortlets"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_tenant_shortlets_landlord" ON "tenant_shortlets"("landlord_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_shortlets_listing_id_tenant_id_key" ON "tenant_shortlets"("listing_id", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "law_firms_cac_number_key" ON "law_firms"("cac_number");

-- CreateIndex
CREATE UNIQUE INDEX "law_firms_call_to_bar_number_key" ON "law_firms"("call_to_bar_number");

-- CreateIndex
CREATE UNIQUE INDEX "law_firms_nba_enrollment_number_key" ON "law_firms"("nba_enrollment_number");

-- CreateIndex
CREATE INDEX "idx_law_firms_verification" ON "law_firms"("verification_status");

-- CreateIndex
CREATE INDEX "idx_law_firms_call_to_bar" ON "law_firms"("call_to_bar_number");

-- CreateIndex
CREATE UNIQUE INDEX "law_firm_cases_dispute_id_key" ON "law_firm_cases"("dispute_id");

-- CreateIndex
CREATE UNIQUE INDEX "law_firm_cases_engagement_id_key" ON "law_firm_cases"("engagement_id");

-- CreateIndex
CREATE UNIQUE INDEX "law_firm_cases_conflict_check_id_key" ON "law_firm_cases"("conflict_check_id");

-- CreateIndex
CREATE INDEX "idx_law_firm_cases_firm" ON "law_firm_cases"("firm_id");

-- CreateIndex
CREATE INDEX "idx_law_firm_cases_status" ON "law_firm_cases"("status");

-- CreateIndex
CREATE UNIQUE INDEX "service_charges_transaction_id_key" ON "service_charges"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_service_charges_org" ON "service_charges"("organization_id");

-- CreateIndex
CREATE INDEX "idx_service_charges_listing" ON "service_charges"("listing_id");

-- CreateIndex
CREATE INDEX "idx_service_charges_status" ON "service_charges"("status");

-- CreateIndex
CREATE UNIQUE INDEX "utility_allocations_transaction_id_key" ON "utility_allocations"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_utility_allocations_unit" ON "utility_allocations"("unit_id");

-- CreateIndex
CREATE INDEX "idx_utility_allocations_status" ON "utility_allocations"("status");

-- CreateIndex
CREATE INDEX "idx_turnover_tasks_booking" ON "turnover_tasks"("booking_id");

-- CreateIndex
CREATE INDEX "idx_turnover_tasks_listing" ON "turnover_tasks"("listing_id");

-- CreateIndex
CREATE INDEX "idx_turnover_tasks_assignee" ON "turnover_tasks"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "idx_turnover_tasks_status" ON "turnover_tasks"("status");

-- CreateIndex
CREATE INDEX "idx_turnover_tasks_priority" ON "turnover_tasks"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_user_id_key" ON "business_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_cac_number_key" ON "business_profiles"("cac_number");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_rc_number_key" ON "business_profiles"("rc_number");

-- CreateIndex
CREATE INDEX "idx_business_profiles_cac" ON "business_profiles"("cac_number");

-- CreateIndex
CREATE INDEX "idx_business_verifications_entity" ON "business_verifications"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_business_verifications_status" ON "business_verifications"("status");

-- CreateIndex
CREATE INDEX "idx_business_verifications_cac" ON "business_verifications"("cac_number");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_packs_dispute_id_key" ON "evidence_packs"("dispute_id");

-- CreateIndex
CREATE INDEX "idx_documents_listing" ON "documents"("listing_id");

-- CreateIndex
CREATE INDEX "idx_documents_type" ON "documents"("type");

-- CreateIndex
CREATE INDEX "idx_doc_versions_document" ON "document_versions"("document_id");

-- CreateIndex
CREATE INDEX "idx_doc_versions_hash" ON "document_versions"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");

-- CreateIndex
CREATE INDEX "idx_doc_access_doc_user" ON "document_access_logs"("document_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_doc_access_document" ON "document_access_logs"("document_id");

-- CreateIndex
CREATE INDEX "idx_exhibits_pack_order" ON "evidence_exhibits"("pack_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_exhibits_pack_id_exhibit_number_key" ON "evidence_exhibits"("pack_id", "exhibit_number");

-- CreateIndex
CREATE INDEX "idx_custody_pack" ON "evidence_custody_entries"("pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "engagements_case_id_key" ON "engagements"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "conflict_checks_case_id_key" ON "conflict_checks"("case_id");

-- CreateIndex
CREATE INDEX "idx_conflict_checks_firm" ON "conflict_checks"("law_firm_id");

-- CreateIndex
CREATE INDEX "idx_conflict_checks_status" ON "conflict_checks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_profiles_user_id_key" ON "lawyer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_profiles_call_to_bar_number_key" ON "lawyer_profiles"("call_to_bar_number");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_profiles_nba_number_key" ON "lawyer_profiles"("nba_number");

-- CreateIndex
CREATE INDEX "idx_lawyer_profiles_firm" ON "lawyer_profiles"("law_firm_id");

-- CreateIndex
CREATE UNIQUE INDEX "lawyer_documents_engagement_id_document_id_key" ON "lawyer_documents"("engagement_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "idx_subscription_plans_active" ON "subscription_plans"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_paystack_customer_id_key" ON "user_subscriptions"("paystack_customer_id");

-- CreateIndex
CREATE INDEX "idx_user_subscriptions_user" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_subscriptions_plan" ON "user_subscriptions"("plan_id");

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
CREATE INDEX "idx_agent_assignments_agent" ON "agent_assignments"("agent_id");

-- CreateIndex
CREATE INDEX "idx_agent_assignments_listing" ON "agent_assignments"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_agent_assignments_agent_listing" ON "agent_assignments"("agent_id", "listing_id");

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
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");

-- CreateIndex
CREATE INDEX "idx_wallets_user" ON "wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_reference_key" ON "wallet_transactions"("reference");

-- CreateIndex
CREATE INDEX "idx_wallet_txns_wallet" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "idx_wallet_txns_user" ON "wallet_transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_wallet_txns_reference" ON "wallet_transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "paystack_accounts_user_id_key" ON "paystack_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "paystack_accounts_customer_code_key" ON "paystack_accounts"("customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "paystack_accounts_dedicated_account_id_key" ON "paystack_accounts"("dedicated_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "paystack_accounts_recipient_code_key" ON "paystack_accounts"("recipient_code");

-- CreateIndex
CREATE INDEX "idx_paystack_account_user" ON "paystack_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_TransactionAgreements_AB_unique" ON "_TransactionAgreements"("A", "B");

-- CreateIndex
CREATE INDEX "_TransactionAgreements_B_index" ON "_TransactionAgreements"("B");

-- AddForeignKey
ALTER TABLE "user_kyc" ADD CONSTRAINT "user_kyc_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_otps" ADD CONSTRAINT "phone_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_flags" ADD CONSTRAINT "listing_flags_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_flags" ADD CONSTRAINT "listing_flags_flagged_by_fkey" FOREIGN KEY ("flagged_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_l4_agent_id_fkey" FOREIGN KEY ("l4_agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_verification_id_fkey" FOREIGN KEY ("verification_id") REFERENCES "verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_signatures" ADD CONSTRAINT "agreement_signatures_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement_signatures" ADD CONSTRAINT "agreement_signatures_signer_id_fkey" FOREIGN KEY ("signer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_schedule" ADD CONSTRAINT "rent_schedule_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_schedule" ADD CONSTRAINT "rent_schedule_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_listings" ADD CONSTRAINT "org_listings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_listings" ADD CONSTRAINT "org_listings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_subscriptions" ADD CONSTRAINT "org_subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_calls" ADD CONSTRAINT "screening_calls_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_calls" ADD CONSTRAINT "screening_calls_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screening_calls" ADD CONSTRAINT "screening_calls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_current_tenant_id_fkey" FOREIGN KEY ("current_tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stamp_duty" ADD CONSTRAINT "stamp_duty_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_slots" ADD CONSTRAINT "calendar_slots_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_shortlets" ADD CONSTRAINT "tenant_shortlets_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "law_firm_cases" ADD CONSTRAINT "law_firm_cases_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "law_firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "law_firm_cases" ADD CONSTRAINT "law_firm_cases_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_estate_manager_id_fkey" FOREIGN KEY ("estate_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_charges" ADD CONSTRAINT "service_charges_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_allocations" ADD CONSTRAINT "utility_allocations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utility_allocations" ADD CONSTRAINT "utility_allocations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnover_tasks" ADD CONSTRAINT "turnover_tasks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnover_tasks" ADD CONSTRAINT "turnover_tasks_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnover_tasks" ADD CONSTRAINT "turnover_tasks_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_packs" ADD CONSTRAINT "evidence_packs_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_packs" ADD CONSTRAINT "evidence_packs_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_logs" ADD CONSTRAINT "document_access_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_exhibits" ADD CONSTRAINT "evidence_exhibits_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "evidence_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_custody_entries" ADD CONSTRAINT "evidence_custody_entries_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "evidence_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "law_firm_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "law_firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "law_firm_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conflict_checks" ADD CONSTRAINT "conflict_checks_lawyer_profile_id_fkey" FOREIGN KEY ("lawyer_profile_id") REFERENCES "lawyer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_profiles" ADD CONSTRAINT "lawyer_profiles_law_firm_id_fkey" FOREIGN KEY ("law_firm_id") REFERENCES "law_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lawyer_documents" ADD CONSTRAINT "lawyer_documents_engagement_id_fkey" FOREIGN KEY ("engagement_id") REFERENCES "engagements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_invites" ADD CONSTRAINT "agent_invites_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_invites" ADD CONSTRAINT "agent_invites_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "agent_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_assignments" ADD CONSTRAINT "agent_assignments_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paystack_accounts" ADD CONSTRAINT "paystack_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionAgreements" ADD CONSTRAINT "_TransactionAgreements_A_fkey" FOREIGN KEY ("A") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TransactionAgreements" ADD CONSTRAINT "_TransactionAgreements_B_fkey" FOREIGN KEY ("B") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

