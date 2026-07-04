import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Record<string, unknown>[];
  tags?: string[];
  context?: Record<string, string>;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
  duration?: number;
}

export async function uploadImage(
  file: Buffer | string | Readable,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file as any, ({
    folder: options.folder || 'propati/images',
    resource_type: 'image',
    transformation: options.transformation || [
      { quality: 'auto:good', fetch_format: 'auto' },
      { width: 1920, height: 1080, crop: 'limit' },
    ],
    tags: options.tags || ['propati'],
    context: options.context,
    public_id: options.public_id,
  } as any) as any);

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function uploadDocument(
  file: Buffer | string | Readable,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file as any, {
    folder: options.folder || 'propati/documents',
    resource_type: 'raw',
    tags: options.tags || ['propati', 'document'],
    context: options.context,
    public_id: options.public_id,
  } as any as any);

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function uploadVideo(
  file: Buffer | string | Readable,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file as any, {
    folder: options.folder || 'propati/videos',
    resource_type: 'video',
    tags: options.tags || ['propati', 'video'],
    context: options.context,
    public_id: options.public_id,
    eager: [
      { width: 1280, height: 720, crop: 'limit', quality: 'auto' },
    ],
    eager_async: true,
  } as any);

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    duration: result.duration,
  };
}

export async function deleteMedia(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  return result;
}

export async function deleteMultipleMedia(publicIds: string[], resourceType: 'image' | 'video' | 'raw' = 'image') {
  const result = await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
  return result;
}

export function getOptimizedUrl(publicId: string, options: Record<string, unknown> = {}) {
  return cloudinary.url(publicId, {
    quality: 'auto:good',
    fetch_format: 'auto',
    ...options,
  });
}

export function getThumbnailUrl(publicId: string, width = 400, height = 300) {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto:good',
    fetch_format: 'auto',
  });
}

/**
 * Generic upload function for verification documents
 * Handles File objects from browser uploads
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ url: string; publicId: string }> {
  // Convert File to Buffer for upload
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a base64 data URI
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  let result;
  if (resourceType === 'image') {
    result = await uploadImage(dataURI, { folder });
  } else if (resourceType === 'video') {
    result = await uploadVideo(dataURI, { folder });
  } else {
    result = await uploadDocument(dataURI, { folder });
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const resourceType = publicId.includes('/videos/') ? 'video'
    : publicId.includes('/documents/') ? 'raw'
    : 'image';

  await deleteMedia(publicId, resourceType);
}

export { cloudinary };

export default cloudinary;