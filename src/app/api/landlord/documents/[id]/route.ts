import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

/**
 * DELETE /api/landlord/documents/[id]
 * Removes an owner's own document. The row is scoped by userId, so an id from
 * another account resolves to 404 rather than being deleted.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const document = await prisma.landlordDocument.findFirst({
      where: { id, userId: user.id },
      select: { id: true, publicId: true },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    try {
      await deleteFromCloudinary(document.publicId);
    } catch (cloudError) {
      // The row is the source of truth for the profile. A storage cleanup
      // failure must not leave the owner unable to remove a bad upload.
      console.error('Landlord document storage delete failed:', cloudError);
    }

    await prisma.landlordDocument.delete({ where: { id: document.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Landlord document DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
