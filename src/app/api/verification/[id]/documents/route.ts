import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

/**
 * GET /api/verification/[id]/documents
 * List all documents for a verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = id;

    // Get verification with documents
    const verification = await prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        documents: {
          where: { deletedAt: null }, // Only non-deleted documents
          orderBy: { uploadedAt: 'desc' },
          select: {
            id: true,
            documentType: true,
            url: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
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

    // Check authorization (owner or admin)
    const isOwner = verification.listing.ownerId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Group documents by type
    const documentsByType = {
      ownership: verification.documents.filter(d => d.documentType === 'ownership'),
      id: verification.documents.filter(d => d.documentType === 'id'),
      photos: verification.documents.filter(d => d.documentType === 'photos'),
      utility: verification.documents.filter(d => d.documentType === 'utility'),
    };

    // Calculate completion status
    const hasOwnership = documentsByType.ownership.length > 0;
    const hasId = documentsByType.id.length > 0;
    const hasPhotos = documentsByType.photos.length >= 5;
    const hasUtility = documentsByType.utility.length > 0;

    const allRequiredDocuments = hasOwnership && hasId && hasPhotos && hasUtility;

    return NextResponse.json({
      success: true,
      documents: verification.documents,
      documentsByType,
      completion: {
        hasOwnership,
        hasId,
        hasPhotos,
        hasUtility,
        allRequiredDocuments,
        photosCount: documentsByType.photos.length,
        totalDocuments: verification.documents.length,
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/verification/[id]/documents?documentId=xxx
 * Delete a specific document (soft delete + Cloudinary cleanup)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const verificationId = id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document with verification info
    const document = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: {
        verification: {
          include: {
            listing: {
              select: { ownerId: true },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.verificationId !== verificationId) {
      return NextResponse.json(
        { error: 'Document does not belong to this verification' },
        { status: 400 }
      );
    }

    // Check authorization (owner only, admins should not delete user documents)
    const isOwner = document.verification.listing.ownerId === user.id;

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the listing owner can delete documents' },
        { status: 403 }
      );
    }

    // Soft delete in database
    await prisma.verificationDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    });

    // Delete from Cloudinary (background task, don't wait)
    deleteFromCloudinary(document.publicId).catch(err => {
      console.error('Failed to delete from Cloudinary:', err);
      // Continue anyway - soft delete is more important
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
