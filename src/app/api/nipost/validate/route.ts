import { NextRequest, NextResponse } from 'next/server';
import { nipost, validateAddress } from '@/lib/nipost';

/**
 * NIPOST Postcode API routes
 *
 * GET /api/nipost/validate?postalCode=CODE&state=STATE&lga=LGA&address=ADDR
 * GET /api/nipost/autocomplete?q=query
 *
 * These endpoints proxy requests to the NIPOST Postcode API
 * (https://docs.postcode.gov.ng) and return normalized results.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get('postalCode');
    const state = searchParams.get('state') || undefined;
    const lga = searchParams.get('lga') || undefined;
    const address = searchParams.get('address') || undefined;
    const q = searchParams.get('q');

    // Autocomplete endpoint
    if (!postalCode && q) {
      if (q.trim().length < 2) {
        return NextResponse.json(
          { error: 'Query parameter "q" must be at least 2 characters' },
          { status: 400 }
        );
      }
      const result = await nipost.autocomplete(q);
      return NextResponse.json({
        segment: result.segment,
        suggestions: result.suggestions,
        mockMode: nipost.isMockMode(),
      });
    }

    // Validate endpoint
    if (!postalCode) {
      return NextResponse.json(
        { error: 'postalCode parameter is required (or use q= for autocomplete)' },
        { status: 400 }
      );
    }

    const result = await validateAddress({ postalCode, state, lga, address });

    return NextResponse.json({
      valid: result.valid,
      postalCode: result.postalCode,
      state: result.state,
      lga: result.lga,
      locality: result.locality,
      buildingUseStatus: result.buildingUseStatus,
      matches: result.matches,
      confidence: result.confidence,
      mockMode: nipost.isMockMode(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('NIPOST_')) {
      const code = error.message.split(':')[0];
      const message = error.message.includes(':') ? error.message.split(':')[1] : error.message;
      const status = code === 'NIPOST_INVALID_API_KEY' || code === 'NIPOST_ACCESS_DENIED' ? 401 : 502;
      return NextResponse.json({ error: code, message: message.trim() }, { status });
    }
    console.error('[NIPOST API] Error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to validate address' },
      { status: 500 }
    );
  }
}
