import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

export const runtime = 'nodejs';

/** Legacy Prembly/raw-ID endpoint. Identity verification now uses Dojah. */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  return NextResponse.json(
    { success: false, error: 'IDENTITY_FLOW_MOVED', message: 'Use the Dojah widget to verify identity.' },
    { status: 410 }
  );
}
