import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getRentSchedule, createRentScheduleEntries } from '@/lib/rent-schedule';

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
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check permissions
    const isParticipant =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      agreement.agentId === user.id ||
      user.role === 'admin';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Get rent schedule
    const schedule = await getRentSchedule(id);

    // If schedule doesn't exist and agreement is fully signed, create it
    if (schedule.length === 0 && agreement.status === 'fully_signed') {
      await createRentScheduleEntries(id);
      const newSchedule = await getRentSchedule(id);
      return NextResponse.json({ success: true, data: newSchedule });
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Rent schedule GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve rent schedule', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    if (agreement.status !== 'fully_signed') {
      return NextResponse.json(
        { error: 'Can only generate rent schedule for fully signed agreements' },
        { status: 400 }
      );
    }

    // Check if schedule already exists
    const existingSchedule = await getRentSchedule(id);
    if (existingSchedule.length > 0) {
      return NextResponse.json(
        { error: 'Rent schedule already exists for this agreement' },
        { status: 400 }
      );
    }

    // Create rent schedule
    await createRentScheduleEntries(id);
    const schedule = await getRentSchedule(id);

    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error) {
    console.error('Rent schedule POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create rent schedule', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
