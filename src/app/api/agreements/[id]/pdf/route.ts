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
    if (agreement.status !== 'fully_signed' && agreement.status !== 'terminated') {
      return NextResponse.json(
        { error: 'PDF is only available for fully signed agreements' },
        { status: 400 }
      );
    }

    const templateVars = agreement.templateVars as { pdfUrl?: string; pdfPublicId?: string } | null;
    let pdfUrl = templateVars?.pdfUrl;

    // Generate PDF if it doesn't exist
    if (!pdfUrl) {
      const result = await generateAndSaveAgreementPDF(id);
      pdfUrl = result.url;
    }

    // Try to return direct PDF bytes with correct Content-Type
    if (pdfUrl) {
      try {
        const pdfResponse = await fetch(pdfUrl);

        if (pdfResponse.ok && pdfResponse.headers.get('content-type')?.includes('pdf')) {
          const pdfBuffer = await pdfResponse.arrayBuffer();
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="agreement-${id}.pdf"`,
              'Cache-Control': 'no-store',
            },
          });
        }

        // Fallback to redirect when direct bytes are not feasible
        return NextResponse.redirect(pdfUrl);
      } catch {
        // If fetching direct bytes fails, redirect to Cloudinary
        return NextResponse.redirect(pdfUrl);
      }
    }

    // If we somehow cannot obtain a PDF URL, return an error
    return NextResponse.json(
      { error: 'Failed to generate or retrieve PDF' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Agreement PDF error:', error);
    return NextResponse.json(
      { error: 'Failed to generate or retrieve PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
