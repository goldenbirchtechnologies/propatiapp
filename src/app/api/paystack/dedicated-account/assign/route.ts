import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { getVerifiedPayerIdentity, syncPaystackCustomerFromKyc } from '@/lib/verified-identity';

export const runtime = 'nodejs';

const assignSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/, 'BVN must be 11 digits'),
  accountNumber: z.string().regex(/^\d{10,12}$/, 'Account number must be 10–12 digits'),
  bankCode: z.string().regex(/^\d{3,6}$/, 'Bank code is invalid'),
  preferredBank: z.string().min(2).max(80).optional(),
});

/**
 * POST /api/paystack/dedicated-account/assign
 *
 * Narrow, consented payout fallback for Paystack categories that require
 * customer validation. The BVN is forwarded to Paystack in this request and
 * is deliberately not written to PropatiBox storage or logs.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'agent', 'estate_manager']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const kyc = await prisma.userKyc.findUnique({ where: { userId: user.id }, select: { status: true } });
    if (kyc?.status !== 'approved') {
      return NextResponse.json({ error: 'Complete Dojah identity verification first.' }, { status: 403 });
    }

    const parsed = assignSchema.parse(await request.json());
    const payer = await getVerifiedPayerIdentity(user.id);
    if (!payer?.verified || !payer.email || !payer.fullName || !payer.phone) {
      return NextResponse.json({ error: 'A complete Dojah identity profile is required.' }, { status: 409 });
    }

    let existing = await prisma.userPaystackAccount.findUnique({ where: { userId: user.id } });
    if (!existing?.customerCode) {
      await syncPaystackCustomerFromKyc(user.id);
      existing = await prisma.userPaystackAccount.findUnique({ where: { userId: user.id } });
    }
    const nameParts = payer.fullName.trim().split(/\s+/);
    const result = await paystack.assignDedicatedAccount({
      email: payer.email,
      first_name: payer.firstName || nameParts[0] || payer.fullName,
      last_name: payer.lastName || nameParts.slice(1).join(' ') || nameParts[0] || payer.fullName,
      phone: payer.phone,
      preferred_bank: parsed.preferredBank,
      country: 'NG',
      account_number: parsed.accountNumber,
      bank_code: parsed.bankCode,
      bvn: parsed.bvn,
      subaccount: existing?.subaccountCode ?? undefined,
    });

    if (!result.status) {
      return NextResponse.json({ error: result.message || 'Paystack could not validate the payout account.' }, { status: 422 });
    }

    const account = await prisma.userPaystackAccount.upsert({
      where: { userId: user.id },
      update: {
        email: payer.email,
        firstName: payer.firstName,
        lastName: payer.lastName,
        phone: payer.phone,
        ...(result.data?.account_number
          ? {
              status: result.data.active ? 'active' : 'pending',
              bankName: result.data.bank?.name,
              accountNumber: result.data.account_number,
              accountName: result.data.account_name,
              dedicatedAccountId: String(result.data.id),
              currency: result.data.currency,
            }
          : { status: 'pending' }),
      },
      create: {
        userId: user.id,
        email: payer.email,
        firstName: payer.firstName,
        lastName: payer.lastName,
        phone: payer.phone,
        customerCode: existing?.customerCode ?? null,
        status: result.data?.account_number && result.data.active ? 'active' : 'pending',
        bankName: result.data?.bank?.name,
        accountNumber: result.data?.account_number,
        accountName: result.data?.account_name,
        dedicatedAccountId: result.data?.id ? String(result.data.id) : null,
        currency: result.data?.currency ?? 'NGN',
      },
    });

    return NextResponse.json({
      success: true,
      status: result.data?.account_number ? 'active' : 'pending',
      data: account,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payout verification details.', details: error.flatten().fieldErrors }, { status: 400 });
    }
    console.error('[Paystack] Dedicated account assignment failed:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Unable to validate the payout account right now.' }, { status: 502 });
  }
}
