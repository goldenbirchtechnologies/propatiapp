import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const result = await withAuth(request);

  if (result instanceof NextResponse) {
    return result;
  }

  return NextResponse.json({ user: { id: result.user.id, role: result.user.role, email: result.user.email, fullName: result.user.fullName } });
}
