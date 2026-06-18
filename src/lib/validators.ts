import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid phone number');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const urlSchema = z.string().url('Invalid URL');
export const uuidSchema = z.string().uuid('Invalid ID format');
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// User schemas
export const createUserSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
  password: passwordSchema,
  role: z.enum(['landlord', 'tenant', 'agent', 'admin', 'estate_manager']),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  avatarUrl: urlSchema.optional(),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: phoneSchema.optional(),
  avatarUrl: urlSchema.optional(),
  profileBio: z.string().max(500).optional(),
});

// Listing schemas
export const listingTypeSchema = z.enum(['rent', 'sale', 'short_let', 'share', 'commercial']);
export const propertyTypeSchema = z.enum(['apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse']);
export const listingStatusSchema = z.enum(['draft', 'active', 'suspended', 'deleted']);
export const verificationTierSchema = z.enum(['basic', 'verified', 'inspected', 'certified']);

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().max(5000).optional(),
  listingType: listingTypeSchema,
  propertyType: propertyTypeSchema.optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  area: z.string().min(2, 'Area is required'),
  state: z.string().min(2).default('Lagos'),
  price: z.number().positive('Price must be positive'),
  pricePeriod: z.enum(['night', 'month', 'year', 'total']).optional(),
  cautionDeposit: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  toilets: z.number().int().nonnegative().optional(),
  sizeSqm: z.number().positive().optional(),
  floorLevel: z.number().int().nonnegative().optional(),
  furnished: z.boolean().default(false),
  parkingSpaces: z.number().int().nonnegative().default(0),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.string().datetime().optional(),
  minimumStay: z.number().int().positive().optional(),
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: listingStatusSchema.optional(),
  verificationTier: verificationTierSchema.optional(),
  isFeatured: z.boolean().optional(),
});

export const listingFilterSchema = paginationSchema.extend({
  q: z.string().optional(), // Text search for title, description, location
  listingType: listingTypeSchema.optional(),
  propertyType: propertyTypeSchema.optional(),
  area: z.string().optional(),
  state: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minBedrooms: z.coerce.number().int().nonnegative().optional(),
  maxBedrooms: z.coerce.number().int().positive().optional(),
  verificationTier: verificationTierSchema.optional(),
  status: listingStatusSchema.optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'most_verified']).default('newest'),
});

// Verification schemas
export const verificationLayerStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const verificationOverallStatusSchema = z.enum(['not_started', 'in_progress', 'certified', 'rejected']);
export const idTypeSchema = z.enum(['nin', 'bvn', 'passport', 'drivers_licence', 'voters_card']);

export const submitLayer1Schema = z.object({
  listingId: uuidSchema,
  docUrl: urlSchema,
});

// Document Upload schemas
export const documentTypeSchema = z.enum(['ownership', 'id', 'photos', 'utility']);

export const documentUploadSchema = z.object({
  documentType: documentTypeSchema,
  listingId: z.string().min(1, 'Listing ID is required'),
  fileName: z.string().optional(),
});

// File validation constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ACCEPTED_DOC_TYPES = ['application/pdf', ...ACCEPTED_IMAGE_TYPES];

export const validateFileType = (mimeType: string, documentType: string): boolean => {
  if (documentType === 'photos') {
    return ACCEPTED_IMAGE_TYPES.includes(mimeType);
  }
  return ACCEPTED_DOC_TYPES.includes(mimeType);
};

export const validateFileSize = (size: number): boolean => {
  return size <= MAX_FILE_SIZE;
};

export const verifyIdentitySchema = z.object({
  verificationId: z.string().cuid(),
  verificationType: z.enum(['nin', 'bvn']),
  number: z.string().min(10).max(11),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export const oldVerifyIdentitySchema = z.object({
  listingId: uuidSchema,
  idType: idTypeSchema,
  idNumber: z.string().min(11).max(20),
});

export const confirmIdentitySchema = z.object({
  listingId: uuidSchema,
  confirmed: z.boolean(),
});

export const uploadVideoSchema = z.object({
  listingId: uuidSchema,
  videoUrl: urlSchema,
});

// Video upload validation constants
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export const videoUploadFormSchema = z.object({
  verificationId: z.string().cuid(),
  listingId: z.string().cuid(),
});

export const requestInspectionSchema = z.object({
  listingId: uuidSchema,
  preferredDate: z.string().datetime(),
  preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const completeInspectionSchema = z.object({
  inspectionId: z.string().cuid(),
  status: z.enum(['passed', 'failed', 'requires_followup']),
  report: z.string().min(50, 'Report must be at least 50 characters'),
  rating: z.number().min(1).max(5),
  issues: z.array(z.string()).optional(),
  reportUrl: urlSchema.optional(),
});

export const adminReviewSchema = z.object({
  listingId: uuidSchema,
  layer: z.number().int().min(1).max(5),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
});

export const startVerificationSchema = z.object({
  listingId: uuidSchema,
});

export const updateVerificationSchema = z.object({
  status: z.enum(['certified', 'rejected']).optional(),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
});

export const getMyVerificationsSchema = z.object({
  status: verificationOverallStatusSchema.optional(),
  listingId: uuidSchema.optional(),
});

// Transaction schemas
export const transactionTypeSchema = z.enum(['rent', 'caution', 'sale', 'short_let', 'subscription']);
export const transactionStatusSchema = z.enum(['pending', 'in_escrow', 'released', 'failed', 'refunded']);

export const initiatePaymentSchema = z.object({
  listingId: uuidSchema,
  agreementId: uuidSchema.optional(),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  email: emailSchema,
  phone: phoneSchema.optional(),
  metadata: z.record(z.string()).optional(),
});

// Payment verification schema for Phase D
export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required'),
});

export const releaseEscrowSchema = z.object({
  recipientBankCode: z.string().min(3, 'Bank code is required'),
  recipientAccountNumber: z.string().regex(/^\d{10}$/, 'Account number must be 10 digits'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  amount: z.number().positive().optional(),
  reason: z.string().min(5, 'Reason is required').optional(),
});

export const transactionFiltersSchema = paginationSchema.extend({
  userId: uuidSchema.optional(),
  status: transactionStatusSchema.optional(),
  type: transactionTypeSchema.optional(),
  listingId: uuidSchema.optional(),
  agreementId: uuidSchema.optional(),
});

export const webhookSchema = z.object({
  event: z.string(),
  data: z.record(z.unknown()),
});

// Agreement schemas
export const agreementTypeSchema = z.enum(['rental', 'sale', 'short_let', 'share']);
export const agreementStatusSchema = z.enum([
  'draft', 'pending_landlord', 'pending_tenant', 'tenant_signed',
  'landlord_signed', 'fully_signed', 'terminated', 'expired'
]);

export const createAgreementSchema = z.object({
  listingId: uuidSchema,
  tenantId: uuidSchema,
  agentId: uuidSchema.optional(),
  type: agreementTypeSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  rentAmount: z.number().positive('Rent amount must be positive'),
  paymentSchedule: z.enum(['monthly', 'quarterly', 'annually']),
  cautionDeposit: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  terms: z.string().optional(),
  noticePeriodDays: z.number().int().positive().default(30),
  specialClauses: z.string().optional(),
  templateVars: z.record(z.string()).optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const signAgreementSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must consent to sign the agreement',
  }),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Message schemas (Phase E: Messaging System)
export const createConversationSchema = z.object({
  listingId: z.string().cuid(),
  participantId: z.string().cuid(),
  subject: z.string().max(200).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  attachmentUrl: urlSchema.optional(),
  attachmentType: z.enum(['image', 'document', 'video']).optional(),
}).refine(
  (data) => {
    // If attachmentUrl is provided, attachmentType must also be provided
    if (data.attachmentUrl && !data.attachmentType) {
      return false;
    }
    return true;
  },
  {
    message: 'attachmentType is required when attachmentUrl is provided',
    path: ['attachmentType'],
  }
);

export const messageFilterSchema = paginationSchema.extend({
  conversationId: uuidSchema,
  since: z.string().datetime().optional(),
  before: z.string().cuid().optional(), // For cursor-based pagination
});

// Organisation schemas
export const orgPlanTierSchema = z.enum(['starter', 'growth', 'enterprise']);
export const orgMemberRoleSchema = z.enum(['manager', 'accountant', 'maintenance', 'owner_view']);
export const orgMemberStatusSchema = z.enum(['pending', 'active', 'removed']);

export const createOrganisationSchema = z.object({
  name: z.string().min(2).max(100),
  billingEmail: emailSchema.optional(),
  address: z.string().optional(),
  cacNumber: z.string().optional(),
  planTier: orgPlanTierSchema.default('starter'),
});

export const subscribeOrgSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  paymentMethod: z.string().optional(), // Paystack authorization code
});

export const updateSubscriptionSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']).optional(),
  status: z.enum(['active', 'paused', 'cancelled']).optional(),
});

export const inviteOrgMemberSchema = z.object({
  orgId: uuidSchema,
  email: emailSchema,
  role: orgMemberRoleSchema,
});

export const acceptInviteSchema = z.object({
  inviteToken: z.string().min(1),
});

export const createMaintenanceTicketSchema = z.object({
  orgId: uuidSchema,
  listingId: uuidSchema.optional(),
  tenantId: uuidSchema.optional(),
  title: z.string().min(5).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['plumbing', 'electrical', 'structural', 'security', 'cleaning', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  photoUrls: z.array(urlSchema).optional(),
  assignedTo: uuidSchema.optional(),
});

export const updateMaintenanceTicketSchema = z.object({
  ticketId: uuidSchema,
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  assignedTo: uuidSchema.optional(),
  resolutionNote: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

// Application schemas
export const applicationStatusSchema = z.enum(['pending', 'under_review', 'accepted', 'rejected', 'withdrawn']);

export const createApplicationSchema = z.object({
  listingId: z.string().cuid(),
  message: z.string().max(2000).optional(),
});

export const updateApplicationSchema = z.object({
  status: z.enum(['under_review', 'accepted', 'rejected', 'withdrawn']),
  landlordNotes: z.string().max(2000).optional(),
});

export const applicationFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: applicationStatusSchema.optional(),
  listingId: z.string().cuid().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationFilters = z.infer<typeof applicationFiltersSchema>;

// Screening calls
export const scheduleScreeningSchema = z.object({
  listingId: uuidSchema,
  tenantId: uuidSchema,
  scheduledAt: z.string().datetime(),
});

export const updateScreeningSchema = z.object({
  screeningId: uuidSchema,
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().optional(),
});

// Disputes
export const createDisputeSchema = z.object({
  listingId: uuidSchema.optional(),
  type: z.enum(['non_delivery', 'misrepresentation', 'refund', 'other']),
  description: z.string().min(10).max(2000),
});

export const adminDisputeActionSchema = z.object({
  disputeId: uuidSchema,
  action: z.enum(['investigate', 'mediate', 'resolve', 'close']),
  resolution: z.string().optional(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type ListingFilters = z.infer<typeof listingFilterSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type ReleaseEscrowInput = z.infer<typeof releaseEscrowSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;
export type SignAgreementInput = z.infer<typeof signAgreementSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;
export type InviteOrgMemberInput = z.infer<typeof inviteOrgMemberSchema>;
export type CreateMaintenanceTicketInput = z.infer<typeof createMaintenanceTicketSchema>;
export type UpdateMaintenanceTicketInput = z.infer<typeof updateMaintenanceTicketSchema>;
export type ScheduleScreeningInput = z.infer<typeof scheduleScreeningSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type UpdateAgreementInput = Partial<z.infer<typeof createAgreementSchema>> & { status?: string };
export type UpdateOrganisationInput = Partial<z.infer<typeof createOrganisationSchema>>;
export type UpdateScreeningInput = Partial<z.infer<typeof scheduleScreeningSchema>> & { status?: string; meetingUrl?: string; notes?: string };
export type VerifyIdentityInput = z.infer<typeof verifyIdentitySchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type SubscribeOrgInput = z.infer<typeof subscribeOrgSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export interface OnboardingFormData {
  role: string;
  fullName: string;
  phone?: string;
  agentBio?: string;
  agentAreas?: string[];
}

// ===========================================================================
// ADMIN DASHBOARD SCHEMAS (Phase G)
// ===========================================================================

export const approveVerificationSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const rejectVerificationSchema = z.object({
  reason: z.string().min(10).max(1000),
  layer: z.number().min(1).max(5).optional(),
});

export const updateUserAdminSchema = z.object({
  role: z.enum(['landlord', 'tenant', 'agent', 'admin', 'estate_manager']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  phoneVerified: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(10).max(500),
});

export const banUserSchema = z.object({
  reason: z.string().min(10).max(500),
});

export const approveAgentSchema = z.object({
  agentTier: z.enum(['standard', 'senior', 'probation']).default('probation'),
  notes: z.string().max(500).optional(),
});

export const dismissFlagsSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const suspendListingSchema = z.object({
  reason: z.string().min(10).max(500),
});

export const revenueFiltersSchema = paginationSchema.extend({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('month'),
});

export const auditLogFiltersSchema = paginationSchema.extend({
  adminId: uuidSchema.optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const adminUserFiltersSchema = paginationSchema.extend({
  role: z.enum(['landlord', 'tenant', 'agent', 'admin', 'estate_manager']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  search: z.string().optional(),
});

export const verificationQueueFiltersSchema = paginationSchema.extend({
  status: verificationLayerStatusSchema.optional(),
  layer: z.coerce.number().int().min(1).max(5).optional(),
});

export const flaggedListingsFiltersSchema = paginationSchema.extend({
  resolved: z.coerce.boolean().optional(),
  flagType: z.enum(['fraud', 'duplicate', 'misleading', 'wrong_price', 'harassment', 'other']).optional(),
});

// Type exports for Phase G
export type ApproveVerificationInput = z.infer<typeof approveVerificationSchema>;
export type RejectVerificationInput = z.infer<typeof rejectVerificationSchema>;
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type ApproveAgentInput = z.infer<typeof approveAgentSchema>;
export type DismissFlagsInput = z.infer<typeof dismissFlagsSchema>;
export type SuspendListingInput = z.infer<typeof suspendListingSchema>;
export type RevenueFilters = z.infer<typeof revenueFiltersSchema>;
export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>;
export type AdminUserFilters = z.infer<typeof adminUserFiltersSchema>;
export type VerificationQueueFilters = z.infer<typeof verificationQueueFiltersSchema>;
export type FlaggedListingsFilters = z.infer<typeof flaggedListingsFiltersSchema>;

// ===========================================================================
// NOTIFICATION SCHEMAS (Phase H)
// ===========================================================================

export const notificationTypeSchema = z.enum([
  'rent_due',
  'payment',
  'message',
  'verification',
  'agreement',
  'maintenance',
  'screening',
  'system',
]);

export const createNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  actionUrl: z.string().url().optional(),
  metadata: z.any().optional(),
});

export const notificationFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  read: z.enum(['true', 'false']).optional(),
  type: notificationTypeSchema.optional(),
});

export const markNotificationReadSchema = z.object({
  read: z.boolean(),
});

// Type exports
export type NotificationTypeEnum = z.infer<typeof notificationTypeSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationFilters = z.infer<typeof notificationFiltersSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;