import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { paystack } from '@/lib/paystack';

/**
 * GET /api/paystack/status
 *
 * Admin-facing readiness check for the payments integration. Reports whether
 * the secret key is present and, when it is, whether Paystack accepts it — by
 * calling the cheapest authenticated endpoint (`/bank`).
 *
 * Never returns the key itself.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['admin']);
  if (authResult instanceof NextResponse) return authResult;

  const configured = paystack.isConfigured();
  const mockMode = paystack.isMockMode();
  const webhookUrl = '/api/webhook/paystack';

  if (!configured) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        mockMode,
        mode: mockMode ? 'mock' : 'disabled',
        message: mockMode
          ? 'PAYSTACK_SECRET_KEY is not set — payments return synthetic responses (development only).'
          : 'PAYSTACK_SECRET_KEY is not set — payments are disabled.',
        webhookUrl,
      },
      { status: mockMode ? 200 : 503 }
    );
  }

  try {
    const banks = await paystack.listBanks('nigeria');
    const reachable = Boolean(banks?.status);
    return NextResponse.json(
      {
        success: reachable,
        configured: true,
        mockMode: false,
        mode: process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
        message: reachable
          ? 'Paystack reachable and the secret key is accepted.'
          : 'Paystack responded but rejected the request — check the secret key.',
        bankCount: Array.isArray(banks?.data) ? banks.data.length : 0,
        webhookUrl,
      },
      { status: reachable ? 200 : 502 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        configured: true,
        mockMode: false,
        mode: 'unknown',
        message: error instanceof Error ? error.message : 'Paystack unreachable.',
        webhookUrl,
      },
      { status: 502 }
    );
  }
}
