import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const decisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(1000).optional(),
});

/**
 * POST /api/admin/legal-subjects/:id/decision
 * Approves or rejects a company/joint-owner legal subject after CAC,
 * ownership, mandate, and member evidence have been reviewed.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const input = decisionSchema.parse(await request.json());
    const subject = await prisma.legalSubject.findUnique({
      where: { id: params.id },
      include: { members: { select: { status: true } } },
    });
    if (!subject) return NextResponse.json({ error: 'Legal subject not found.' }, { status: 404 });

    if (input.status === 'approved' && subject.type !== 'individual') {
      const incomplete = subject.members.some((member) => member.status !== 'verified');
      if (incomplete) {
        return NextResponse.json(
          { error: 'Every director, signatory, or joint owner must complete identity verification first.' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.legalSubject.update({
      where: { id: subject.id },
      data: {
        status: input.status,
        metadata: {
          ...(typeof subject.metadata === 'object' && subject.metadata && !Array.isArray(subject.metadata)
            ? subject.metadata
            : {}),
          adminDecision: {
            status: input.status,
            note: input.note || null,
            decidedBy: authResult.user.id,
            decidedAt: new Date().toISOString(),
          },
        },
      },
      select: { id: true, type: true, name: true, status: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid legal-subject decision.', details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error('[Admin] Legal subject decision failed:', error);
    return NextResponse.json({ error: 'Could not update legal subject.' }, { status: 500 });
  }
}
