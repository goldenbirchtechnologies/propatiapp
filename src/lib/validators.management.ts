import { z } from 'zod';
import { uuidSchema } from './validators';

export const turnoverStatusSchema = z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']);

export const turnoverPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const createTurnoverTaskSchema = z.object({
  bookingId: uuidSchema.optional(),
  propertyId: z.string().uuid().optional(),
  listingId: uuidSchema.optional(),
  assignedToUserId: uuidSchema.optional(),
  priority: turnoverPrioritySchema.default('medium'),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  checklist: z.record(z.any()).optional(),
  photos: z.array(z.string()).optional(),
});

export const updateTurnoverTaskSchema = z.object({
  status: turnoverStatusSchema.optional(),
  priority: turnoverPrioritySchema.optional(),
  assignedToUserId: uuidSchema.optional(),
  scheduledStart: z.string().datetime().optional(),
  scheduledEnd: z.string().datetime().optional(),
  actualStart: z.string().datetime().optional(),
  actualEnd: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
  checklist: z.record(z.any()).optional(),
  photos: z.array(z.string()).optional(),
  propertyId: z.string().uuid().optional(),
  listingId: uuidSchema.optional(),
});

export const businessProfileStatusSchema = z.enum(['pending', 'verified', 'rejected']);

export const createBusinessProfileSchema = z.object({
  userId: uuidSchema,
  cacNumber: z.string().min(2).max(50),
  rcNumber: z.string().min(2).max(50).optional(),
  companyName: z.string().max(200).optional(),
});

export const updateBusinessProfileSchema = z.object({
  verified: z.boolean().optional(),
  verifiedAt: z.string().datetime().optional(),
});

export const createEvidencePackSchema = z.object({
  disputeId: uuidSchema,
  contracts: z.record(z.any()),
  payments: z.record(z.any()),
  messages: z.record(z.any()),
  auditLogs: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

export const updateEvidencePackSchema = z.object({
  contracts: z.record(z.any()).optional(),
  payments: z.record(z.any()).optional(),
  messages: z.record(z.any()).optional(),
  auditLogs: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const documentTypeSchema = z.enum(['agreement', 'receipt', 'verification', 'other']);

export const createDocumentSchema = z.object({
  listingId: uuidSchema.optional(),
  uploadedById: uuidSchema,
  type: documentTypeSchema,
  url: z.string().url(),
  name: z.string().min(1).max(255),
  mimeType: z.string().max(100).optional(),
  sizeBytes: z.number().nonnegative().optional(),
  accessControl: z.string().default('private'),
});

export const updateDocumentSchema = z.object({
  type: documentTypeSchema.optional(),
  version: z.number().int().positive().optional(),
  url: z.string().url().optional(),
  name: z.string().min(1).max(255).optional(),
  accessControl: z.string().optional(),
});

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().nonnegative(),
  currency: z.string().max(10).default('NGN'),
  interval: z.string().min(3).max(10),
  features: z.record(z.any()),
  isActive: z.boolean().default(true),
});

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  interval: z.string().min(3).max(10).optional(),
  features: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const createUserSubscriptionSchema = z.object({
  userId: uuidSchema,
  planId: uuidSchema,
  paystackSubId: z.string().optional(),
  status: z.string().default('active'),
  currentPeriodEnd: z.string().datetime(),
});

export const updateUserSubscriptionSchema = z.object({
  status: z.string().optional(),
  paystackSubId: z.string().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
});

export type CreateTurnoverTaskInput = z.infer<typeof createTurnoverTaskSchema>;
export type UpdateTurnoverTaskInput = z.infer<typeof updateTurnoverTaskSchema>;
export type CreateBusinessProfileInput = z.infer<typeof createBusinessProfileSchema>;
export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>;
export type CreateEvidencePackInput = z.infer<typeof createEvidencePackSchema>;
export type UpdateEvidencePackInput = z.infer<typeof updateEvidencePackSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>;
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>;
export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>;
export type UpdateUserSubscriptionInput = z.infer<typeof updateUserSubscriptionSchema>;
