import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const result = await withAuth(request);

  if (result instanceof NextResponse) {
    return result;
  }

  return NextResponse.json({ user: { role: result.user.role } });
}
