import { z } from 'zod';
import { uuidSchema } from './validators';

export const invoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']);

export const createServiceChargeSchema = z.object({
  listingId: uuidSchema,
  organizationId: uuidSchema,
  period: z.string().min(4).max(20),
  amount: z.number().nonnegative(),
  currency: z.string().default('NGN'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(1000).optional(),
});

export const updateServiceChargeSchema = z.object({
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: invoiceStatusSchema.optional(),
  description: z.string().max(1000).optional(),
  estateManagerId: uuidSchema.optional(),
});

export const utilityTypeSchema = z.enum(['electricity', 'water', 'waste', 'security', 'other']);

export const createUtilityAllocationSchema = z.object({
  unitId: uuidSchema,
  type: utilityTypeSchema,
  reading: z.number().nonnegative().optional(),
  amount: z.number().nonnegative(),
  currency: z.string().default('NGN'),
  billingPeriod: z.string().min(4).max(20),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateUtilityAllocationSchema = z.object({
  type: utilityTypeSchema.optional(),
  reading: z.number().nonnegative().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  billingPeriod: z.string().min(4).max(20).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: invoiceStatusSchema.optional(),
});

export const lawFirmCaseStatusSchema = z.enum(['assigned', 'in_progress', 'resolved', 'cancelled']);

export const createLawFirmSchema = z.object({
  name: z.string().min(2).max(200),
  cacNumber: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  jurisdiction: z.array(z.string()).optional(),
});

export const updateLawFirmSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  jurisdiction: z.array(z.string()).optional(),
  verified: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
});

export const createLawFirmCaseSchema = z.object({
  disputeId: uuidSchema,
  firmId: uuidSchema,
  fee: z.number().nonnegative().optional(),
  feeCurrency: z.string().default('NGN'),
});

export const updateLawFirmCaseSchema = z.object({
  status: lawFirmCaseStatusSchema.optional(),
  fee: z.number().nonnegative().optional(),
  feeCurrency: z.string().default('NGN').optional(),
  resolvedAt: z.string().datetime().optional(),
});

export type CreateServiceChargeInput = z.infer<typeof createServiceChargeSchema>;
export type UpdateServiceChargeInput = z.infer<typeof updateServiceChargeSchema>;
export type CreateUtilityAllocationInput = z.infer<typeof createUtilityAllocationSchema>;
export type UpdateUtilityAllocationInput = z.infer<typeof updateUtilityAllocationSchema>;
export type CreateLawFirmInput = z.infer<typeof createLawFirmSchema>;
export type UpdateLawFirmInput = z.infer<typeof updateLawFirmSchema>;
export type CreateLawFirmCaseInput = z.infer<typeof createLawFirmCaseSchema>;
export type UpdateLawFirmCaseInput = z.infer<typeof updateLawFirmCaseSchema>;
