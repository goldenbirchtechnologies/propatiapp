import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { AgentLicenseBoard, AgentLicenseStatus } from '@prisma/client';

const BOARDS: AgentLicenseBoard[] = ['LASRERA', 'ESVARBON', 'NIESV', 'EAR'];

const BOARD_LABELS: Record<AgentLicenseBoard, string> = {
  LASRERA: 'LASRERA (Lagos State Real Estate Regulatory Authority)',
  ESVARBON: 'ESVARBON (Estate Surveyors and Valuers Registration Board of Nigeria)',
  NIESV: 'NIESV (Nigerian Institution of Estate Surveyors and Valuers)',
  EAR: 'EAR (Estate Agents Registration)',
};

/**
 * GET /api/agent/licenses
 *
 * Statutory practice credentials held by the signed-in agent, newest first.
 * The most recent `approved` row is the agent's primary credential.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const scopeParam = searchParams.get('agentId');
    const agentId = user.role === 'admin' && scopeParam ? scopeParam : user.id;

    const [licenses, businessProfiles] = await Promise.all([
      prisma.agentLicense.findMany({
        where: { agentId },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.businessProfile.findMany({
        where: { userId: agentId },
        select: { id: true, companyName: true, cacNumber: true, rcNumber: true, verified: true },
      }),
    ]);

    const approved = licenses.filter((l) => l.status === AgentLicenseStatus.approved);
    const underReview = licenses.filter((l) => l.status === AgentLicenseStatus.under_review);
    const rejected = licenses.filter((l) => l.status === AgentLicenseStatus.rejected);
    const drafts = licenses.filter((l) => l.status === AgentLicenseStatus.draft);

    // Deterministic reference id: a stable hash of the registration number
    // so the same credential always shows the same docket reference.
    const referenceFor = (registrationNo: string) => {
      let hash = 0;
      for (let i = 0; i < registrationNo.length; i += 1) {
        hash = (hash * 31 + registrationNo.charCodeAt(i)) >>> 0;
      }
      return `VER-LIC-${hash.toString(36).toUpperCase().slice(0, 4)}-${hash.toString(16).toUpperCase().slice(-4)}`;
    };

    return NextResponse.json({
      success: true,
      data: {
        licenses: licenses.map((l) => ({
          ...l,
          boardLabel: BOARD_LABELS[l.board],
          referenceId: l.referenceId || referenceFor(l.registrationNo),
        })),
        primary: approved[0] ?? null,
        boardOptions: BOARDS.map((b) => ({ value: b, label: BOARD_LABELS[b] })),
        businessProfile: businessProfiles[0] ?? null,
        counts: {
          total: licenses.length,
          approved: approved.length,
          underReview: underReview.length,
          rejected: rejected.length,
          draft: drafts.length,
        },
      },
    });
  } catch (error) {
    console.error('Agent licenses GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/agent/licenses
 *
 * Submit a statutory credential for regulatory verification. The agent can
 * only file credentials against their own account.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['agent']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const {
      board,
      licenseType,
      registrationNo,
      issuingBody,
      validUntil,
      documentUrl,
      documentName,
      documentBytes,
      channel,
      entityName,
      entityRcNumber,
    } = body ?? {};

    if (!board || !BOARDS.includes(board)) {
      return NextResponse.json({ error: 'Unknown accreditation board' }, { status: 400 });
    }
    if (!licenseType || !String(licenseType).trim()) {
      return NextResponse.json({ error: 'licenseType is required' }, { status: 400 });
    }
    if (!registrationNo || !String(registrationNo).trim()) {
      return NextResponse.json({ error: 'registrationNo is required' }, { status: 400 });
    }
    if (!issuingBody || !String(issuingBody).trim()) {
      return NextResponse.json({ error: 'issuingBody is required' }, { status: 400 });
    }

    const parsedValidUntil = validUntil ? new Date(validUntil) : null;
    if (parsedValidUntil && Number.isNaN(parsedValidUntil.getTime())) {
      return NextResponse.json({ error: 'validUntil is not a valid date' }, { status: 400 });
    }

    let hash = 0;
    const reg = String(registrationNo).trim();
    for (let i = 0; i < reg.length; i += 1) {
      hash = (hash * 31 + reg.charCodeAt(i)) >>> 0;
    }
    const referenceId = `VER-LIC-${hash.toString(36).toUpperCase().slice(0, 4)}-${hash.toString(16).toUpperCase().slice(-4)}`;

    const license = await prisma.agentLicense.create({
      data: {
        agentId: user.id,
        board: board as AgentLicenseBoard,
        licenseType: String(licenseType).trim(),
        registrationNo: reg,
        issuingBody: String(issuingBody).trim(),
        validUntil: parsedValidUntil,
        status: AgentLicenseStatus.under_review,
        referenceId,
        documentUrl: documentUrl ? String(documentUrl) : null,
        documentName: documentName ? String(documentName) : null,
        documentBytes: typeof documentBytes === 'number' ? documentBytes : null,
        channel: channel ? String(channel) : 'self_service_portal_submission',
        entityName: entityName ? String(entityName) : null,
        entityRcNumber: entityRcNumber ? String(entityRcNumber) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...license, boardLabel: BOARD_LABELS[license.board] },
    });
  } catch (error) {
    console.error('Agent licenses POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
