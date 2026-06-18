import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Users can view their own profile, admins can view anyone
    if (user.id !== id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        ninVerified: true,
        phoneVerified: true,
        idVerified: true,
        idType: true,
        profileBio: true,
        profileCompleted: true,
        guarantorName: true,
        guarantorPhone: true,
        guarantorRelationship: true,
        employmentStatus: true,
        employmentType: true,
        employerName: true,
        jobTitle: true,
        yearlyIncome: true,
        incomeVerified: true,
        agentTier: true,
        agentApproved: true,
        agentBio: true,
        agentAreas: true,
        isActive: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        orgMemberships: {
          include: {
            organization: {
              select: { id: true, name: true, planTier: true, maxUnits: true, maxSeats: true },
            },
          },
        },
        _count: {
          select: {
            ownedListings: true,
            managedListings: true,
            tenantAgreements: true,
            landlordAgreements: true,
            sentTransactions: true,
            receivedTransactions: true,
            raisedTickets: true,
            assignedTickets: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: targetUser });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    // Users can only update their own profile, admins can update anyone
    if (user.id !== id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { updateUserSchema } = await import('@/lib/validators');
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    // Admins can update additional fields
    let adminFields: Record<string, unknown> = {};
    if (user.role === 'ADMIN') {
      adminFields = {
        role: body.role,
        isActive: body.isActive,
        isBanned: body.isBanned,
        banReason: body.banReason,
        agentApproved: body.agentApproved,
        agentTier: body.agentTier,
        agentBio: body.agentBio,
        agentAreas: body.agentAreas,
      };
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...validated,
        ...adminFields,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        ninVerified: true,
        phoneVerified: true,
        idVerified: true,
        profileBio: true,
        profileCompleted: true,
        agentTier: true,
        agentApproved: true,
        agentBio: true,
        agentAreas: true,
        isActive: true,
        isBanned: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('User PATCH error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}