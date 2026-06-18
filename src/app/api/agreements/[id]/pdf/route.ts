import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { generateAndSaveAgreementPDF } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      select: {
        id: true,
        landlordId: true,
        tenantId: true,
        agentId: true,
        status: true,
        templateVars: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check permissions - only parties to the agreement can download PDF
    const isParticipant =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      agreement.agentId === user.id ||
      user.role === 'admin';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Only allow PDF download for fully signed agreements
    if (agreement.status !== 'fully_signed' && agreement.status !== 'active' && agreement.status !== 'terminated') {
      return NextResponse.json(
        { error: 'PDF is only available for fully signed agreements' },
        { status: 400 }
      );
    }

    // Check if PDF already exists
    const templateVars = agreement.templateVars as { pdfUrl?: string; pdfPublicId?: string } | null;
    let pdfUrl = templateVars?.pdfUrl;

    // Generate PDF if it doesn't exist
    if (!pdfUrl) {
      const result = await generateAndSaveAgreementPDF(id);
      pdfUrl = result.url;
    }

    // Redirect to the PDF URL
    return NextResponse.redirect(pdfUrl);
  } catch (error) {
    console.error('Agreement PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to generate or retrieve PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
