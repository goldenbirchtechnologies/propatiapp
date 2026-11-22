import { prisma } from '@/lib/prisma';

/** Keep a shortlet reservation in sync with its payment transaction. */
export async function syncShortletBookingPayment(
  transactionId: string,
  outcome: 'paid' | 'failed'
) {
  const booking = await prisma.booking.findFirst({
    where: { transactionId },
    select: { id: true },
  });

  if (!booking) return;

  await prisma.booking.update({
    where: { id: booking.id },
    data: outcome === 'paid'
      ? { paymentStatus: 'paid', status: 'confirmed' }
      : { paymentStatus: 'failed', status: 'cancelled', cancelledAt: new Date() },
  });
}
