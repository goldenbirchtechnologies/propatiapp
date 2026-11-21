import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

const schema = z.object({ managementType: z.string().min(2), capabilities: z.array(z.string()).min(1), managesOnBehalf: z.boolean() });

export async function POST(request: Request) {
  const authResult = await withAuth(request as any, ['estate_manager']);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const data = schema.parse(await request.json());
    await prisma.estateManagerProfile.upsert({ where: { userId: authResult.user.id }, create: { userId: authResult.user.id, ...data }, update: data });
    await advanceOnboarding(authResult.user.id, authResult.user.role, 'estateCapabilities');
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save capabilities.' }, { status: 400 }); }
}
