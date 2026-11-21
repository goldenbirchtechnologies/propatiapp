import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

export const runtime = 'nodejs';

/**
 * Legacy endpoint retained so old clients fail safely. Raw identity lookups
 * are no longer accepted from the PropatiBox application.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json(
    { success: false, error: 'IDENTITY_FLOW_MOVED', message: 'Use the Dojah widget to verify identity.' },
    { status: 410 }
  );
}
