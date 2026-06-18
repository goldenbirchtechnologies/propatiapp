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

export const verifyIdentitySchema = z.object({
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

export const requestInspectionSchema = z.object({
  listingId: uuidSchema,
  preferredDate: z.string().datetime(),
  preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const adminReviewSchema = z.object({
  listingId: uuidSchema,
  layer: z.number().int().min(1).max(5),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
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
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  rentAmount: z.number().nonnegative().optional(),
  rentPeriod: z.enum(['monthly', 'yearly']).optional(),
  cautionDeposit: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  noticePeriodDays: z.number().int().positive().default(30),
  specialClauses: z.string().optional(),
  templateVars: z.record(z.string()).optional(),
});

export const signAgreementSchema = z.object({
  agreementId: uuidSchema,
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  consentText: z.string().min(10, 'Consent text required'),
});

// Message schemas
export const createConversationSchema = z.object({
  listingId: uuidSchema.optional(),
  tenantId: uuidSchema,
  subject: z.string().max(200).optional(),
});

export const sendMessageSchema = z.object({
  conversationId: uuidSchema,
  content: z.string().min(1).max(5000),
  attachmentUrl: urlSchema.optional(),
  attachmentType: z.enum(['image', 'document', 'voice']).optional(),
});

export const messageFilterSchema = paginationSchema.extend({
  conversationId: uuidSchema,
  since: z.string().datetime().optional(),
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
});

export const updateMaintenanceTicketSchema = z.object({
  ticketId: uuidSchema,
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']).optional(),
  assignedTo: uuidSchema.optional(),
  resolutionNote: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

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