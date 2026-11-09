import { paystack } from './paystack';

/**
 * Bank directory used by the onboarding settlement steps.
 *
 * Paystack's `/bank` endpoint is the source of truth in a configured
 * environment, but the onboarding form must still render when the key is
 * absent (local development, or a fresh preview deploy). The fallback list
 * carries the banks the resolver map already knows about, so a settlement
 * account can be captured before payments are wired up.
 */

export interface SettlementBank {
  code: string;
  name: string;
}

export const NIGERIAN_BANKS: SettlementBank[] = [
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '023', name: 'Citibank Nigeria' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank (FCMB)' },
  { code: '00103', name: 'Globus Bank' },
  { code: '058', name: 'Guaranty Trust Bank (GTBank)' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '302', name: 'TAJBank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa (UBA)' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank / ALAT' },
  { code: '057', name: 'Zenith Bank' },
  { code: '999991', name: 'Moniepoint MFB' },
  { code: '999992', name: 'OPay Digital Services' },
  { code: '999993', name: 'PalmPay' },
  { code: '999994', name: 'Kuda Microfinance Bank' },
].sort((a, b) => a.name.localeCompare(b.name));

export interface BankDirectory {
  banks: SettlementBank[];
  /** `fallback` means Paystack could not be reached and the static list was used. */
  source: 'paystack' | 'fallback';
}

function normalize(payload: unknown): SettlementBank[] {
  const rows = Array.isArray(payload) ? payload : [];
  const seen = new Set<string>();
  const banks: SettlementBank[] = [];

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const code = typeof record.code === 'string' ? record.code.trim() : '';
    const name = typeof record.name === 'string' ? record.name.trim() : '';
    if (!code || !name || seen.has(code)) continue;
    // A dormant bank cannot receive a settlement split.
    if (record.active === false) continue;
    seen.add(code);
    banks.push({ code, name });
  }

  return banks.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Read the settlement bank directory, degrading to the static list rather than
 * failing the form when Paystack is unavailable.
 */
export async function listSettlementBanks(): Promise<BankDirectory> {
  if (!paystack.isConfigured()) {
    return { banks: NIGERIAN_BANKS, source: 'fallback' };
  }

  try {
    const response = await paystack.listBanks('nigeria');
    const banks = normalize(response?.data);
    if (banks.length === 0) return { banks: NIGERIAN_BANKS, source: 'fallback' };
    return { banks, source: 'paystack' };
  } catch (error) {
    console.error('[banks] Paystack bank list unavailable, using fallback:', error);
    return { banks: NIGERIAN_BANKS, source: 'fallback' };
  }
}

/**
 * Resolve a submitted bank code (or a bank name, for older clients) to its
 * canonical entry. Codes win; names are matched case-insensitively against the
 * directory so "gtbank" and "Guaranty Trust Bank (GTBank)" both land on 058.
 */
export async function resolveBank(input: {
  bankCode?: string | null;
  bankName?: string | null;
}): Promise<SettlementBank | null> {
  const { banks } = await listSettlementBanks();
  const code = (input.bankCode || '').trim();
  const name = (input.bankName || '').trim().toLowerCase();

  if (code) {
    const byCode = banks.find((b) => b.code === code);
    if (byCode) return byCode;
  }

  if (name) {
    const exact = banks.find((b) => b.name.toLowerCase() === name);
    if (exact) return exact;
    const partial = banks.find(
      (b) => b.name.toLowerCase().includes(name) || name.includes(b.name.toLowerCase())
    );
    if (partial) return partial;
  }

  return null;
}
