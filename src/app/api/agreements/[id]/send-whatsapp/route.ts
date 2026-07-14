import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/whatsapp/twilio';

const formatCurrency = (amount: number | string | bigint | null | undefined) => {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount || 0);
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
};

const buildAgreementWhatsAppMessage = (agreement: {
  id: string;
  type: string;
  status: string;
  rentAmount: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  listing: { title: string; address?: string | null };
  signatures: { id: string; role: string; signedAt: Date }[];
}) => {
  const signed = agreement.signatures.length > 0;
  const statusLabel = agreement.status.replace(/_/g, ' ').toUpperCase();
  const period =
    agreement.startDate && agreement.endDate
      ? `${new Date(agreement.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(agreement.endDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Dates pending';

  return [
    'PROPATI Agreement Update',
    '',
    `Agreement #${agreement.id.slice(-8).toUpperCase()}`,
    `Property: ${agreement.listing.title}`,
    agreement.listing.address ? `Address: ${agreement.listing.address}` : '',
    `Type: ${agreement.type}`,
    `Status: ${statusLabel}`,
    agreement.rentAmount ? `Rent: ${formatCurrency(agreement.rentAmount)}` : '',
    `Period: ${period}`,
    signed ? `Signatures: ${agreement.signatures.length} recorded` : 'Signatures: pending',
    '',
    'Review and sign quickly on your PROPATI dashboard.',
    `Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/${agreement.type === 'sale' ? 'agent' : 'tenant'}/agreements/${agreement.id}`,
  ]
    .filter(Boolean)
    .join('\n');
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { id } = await params;

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        signatures: { select: { id: true, role: true, signedAt: true } },
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    if (agreement.landlordId !== user.id && agreement.tenantId !== user.id && agreement.agentId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const party = agreement.landlordId === user.id ? agreement.landlord : agreement.tenantId === user.id ? agreement.tenant : agreement.agent;

    if (!party?.phone) {
      return NextResponse.json({ error: 'Missing phone number for delivery' }, { status: 400 });
    }

    const message = buildAgreementWhatsAppMessage(agreement);

    await sendWhatsApp({
      to: party.phone,
      message,
    });

    return NextResponse.json({ success: true, provider: 'twilio', phone: party.phone });
  } catch (error) {
    console.error('Agreement WhatsApp delivery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
