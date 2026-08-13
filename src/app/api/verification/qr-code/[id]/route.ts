import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { generateVerificationQR } from '@/lib/qr-code';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = id;

    // Find verification record
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        listing: {
          select: { id: true, ownerId: true },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner or an admin
    if (verification.listing.ownerId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - not the property owner' },
        { status: 403 }
      );
    }

    // Check if we're at Layer 3 (video verification)
    if (verification.currentLayer !== 3) {
      return NextResponse.json(
        { error: 'QR code only available for Layer 3 verification' },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrCode = await generateVerificationQR(
      verification.id,
      verification.listingId
    );

    // Update verification with QR code
    await prisma.verification.update({
      where: { id: verification.id },
      data: { l3QrCode: qrCode },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode,
        verificationId: verification.id,
        listingId: verification.listingId,
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
