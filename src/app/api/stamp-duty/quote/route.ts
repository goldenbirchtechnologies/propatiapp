import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { loadStampDutyContext, toAssessmentPayload } from '@/lib/stamp-duty-assessment';

/**
 * GET /api/stamp-duty/quote?agreementId=…
 *
 * What stamp duty is payable on this agreement, before anything is remitted:
 * the instrument, the basis it is assessed on, the rate, the collecting
 * authority, and who will be named on the certificate.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const agreementId = request.nextUrl.searchParams.get('agreementId');
  if (!agreementId) {
    return NextResponse.json({ error: 'agreementId is required' }, { status: 400 });
  }

  try {
    const ctx = await loadStampDutyContext(agreementId);
    if (!ctx) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });

    const isParticipant =
      ctx.agreement.landlordId === user.id ||
      ctx.agreement.tenantId === user.id ||
      user.role === 'admin';
    if (!isParticipant) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    return NextResponse.json({ success: true, data: toAssessmentPayload(ctx) });
  } catch (error) {
    console.error('[StampDuty] Quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
