import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import {
  documentUploadSchema,
  validateFileType,
  validateFileSize,
  MAX_FILE_SIZE,
} from '@/lib/validators';

/**
 * POST /api/verification/upload-document
 * Upload a verification document (ownership, ID, photos, utility bill)
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const listingId = formData.get('listingId') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate form data
    const validated = documentUploadSchema.parse({
      documentType,
      listingId,
      fileName: file.name,
    });

    // Validate file type
    if (!validateFileType(file.type, validated.documentType)) {
      return NextResponse.json(
        {
          error: `Invalid file type. ${
            validated.documentType === 'photos'
              ? 'Only images are allowed for photos'
              : 'Only PDF and images are allowed'
          }`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Check if listing exists and user owns it
    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
      select: { id: true, ownerId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this listing' },
        { status: 403 }
      );
    }

    // Get or create verification record
    let verification = await prisma.verification.findUnique({
      where: { listingId: validated.listingId },
    });

    if (!verification) {
      // Create verification record if it doesn't exist
      verification = await prisma.verification.create({
        data: {
          listingId: validated.listingId,
          ownerId: user.id,
          currentLayer: 1,
          overallStatus: 'not_started',
          l1Status: 'pending',
          l2Status: 'pending',
          l3Status: 'pending',
          l4Status: 'pending',
          l5Status: 'pending',
        },
      });
    }

    // Upload to Cloudinary
    const resourceType =
      validated.documentType === 'photos'
        ? 'image'
        : file.type === 'application/pdf'
        ? 'raw'
        : 'image';

    const folder = `propati/verification/${validated.listingId}/${validated.documentType}`;

    const { url, publicId } = await uploadToCloudinary(
      file,
      folder,
      resourceType
    );

    // Save document record to database
    const document = await prisma.verificationDocument.create({
      data: {
        verificationId: verification.id,
        listingId: validated.listingId,
        documentType: validated.documentType,
        url,
        publicId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    // If this is the first document uploaded, update verification status
    if (verification.overallStatus === 'not_started') {
      await prisma.verification.update({
        where: { id: verification.id },
        data: {
          overallStatus: 'in_progress',
          currentLayer: 1,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        document: {
          id: document.id,
          url: document.url,
          type: document.documentType,
          fileName: document.fileName,
          uploadedAt: document.uploadedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Document upload error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
