import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { getReportData, buildCSV, buildPDFBuffer } from '@/lib/reports-service';

// ── Validation ───────────────────────────────────────────────────────────────

const reportTypeSchema = z.enum(['pl', 'balance-sheet', 'cashflow']);
const reportFormatSchema = z.enum(['csv', 'pdf']);

const reportExportSchema = z.object({
  type: reportTypeSchema,
  format: reportFormatSchema.default('csv'),
  from: z.coerce.date().default(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  to: z.coerce.date().default(new Date()),
  listingId: z.string().cuid().optional(),
  orgId: z.string().cuid().optional(),
});

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const raw = Object.fromEntries(searchParams.entries());

    const validated = reportExportSchema.parse(raw);

    const fromDate = new Date(validated.from);
    const toDate = new Date(validated.to);
    toDate.setHours(23, 59, 59, 999);

    if (fromDate > toDate) {
      return NextResponse.json({ error: 'from date must be before to date' }, { status: 400 });
    }

    const report = await getReportData({
      type: validated.type,
      from: validated.from.toISOString().slice(0, 10),
      to: validated.to.toISOString().slice(0, 10),
      listingId: validated.listingId,
      orgId: validated.orgId,
      role: user.role,
      userId: user.id,
    });

    if (validated.format === 'csv') {
      const csv = buildCSV(report);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${validated.type}-report-${validated.from}-to-${validated.to}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    // PDF
    const pdfBuffer = await buildPDFBuffer(report);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${validated.type}-report-${validated.from}-to-${validated.to}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Reports export error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: (error as unknown as z.ZodError).issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
