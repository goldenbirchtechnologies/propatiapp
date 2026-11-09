import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { previewSettlementAccount } from '@/lib/settlement';

export const runtime = 'nodejs';

const verifySchema = z.object({
  accountNumber: z.string().regex(/^\d{10,12}$/, 'NUBAN must be 10–12 digits'),
  bankCode: z.string().trim().min(2).optional(),
  bankName: z.string().trim().min(2).optional(),
});

/**
 * POST /api/onboarding/settlement/verify
 *
 * Resolves a settlement account for display while the user is still filling the
 * step: the bank's own record of the account name, and whether it belongs to
 * the identity Dojah verified. Nothing is written — the save endpoint repeats
 * the check before anything is stored or a subaccount is created.
 *
 * An estate manager's client trust account is corporate, so it is resolved but
 * not name-matched, exactly as the save endpoint does.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const parsed = verifySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'INVALID_INPUT', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const preview = await previewSettlementAccount(user.id, parsed.data, {
    requireNameMatch: user.role !== 'estate_manager',
  });

  return NextResponse.json({ success: true, data: preview });
}
