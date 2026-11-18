import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { errorResponse, successResponse, withAuth } from '@/lib/api-auth';
import {
  getEffectivePlatformConfig,
  savePlatformConfigOverride,
} from '@/lib/platform-config-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await withAuth(request, ['admin']);
  if (auth instanceof Response) return auth;

  return successResponse({ config: await getEffectivePlatformConfig() });
}

export async function PATCH(request: NextRequest) {
  const auth = await withAuth(request, ['admin']);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const patch = body?.config ?? body;
    const config = await savePlatformConfigOverride(patch);
    return successResponse({ config }, 'Platform configuration updated');
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse('Invalid platform configuration', 400, error.flatten());
    }
    console.error('Platform config update failed:', error);
    return errorResponse('Could not save platform configuration', 500);
  }
}
