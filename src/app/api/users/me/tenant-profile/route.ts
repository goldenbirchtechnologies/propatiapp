import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodTypeAny } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serializers';
import { upsertDossier } from '@/lib/onboarding/dossier';
import { tenantProfileSummary, type TenantSectionId } from '@/lib/tenant-profile/completion';
import {
  tenantPersonalSchema,
  tenantAddressSchema,
  tenantNextOfKinSchema,
  tenantEmploymentSchema,
  tenantFinancialSchema,
  tenantGuarantorSchema,
  tenantRentalPreferencesSchema,
  tenantAddressListSchema,
  tenantEmergencyContactListSchema,
} from '@/lib/validators';

/**
 * The tenant's standing profile.
 *
 * GET  — everything the profile page needs: the dossier, residential history,
 *        emergency contacts, verification flags and the per-section completion
 *        summary, in one round trip.
 * PATCH — `{ section, data }`, one section at a time, validated against the
 *        matching schema in @/lib/validators.
 *
 * Role and the verification booleans are deliberately not writable here: the
 * caller is authenticated as the profile owner, so anything that gates trust
 * must come from the verification flows, not from this form.
 */

const DOSSIER_SECTIONS = [
  'personal',
  'address',
  'nextOfKin',
  'employment',
  'financial',
  'guarantor',
  'preferences',
] as const;

type DossierSection = (typeof DOSSIER_SECTIONS)[number];

const SECTION_SCHEMAS: Record<DossierSection, ZodTypeAny> = {
  personal: tenantPersonalSchema,
  address: tenantAddressSchema,
  nextOfKin: tenantNextOfKinSchema,
  employment: tenantEmploymentSchema,
  financial: tenantFinancialSchema,
  guarantor: tenantGuarantorSchema,
  preferences: tenantRentalPreferencesSchema,
};

const ARRAY_SCHEMAS: Record<string, ZodTypeAny> = {
  addressHistory: tenantAddressListSchema,
  emergencyContacts: tenantEmergencyContactListSchema,
};

const isDossierSection = (section: string): section is DossierSection =>
  (DOSSIER_SECTIONS as readonly string[]).includes(section);

/** BigInt columns → Number, at the one place they leave the server. */
const moneyToNumber = <T extends Record<string, unknown>>(row: T): T => {
  const out: Record<string, unknown> = { ...row };
  for (const key of ['yearlyIncome', 'monthlyBudget', 'maxMonthlyBudget']) {
    const value = out[key];
    if (typeof value === 'bigint') out[key] = Number(value);
  }
  return out as T;
};

async function loadProfile(userId: string) {
  const [dossier, addresses, emergencyContacts, user] = await Promise.all([
    prisma.rentalApplicationDossier.findUnique({ where: { userId } }),
    prisma.tenantAddress.findMany({
      where: { userId },
      orderBy: [{ isCurrent: 'desc' }, { sequence: 'asc' }],
    }),
    prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        idType: true,
        idVerified: true,
        phoneVerified: true,
        ninVerified: true,
        incomeVerified: true,
      },
    }),
  ]);

  return { dossier, addresses, emergencyContacts, user };
}

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { dossier, addresses, emergencyContacts, user: profile } = await loadProfile(user.id);

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Derived from the raw rows (which still hold real BigInts) before anything
    // is converted for transport.
    const completion = tenantProfileSummary({
      dossier: dossier ?? null,
      addresses,
      emergencyContacts,
      verification: { idVerified: profile.idVerified, phoneVerified: profile.phoneVerified },
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: profile,
        dossier: dossier ? moneyToNumber(dossier) : null,
        addresses: addresses.map(moneyToNumber),
        emergencyContacts: emergencyContacts.map(moneyToNumber),
        completion,
      },
    });
  } catch (error) {
    console.error('Tenant profile GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const section: unknown = body?.section;
    const data: unknown = body?.data;

    if (typeof section !== 'string' || data === undefined) {
      return NextResponse.json(
        { success: false, error: 'Expected { section, data }' },
        { status: 400 },
      );
    }

    if (isDossierSection(section)) {
      const parsed = SECTION_SCHEMAS[section].parse(data);

      if (section === 'employment') {
        // Goes through the shared helper so the User row keeps mirroring the
        // dossier — other dashboards read employment off User, not here.
        await upsertDossier(user.id, parsed);
      } else {
        await prisma.rentalApplicationDossier.upsert({
          where: { userId: user.id },
          create: { userId: user.id, ...parsed, status: 'draft' },
          update: parsed,
        });
      }
    } else if (section === 'addressHistory') {
      const rows = ARRAY_SCHEMAS[section].parse(data) as Record<string, unknown>[];

      await prisma.$transaction(async (tx) => {
        // Replace wholesale: the client owns the list, and diffing rows would
        // need stable ids the form does not have yet.
        await tx.tenantAddress.deleteMany({ where: { userId: user.id } });
        if (rows.length > 0) {
          await tx.tenantAddress.createMany({
            data: rows.map((row, index) => ({
              ...(row as any),
              userId: user.id,
              sequence: index + 1,
              isCurrent: index === 0 ? true : Boolean(row.isCurrent),
            })),
          });
        }
      });
    } else if (section === 'emergencyContacts') {
      const rows = ARRAY_SCHEMAS[section].parse(data) as Record<string, unknown>[];

      await prisma.$transaction(async (tx) => {
        await tx.emergencyContact.deleteMany({ where: { userId: user.id } });
        if (rows.length > 0) {
          await tx.emergencyContact.createMany({
            data: rows.map((row, index) => ({
              ...(row as any),
              userId: user.id,
              isPrimary: index === 0 ? true : Boolean(row.isPrimary),
            })),
          });
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: `Unknown section "${section}"` },
        { status: 400 },
      );
    }

    // Send back the recomputed summary so the rail updates without a refetch.
    const { dossier, addresses, emergencyContacts, user: profile } = await loadProfile(user.id);
    const completion = tenantProfileSummary({
      dossier: dossier ?? null,
      addresses,
      emergencyContacts,
      verification: {
        idVerified: Boolean(profile?.idVerified),
        phoneVerified: Boolean(profile?.phoneVerified),
      },
    });

    return NextResponse.json({ success: true, data: { section: section as TenantSectionId, completion } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }
    console.error('Tenant profile PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
