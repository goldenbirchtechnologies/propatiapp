import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

export const runtime = 'nodejs';

/**
 * POST /api/onboarding/identity
 *
 * Legacy endpoint retained so old clients fail safely. Identity onboarding is
 * completed by the Dojah widget and signed webhook.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  return NextResponse.json(
    { success: false, error: 'IDENTITY_FLOW_MOVED', message: 'Start identity verification with the Dojah widget.' },
    { status: 410 }
  );
}
