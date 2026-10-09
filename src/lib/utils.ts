import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseKoboToNaira(kobo: number): number {
  return kobo / 100
}

export function parseNairaToKobo(naira: number): number {
  return naira * 100
}

export function formatCurrency(kobo: number): string {
  const naira = parseKoboToNaira(kobo)
  return formatNaira(naira)
}

export function formatNaira(naira: number): string {
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatNairaFull(naira: number): string {
  return `₦${naira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

// Nigeria reads dates day-first (dd/mm/yyyy). Use these instead of bare
// toLocaleDateString(), which follows the viewer's browser locale and renders
// month-first for US visitors.
export function formatDate(
  value: Date | string | number | null | undefined,
  fallback = '—'
): string {
  if (value === null || value === undefined || value === '') return fallback
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateLong(
  value: Date | string | number | null | undefined,
  fallback = '—'
): string {
  if (value === null || value === undefined || value === '') return fallback
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(
  value: Date | string | number | null | undefined,
  fallback = '—'
): string {
  if (value === null || value === undefined || value === '') return fallback
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return fallback
  return `${formatDate(d)}, ${d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`
}
