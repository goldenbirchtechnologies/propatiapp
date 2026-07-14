import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { buildInvoicePDFBuffer, uploadInvoicePDF } from '@/lib/invoice-pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        landlord: { select: { fullName: true } },
        tenant: { select: { fullName: true } },
        listing: { select: { title: true, address: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.landlordId !== user.id && invoice.tenantId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (!invoice.pdfUrl) {
      const items = Array.isArray(invoice.items) ? (invoice.items as unknown[]) : [];
      const pdfBuffer = buildInvoicePDFBuffer({
        invoiceNumber: invoice.invoiceNumber,
        landlordName: invoice.landlord?.fullName || 'Propati Landlord',
        tenantName: invoice.tenant?.fullName,
        propertyTitle: invoice.listing?.title,
        propertyAddress: invoice.listing?.address,
        type: invoice.type,
        amount: Number(invoice.amount),
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt || null,
        items,
        notes: invoice.notes || undefined,
      });

      const pdfUrl = await uploadInvoicePDF({ invoiceId: invoice.id, buffer: pdfBuffer });

      await prisma.invoice.update({
        where: { id },
        data: { pdfUrl },
      });

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        },
      });
    }

    return NextResponse.json({ success: true, pdfUrl: invoice.pdfUrl });
  } catch (error) {
    console.error('Invoice receipt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
