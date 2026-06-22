import { z } from 'zod';
import { emailSchema, phoneSchema, urlSchema, uuidSchema, paginationSchema } from './validators';

export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentStatusSchema = z.enum(['pending', 'paid', 'refunded']);

export const createBookingSchema = z.object({
  listingId: uuidSchema,
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  guestName: z.string().min(2).max(100).optional(),
  guestPhone: phoneSchema.optional(),
  guestEmail: emailSchema.optional(),
  specialRequests: z.string().max(2000).optional(),
}).refine((data) => {
  return new Date(data.checkOut) > new Date(data.checkIn);
}, {
  message: 'Check-out must be after check-in',
  path: ['checkOut'],
});

export const updateBookingSchema = z.object({
  status: bookingStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  specialRequests: z.string().max(2000).optional(),
  checkedInAt: z.string().datetime().optional(),
  checkedOutAt: z.string().datetime().optional(),
});

export const calendarSlotStatusSchema = z.enum(['available', 'booked', 'blocked']);

export const createCalendarSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  status: calendarSlotStatusSchema.default('available'),
  price: z.number().nonnegative().optional(),
  reason: z.string().max(200).optional(),
});

export const bulkCalendarSlotsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
  status: calendarSlotStatusSchema.default('available'),
  price: z.number().nonnegative().optional(),
  reason: z.string().max(200).optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'endDate must be after or equal to startDate',
  path: ['endDate'],
});

export const pricingRuleTypeSchema = z.enum(['seasonal', 'weekend', 'last_minute', 'early_bird', 'custom']);

export const createPricingRuleSchema = z.object({
  name: z.string().max(100).optional(),
  ruleType: pricingRuleTypeSchema,
  priority: z.number().int().nonnegative().default(0),
  multiplier: z.number().positive().optional(),
  fixedPrice: z.number().nonnegative().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  minNights: z.number().int().positive().optional(),
  maxNights: z.number().int().positive().optional(),
  advanceDays: z.number().int().nonnegative().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  isActive: z.boolean().default(true),
});

export const updatePricingRuleSchema = createPricingRuleSchema.partial();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateCalendarSlotInput = z.infer<typeof createCalendarSlotSchema>;
export type BulkCalendarSlotsInput = z.infer<typeof bulkCalendarSlotsSchema>;
export type CreatePricingRuleInput = z.infer<typeof createPricingRuleSchema>;
export type UpdatePricingRuleInput = z.infer<typeof updatePricingRuleSchema>;
