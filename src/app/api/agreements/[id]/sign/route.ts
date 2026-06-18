import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { signAgreementSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { AgreementStatus } from '@prisma/client';
import crypto from 'crypto';

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
    const validated = signAgreementSchema.parse(body);

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

    // Determine signer role
    let signerRole: 'landlord' | 'tenant' | 'agent' | null = null;
    if (agreement.landlordId === user.id) signerRole = 'landlord';
    else if (agreement.tenantId === user.id) signerRole = 'tenant';
    else if (agreement.agentId === user.id) signerRole = 'agent';

    if (!signerRole) {
      return NextResponse.json({ error: 'FORBIDDEN: Not a party to this agreement' }, { status: 403 });
    }

    // Check if already signed by this party
    const existingSignature = await prisma.agreementSignature.findFirst({
      where: { agreementId: id, signerId: user.id, role: signerRole },
    });

    if (existingSignature) {
      return NextResponse.json({ error: 'Already signed by this party' }, { status: 400 });
    }

    // Check agreement status allows signing
    const signableStatuses = ['draft', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'];
    if (!signableStatuses.includes(agreement.status)) {
      return NextResponse.json({ error: `Cannot sign agreement in ${agreement.status} status` }, { status: 400 });
    }

    // Create signature record
    const checksum = crypto
      .createHash('sha256')
      .update(`${agreement.id}${user.id}${new Date().toISOString()}`)
      .digest('hex');

    const signature = await prisma.agreementSignature.create({
      data: {
        agreementId: id,
        signerId: user.id,
        role: signerRole,
        ipAddress: validated.ipAddress ?? null,
        userAgent: validated.userAgent ?? null,
        consentText: validated.consentText,
        checksum,
      },
    });

    // Update agreement status based on who signed
    let newStatus = agreement.status;
    if (signerRole === 'landlord') {
      if (agreement.status === 'draft' || agreement.status === 'pending_landlord') {
        newStatus = agreement.tenantSignedAt ? 'fully_signed' : 'landlord_signed';
      }
      await prisma.agreement.update({
        where: { id },
        data: { landlordSignedAt: new Date(), status: newStatus },
      });
    } else if (signerRole === 'tenant') {
      if (agreement.status === 'draft' || agreement.status === 'pending_tenant') {
        newStatus = agreement.landlordSignedAt ? 'fully_signed' : 'tenant_signed';
      }
      await prisma.agreement.update({
        where: { id },
        data: { tenantSignedAt: new Date(), status: newStatus },
      });
    }

    // Notify other parties
    const notifyUsers = [agreement.landlord, agreement.tenant, agreement.agent]
      .filter((p): p is { id: string; fullName: string; email: string } => p !== null && p.id !== user.id);

    for (const notifyUser of notifyUsers) {
      await prisma.notification.create({
        data: {
          userId: notifyUser.id,
          type: 'agreement',
          title: 'Agreement Signed',
          body: `${user.fullName} has signed the agreement for ${agreement.listing.title}.`,
          data: { agreementId: id, signerRole },
        },
      });
    }

    // If fully signed, notify all parties
    if (newStatus === 'fully_signed') {
      for (const notifyUser of [agreement.landlord, agreement.tenant, agreement.agent].filter(
        (p): p is { id: string; fullName: string; email: string } => p !== null
      )) {
        await prisma.notification.create({
          data: {
            userId: notifyUser.id,
            type: 'agreement',
            title: 'Agreement Fully Signed',
            body: `The agreement for ${agreement.listing.title} is now fully signed by all parties.`,
            data: { agreementId: id, status: 'fully_signed' },
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: signature, status: newStatus });
  } catch (error) {
    console.error('Agreement sign error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}