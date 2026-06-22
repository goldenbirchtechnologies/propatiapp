import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

/**
 * GET /api/documents
 * List all documents for the authenticated user
 * Returns: { documents: Array<{ id, type, version, name, url, createdAt, updatedAt }> }
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const documents = await prisma.document.findMany({
      where: { uploadedById: user.id },
      select: {
        id: true,
        type: true,
        version: true,
        name: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Upload a new document. Version is auto-incremented based on existing documents of the same type for this user.
 * Body: multipart/form-data with 'file' and 'type'
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['agreement', 'receipt', 'verification', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Determine next version
    const maxVersion = await prisma.document.findFirst({
      where: { uploadedById: user.id, type },
      select: { version: true },
      orderBy: { version: 'desc' },
    });

    const nextVersion = maxVersion ? maxVersion.version + 1 : 1;

    // Upload to Cloudinary
    const folder = `propati/documents/${user.id}/${type}`;
    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';

    const { url, publicId } = await uploadToCloudinary(file, folder, resourceType);

    const document = await prisma.document.create({
      data: {
        listingId: null,
        uploadedById: user.id,
        type,
        version: nextVersion,
        url,
        name: file.name,
        mimeType: file.type,
        sizeBytes: BigInt(file.size),
        accessControl: 'private',
      },
      select: {
        id: true,
        type: true,
        version: true,
        name: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
