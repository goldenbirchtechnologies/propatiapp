import { z } from 'zod';
import { emailSchema, phoneSchema } from '@/lib/validators';

const optionalText = (max: number) => z.string().max(max).optional().nullable();

const optionalEmail = z
  .union([z.literal(''), emailSchema])
  .optional()
  .nullable();

const optionalPhone = z
  .union([z.literal(''), phoneSchema])
  .optional()
  .nullable();

export const landlordOwnerProfilePatchSchema = z
  .object({
    legalEntityType: z.enum(['individual', 'joint', 'company']).optional().nullable(),
    legalName: optionalText(200),
    jointOwnerNames: optionalText(1000),
    companyName: optionalText(200),
    companyRegistrationNumber: optionalText(40),
    companyAddress: optionalText(300),
    representativeName: optionalText(120),
    representativePhone: optionalPhone,
    representativeEmail: optionalEmail,

    primaryPhone: optionalPhone,
    contactEmail: optionalEmail,
    mailingAddress: optionalText(300),
    countryCode: optionalText(2),
    stateRegion: optionalText(80),
    city: optionalText(80),
    streetAddress: optionalText(200),
    postalCode: optionalText(20),

    taxIdType: z.enum(['tin', 'nin', 'other']).optional().nullable(),
    taxNumber: optionalText(30),
    taxJurisdiction: optionalText(120),

    managementFeeType: z.enum(['percentage', 'fixed']).optional().nullable(),
    managementFeeValue: z.number().int().min(0).max(1_000_000).optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'No changes to save',
  });

export const landlordDocumentCategorySchema = z.enum([
  'government_id',
  'company_registration',
  'joint_ownership',
  'tax_document',
  'ownership_evidence',
  'supporting',
]);

export const landlordPhoneVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the six-digit code'),
});

export type LandlordOwnerProfilePatch = z.infer<typeof landlordOwnerProfilePatchSchema>;
