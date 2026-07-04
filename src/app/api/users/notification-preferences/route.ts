import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/users/notification-preferences - Get user's notification preferences
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;
  const userId = user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationPreferences: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Default preferences if none set
    const defaultPreferences = {
      email: true,
      sms: true,
      whatsapp: false,
      inapp: true,
      types: {
        verification: true,
        agreement: true,
        payment: true,
        message: true,
        rent_due: true,
        maintenance: true,
        screening: true,
        system: true,
      },
    };

    const preferences = user.notificationPreferences
      ? (typeof user.notificationPreferences === 'string'
          ? JSON.parse(user.notificationPreferences)
          : user.notificationPreferences)
      : defaultPreferences;

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Notification preferences GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/notification-preferences - Update user's notification preferences
export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { user } = authResult;
  const userId = user.id;

  try {
    const body = await request.json();
    const schema = z.object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      whatsapp: z.boolean().optional(),
      inapp: z.boolean().optional(),
      types: z
        .object({
          verification: z.boolean().optional(),
          agreement: z.boolean().optional(),
          payment: z.boolean().optional(),
          message: z.boolean().optional(),
          rent_due: z.boolean().optional(),
          maintenance: z.boolean().optional(),
          screening: z.boolean().optional(),
          system: z.boolean().optional(),
        })
        .optional(),
    });

    const validated = schema.parse(body);

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });

    const currentPreferences = user?.notificationPreferences
      ? (typeof user.notificationPreferences === 'string'
          ? JSON.parse(user.notificationPreferences)
          : user.notificationPreferences)
      : {};

    // Merge with new preferences
    const newPreferences = {
      ...currentPreferences,
      ...validated,
      types: {
        ...(currentPreferences.types || {}),
        ...(validated.types || {}),
      },
    };

    // Update user
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: newPreferences,
      },
      select: {
        notificationPreferences: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated.notificationPreferences,
    });
  } catch (error) {
    console.error('Notification preferences PATCH error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
