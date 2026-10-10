export function toTitleCase(value: string): string {
  if (!value) return value;
  return value
    .split(/[\s,]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function truncateCuid(cuid: string, head = 8, tail = 4): string {
  if (!cuid) return cuid;
  if (cuid.length <= head + tail + 1) return cuid;
  return `${cuid.slice(0, head)}…${cuid.slice(-tail)}`;
}

export function sanitizeCountLabel(label: string, count: number | string): string {
  return `${label.trim()} (${String(count).trim()})`;
}

export function sanitizeAddress(value: string): string {
  return toTitleCase(value.trim());
}
