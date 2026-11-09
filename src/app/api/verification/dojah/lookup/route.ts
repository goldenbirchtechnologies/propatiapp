import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { verifyIdentityWithDojah } from '@/lib/identity-verification';

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
 *
 * The pipeline itself lives in `verifyIdentityWithDojah`; onboarding calls the
 * same function, so both entry points verify and persist identically.
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

  const { idType, idNumber, firstName, lastName, dateOfBirth } = parsed.data;

  const result = await verifyIdentityWithDojah(
    { id: user.id, role: user.role, fullName: user.fullName },
    { idType, idNumber, firstName, lastName, dateOfBirth }
  );

  if (!result.ok) {
    const body: Record<string, unknown> = {
      success: false,
      error: result.error,
      message: result.message,
    };
    if (result.error === 'NAME_MISMATCH') body.mismatched = result.mismatched;
    if (result.error === 'DOJAH_ERROR') body.providerStatus = result.providerStatus ?? null;
    return NextResponse.json(body, { status: result.status });
  }

  return NextResponse.json({
    success: true,
    message: 'Identity verified',
    data: {
      kycId: result.kycId,
      identity: {
        type: result.identity.type,
        idNumberMasked: result.idNumberMasked,
        firstName: result.identity.firstName,
        lastName: result.identity.lastName,
        middleName: result.identity.middleName,
        dateOfBirth: result.identity.dateOfBirth,
        gender: result.identity.gender,
        phone: result.identity.phone,
        verifiedAt: result.identity.verifiedAt,
      },
      paystack: result.paystack,
    },
  });
}
