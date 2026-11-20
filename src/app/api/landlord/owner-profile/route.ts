import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';
import { landlordOwnerProfilePatchSchema } from '@/lib/landlord-profile/schemas';
import { loadLandlordWorkspace } from '@/lib/landlord-profile/data';

const nullable = (value: string | null | undefined): string | null => {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * GET /api/landlord/owner-profile
 * The owner workspace exactly as the server page renders it: stored facts,
 * settlement state, uploaded documents, and completion derived from those.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const data = await loadLandlordWorkspace(user.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Landlord owner profile GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load owner profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/landlord/owner-profile
 *
 * Partial update of the legal ownership, contact, tax, and mandate fields.
 * The phone is special: it is stored on the user row because that is where the
 * verified flag lives, so changing it resets `phoneVerified` until the owner
 * proves the new number.
 */
export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = landlordOwnerProfilePatchSchema.parse(body);

    const [existing, account] = await Promise.all([
      prisma.landlordProfile.findUnique({ where: { userId: user.id } }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: { phone: true },
      }),
    ]);

    const data: Prisma.LandlordProfileUncheckedUpdateInput = {};
    const accountData: Prisma.UserUpdateInput = {};

    if ('legalEntityType' in parsed) data.legalEntityType = parsed.legalEntityType ?? null;
    if ('legalName' in parsed) data.legalName = nullable(parsed.legalName);
    if ('jointOwnerNames' in parsed) data.jointOwnerNames = nullable(parsed.jointOwnerNames);
    if ('companyName' in parsed) data.companyName = nullable(parsed.companyName);
    if ('companyRegistrationNumber' in parsed) {
      data.companyRegistrationNumber = nullable(parsed.companyRegistrationNumber);
    }
    if ('companyAddress' in parsed) data.companyAddress = nullable(parsed.companyAddress);
    if ('representativeName' in parsed) data.representativeName = nullable(parsed.representativeName);
    if ('representativeEmail' in parsed) data.representativeEmail = nullable(parsed.representativeEmail);
    if ('contactEmail' in parsed) data.contactEmail = nullable(parsed.contactEmail);
    if ('countryCode' in parsed) {
      const code = nullable(parsed.countryCode);
      data.countryCode = code ? code.toUpperCase() : null;
    }
    if ('stateRegion' in parsed) data.stateRegion = nullable(parsed.stateRegion);
    if ('city' in parsed) data.city = nullable(parsed.city);
    if ('streetAddress' in parsed) data.streetAddress = nullable(parsed.streetAddress);
    if ('postalCode' in parsed) data.postalCode = nullable(parsed.postalCode);
    if ('taxIdType' in parsed) data.taxIdType = parsed.taxIdType ?? null;
    if ('taxNumber' in parsed) data.taxNumber = nullable(parsed.taxNumber);
    if ('taxJurisdiction' in parsed) data.taxJurisdiction = nullable(parsed.taxJurisdiction);

    if ('managementFeeType' in parsed) {
      const next = parsed.managementFeeType ?? null;
      data.managementFeeType = next;
      if (next === null) data.managementFeeValue = null;
    }
    if ('managementFeeValue' in parsed) data.managementFeeValue = parsed.managementFeeValue ?? null;

    const effectiveFeeType =
      parsed.managementFeeType !== undefined
        ? parsed.managementFeeType
        : (existing?.managementFeeType as string | null | undefined);
    const effectiveFeeValue =
      parsed.managementFeeValue !== undefined
        ? parsed.managementFeeValue
        : existing?.managementFeeValue;
    if (
      effectiveFeeType === 'percentage' &&
      effectiveFeeValue !== null &&
      effectiveFeeValue !== undefined &&
      effectiveFeeValue > 100
    ) {
      return NextResponse.json(
        { success: false, error: 'Percentage fee cannot exceed 100' },
        { status: 400 }
      );
    }

    if (parsed.representativePhone !== undefined) {
      const raw = (parsed.representativePhone ?? '').trim();
      if (!raw) {
        data.representativePhone = null;
      } else {
        const normalized = normalizePhone(raw);
        if (!normalized) {
          return NextResponse.json(
            { success: false, error: 'Enter a valid representative phone number' },
            { status: 400 }
          );
        }
        data.representativePhone = normalized;
      }
    }

    if (parsed.primaryPhone !== undefined) {
      const raw = (parsed.primaryPhone ?? '').trim();
      if (!raw) {
        return NextResponse.json(
          { success: false, error: 'Enter a valid phone number' },
          { status: 400 }
        );
      }
      const normalized = normalizePhone(raw);
      if (!normalized) {
        return NextResponse.json(
          { success: false, error: 'Enter a valid phone number' },
          { status: 400 }
        );
      }

      data.primaryPhone = normalized;

      if (normalized !== account?.phone) {
        const inUse = await prisma.user.findUnique({
          where: { phone: normalized },
          select: { id: true },
        });
        if (inUse && inUse.id !== user.id) {
          return NextResponse.json(
            {
              success: false,
              error: 'PHONE_IN_USE',
              message: 'That phone number is already registered to another account.',
            },
            { status: 409 }
          );
        }
        accountData.phone = normalized;
        accountData.phoneVerified = false;
      }
    }

    // Compose the one-line notice address whenever any structured address part
    // is written, so downstream documents keep a single canonical string.
    const addressTouched = ['streetAddress', 'city', 'stateRegion', 'postalCode'].some(
      (key) => key in parsed
    );
    if (addressTouched) {
      const street =
        'streetAddress' in parsed
          ? nullable(parsed.streetAddress)
          : (existing?.streetAddress ?? existing?.mailingAddress ?? null);
      const city = 'city' in parsed ? nullable(parsed.city) : (existing?.city ?? null);
      const region =
        'stateRegion' in parsed ? nullable(parsed.stateRegion) : (existing?.stateRegion ?? null);
      const postal =
        'postalCode' in parsed ? nullable(parsed.postalCode) : (existing?.postalCode ?? null);

      const composed = [street, city, region, postal]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(', ');
      data.mailingAddress = composed || null;
    } else if ('mailingAddress' in parsed) {
      data.mailingAddress = nullable(parsed.mailingAddress);
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(accountData).length > 0) {
        await tx.user.update({ where: { id: user.id }, data: accountData });
      }
      await tx.landlordProfile.upsert({
        where: { userId: user.id },
        create: { ...(data as Prisma.LandlordProfileUncheckedCreateInput), userId: user.id },
        update: data,
      });
    });

    const workspace = await loadLandlordWorkspace(user.id);
    return NextResponse.json({ success: true, data: workspace });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'PHONE_IN_USE',
          message: 'That phone number is already registered to another account.',
        },
        { status: 409 }
      );
    }
    console.error('Landlord owner profile PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save owner profile' },
      { status: 500 }
    );
  }
}
