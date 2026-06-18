import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | bigint, currency = 'NGN'): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num / 100); // Convert kobo to Naira
}

export function formatCurrencyKobo(amount: number | bigint): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function generateId(prefix: string, length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

export function parseKoboToNaira(kobo: number | bigint): number {
  const num = typeof kobo === 'bigint' ? Number(kobo) : kobo;
  return num / 100;
}

export function parseNairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function computePlatformFee(
  type: 'rent' | 'sale' | 'short_let' | 'subscription',
  amount: number,
  hasAgent: boolean
): { platformFee: number; agentCommission: number; payeeAmount: number } {
  const RATES = {
    rent: { platform: 0.10, agent: 0.10 },
    sale: { platform: amount > 20_000_000 * 100 ? 0.02 : 0.01, agent: 0.015 },
    short_let: { platform: 0.10, agent: 0.10 },
    subscription: { platform: 0, agent: 0 },
  };

  const rate = RATES[type];
  const platformFee = Math.round(amount * rate.platform);
  const agentCommission = hasAgent ? Math.round(platformFee * rate.agent) : 0;
  const payeeAmount = amount - platformFee - agentCommission;

  return { platformFee, agentCommission, payeeAmount };
}

export const NAIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

export const LAGOS_AREAS = [
  'Ikeja', 'Lekki', 'Victoria Island', 'Ikoyi', 'Surulere', 'Yaba', 'Lagos Island',
  'Apapa', 'Amuwo Odofin', 'Eti Osa', 'Ibeju Lekki', 'Ifako Ijaiye', 'Kosofe',
  'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi Isolo', 'Shomolu', 'Agege', 'Ajeromi Ifelodun',
  'Alimosho', 'Badagry', 'Epe', 'Ikorodu', 'Eredo', 'Agbowa', 'Oreta', 'Majidun',
] as const;

export type NigerianState = (typeof NAIGERIAN_STATES)[number];
export type LagosArea = (typeof LAGOS_AREAS)[number];