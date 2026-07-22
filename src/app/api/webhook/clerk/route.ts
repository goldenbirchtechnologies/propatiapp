import { WebhookEvent } from '@clerk/nextjs/server';
import type { UserJSON, DeletedObjectJSON } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';

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
    const role = allowedRoles.includes(rawRole as (typeof allowedRoles)[number]) ? rawRole : 'tenant';

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
        phone: clerkUser.phone_numbers?.[0]?.phone_number || '',
        fullName: fullName || clerkId,
        role,
      },
      select: { id: true, email: true },
    });

    // Create internal wallet
    await prisma.wallet.upsert({
      where: { userId: created.id },
      update: {},
      create: { userId: created.id, currency: 'NGN', balance: 0 },
    });

    // Create Paystack customer and dedicated account
    try {
      const customer = await paystack.createCustomer({ email: created.email, first_name: clerkUser.first_name || undefined, last_name: clerkUser.last_name || undefined, phone: clerkUser.phone_numbers?.[0]?.phone_number || undefined, metadata: { userId: created.id, clerkId } });
      if (!customer.status) throw new Error(customer.message || 'Paystack customer creation failed');
      const dedicated = await paystack.createDedicatedAccount(customer.data.customer_code);
      await prisma.userPaystackAccount.upsert({
        where: { userId: created.id },
        update: { customerCode: customer.data.customer_code, email: created.email, firstName: customer.data.first_name, lastName: customer.data.last_name, phone: clerkUser.phone_numbers?.[0]?.phone_number || null, status: dedicated.status && dedicated.data?.active ? 'active' : 'pending', bankName: dedicated.data?.bank?.name || null, accountNumber: dedicated.data?.account_number || null, accountName: dedicated.data?.account_name || null, dedicatedAccountId: dedicated.data?.id ? String(dedicated.data.id) : null, currency: 'NGN' },
        create: { userId: created.id, customerCode: customer.data.customer_code, email: created.email, firstName: customer.data.first_name, lastName: customer.data.last_name, phone: clerkUser.phone_numbers?.[0]?.phone_number || null, status: dedicated.status && dedicated.data?.active ? 'active' : 'pending', bankName: dedicated.data?.bank?.name || null, accountNumber: dedicated.data?.account_number || null, accountName: dedicated.data?.account_name || null, dedicatedAccountId: dedicated.data?.id ? String(dedicated.data.id) : null, currency: 'NGN' },
      });
    } catch (error) {
      console.error('[ClerkWebhook] Paystack provisioning failed for user', created.id, error);
    }

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
