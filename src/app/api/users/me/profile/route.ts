import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        ninVerified: true,
        phoneVerified: true,
        idVerified: true,
        idType: true,
        profileBio: true,
        profileCompleted: true,
        guarantorName: true,
        guarantorPhone: true,
        guarantorRelationship: true,
        employmentStatus: true,
        employmentType: true,
        employerName: true,
        jobTitle: true,
        yearlyIncome: true,
        incomeVerified: true,
        agentTier: true,
        agentApproved: true,
        agentBio: true,
        agentAreas: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        orgMemberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                planTier: true,
                maxUnits: true,
                maxSeats: true,
                ownerId: true,
                createdAt: true,
              },
            },
          },
        },
        ownedListings: {
          select: {
            id: true,
            title: true,
            status: true,
            verificationTier: true,
            area: true,
            state: true,
            price: true,
            listingType: true,
            createdAt: true,
            images: { where: { isCover: true }, take: 1 },
          },
        },
        tenantAgreements: {
          select: {
            id: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            listing: { select: { id: true, title: true, area: true } },
          },
        },
        landlordAgreements: {
          select: {
            id: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
            rentAmount: true,
            listing: { select: { id: true, title: true, area: true } },
          },
        },
        sentTransactions: {
          select: {
            id: true,
            type: true,
            status: true,
            amount: true,
            createdAt: true,
            listing: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        receivedTransactions: {
          select: {
            id: true,
            type: true,
            status: true,
            amount: true,
            createdAt: true,
            listing: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        raisedTickets: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            category: true,
            createdAt: true,
            listing: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        notifications: {
          where: { read: false },
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            createdAt: true,
            data: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format transactions
    const formatTransaction = (txn: any) => ({
      ...txn,
      amountFormatted: (Number(txn.amount) / 100).toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
      }),
    });

    return NextResponse.json({
      success: true,
      data: {
        ...fullUser,
        sentTransactions: fullUser.sentTransactions.map(formatTransaction),
        receivedTransactions: fullUser.receivedTransactions.map(formatTransaction),
        unreadNotificationsCount: fullUser.notifications.length,
      },
    });
  } catch (error) {
    console.error('User profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}