import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { getDojahService, DojahApiError } from '@/lib/dojah';
import {
  recordVerifiedIdentity,
  syncPaystackCustomerFromKyc,
  toVerifiedIdentity,
  namesMatch,
  maskIdentifier,
} from '@/lib/verified-identity';

export const runtime = 'nodejs';

const lookupSchema = z.object({
  idType: z.enum(['nin', 'bvn']),
  idNumber: z.string().regex(/^\d{11}$/, 'must be an 11-digit number'),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  dateOfBirth: z.string().trim().optional(),
});

/**
 * POST /api/verification/dojah/lookup
 *
 * Direct server-side identity verification (no widget). The lookup result is
 * matched against the names supplied, then persisted as the user's verified
 * identity — which is what Paystack customers and Remita stamp duty read.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const parsed = lookupSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'INVALID_INPUT', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { idType, idNumber, dateOfBirth } = parsed.data;

  // Fall back to the profile name so a caller that only supplies the number
  // still gets a meaningful match check.
  const nameParts = (user.fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parsed.data.firstName || nameParts[0];
  const lastName = parsed.data.lastName || nameParts[nameParts.length - 1];

  try {
    const dojah = getDojahService();
    const identity =
      idType === 'nin'
        ? await dojah.lookupNIN(idNumber)
        : await dojah.lookupBVN(idNumber, { firstName, lastName, dateOfBirth });

    const hasRecord = Boolean(identity.firstName || identity.lastName || identity.matchConfidence !== undefined);
    if (!hasRecord) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: `No ${idType.toUpperCase()} record was found for that number.` },
        { status: 422 }
      );
    }

    const match = namesMatch({ firstName, lastName }, identity);
    const weakConfidence = identity.matchConfidence !== undefined && identity.matchConfidence < 50;
    if (!match.matched || weakConfidence) {
      return NextResponse.json(
        {
          success: false,
          error: 'NAME_MISMATCH',
          message: 'The name on this ID does not match your account details.',
          mismatched: match.mismatched,
        },
        { status: 422 }
      );
    }

    const record = toVerifiedIdentity(identity, 'dojah_direct');
    const { kycId } = await recordVerifiedIdentity({ userId: user.id, role: user.role, identity: record });

    // Push the verified name onto Paystack and mint the dedicated account in
    // the same step, handing over the BVN straight from the lookup — Paystack
    // will not issue an account number without one. A sync failure must not
    // undo a successful verification.
    const paystackSync = await syncPaystackCustomerFromKyc(user.id, {
      bvn: idType === 'bvn' ? idNumber : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Identity verified',
      data: {
        kycId,
        identity: {
          type: record.type,
          idNumberMasked: maskIdentifier(idNumber),
          firstName: record.firstName,
          lastName: record.lastName,
          middleName: record.middleName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          phone: record.phone,
          verifiedAt: record.verifiedAt,
        },
        paystack: paystackSync,
      },
    });
  } catch (error) {
    if (error instanceof DojahApiError) {
      // The provider is reachable but rejected the number (bad/unknown id):
      // that is the user's input, not our outage.
      const status = error.status === 400 || error.status === 404 ? 422 : 502;
      return NextResponse.json(
        { success: false, error: 'DOJAH_ERROR', message: error.message, providerStatus: error.status ?? null },
        { status }
      );
    }

    if (error instanceof Error && error.message === 'IDENTITY_ALREADY_LINKED') {
      return NextResponse.json(
        { success: false, error: 'IDENTITY_ALREADY_LINKED', message: 'This identification number is already linked to another account.' },
        { status: 409 }
      );
    }

    console.error('Dojah lookup error:', error);
    return NextResponse.json({ success: false, error: 'LOOKUP_FAILED' }, { status: 500 });
  }
}
