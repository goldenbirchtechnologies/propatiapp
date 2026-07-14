import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import crypto from 'crypto';

export type WalletTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'refund' | 'adjustment' | 'escrow_credit';

export interface CreateWalletParams {
  userId: string;
  currency?: string;
}

export async function getOrCreateWallet(userId: string, currency = 'NGN') {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.wallet.create({ data: { userId, currency } });
}

export async function getWalletBalance(userId: string) {
  const wallet = await getOrCreateWallet(userId);
  return { balance: Number(wallet.balance), walletId: wallet.id, currency: wallet.currency, locked: wallet.isLocked };
}

export async function creditWallet(userId: string, amount: number, type: WalletTransactionType = 'deposit', description?: string, meta?: Record<string, unknown>) {
  if (amount <= 0) throw new Error('Amount must be greater than zero');
  const wallet = await getOrCreateWallet(userId);
  return prisma.$transaction(async (tx) => {
    const current = await tx.wallet.findUnique({ where: { id: wallet.id } });
    const opening = Number(current?.balance ?? 0);
    const closing = opening + amount;
    const reference = `WAL_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.toUpperCase();
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
    const txn = await tx.walletTransaction.create({
      data: { walletId: wallet.id, userId, reference, type, status: 'success', amount, openingBalance: opening, closingBalance: closing, description, meta },
    });
    return { opening, closing, reference, txn };
  });
}

export async function debitWallet(userId: string, amount: number, type: WalletTransactionType = 'withdrawal', description?: string, meta?: Record<string, unknown>) {
  if (amount <= 0) throw new Error('Amount must be greater than zero');
  const wallet = await getOrCreateWallet(userId);
  return prisma.$transaction(async (tx) => {
    const current = await tx.wallet.findUnique({ where: { id: wallet.id } });
    if (current?.isLocked) throw new Error('Wallet is locked');
    const opening = Number(current?.balance ?? 0);
    if (opening < amount) throw new Error('Insufficient wallet balance');
    const closing = opening - amount;
    const reference = `WAL_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.toUpperCase();
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
    const txn = await tx.walletTransaction.create({
      data: { walletId: wallet.id, userId, reference, type, status: 'success', amount, openingBalance: opening, closingBalance: closing, description, meta },
    });
    return { opening, closing, reference, txn };
  });
}

export async function getUserWalletTransactions(userId: string, page = 1, limit = 20) {
  const wallet = await getOrCreateWallet(userId);
  const [items, total] = await prisma.$transaction([
    prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
  ]);
  return { items, total, page, limit };
}

export async function initiateDeposit(userId: string, amountNaira: number) {
  const amountKobo = Math.round(amountNaira * 100);
  if (amountKobo <= 0) throw new Error('Deposit amount must be greater than zero');
  const reference = `WAL_DEP_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.toUpperCase();
  const result = await paystack.initializePayment({
    email: '',
    amount: amountKobo,
    reference,
    metadata: { walletDeposit: true, userId },
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet/deposit/verify?reference=${reference}`,
  });
  return { reference, authorizationUrl: result.data?.authorization_url };
}
