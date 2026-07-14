import { NextRequest, NextResponse } from 'next/server';
import { withAuth, requireEstateManager } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

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

    if (!amountNaira || amountNaira <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (!landlordId) return NextResponse.json({ error: 'landlordId is required' }, { status: 400 });

    const managerWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!managerWallet) return NextResponse.json({ error: 'Manager wallet not found' }, { status: 400 });
    const managerBalance = Number(managerWallet.balance);
    if (managerBalance < amountNaira) return NextResponse.json({ error: 'Insufficient manager wallet balance' }, { status: 400 });

    const landlordWallet = await prisma.wallet.findUnique({ where: { userId: landlordId } });
    if (!landlordWallet) return NextResponse.json({ error: 'Landlord wallet not found' }, { status: 404 });

    const txn = await prisma.$transaction(async (tx) => {
      const managerOpening = managerBalance;
      const managerClosing = managerOpening - amountNaira;
      const landlordOpening = Number(landlordWallet.balance);
      const landlordClosing = landlordOpening + amountNaira;

      await tx.wallet.update({ where: { id: managerWallet.id }, data: { balance: managerClosing } });
      const managedTxn = await tx.walletTransaction.create({
        data: { walletId: managerWallet.id, userId: user.id, type: 'transfer', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: managerOpening, closingBalance: managerClosing, description, meta: { toUserId: landlordId, reference: transactionId, flow: 'manager_disbursement' } },
      });

      await tx.wallet.update({ where: { id: landlordWallet.id }, data: { balance: landlordClosing } });
      const landlordTxn = await tx.walletTransaction.create({
        data: { walletId: landlordWallet.id, userId: landlordId, type: 'deposit', status: 'success', amount: amountNaira, currency: 'NGN', openingBalance: landlordOpening, closingBalance: landlordClosing, description: `Disbursement from manager`, meta: { fromUserId: user.id, reference: transactionId } },
      });

      return { managedTxn, landlordTxn };
    });

    return NextResponse.json({ success: true, ...txn });
  } catch {
    return NextResponse.json({ error: 'Disbursement failed' }, { status: 400 });
  }
}
