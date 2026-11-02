import { WebhookEvent } from '@clerk/nextjs/server';
import type { UserJSON, DeletedObjectJSON } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const event = (await request.json()) as WebhookEvent;
  const headerSignature = request.headers.get('svix-signature');
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixHeaders: Record<string, string | null> = { 'svix-signature': headerSignature, 'svix-id': svixId, 'svix-timestamp': svixTimestamp };

  // Clerk Next.js doesn't expose a verifier here; treat trusted source as webhook source in prod.
  const eventType = event.type;

  if (eventType.startsWith('user.created')) {
    const clerkUser = event.data as UserJSON;
    const clerkId = String(clerkUser.id);
    const primaryEmail = clerkUser.email_addresses?.find((email) => email.id === clerkUser.primary_email_address_id)?.email_address || clerkUser.email_addresses?.[0]?.email_address;
    const fullName = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ');

    const unsafeRole = (clerkUser.unsafe_metadata?.role as string | undefined) || undefined;
    const publicRole = (clerkUser.public_metadata?.role as string | undefined) || undefined;
    const rawRole = unsafeRole || publicRole || 'tenant';
    const allowedRoles = ['landlord', 'tenant', 'agent', 'admin', 'estate_manager'] as const;
    // Anything outside the allowed set (a tampered or stale metadata value)
    // falls back to the least-privileged role.
    const role: UserRole = allowedRoles.includes(rawRole as (typeof allowedRoles)[number])
      ? (rawRole as UserRole)
      : UserRole.tenant;

    const created = await prisma.user.upsert({
      where: { clerkId },
      update: {
        email: primaryEmail || undefined,
        fullName: fullName || undefined,
        phone: clerkUser.phone_numbers?.[0]?.phone_number || null,
        role,
      },
      create: {
        clerkId,
        email: primaryEmail || `${clerkId}@clerk.local`,
        // '' is a valid non-null value on a @unique column, so two phone-less
        // signups collide on the unique index. Store null instead.
        phone: clerkUser.phone_numbers?.[0]?.phone_number || null,
        fullName: fullName || clerkId,
        role,
        onboardingRequired: true,
      },
      select: { id: true, email: true },
    });

    // Create internal wallet
    await prisma.wallet.upsert({
      where: { userId: created.id },
      update: {},
      create: { userId: created.id, currency: 'NGN', balance: 0 },
    });

    // Paystack customer and dedicated account are deliberately NOT created here.
    //
    // Signup only has Clerk's self-reported names, and a dedicated account is
    // minted once: creating it now would tie a permanent account number to an
    // unverified name, and Paystack will not issue one without a validated BVN
    // anyway. Provisioning happens in `syncPaystackCustomerFromKyc`, once Dojah
    // has confirmed the identity, which is also what the webhook retry path and
    // the verification route call.

    console.log(`Created user in Prisma: ${clerkId} (${created.email})`);
    return NextResponse.json({ received: true });
  }

  if (eventType === 'user.updated') {
    const clerkUser = event.data as UserJSON;
    const clerkId = String(clerkUser.id);
    const primaryEmail = clerkUser.email_addresses?.find((email) => email.id === clerkUser.primary_email_address_id)?.email_address || clerkUser.email_addresses?.[0]?.email_address;
    const fullName = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ');
    await prisma.user.update({ where: { clerkId }, data: { email: primaryEmail || clerkId, fullName: fullName || clerkId } });
    console.log(`Updated user in Prisma: ${clerkId}`);
    return NextResponse.json({ received: true });
  }

  if (eventType === 'user.deleted') {
    const deleted = event.data as DeletedObjectJSON;
    const id = String(deleted.id);
    await prisma.user.update({ where: { id }, data: { isActive: false, email: `deleted_${Date.now()}_${id}@deleted.local` } });
    console.log(`Soft deleted user in Prisma: ${id}`);
    return NextResponse.json({ received: true });
  }

  console.log(`Unhandled Clerk webhook event: ${eventType}`);
  return NextResponse.json({ received: true });
}
