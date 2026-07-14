import { prisma } from './prisma';

export interface CreateAuditLogParams {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an admin audit log entry
 * Used to track all administrative actions for compliance and security
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
    },
  });
}

/**
 * Get human-readable action description
 */
export function getAuditLogAction(action: string): string {
  const actions: Record<string, string> = {
    approve_verification: 'Approved verification',
    reject_verification: 'Rejected verification',
    suspend_listing: 'Suspended listing',
    activate_listing: 'Activated listing',
    suspend_user: 'Suspended user',
    activate_user: 'Activated user',
    ban_user: 'Banned user',
    approve_agent: 'Approved agent',
    reject_agent: 'Rejected agent',
    dismiss_flags: 'Dismissed flags',
    resolve_dispute: 'Resolved dispute',
    update_user_role: 'Updated user role',
    delete_listing: 'Deleted listing',
    refund_transaction: 'Refunded transaction',
  };
  return actions[action] || action;
}

/**
 * Get audit log entries with filters
 */
export async function getAuditLogs(params: {
  adminId?: string;
  action?: string;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  const { adminId, action, targetType, startDate, endDate, page = 1, limit = 20 } = params;

  const where: Prisma.AdminAuditLogWhereInput = {};

  if (adminId) where.adminId = adminId;
  if (action) where.action = action;
  if (targetType) where.targetType = targetType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get recent activity for a specific admin
 */
export async function getAdminActivity(adminId: string, limit = 10) {
  return prisma.adminAuditLog.findMany({
    where: { adminId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit trail for a specific target
 */
export async function getTargetAuditTrail(targetType: string, targetId: string) {
  return prisma.adminAuditLog.findMany({
    where: {
      targetType,
      targetId,
    },
    include: {
      admin: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
