import { NextRequest, NextResponse } from 'next/server';

const BANK_NAME_TO_CODE: Record<string, string> = {
  access: '044',
  'access-bank': '044',
  gtb: '058',
  gtbank: '058',
  'guaranty-trust': '058',
  firstbank: '011',
  'first-bank': '011',
  zenith: '057',
  uba: '033',
  wema: '035',
  fidelity: '070',
  union: '032',
  ecobank: '050',
  fcmb: '214',
  sterling: '232',
  stanbic: '221',
  polaris: '076',
  unity: '215',
  keystone: '082',
  heritage: '030',
  jaiz: '301',
  taj: '302',
  providus: '101',
  suntrust: '100',
  globus: '00103',
  standardchartered: '068',
  citibank: '023',
};

function normalizeBankCode(input: string): string {
  const trimmed = input.trim();
  if (/^\d{3,6}$/.test(trimmed)) return trimmed;
  const key = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return BANK_NAME_TO_CODE[key] || BANK_NAME_TO_CODE[trimmed.toLowerCase()] || trimmed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get('accountNumber');
  let bankCode = searchParams.get('bankCode');
  if (!accountNumber || !bankCode) return NextResponse.json({ error: 'Missing account details' }, { status: 400 });
  if (!/^\d{10}$/.test(accountNumber.trim())) {
    return NextResponse.json({ error: 'Account number must be 10 digits' }, { status: 400 });
  }
  bankCode = normalizeBankCode(bankCode);
  try {
    const { paystack } = await import('@/lib/paystack');
    if (!paystack.isConfigured()) {
      return NextResponse.json({ error: 'Paystack not configured — set PAYSTACK_SECRET_KEY' }, { status: 503 });
    }
    if (!/^\d{3,6}$/.test(bankCode)) {
      // Try to resolve via banks list as fallback
      try {
        const banksRes: any = await paystack.listBanks();
        const banks: any[] = banksRes?.data || [];
        const match = banks.find((b: any) => b.slug === bankCode || b.code === bankCode || String(b.name || '').toLowerCase().includes(bankCode.toLowerCase()));
        if (match?.code) bankCode = String(match.code);
        else return NextResponse.json({ error: `Unknown bank "${bankCode}". Please select a bank from the list.` }, { status: 400 });
      } catch {
        return NextResponse.json({ error: `Invalid bank code "${bankCode}". Use the 3-digit code (e.g. 044 for Access Bank).` }, { status: 400 });
      }
    }
    const result = await paystack.resolveAccountNumber(accountNumber.trim(), bankCode);
    return NextResponse.json(result);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Failed to resolve account';
    const status = err?.response?.status && err.response.status < 500 ? err.response.status : 502;
    console.error('[paystack/resolve-account] error:', msg, { accountNumber, bankCode });
    return NextResponse.json({ error: msg }, { status: status === 502 ? 400 : status });
  }
}
