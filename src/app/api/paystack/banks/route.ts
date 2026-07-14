import { NextRequest, NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';

export async function GET() {
  const result = await paystack.listBanks('nigeria');
  return NextResponse.json(result);
}
