import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const agreementTemplates: Record<string, (data: Record<string, any>) => string> = {
  rental: (data) => `
    <h1>RESIDENTIAL TENANCY AGREEMENT</h1>
    <p><strong>Property:</strong> ${data.listingTitle} (${data.listingArea}, ${data.listingState})</p>
    <p><strong>Landlord:</strong> ${data.landlordName} (${data.landlordEmail})</p>
    <p><strong>Tenant:</strong> ${data.tenantName} (${data.tenantEmail})</p>
    <p><strong>Agent:</strong> ${data.agentName ?? 'N/A'}</p>
    <hr/>
    <p><strong>Term:</strong> ${data.startDate} to ${data.endDate ?? 'Open-ended'}</p>
    <p><strong>Rent:</strong> ₦${data.rentAmount?.toLocaleString() ?? 'N/A'} per ${data.rentPeriod ?? 'month'}</p>
    <p><strong>Caution Deposit:</strong> ₦${data.cautionDeposit?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Service Charge:</strong> ₦${data.serviceCharge?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Notice Period:</strong> ${data.noticePeriodDays} days</p>
    ${data.specialClauses ? `<hr/><p><strong>Special Clauses:</strong></p><p>${data.specialClauses}</p>` : ''}
    <hr/>
    <p>By signing this agreement, both parties agree to the terms and conditions outlined above.</p>
  `,
  sale: (data) => `
    <h1>PROPERTY SALE AGREEMENT</h1>
    <p><strong>Property:</strong> ${data.listingTitle} (${data.listingArea}, ${data.listingState})</p>
    <p><strong>Seller (Landlord):</strong> ${data.landlordName} (${data.landlordEmail})</p>
    <p><strong>Buyer (Tenant):</strong> ${data.tenantName} (${data.tenantEmail})</p>
    <p><strong>Agent:</strong> ${data.agentName ?? 'N/A'}</p>
    <hr/>
    <p><strong>Sale Price:</strong> ₦${data.rentAmount?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Deposit:</strong> ₦${data.cautionDeposit?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Completion Date:</strong> ${data.endDate ?? 'TBD'}</p>
    ${data.specialClauses ? `<hr/><p><strong>Special Clauses:</strong></p><p>${data.specialClauses}</p>` : ''}
    <hr/>
    <p>By signing this agreement, both parties agree to the terms and conditions outlined above.</p>
  `,
  short_let: (data) => `
    <h1>SHORT-LET AGREEMENT</h1>
    <p><strong>Property:</strong> ${data.listingTitle} (${data.listingArea}, ${data.listingState})</p>
    <p><strong>Host (Landlord):</strong> ${data.landlordName} (${data.landlordEmail})</p>
    <p><strong>Guest (Tenant):</strong> ${data.tenantName} (${data.tenantEmail})</p>
    <p><strong>Agent:</strong> ${data.agentName ?? 'N/A'}</p>
    <hr/>
    <p><strong>Check-in:</strong> ${data.startDate}</p>
    <p><strong>Check-out:</strong> ${data.endDate}</p>
    <p><strong>Nightly Rate:</strong> ₦${data.rentAmount?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Security Deposit:</strong> ₦${data.cautionDeposit?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Minimum Stay:</strong> ${data.minimumStay ?? '1'} nights</p>
    ${data.specialClauses ? `<hr/><p><strong>Special Clauses:</strong></p><p>${data.specialClauses}</p>` : ''}
    <hr/>
    <p>By signing this agreement, both parties agree to the terms and conditions outlined above.</p>
  `,
  share: (data) => `
    <h1>CO-LIVING / SHARED ACCOMMODATION AGREEMENT</h1>
    <p><strong>Property:</strong> ${data.listingTitle} (${data.listingArea}, ${data.listingState})</p>
    <p><strong>Primary Tenant (Landlord):</strong> ${data.landlordName} (${data.landlordEmail})</p>
    <p><strong>Incoming Tenant:</strong> ${data.tenantName} (${data.tenantEmail})</p>
    <p><strong>Agent:</strong> ${data.agentName ?? 'N/A'}</p>
    <hr/>
    <p><strong>Move-in Date:</strong> ${data.startDate}</p>
    <p><strong>Monthly Rent Share:</strong> ₦${data.rentAmount?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Shared Service Charge:</strong> ₦${data.serviceCharge?.toLocaleString() ?? 'N/A'}</p>
    <p><strong>Notice Period:</strong> ${data.noticePeriodDays} days</p>
    ${data.specialClauses ? `<hr/><p><strong>Special Clauses:</strong></p><p>${data.specialClauses}</p>` : ''}
    <hr/>
    <p>By signing this agreement, both parties agree to the terms and conditions outlined above.</p>
  `,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, area: true, state: true } },
        landlord: { select: { id: true, fullName: true, email: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    // Check permissions
    const isParticipant =
      agreement.landlordId === user.id ||
      agreement.tenantId === user.id ||
      agreement.agentId === user.id ||
      user.role === 'ADMIN';

    if (!isParticipant) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const templateFn = agreementTemplates[agreement.type] || agreementTemplates.rental;

    const templateData = {
      listingTitle: agreement.listing.title,
      listingArea: agreement.listing.area,
      listingState: agreement.listing.state,
      landlordName: agreement.landlord.fullName,
      landlordEmail: agreement.landlord.email,
      tenantName: agreement.tenant.fullName,
      tenantEmail: agreement.tenant.email,
      agentName: agreement.agent?.fullName ?? null,
      startDate: agreement.startDate?.toISOString().split('T')[0] ?? 'TBD',
      endDate: agreement.endDate?.toISOString().split('T')[0] ?? 'TBD',
      rentAmount: agreement.rentAmount ? Number(agreement.rentAmount) : null,
      rentPeriod: agreement.rentPeriod,
      cautionDeposit: agreement.cautionDeposit ? Number(agreement.cautionDeposit) : null,
      serviceCharge: agreement.serviceCharge ? Number(agreement.serviceCharge) : null,
      noticePeriodDays: agreement.noticePeriodDays,
      minimumStay: (agreement as any).minimumStay ?? null,
      specialClauses: agreement.specialClauses,
    };

    const html = templateFn(templateData);

    return NextResponse.json({
      success: true,
      data: {
        html,
        agreementId: agreement.id,
        type: agreement.type,
        status: agreement.status,
      },
    });
  } catch (error) {
    console.error('Agreement preview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}