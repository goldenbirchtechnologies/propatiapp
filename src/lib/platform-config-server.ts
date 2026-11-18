import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_PLATFORM_CONFIG,
  validatePlatformConfig,
  type PlatformConfig,
} from '@/lib/platform-config';

const overridePath =
  process.env.PLATFORM_CONFIG_FILE || path.join(process.cwd(), 'data', 'platform-config.overrides.json');

function deepMerge(base: unknown, patch: unknown): unknown {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch;
  if (!base || typeof base !== 'object' || Array.isArray(base)) return patch;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    result[key] = key in result ? deepMerge(result[key], value) : value;
  }
  return result;
}

export async function getEffectivePlatformConfig(): Promise<PlatformConfig> {
  try {
    const raw = await fs.readFile(overridePath, 'utf8');
    return validatePlatformConfig(deepMerge(DEFAULT_PLATFORM_CONFIG, JSON.parse(raw)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return DEFAULT_PLATFORM_CONFIG;
    throw error;
  }
}

export async function savePlatformConfigOverride(patch: unknown): Promise<PlatformConfig> {
  const merged = validatePlatformConfig(deepMerge(await getEffectivePlatformConfig(), patch));
  await fs.mkdir(path.dirname(overridePath), { recursive: true });
  await fs.writeFile(overridePath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  return merged;
}
