import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const agreements = await prisma.agreement.findMany({
      where: { agentId: user.id },
      select: {
        id: true,
        listingId: true,
        landlordId: true,
        tenantId: true,
        agentId: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        rentPeriod: true,
        cautionDeposit: true,
        serviceCharge: true,
        noticePeriodDays: true,
        specialClauses: true,
        landlordSignedAt: true,
        tenantSignedAt: true,
        pdfUrl: true,
        templateVars: true,
        riskTier: true,
        jurisdictionState: true,
        governingStatute: true,
        headTenantVerified: true,
        createdAt: true,
        updatedAt: true,
        finalizedAt: true,
        lockStatus: true,
        integrityChainHash: true,
        lockedBy: true,
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            price: true,
            listingType: true,
            propertyType: true,
            status: true,
          },
        },
        landlord: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        signatures: {
          select: {
            id: true,
            agreementId: true,
            signerId: true,
            role: true,
            ipAddress: true,
            userAgent: true,
            consentText: true,
            signedAt: true,
            checksum: true,
            documentHash: true,
            bindingHash: true,
          },
        },
        rentSchedule: true,
        stampDuty: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: agreements });
  } catch (error) {
    console.error('Agent deals GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
