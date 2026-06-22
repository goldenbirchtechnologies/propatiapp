import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit-log';

/**
 * GET /api/admin/business/verifications
 * List pending business CAC verifications
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const verifications = await prisma.businessVerification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return successResponse(verifications);
  } catch (error) {
    console.error('Fetch business verifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/business/verifications
 * Create a new business CAC verification request
 * Body: { entityType, entityId, cacNumber, companyName?, contactEmail?, contactPhone?, address?, documents? }
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const {
      entityType,
      entityId,
      cacNumber,
      companyName,
      contactEmail,
      contactPhone,
      address,
      documents,
    } = body;

    if (!entityType || !entityId || !cacNumber) {
      return NextResponse.json(
        { error: 'entityType, entityId, and cacNumber are required' },
        { status: 400 }
      );
    }

    const validEntityTypes = ['law_firm', 'organisation', 'business_profile'];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `entityType must be one of: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const verification = await prisma.businessVerification.create({
      data: {
        entityType,
        entityId,
        cacNumber,
        companyName: companyName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: address || null,
        documents: documents || null,
      },
    });

    // Create audit log
    await createAuditLog({
      adminId: user.id,
      action: 'create_business_verification',
      targetType: 'business_verification',
      targetId: verification.id,
      details: {
        entityType,
        entityId,
        cacNumber,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data: verification, message: 'Business verification created' }, { status: 201 });
  } catch (error) {
    console.error('Create business verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
