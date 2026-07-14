import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getReportData, buildCSV, buildPDFBuffer } from '@/lib/reports-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json().catch(() => ({}));
    const type = String(body.type || 'pl');
    const from = String(body.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    const to = String(body.to || new Date().toISOString());
    const listingId = body.listingId ? String(body.listingId) : undefined;
    const format = String(body.format || 'json');

    const report = await getReportData({
      type: type as 'pl' | 'balance-sheet' | 'cashflow',
      from,
      to,
      listingId,
      role: 'admin',
      userId: authResult.user.id,
    });

    if (format === 'csv') {
      const csv = buildCSV(report);
      const filename = `report-${type}-${from.slice(0,10)}-${to.slice(0,10)}.csv`;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    if (format === 'pdf') {
      const pdfBuffer = await buildPDFBuffer(report);
      const filename = `report-${type}-${from.slice(0,10)}-${to.slice(0,10)}.pdf`;
      return new NextResponse(pdfBuffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Admin report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
