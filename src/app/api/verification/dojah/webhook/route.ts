import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDojahService } from '@/lib/dojah';
import { KycStatus, Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { recordVerifiedIdentity, syncPaystackCustomerFromKyc } from '@/lib/verified-identity';

export const runtime = 'nodejs';

/**
 * POST /api/verification/dojah/webhook
 *
 * Dojah calls this when a widget session finishes. Two signature headers are in
 * circulation — `x-dojah-signature` (HMAC of the body, per-subscription secret)
 * and `x-dojah-signature-v2` (SHA256 of the API secret key) — so both are
 * offered to the verifier and either is enough.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-dojah-signature') || request.headers.get('x-signature');
    const signatureV2 = request.headers.get('x-dojah-signature-v2');

    const dojahService = getDojahService();
    const signatureValid = dojahService.verifyWebhookSignature(rawBody, { signature, signatureV2 });
    if (!signatureValid) {
      console.warn('[Dojah] Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      referenceId?: string;
      reference_id?: string;
      verification_status?: string;
      status?: boolean | string;
      event?: string;
      data?: Record<string, unknown>;
    };

    // Widget callbacks nest the result under `data`; older payloads are flat.
    const body = (payload.data && typeof payload.data === 'object' ? payload.data : payload) as Record<
      string,
      unknown
    >;

    const referenceId =
      readString(body, 'reference_id', 'referenceId') ||
      readString(payload as Record<string, unknown>, 'reference_id', 'referenceId');
    const eventStatus = readString(payload as Record<string, unknown>, 'status', 'event');

    if (!referenceId) {
      return NextResponse.json({ error: 'Missing reference ID' }, { status: 400 });
    }

    const kyc = await prisma.userKyc.findFirst({
      where: { dojahRef: referenceId },
      include: { user: true },
    });

    if (!kyc) {
      console.warn(`[Dojah] Webhook for unknown reference: ${referenceId}`);
      // Acknowledge so Dojah stops retrying an id we never issued.
      return NextResponse.json({ success: true, message: 'Reference not found' }, { status: 200 });
    }

    const attempt = await prisma.verificationAttempt.findUnique({ where: { referenceId } });

    // `Completed` only means the session reached the end — whether the user
    // passed is the boolean `status`. The service owns that reading.
    const mappedStatus = dojahService.mapDojahStatus({
      ...(body as Record<string, unknown>),
      status: body.status ?? eventStatus,
    }) as KycStatus;
    const isFinalStatus = mappedStatus === KycStatus.approved || mappedStatus === KycStatus.rejected;

    const now = new Date();
    const idType = readString(body, 'id_type', 'idType', 'document_type', 'documentType');
    const providerPayloadHash = createHash('sha256').update(rawBody).digest('hex');

    await prisma.$transaction([
      prisma.userKyc.update({
      where: { id: kyc.id },
      data: {
        status: mappedStatus,
        metadata: {
          ...((typeof kyc.metadata === 'object' && kyc.metadata) || {}),
          lastWebhook: {
            referenceId,
            status: mappedStatus,
            receivedAt: now.toISOString(),
          },
        } as unknown as Prisma.InputJsonValue,
        verifiedAt: isFinalStatus && mappedStatus === KycStatus.approved ? now : undefined,
        rejectedAt: isFinalStatus && mappedStatus === KycStatus.rejected ? now : undefined,
        ...(isFinalStatus && mappedStatus === KycStatus.approved
          ? { rejectionReason: null }
          : {}),
      },
      }),
      ...(attempt
        ? [prisma.verificationAttempt.update({
            where: { id: attempt.id },
            data: {
              status: mappedStatus,
              completedAt: isFinalStatus ? now : undefined,
              failureReason: mappedStatus === KycStatus.rejected ? 'Dojah verification was not approved.' : null,
              providerPayloadHash,
            },
          })]
        : []),
      ...(mappedStatus === KycStatus.approved
        ? [prisma.user.update({
            where: { id: kyc.userId },
            data: {
              idVerified: true,
              ...(idType === 'nin' || idType === 'bvn' ? { idType } : {}),
            },
          })]
        : []),
    ]);

    // The widget does not expose a trusted client-side identity result. Once
    // the signed webhook says approved, keep only the normalized identity
    // fields needed by downstream money rails, then sync Paystack. Raw ID
    // numbers are intentionally not copied from the provider payload here.
    let paystackSynced = false;
    if (mappedStatus === KycStatus.approved && (idType === 'nin' || idType === 'bvn')) {
      try {
        await recordVerifiedIdentity({
          userId: kyc.userId,
          role: kyc.user.role,
          identity: {
            type: idType,
            firstName: readString(body, 'first_name', 'firstName', 'firstname'),
            middleName: readString(body, 'middle_name', 'middleName', 'middlename'),
            lastName: readString(body, 'last_name', 'lastName', 'surname', 'lastname'),
            dateOfBirth: readString(body, 'date_of_birth', 'dateOfBirth', 'dob', 'birthdate'),
            gender: readString(body, 'gender'),
            phone: readString(body, 'phone_number', 'phoneNumber', 'phone'),
            referenceId,
            verifiedAt: now.toISOString(),
            source: 'dojah_widget',
          },
        });
        const paystack = await syncPaystackCustomerFromKyc(kyc.userId);
        paystackSynced = paystack.synced;
      } catch (syncError) {
        // KYC remains approved; money-rail provisioning can be retried by the
        // settlement flow without asking the user for their identity number.
        console.error('[Dojah] Downstream identity sync failed:', syncError);
      }
    }

    return NextResponse.json({ success: true, status: mappedStatus, paystackSynced });
  } catch (error) {
    console.error('Dojah webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function readString(node: Record<string, unknown> | undefined, ...keys: string[]): string | undefined {
  if (!node) return undefined;
  for (const key of keys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}
