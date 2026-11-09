import { NextResponse } from 'next/server';
import { listSettlementBanks } from '@/lib/banks';

/**
 * GET /api/paystack/banks
 *
 * The bank picker for settlement accounts. Returns a normalised `{ code, name }`
 * list so the form does not depend on Paystack's payload shape, and falls back
 * to the static directory when the key is not configured.
 */
export async function GET() {
  const directory = await listSettlementBanks();
  return NextResponse.json({ success: true, data: directory });
}
