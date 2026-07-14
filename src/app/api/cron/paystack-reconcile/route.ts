import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accounts = await prisma.userPaystackAccount.findMany({
      where: { status: 'active' },
      select: { id: true, userId: true, customerCode: true, lastSyncedAt: true },
    });

    const results: { userId: string; synced: boolean; error?: string }[] = [];
    for (const account of accounts) {
      try {
        const balance = await paystack.getBalanceByCustomerCode(account.customerCode);
        await prisma.wallet.updateMany({
          where: { userId: account.userId },
          data: {
            balance: balance.available,
            metadata: {
              ...(typeof balance.raw !== 'undefined' ? { paystackRaw: balance.raw } : {}),
              lastSyncAt: new Date().toISOString(),
            } as any,
          },
        });
        results.push({ userId: account.userId, synced: true });
      } catch (error) {
        results.push({ userId: account.userId, synced: false, error: (error as Error).message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
