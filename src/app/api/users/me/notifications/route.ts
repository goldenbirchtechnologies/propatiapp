import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { paginationSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, ...filters } = paginationSchema.extend({
      read: z.coerce.boolean().optional(),
      type: z.string().optional(),
    }).parse(params);

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = { userId: user.id };
    if (filters.read !== undefined) where.read = filters.read;
    if (filters.type) where.type = filters.type;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort) {
      const sortField = sort.replace(/^[-+]/, '');
      const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortOrder };
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('User notifications GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { notificationId, read, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: read ?? true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('User notifications PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}