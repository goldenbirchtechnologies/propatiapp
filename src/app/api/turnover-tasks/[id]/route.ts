import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse, type AuthenticatedRequest } from '@/lib/api-auth';
import { updateTurnoverTaskSchema } from '@/lib/validators.management';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const task = await prisma.turnoverTask.findUnique({
      where: { id: params.id },
      include: { booking: true },
    });

    if (!task) return NextResponse.json({ error: 'Turnover task not found' }, { status: 404 });

    return NextResponse.json({ task });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const body = await request.json();
    const validated = updateTurnoverTaskSchema.parse(body);

    const existing = await prisma.turnoverTask.findUnique({
      where: { id: params.id },
      select: { estateManagerId: true, id: true },
    });

    if (!existing) return NextResponse.json({ error: 'Turnover task not found' }, { status: 404 });

    const isEstateManager = true; // attach after Organization lookup if needed

    const task = await prisma.turnoverTask.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        type: validated.type,
        assignedTo: validated.assignedTo,
        notes: validated.notes,
        completedAt: validated.status === 'completed' ? new Date() : undefined,
      },
      include: { booking: { select: { id: true, checkIn: true, checkOut: true } } },
    });

    return NextResponse.json({ task });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult as AuthenticatedRequest;

  try {
    const existing = await prisma.turnoverTask.findUnique({
      where: { id: params.id },
      select: { bookingId: true },
    });

    if (!existing) return NextResponse.json({ error: 'Turnover task not found' }, { status: 404 });

    await prisma.turnoverTask.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
