import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireEstateManager } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

// Statutory split applied to a gross rent disbursement mandate. Mirrors the
// rates shown in the disbursement UI (src/app/dashboard/estate-manager/disbursements).
const DEFAULT_RETAINER_RATE = 0.05; // EM management retainer
const DEFAULT_WHT_RATE = 0.025; // withholding tax remittance

const clampRate = (v: unknown, fallback: number): number => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 1) return fallback;
  return n;
};

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  if (!['estate_manager', 'admin'].includes(authResult.user.role || '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { user } = authResult;

  try {
    const body = await request.json();
    const transactionId = String(body.transactionId || body.listingId || '');
    const amountNaira = Number(body.amount);
    const landlordId = String(body.landlordId || '');
    const description = String(body.description || `Disbursement for ${transactionId}`);
    const retainerRate = clampRate(body.retainerRate, DEFAULT_RETAINER_RATE);
    const whtRate = clampRate(body.whtRate, DEFAULT_WHT_RATE);

    if (!amountNaira || amountNaira <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!landlordId) return NextResponse.json({ error: 'landlordId is required' }, { status: 400 });

    // Split the gross mandate. The landlord receives the net; the retainer and
    // WHT are retained in the manager wallet (earned commission + tax held).
    const retainer = Math.round(amountNaira * retainerRate * 100) / 100;
    const wht = Math.round(amountNaira * whtRate * 100) / 100;
    const net = Math.round((amountNaira - retainer - wht) * 100) / 100;
    if (net <= 0) return NextResponse.json({ error: 'Net settlement is zero or negative after fees' }, { status: 400 });

    const managerWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!managerWallet) return NextResponse.json({ error: 'Manager wallet not found' }, { status: 400 });
    const managerBalance = Number(managerWallet.balance);
    // The full gross mandate must be backed by custody funds: net leaves to the
    // landlord, retainer + WHT are retained in the manager wallet.
    if (managerBalance < amountNaira) return NextResponse.json({ error: 'Insufficient manager wallet balance' }, { status: 400 });

    const landlordWallet = await prisma.wallet.findUnique({ where: { userId: landlordId } });
    if (!landlordWallet) return NextResponse.json({ error: 'Landlord wallet not found' }, { status: 404 });

    const splitMeta = {
      reference: transactionId,
      gross: amountNaira,
      retainer,
      wht,
      net,
      retainerRate,
      whtRate,
    };

    const txn = await prisma.$transaction(async (tx) => {
      const managerOpening = managerBalance;
      // Only the net is paid out; retainer + WHT remain in the manager wallet.
      const managerClosing = managerOpening - net;
      const landlordOpening = Number(landlordWallet.balance);
      const landlordClosing = landlordOpening + net;

      await tx.wallet.update({ where: { id: managerWallet.id }, data: { balance: managerClosing } });
      const managedTxn = await tx.walletTransaction.create({
        data: { walletId: managerWallet.id, userId: user.id, type: 'transfer', status: 'success', amount: net, currency: 'NGN', openingBalance: managerOpening, closingBalance: managerClosing, description, meta: { ...splitMeta, toUserId: landlordId, flow: 'manager_disbursement' } },
      });

      await tx.wallet.update({ where: { id: landlordWallet.id }, data: { balance: landlordClosing } });
      const landlordTxn = await tx.walletTransaction.create({
        data: { walletId: landlordWallet.id, userId: landlordId, type: 'deposit', status: 'success', amount: net, currency: 'NGN', openingBalance: landlordOpening, closingBalance: landlordClosing, description: `Disbursement from manager`, meta: { ...splitMeta, fromUserId: user.id, flow: 'manager_disbursement' } },
      });

      return { managedTxn, landlordTxn, split: splitMeta };
    });

    return NextResponse.json({ success: true, ...txn });
  } catch {
    return NextResponse.json({ error: 'Disbursement failed' }, { status: 400 });
  }
}
