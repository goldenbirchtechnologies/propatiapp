import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Role, AgentTier } from '@prisma/client';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new SVIX instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response('Error occured -- webhook secret not configured', {
      status: 500,
    });
  }

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook based on event type
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      case 'session.created':
      case 'session.ended':
        // Optional: Track session activity
        break;
      default:
        console.log(`Unhandled Clerk webhook event: ${eventType}`);
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error(`Error handling webhook ${eventType}:`, error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

async function handleUserCreated(data: Record<string, unknown>) {
  const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    image_url,
    phone_numbers,
    public_metadata,
    private_metadata,
    unsafe_metadata,
    created_at,
    updated_at,
  } = data;

  // Get primary email
  const primaryEmail = email_addresses?.[0]?.email_address as string;
  const primaryPhone = phone_numbers?.[0]?.phone_number as string | undefined;

  if (!primaryEmail) {
    console.error('No primary email for user:', clerkId);
    return;
  }

  // Extract role from metadata (set during Clerk onboarding or via admin)
  const role = (public_metadata?.role as Role) || 'TENANT';

  // Extract other metadata
  const ninVerified = public_metadata?.ninVerified as boolean || false;
  const phoneVerified = public_metadata?.phoneVerified as boolean || false;
  const idVerified = public_metadata?.idVerified as boolean || false;
  const profileCompleted = public_metadata?.profileCompleted as boolean || false;
  const agentTier = (public_metadata?.agentTier as AgentTier) || 'STANDARD';
  const agentApproved = public_metadata?.agentApproved as boolean || false;

  // Create user in Prisma
  await prisma.user.create({
    data: {
      clerkId: clerkId as string,
      email: primaryEmail,
      phone: primaryPhone,
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail,
      avatarUrl: image_url as string | null,
      role,
      password: '', // Clerk handles authentication
      ninVerified,
      phoneVerified,
      idVerified,
      profileCompleted,
      agentTier,
      agentApproved,
      isActive: true,
      isBanned: false,
      createdAt: new Date(created_at as number),
      updatedAt: new Date(updated_at as number),
    },
  });

  console.log(`Created user in Prisma: ${clerkId} (${primaryEmail})`);
}

async function handleUserUpdated(data: Record<string, unknown>) {
  const {
    id: clerkId,
    email_addresses,
    first_name,
    last_name,
    image_url,
    phone_numbers,
    public_metadata,
    updated_at,
  } = data;

  // Get primary email
  const primaryEmail = email_addresses?.[0]?.email_address as string;
  const primaryPhone = phone_numbers?.[0]?.phone_number as string | undefined;

  if (!primaryEmail) {
    console.error('No primary email for user:', clerkId);
    return;
  }

  // Extract role from metadata
  const role = (public_metadata?.role as Role) || 'TENANT';

  // Extract other metadata
  const ninVerified = public_metadata?.ninVerified as boolean || false;
  const phoneVerified = public_metadata?.phoneVerified as boolean || false;
  const idVerified = public_metadata?.idVerified as boolean || false;
  const profileCompleted = public_metadata?.profileCompleted as boolean || false;
  const agentTier = (public_metadata?.agentTier as AgentTier) || 'STANDARD';
  const agentApproved = public_metadata?.agentApproved as boolean || false;

  // Update user in Prisma
  await prisma.user.upsert({
    where: { clerkId: clerkId as string },
    update: {
      email: primaryEmail,
      phone: primaryPhone,
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail,
      avatarUrl: image_url as string | null,
      role,
      ninVerified,
      phoneVerified,
      idVerified,
      profileCompleted,
      agentTier,
      agentApproved,
      updatedAt: new Date(updated_at as number),
    },
    create: {
      clerkId: clerkId as string,
      email: primaryEmail,
      phone: primaryPhone,
      fullName: `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail,
      avatarUrl: image_url as string | null,
      role,
      password: '',
      ninVerified,
      phoneVerified,
      idVerified,
      profileCompleted,
      agentTier,
      agentApproved,
      isActive: true,
      isBanned: false,
      createdAt: new Date(updated_at as number),
      updatedAt: new Date(updated_at as number),
    },
  });

  console.log(`Updated user in Prisma: ${clerkId} (${primaryEmail})`);
}

async function handleUserDeleted(data: Record<string, unknown>) {
  const { id: clerkId } = data;

  // Soft delete - mark as inactive and banned
  // This preserves data integrity for references
  await prisma.user.update({
    where: { clerkId: clerkId as string },
    data: {
      isActive: false,
      isBanned: true,
      banReason: 'Account deleted in Clerk',
      email: `deleted_${Date.now()}_${clerkId}@deleted.local`, // Make email unique for soft delete
      clerkId: `deleted_${clerkId}`, // Prefix to allow re-registration with same Clerk ID if needed
    },
  });

  console.log(`Soft deleted user in Prisma: ${clerkId}`);
}