import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { ACCEPTED_DOC_TYPES, MAX_FILE_SIZE } from '@/lib/validators';
import { landlordDocumentCategorySchema } from '@/lib/landlord-profile/schemas';

const serialize = (doc: {
  id: string;
  category: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  reviewNote: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}) => ({
  id: doc.id,
  category: doc.category,
  name: doc.name,
  url: doc.url,
  mimeType: doc.mimeType,
  sizeBytes: doc.sizeBytes,
  status: doc.status,
  reviewNote: doc.reviewNote,
  expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
  createdAt: doc.createdAt.toISOString(),
});

/**
 * GET /api/landlord/documents
 * The caller's own owner-workspace documents. No id parameter: one owner can
 * never list another owner's files.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const documents = await prisma.landlordDocument.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, documents: documents.map(serialize) });
  } catch (error) {
    console.error('Landlord documents GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/landlord/documents
 * multipart/form-data: `file`, `category`, optional `name` and `expiresAt`.
 * New files enter the review lifecycle as `submitted`; the owner cannot mark
 * their own document verified.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const rawCategory = formData.get('category');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Choose a file to upload' },
        { status: 400 }
      );
    }

    const category = landlordDocumentCategorySchema.parse(rawCategory);

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File must be 10MB or smaller' },
        { status: 400 }
      );
    }

    if (!ACCEPTED_DOC_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Upload a PDF, JPG, PNG, or WebP file' },
        { status: 400 }
      );
    }

    const rawExpiresAt = formData.get('expiresAt');
    let expiresAt: Date | null = null;
    if (typeof rawExpiresAt === 'string' && rawExpiresAt.trim()) {
      const parsed = new Date(rawExpiresAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Expiry date is not valid' },
          { status: 400 }
        );
      }
      expiresAt = parsed;
    }

    const rawName = formData.get('name');
    const name =
      typeof rawName === 'string' && rawName.trim()
        ? rawName.trim().slice(0, 160)
        : file.name;

    const folder = `propati/landlord-documents/${user.id}/${category}`;
    const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';
    const { url, publicId } = await uploadToCloudinary(file, folder, resourceType);

    const document = await prisma.landlordDocument.create({
      data: {
        userId: user.id,
        category,
        name,
        url,
        publicId,
        mimeType: file.type,
        sizeBytes: file.size,
        status: 'submitted',
        expiresAt,
      },
    });

    return NextResponse.json(
      { success: true, document: serialize(document) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Choose a valid document category' },
        { status: 400 }
      );
    }
    console.error('Landlord documents POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
