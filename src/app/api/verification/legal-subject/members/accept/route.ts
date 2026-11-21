import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/verification/legal-subject/members/accept
 * Links an invited co-owner/director/signatory to their logged-in account.
 * The member must still complete their own Dojah verification afterwards.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'agent', 'estate_manager']);
  if (authResult instanceof NextResponse) return authResult;

  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = body.token?.trim();
  if (!token) return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });

  const member = await prisma.legalSubjectMember.findUnique({
    where: { inviteToken: token },
    include: { subject: { select: { id: true, type: true, name: true, status: true } } },
  });
  if (!member) return NextResponse.json({ error: 'Invitation is invalid or expired.' }, { status: 404 });
  if (member.email && member.email.toLowerCase() !== authResult.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'This invitation was issued to a different email address.' }, { status: 403 });
  }

  const updated = await prisma.legalSubjectMember.update({
    where: { id: member.id },
    data: { userId: authResult.user.id, status: 'pending_verification', inviteToken: null },
    select: { id: true, subjectId: true, fullName: true, role: true, status: true },
  });

  return NextResponse.json({ success: true, data: updated, next: '/onboarding' });
}
