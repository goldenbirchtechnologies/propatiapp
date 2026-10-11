import axios, { AxiosInstance, AxiosError } from 'axios';

// NIPOST Postcode API — Nigeria's national postcode system
// Docs: https://docs.postcode.gov.ng
const NIPOST_BASE_URL = 'https://api.postcode.gov.ng';
const NIPOST_API_KEY = process.env.NIPOST_API_KEY || '';

// Mock mode for development (if credentials not configured)
const MOCK_MODE = !NIPOST_API_KEY || NIPOST_API_KEY === 'your_api_key_here';

// ---------------------------------------------------------------------------
// Response Interfaces
// ---------------------------------------------------------------------------

export interface NipostAdministrativeAddress {
  state: string;
  state_name: string;
  lga: string;
  lga_name: string;
  locality: string;
  locality_name: string;
  zone?: string;
  zone_name?: string;
}

export interface NipostHouseAddress {
  recent?: string;
  formatted?: string;
}

export interface NipostBuildingInfo {
  building_use_status?: string;
  building_type?: string;
  num_floors?: number;
  occupancy?: string;
}

export interface NipostPointGeometry {
  latitude?: number;
  longitude?: number;
}

export interface NipostLookupResponse {
  postcode: string;
  valid: boolean;
  administrative_address?: NipostAdministrativeAddress;
  recent_house_address?: NipostHouseAddress;
  building_use_status?: string;
  other_building_info?: NipostBuildingInfo;
  point_geometry?: NipostPointGeometry;
}

export interface NipostAutocompleteSuggestion {
  code: string;
  label: string;
}

export interface NipostAutocompleteResponse {
  segment: 'state' | 'lga' | 'district' | 'area' | 'unit';
  suggestions: NipostAutocompleteSuggestion[];
}

export interface NipostError {
  error: {
    code: string;
    message: string;
  };
}

// ---------------------------------------------------------------------------
// NIPOST Client
// ---------------------------------------------------------------------------

class NipostClient {
  private client: AxiosInstance;
  private mockMode: boolean;

  constructor() {
    this.mockMode = MOCK_MODE;

    if (this.mockMode) {
      console.warn('⚠️  NIPOST running in MOCK MODE - NIPOST_API_KEY not configured');
    }

    this.client = axios.create({
      baseURL: NIPOST_BASE_URL,
      headers: {
        'X-API-Key': NIPOST_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Append mock key only in mock mode
    if (this.mockMode) {
      this.client = axios.create({
        baseURL: NIPOST_BASE_URL,
        headers: {
          'X-API-Key': 'nipost_test_mock',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
    }
  }

  /**
   * Validate a Nigerian postcode and retrieve address details.
   * Level 1 = validity only (free); Level 2 = +administrative address;
   * Level 3 = +building use status.
   */
  async lookupPostcode(
    postcode: string,
    level: 1 | 2 | 3 = 1
  ): Promise<NipostLookupResponse> {
    const normalized = postcode.replace(/\s+/g, '').toUpperCase();

    if (this.mockMode) {
      return this.mockPostcodeLookup(normalized, level);
    }

    try {
      const response = await this.client.get<{ data: NipostLookupResponse }>(
        '/v1/lookup',
        { params: { code: normalized, level } }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'NIPOST postcode lookup failed');
    }
  }

  /**
   * Segment-aware autocomplete for partial postcode / address input.
   * Returns matching suggestions for the active segment of the postcode.
   */
  async autocomplete(query: string): Promise<NipostAutocompleteResponse> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { segment: 'state', suggestions: [] };
    }

    if (this.mockMode) {
      return this.mockAutocomplete(trimmed);
    }

    try {
      const response = await this.client.get<{ data: NipostAutocompleteResponse }>(
        '/v1/search/autocomplete',
        { params: { q: trimmed } }
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error, 'NIPOST autocomplete failed');
    }
  }

  /**
   * Validate an address against NIPOST postal records.
   * Returns whether the postal code validates and matches the
   * provided state/LGA.
   */
  async validateAddress(params: {
    postalCode: string;
    state?: string;
    lga?: string;
    address?: string;
  }): Promise<{
    valid: boolean;
    postalCode: string;
    state?: string;
    lga?: string;
    locality?: string;
    buildingUseStatus?: string;
    matches: boolean;
    confidence: 'high' | 'medium' | 'low';
    raw: NipostLookupResponse;
  }> {
    const lookup = await this.lookupPostcode(params.postalCode, 3);

    const matches =
      !params.state ||
      (lookup.administrative_address?.state_name &&
        this.normalize(params.state) === this.normalize(lookup.administrative_address.state_name));

    return {
      valid: lookup.valid,
      postalCode: lookup.postcode,
      state: lookup.administrative_address?.state_name,
      lga: lookup.administrative_address?.lga_name,
      locality: lookup.administrative_address?.locality_name,
      buildingUseStatus: lookup.building_use_status,
      matches,
      confidence: this.calculateConfidence(lookup, params),
      raw: lookup,
    };
  }

  /**
   * Check if client is in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   ** Helper: normalize for comparison
   */
  private normalize(str: string): string {
    return str.toUpperCase().replace(/\s+/g, '');
  }

  /**
   * Helper: calculate confidence based on available data
   */
  private calculateConfidence(
    lookup: NipostLookupResponse,
    params: { state?: string; lga?: string; address?: string }
  ): 'high' | 'medium' | 'low' {
    if (!lookup.valid) return 'low';

    let score = 0;
    if (lookup.administrative_address) score += 1;
    if (params.state && lookup.administrative_address?.state_name) score += 1;
    if (params.lga && lookup.administrative_address?.lga_name) score += 1;
    if (params.address && lookup.recent_house_address?.recent) score += 1;

    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  /**
   * Handle NIPOST API errors
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<NipostError>;
      const apiError = axiosError.response?.data?.error;
      const statusCode = axiosError.response?.status;

      if (statusCode === 401) {
        return new Error('NIPOST_INVALID_API_KEY');
      }
      if (statusCode === 403) {
        return new Error('NIPOST_ACCESS_DENIED: key lacks required scope or level');
      }
      if (statusCode === 402) {
        return new Error('NIPOST_INSUFFICIENT_CREDITS');
      }
      if (statusCode === 429) {
        return new Error('NIPOST_RATE_LIMIT_EXCEEDED');
      }
      if (apiError?.message) {
        return new Error(`NIPOST_ERROR: ${apiError.message}`);
      }
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return new Error('NIPOST_TIMEOUT');
      }
      return new Error(apiError?.message || defaultMessage);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(defaultMessage);
  }

  /**
   * Mock postcode lookup for development
   */
  private mockPostcodeLookup(postcode: string, level: 1 | 2 | 3): NipostLookupResponse {
    console.log(`🔧 MOCK: Looking up postcode ${postcode} (level ${level})`);

    // Map common Nigerian postcodes to their administrative areas
    const mockPostcodes: Record<string, { state_name: string; lga_name: string; locality_name: string }> = {
      '000000': { state_name: 'LAGOS', lga_name: 'LAGOS ISLAND', locality_name: 'VICTORIA ISLAND' },
      '100001': { state_name: 'LAGOS', lga_name: 'LAGOS ISLAND', locality_name: 'VICTORIA ISLAND' },
      '000001': { state_name: 'LAGOS', lga_name: 'MAINLAND', locality_name: 'IKOYE' },
      '000010': { state_name: 'ABUJA', lga_name: 'FCT', locality_name: 'MABUCHI' },
      '001001': { state_name: 'ABUJA', lga_name: 'FCT', locality_name: 'WUSE' },
      '400001': { state_name: 'RIVERS', lga_name: 'PORTHARCOURT', locality_name: 'OBIO' },
      '500001': { state_name: 'AKWA IBOM', lga_name: 'UYO', locality_name: 'EKO' },
      '200001': { state_name: 'OGUN', lga_name: 'ABEOKUTA', locality_name: 'OWO' },
      '200002': { state_name: 'OGUN', lga_name: 'ABEOKUTA', locality_name: 'IDI' },
      '440001': { state_name: 'ENUGU', lga_name: 'ENUGU MUNICIPAL', locality_name: 'GRAFITTI' },
      '260001': { state_name: 'ANAMBRA', lga_name: 'AWKA', locality_name: 'AWKA' },
      '300001': { state_name: 'DELTA', lga_name: 'WARRI', locality_name: 'WARRI' },
      '110001': { state_name: 'BAUCHI', lga_name: 'BAUCHI', locality_name: 'DASS' },
      '303001': { state_name: 'KANO', lga_name: 'KANO MUNICIPAL', locality_name: 'DANBATTA' },
    };

    const normalized = postcode.replace(/\s+/g, '');
    const match = mockPostcodes[normalized] || mockPostcodes[postcode.replace(/-/g, '')];

    if (!match) {
      // Simulate a valid but unknown postcode
      return {
        postcode,
        valid: true,
        administrative_address: undefined,
      };
    }

    const response: NipostLookupResponse = {
      postcode,
      valid: true,
      administrative_address: {
        state: this.normalize(match.state_name),
        state_name: match.state_name,
        lga: this.normalize(match.lga_name),
        lga_name: match.lga_name,
        locality: this.normalize(match.locality_name),
        locality_name: match.locality_name,
        zone: 'SOUTH WEST',
        zone_name: 'South West',
      },
      recent_house_address: level >= 2 ? { recent: 'Mock address for development' } : undefined,
      building_use_status: level >= 3 ? 'residential' : undefined,
    };

    return response;
  }

  /**
   * Mock autocomplete for development
   */
  private mockAutocomplete(query: string): NipostAutocompleteResponse {
    const lower = query.toLowerCase();
    const states = ['LAGOS', 'ABUJA', 'RIVERS', 'OGUN', 'ENUGU', 'AKWA IBOM', 'DELTA', 'BAUCHI', 'ANAMBRA', 'KANO'];
    const suggestions = states
      .filter((s) => s.toLowerCase().includes(lower))
      .map((s) => ({ code: s.substring(0, 2), label: s }))
      .slice(0, 5);

    return {
      segment: 'state',
      suggestions,
    };
  }
}

export const nipost = new NipostClient();

// ---------------------------------------------------------------------------
// Convenience Functions (server-side use)
// ---------------------------------------------------------------------------

/**
 * Validate a Nigerian postcode — returns true/false + normalized code.
 * Server-side helper for quick validity checks.
 */
export async function validatePostcode(postcode: string): Promise<{
  valid: boolean;
  normalized: string;
}> {
  try {
    const result = await nipost.lookupPostcode(postcode, 1);
    return { valid: result.valid, normalized: result.postcode };
  } catch {
    return { valid: false, normalized: postcode.replace(/\s+/g, '').toUpperCase() };
  }
}

/**
 * Validate an address against NIPOST postal records — cross-references
 * the postal code with state/LGA names. Used in Layer 5 of the
 * PropatiBox verification system.
 */
export async function validateAddress(params: {
  postalCode: string;
  state?: string;
  lga?: string;
  address?: string;
}) {
  return nipost.validateAddress(params);
}
