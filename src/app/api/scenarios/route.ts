import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rentScenarioSchema } from '@/lib/validators';

/**
 * GET /api/scenarios
 *
 * The caller's saved forecast scenarios. Owner-scoped by `userId`, so no id
 * parameter is taken and one user cannot read another's.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const scenarios = await prisma.rentScenario.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, assumptions: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, data: { scenarios } });
  } catch (error) {
    console.error('Scenarios GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load scenarios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenarios
 *
 * Saves a forecast as it stood in the builder. The assumptions are stored
 * verbatim so a saved scenario keeps working after the builder changes.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = rentScenarioSchema.parse(body);

    const scenario = await prisma.rentScenario.create({
      data: {
        userId: user.id,
        name: parsed.name,
        // Zod types this as Record<string, unknown>; Prisma wants
        // InputJsonValue. The body came from JSON.parse, so it is JSON already.
        assumptions: parsed.assumptions as Prisma.InputJsonValue,
      },
      select: { id: true, name: true, assumptions: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, data: { scenario } }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid scenario', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Scenarios POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save scenario' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scenarios?id=…
 *
 * `deleteMany` rather than `delete`: scoping by both id and userId makes another
 * user's id a no-op instead of a 500 or, worse, a successful delete.
 */
export async function DELETE(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing scenario id' },
        { status: 400 }
      );
    }

    const { count } = await prisma.rentScenario.deleteMany({
      where: { id, userId: user.id },
    });

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error('Scenarios DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete scenario' },
      { status: 500 }
    );
  }
}
