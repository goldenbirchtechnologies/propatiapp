import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail, emailTemplates } from '@/lib/email';

const completeInspectionSchema = z.object({
  status: z.enum(['passed', 'failed', 'requires_followup']),
  report: z.string().min(50, 'Report must be at least 50 characters'),
  rating: z.number().min(1).max(5),
  issues: z.array(z.string()).optional(),
  reportUrl: z.string().url().optional(), // URL to PDF report if generated
});

export type CompleteInspectionInput = z.infer<typeof completeInspectionSchema>;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = params.id;
    const body = await request.json();
    const validated = completeInspectionSchema.parse(body);

    // Find verification
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            ownerId: true,
          },
        },
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        l4Agent: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Check authorization - only assigned agent or admin
    const isAuthorized =
      verification.l4AgentId === user.id || user.role === 'admin';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized - must be assigned agent or admin' },
        { status: 403 }
      );
    }

    // Check if at Layer 4
    if (verification.currentLayer !== 4) {
      return NextResponse.json(
        { error: 'Inspection not at Layer 4' },
        { status: 400 }
      );
    }

    // Check if inspection was scheduled
    if (!verification.l4ScheduledAt) {
      return NextResponse.json(
        { error: 'Inspection not scheduled' },
        { status: 400 }
      );
    }

    // Prepare report text with issues
    let fullReport = validated.report;
    if (validated.issues && validated.issues.length > 0) {
      fullReport += '\n\nIssues Identified:\n' + validated.issues.map((issue, idx) => `${idx + 1}. ${issue}`).join('\n');
    }
    fullReport += `\n\nRating: ${validated.rating}/5`;
    fullReport += `\nInspected by: ${verification.l4Agent?.fullName || user.fullName}`;
    fullReport += `\nCompleted at: ${new Date().toISOString()}`;

    // Determine verification status based on inspection result
    const inspectionPassed = validated.status === 'passed';
    const newL4Status = inspectionPassed ? 'approved' : 'rejected';
    const newCurrentLayer = inspectionPassed ? 5 : 4;
    const newL5Status = inspectionPassed ? 'pending' : undefined;

    // Update verification
    const updatedVerification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        l4Status: newL4Status,
        l4CompletedAt: new Date(),
        l4ReportUrl: validated.reportUrl || null,
        adminNotes: fullReport,
        currentLayer: newCurrentLayer,
        ...(newL5Status && { l5Status: newL5Status }),
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: { id: true, title: true, verificationTier: true },
        },
      },
    });

    // Update listing verification tier if passed
    if (inspectionPassed) {
      await prisma.listing.update({
        where: { id: verification.listingId },
        data: { verificationTier: 'inspected' },
      });
    }

    // Notify owner
    await prisma.notification.create({
      data: {
        userId: verification.owner.id,
        type: 'verification',
        title: `Inspection ${inspectionPassed ? 'Completed' : 'Failed'}`,
        body: inspectionPassed
          ? `Your property inspection passed! Moving to final certification.`
          : `Inspection did not pass. Please address the issues identified.`,
        data: {
          verificationId,
          listingId: verification.listingId,
          layer: 4,
          status: validated.status,
          rating: validated.rating,
        },
      },
    });

    // Send email to owner
    await sendEmail({
      to: verification.owner.email,
      subject: `Inspection ${inspectionPassed ? 'Completed' : 'Results'}: ${verification.listing.title}`,
      html: emailTemplates.verificationUpdate(
        verification.owner.fullName,
        verification.listing.title,
        4,
        inspectionPassed ? 'approved' : 'rejected',
        fullReport
      ).html,
    });

    // Notify admins if passed (for Layer 5 review)
    if (inspectionPassed) {
      const admins = await prisma.user.findMany({
        where: { role: 'admin', isActive: true },
        select: { id: true },
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: 'verification',
            title: 'Ready for Final Certification',
            body: `${verification.listing.title} - Layer 4 completed, awaiting Layer 5 approval`,
            data: {
              verificationId,
              listingId: verification.listingId,
              layer: 5,
            },
          })),
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        inspection: {
          id: updatedVerification.id,
          status: validated.status,
          completedAt: updatedVerification.l4CompletedAt,
          reportUrl: updatedVerification.l4ReportUrl,
          rating: validated.rating,
          passed: inspectionPassed,
          nextLayer: newCurrentLayer,
        },
        verification: {
          currentLayer: updatedVerification.currentLayer,
          l4Status: updatedVerification.l4Status,
          l5Status: updatedVerification.l5Status,
          overallStatus: updatedVerification.overallStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Complete inspection error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
