import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AgreementStatus } from '@prisma/client';
import { paystack } from '@/lib/paystack';

const terminateAgreementSchema = z.object({
  agreementId: z.string().uuid(),
  reason: z.string().min(10).max(500),
  noticeDays: z.number().int().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const validated = terminateAgreementSchema.parse({ ...body, agreementId: id });

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        landlord: { select: { id: true, fullName: true, email: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Only landlord, tenant, or admin can terminate
    const canTerminate =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      user.role === 'admin';

    if (!canTerminate) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Check if agreement can be terminated
    const terminableStatuses = ['fully_signed', 'tenant_signed', 'landlord_signed', 'pending_landlord', 'pending_tenant'];
    if (!terminableStatuses.includes(agreement.status)) {
      return NextResponse.json({ error: `Cannot terminate agreement in ${agreement.status} status` }, { status: 400 });
    }

    // Calculate termination date
    const terminationDate = new Date();
    if (validated.noticeDays) {
      terminationDate.setDate(terminationDate.getDate() + validated.noticeDays);
    }

    const updated = await prisma.agreement.update({
      where: { id },
      data: {
        status: 'terminated',
        specialClauses: `${agreement.specialClauses ?? ''}\n\nTERMINATED: ${validated.reason}\nTerminated by: ${user.fullName} (${user.role})\nTermination date: ${terminationDate.toISOString().split('T')[0]}`,
      },
      include: {
        listing: { select: { id: true, title: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Notify all parties
    for (const party of [agreement.landlord, agreement.tenant, agreement.agent].filter(
      (p): p is { id: string; fullName: string; email: string } => p !== null
    )) {
      await prisma.notification.create({
        data: {
          userId: party.id,
          type: 'agreement',
          title: 'Agreement Terminated',
          body: `The agreement for ${agreement.listing.title} has been terminated. Reason: ${validated.reason}`,
          data: { agreementId: id, status: 'terminated', terminatedBy: user.id },
        },
      });
    }

    // Attempt to release any held agent commission for this agreement
    try {
      const relatedTx = await prisma.transaction.findFirst({
        where: { agreementId: id, agentCommissionStatus: 'held' },
        include: { agent: { select: { id: true } } },
      });
      if (relatedTx && relatedTx.agentId) {
        const commissionNaira = Number(relatedTx.agentCommission || 0) / 100;
        await prisma.$transaction(async (tx) => {
          const wallet = await tx.wallet.findUnique({ where: { userId: relatedTx.agentId } });
          const acct = await tx.userPaystackAccount.findUnique({ where: { userId: relatedTx.agentId } });
          const opening = wallet ? Number(wallet.balance) : 0;
          const closing = opening + commissionNaira;
          if (wallet) await tx.wallet.update({ where: { id: wallet.id }, data: { balance: closing } });
          await tx.walletTransaction.create({
            data: { walletId: wallet?.id ?? '', userId: relatedTx.agentId, type: 'deposit', status: 'success', amount: commissionNaira, currency: 'NGN', openingBalance: opening, closingBalance: closing, description: `Commission release on agreement termination`, meta: { agreementId: id, transactionId: relatedTx.id, flow: 'termination_release' } },
          });
          await tx.transaction.update({ where: { id: relatedTx.id }, data: { agentCommissionStatus: 'released', agentCommissionReleasedAt: new Date(), status: 'released' } });
        });
        const acct = await prisma.userPaystackAccount.findUnique({ where: { userId: relatedTx.agentId } });
        if (acct?.recipientCode) {
          try {
            await paystack.createTransfer({ source: 'balance', amount: Number(relatedTx.agentCommission || 0), recipient: acct.recipientCode, reference: `AGT_COMM_TERM_${relatedTx.id}`, reason: `Agent commission payout for agreement ${id}` });
          } catch { /* swallow transfer errors in terminal flow */ }
        }
        await prisma.notification.create({ data: { userId: relatedTx.agentId, type: 'payment', title: 'Commission Released', body: `Commission released on terminated agreement`, data: { agreementId: id, transactionId: relatedTx.id } } });
      }
    } catch { /* do not block agreement termination */ }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Agreement terminate error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}