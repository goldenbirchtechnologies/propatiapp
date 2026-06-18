import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments/transactions/[id]/receipt
 * Generates and returns a PDF receipt for the transaction
 *
 * Authorization: Transaction owner (payer) only
 * Returns: PDF file or Cloudinary URL
 *
 * TODO: Implement PDF generation using PDFKit or similar
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
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

    // Only payer can download receipt
    if (transaction.payerId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Only the payer can download the receipt' }, { status: 403 });
    }

    // Check transaction is completed
    if (transaction.status !== 'in_escrow' && transaction.status !== 'released') {
      return NextResponse.json({ error: 'Receipt not available for pending transactions' }, { status: 400 });
    }

    // TODO: Implement PDF generation
    // For now, return a placeholder response
    return NextResponse.json({
      success: false,
      error: 'Receipt generation not yet implemented',
      message: 'PDF receipt generation will be implemented in the next phase',
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: Number(transaction.amount),
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    }, { status: 501 });

    // Future implementation:
    // 1. Use PDFKit to generate PDF
    // 2. Include: PROPATI logo, transaction details, payer/payee info, amount breakdown, fees
    // 3. Upload to Cloudinary or return as inline PDF
    // 4. Cache receipt URL in transaction.paystackData for future requests
  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
