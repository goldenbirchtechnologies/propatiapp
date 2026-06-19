import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { uploadVideo } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// Video validation constants (not exported to avoid Next.js route export conflicts)
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
];

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const verificationId = formData.get('verificationId') as string | null;
    const listingId = formData.get('listingId') as string | null;

    // Validate input
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    if (!verificationId || !listingId) {
      return NextResponse.json(
        { error: 'verificationId and listingId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          details: `Accepted types: ${ACCEPTED_VIDEO_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          details: `Maximum size: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Verify verification exists and is at Layer 3
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        listing: {
          select: { id: true, ownerId: true, title: true },
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    if (verification.listingId !== listingId) {
      return NextResponse.json(
        { error: 'Listing ID does not match verification' },
        { status: 400 }
      );
    }

    // Check authorization
    if (verification.listing.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - not the property owner' },
        { status: 403 }
      );
    }

    // Check if at Layer 3
    if (verification.currentLayer !== 3) {
      return NextResponse.json(
        {
          error: 'Must complete Layer 2 first',
          currentLayer: verification.currentLayer,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadVideo(buffer, {
      folder: `propati/verification/${listingId}/video`,
      public_id: `${verificationId}_${Date.now()}`,
      tags: ['propati', 'verification', 'layer3', listingId],
      context: {
        verificationId,
        listingId,
        uploadedBy: user.id,
      },
    });

    // Update verification record
    const updatedVerification = await prisma.verification.update({
      where: { id: verificationId },
      data: {
        l3VideoUrl: uploadResult.secure_url,
        l3Status: 'pending',
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: { id: true, title: true },
        },
      },
    });

    // Create notification for admins
    const admins = await prisma.user.findMany({
      where: { role: 'admin', isActive: true },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'verification',
          title: 'New Video Verification Submitted',
          body: `${verification.listing.title} - Layer 3 video uploaded`,
          data: {
            verificationId,
            listingId,
            layer: 3,
          },
        })),
      });
    }

    return NextResponse.json(
      {
        success: true,
        video: {
          url: uploadResult.secure_url,
          duration: uploadResult.duration,
          uploadedAt: new Date().toISOString(),
          publicId: uploadResult.public_id,
        },
        verification: {
          id: updatedVerification.id,
          currentLayer: updatedVerification.currentLayer,
          l3Status: updatedVerification.l3Status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Video upload error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Cloudinary')) {
        return NextResponse.json(
          { error: 'Video upload failed', details: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
