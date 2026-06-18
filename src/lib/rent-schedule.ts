import { prisma } from './prisma';
import { addMonths, differenceInMonths, format, parseISO } from 'date-fns';

export interface RentScheduleEntry {
  agreementId: string;
  dueDate: string; // 'YYYY-MM-DD'
  amount: number;
  status: 'upcoming' | 'paid' | 'overdue';
}

/**
 * Generate rent schedule for an agreement
 * Creates monthly entries from start date to end date
 */
export async function generateRentSchedule(agreementId: string): Promise<RentScheduleEntry[]> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      rentAmount: true,
      serviceCharge: true,
      rentPeriod: true,
      cautionDeposit: true,
    },
  });

  if (!agreement) {
    throw new Error('Agreement not found');
  }

  if (!agreement.startDate || !agreement.endDate || !agreement.rentAmount) {
    throw new Error('Agreement must have start date, end date, and rent amount');
  }

  const entries: RentScheduleEntry[] = [];
  const startDate = new Date(agreement.startDate);
  const endDate = new Date(agreement.endDate);
  const rentAmount = Number(agreement.rentAmount);
  const serviceCharge = agreement.serviceCharge ? Number(agreement.serviceCharge) : 0;
  const totalMonthlyPayment = rentAmount + serviceCharge;

  // Calculate number of months
  const months = differenceInMonths(endDate, startDate) + 1;

  // Generate monthly rent entries
  for (let i = 0; i < months; i++) {
    const dueDate = addMonths(startDate, i);
    const dueDateString = format(dueDate, 'yyyy-MM-dd');

    entries.push({
      agreementId: agreement.id,
      dueDate: dueDateString,
      amount: totalMonthlyPayment,
      status: 'upcoming',
    });
  }

  return entries;
}

/**
 * Create rent schedule entries in the database
 */
export async function createRentScheduleEntries(agreementId: string): Promise<void> {
  const entries = await generateRentSchedule(agreementId);

  // Create all entries in a transaction
  await prisma.$transaction(
    entries.map((entry) =>
      prisma.rentSchedule.create({
        data: {
          agreementId: entry.agreementId,
          dueDate: entry.dueDate,
          amount: entry.amount,
          status: entry.status,
          reminderSent: 0,
        },
      })
    )
  );
}

/**
 * Get rent schedule for an agreement
 */
export async function getRentSchedule(agreementId: string) {
  return prisma.rentSchedule.findMany({
    where: { agreementId },
    orderBy: { dueDate: 'asc' },
    include: {
      transaction: {
        select: {
          id: true,
          reference: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
}

/**
 * Mark a rent schedule entry as paid
 */
export async function markRentScheduleAsPaid(
  rentScheduleId: string,
  transactionId: string
): Promise<void> {
  await prisma.rentSchedule.update({
    where: { id: rentScheduleId },
    data: {
      status: 'paid',
      paidAt: new Date(),
      transactionId,
    },
  });
}

/**
 * Update overdue rent entries
 * Should be called by a cron job daily
 */
export async function updateOverdueRentEntries(): Promise<number> {
  const today = format(new Date(), 'yyyy-MM-dd');

  const result = await prisma.rentSchedule.updateMany({
    where: {
      dueDate: { lt: today },
      status: 'upcoming',
    },
    data: {
      status: 'overdue',
    },
  });

  return result.count;
}

/**
 * Get upcoming rent payments for a user (landlord or tenant)
 */
export async function getUpcomingRentPayments(userId: string, role: 'landlord' | 'tenant') {
  const whereClause = role === 'landlord'
    ? { agreement: { landlordId: userId } }
    : { agreement: { tenantId: userId } };

  return prisma.rentSchedule.findMany({
    where: {
      ...whereClause,
      status: { in: ['upcoming', 'overdue'] },
    },
    orderBy: { dueDate: 'asc' },
    take: 10,
    include: {
      agreement: {
        select: {
          id: true,
          listing: {
            select: {
              id: true,
              title: true,
              area: true,
            },
          },
          landlord: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          tenant: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });
}
