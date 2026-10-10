export function formatMoney(amountMinor: number, currency: string, locale: string): string {
  const amountMajor = amountMinor / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountMajor);
}

export function formatPriceForListing(
  price: number | string,
  opts: { currency?: string; locale?: string; pricePeriod?: string | null; listingType?: string } = {}
): string {
  const n = typeof price === 'string' ? Number(price) : price;
  const currency = opts.currency ?? 'NGN';
  const locale = opts.locale ?? (currency === 'USD' ? 'en-US' : 'en-NG');
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
  if (opts.listingType === 'sale') return formatted;
  if (opts.pricePeriod) {
    const suffix =
      opts.pricePeriod === 'month' ? '/mo' : opts.pricePeriod === 'night' ? '/night' : opts.pricePeriod === 'year' ? '/yr' : `/${opts.pricePeriod}`;
    return `${formatted}${suffix}`;
  }
  return formatted;
}

export function toMinor(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

export function fromMinor(amountMinor: number): number {
  return amountMinor / 100;
}
