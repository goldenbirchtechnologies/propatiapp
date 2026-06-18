import { NextRequest, NextResponse } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { updateUserAdminSchema, suspendUserSchema, approveAgentSchema } from '@/lib/validators';
import { createAuditLog } from '@/lib/audit-log';

/**
 * PATCH /api/admin/users/[id]
 * Update user details (role, status, verification flags)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user: admin } = authResult;

  try {
    const body = await request.json();
    const validated = updateUserAdminSchema.parse(body);
    const userId = params.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};

    if (validated.role) updateData.role = validated.role;
    if (validated.phoneVerified !== undefined) updateData.phoneVerified = validated.phoneVerified;

    // Handle status changes
    if (validated.status) {
      if (validated.status === 'active') {
        updateData.isActive = true;
        updateData.isBanned = false;
      } else if (validated.status === 'suspended') {
        updateData.isActive = false;
        updateData.isBanned = false;
      } else if (validated.status === 'banned') {
        updateData.isBanned = true;
        updateData.isActive = false;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Create audit log
    await createAuditLog({
      adminId: admin.id,
      action: 'update_user',
      targetType: 'user',
      targetId: userId,
      details: {
        userName: user.fullName,
        changes: validated,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse(updatedUser, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users/[id]/suspend
 * Suspend user account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user: admin } = authResult;

  try {
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();
    const userId = params.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'suspend') {
      const body = await request.json();
      const validated = suspendUserSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          banReason: validated.reason,
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          type: 'system',
          title: 'Account Suspended',
          body: `Your account has been suspended. Reason: ${validated.reason}`,
          data: { reason: validated.reason },
        },
      });

      // Create audit log
      await createAuditLog({
        adminId: admin.id,
        action: 'suspend_user',
        targetType: 'user',
        targetId: userId,
        details: {
          userName: user.fullName,
          reason: validated.reason,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return successResponse(updatedUser, 'User suspended successfully');
    }

    if (action === 'activate') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          isBanned: false,
          banReason: null,
        },
      });

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          type: 'system',
          title: 'Account Activated',
          body: 'Your account has been reactivated. You can now access all features.',
          data: {},
        },
      });

      // Create audit log
      await createAuditLog({
        adminId: admin.id,
        action: 'activate_user',
        targetType: 'user',
        targetId: userId,
        details: {
          userName: user.fullName,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return successResponse(updatedUser, 'User activated successfully');
    }

    if (action === 'approve-agent') {
      if (user.role !== 'agent') {
        return NextResponse.json({ error: 'User is not an agent' }, { status: 400 });
      }

      const body = await request.json();
      const validated = approveAgentSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          agentApproved: true,
          agentTier: validated.agentTier,
        },
      });

      // Notify agent
      await prisma.notification.create({
        data: {
          userId,
          type: 'system',
          title: 'Agent Application Approved',
          body: `Congratulations! Your agent application has been approved. You are now a ${validated.agentTier} agent.`,
          data: {
            agentTier: validated.agentTier,
            notes: validated.notes,
          },
        },
      });

      // Create audit log
      await createAuditLog({
        adminId: admin.id,
        action: 'approve_agent',
        targetType: 'user',
        targetId: userId,
        details: {
          userName: user.fullName,
          agentTier: validated.agentTier,
          notes: validated.notes,
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return successResponse(updatedUser, 'Agent approved successfully');
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('User action error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
