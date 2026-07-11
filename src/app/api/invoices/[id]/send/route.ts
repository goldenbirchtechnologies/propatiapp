import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { buildInvoicePDFBuffer, uploadInvoicePDF } from '@/lib/invoice-pdf-generator';
import { notificationService } from '@/lib/notification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true, address: true } },
      },
    });

    if (!invoice || invoice.landlordId !== user.id) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    const items = (invoice.items as any[]) || [];
    const pdfBuffer = buildInvoicePDFBuffer({
      invoiceNumber: invoice.invoiceNumber,
      landlordName: user.fullName || 'Propati Landlord',
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

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'sent',
        pdfUrl,
      },
      include: {
        tenant: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    if (updated.tenantId) {
      notificationService.notifyUsersForEvent({
        userIds: [updated.tenantId],
        type: 'rent_due',
        title: 'Invoice Sent',
        message: `You have a new ${updated.type} invoice for ${updated.listing?.title || 'your property'}. Amount: ${updated.currency} ${Number(updated.amount).toLocaleString()}`,
        actionUrl: `/dashboard/tenant/invoices`,
        metadata: { invoiceId: updated.id, invoiceNumber: updated.invoiceNumber },
        channels: ['inapp'],
      }).catch(() => undefined);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Invoice send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
