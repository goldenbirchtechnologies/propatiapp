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

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
          },
        },
        payer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        payee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Only payer, payee, or admin can download receipt
    if (transaction.payerId !== user.id && transaction.payeeId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Not authorized to download this receipt' }, { status: 403 });
    }

    // Check transaction is completed
    if (transaction.status !== 'in_escrow' && transaction.status !== 'released') {
      return NextResponse.json({ error: 'Receipt not available for pending transactions' }, { status: 400 });
    }

    // Build PDF receipt using invoice-style generator for consistency
    const pdfBuffer = buildInvoicePDFBuffer({
      invoiceNumber: transaction.reference || transaction.id,
      landlordName: transaction.payee.fullName,
      tenantName: transaction.payer.fullName,
      propertyTitle: transaction.listing?.title,
      propertyAddress: transaction.listing?.address,
      type: transaction.type,
      amount: Number(transaction.amount),
      currency: transaction.currency || 'NGN',
      status: transaction.status,
      dueDate: transaction.createdAt,
      paidAt: transaction.paidAt || null,
      items: [{ description: `${transaction.type} transaction`, amount: Number(transaction.amount), quantity: 1 }],
      notes: transaction.description || undefined,
    });

    const pdfUrl = await uploadInvoicePDF({ invoiceId: transaction.id, buffer: pdfBuffer });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${transaction.reference || transaction.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
