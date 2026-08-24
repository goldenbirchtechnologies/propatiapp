import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';
import { withRateLimit, webhookRateLimiter, getRateLimitHeaders } from '@/lib/rate-limit';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // Rate limiting for webhook
  const rateLimitResult = await withRateLimit(request, webhookRateLimiter);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(webhookSecret);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle event
  const { type, data } = evt;

  try {
    switch (type) {
      case 'user.created': {
        await handleUserCreated(data);
        break;
      }
      case 'user.updated': {
        await handleUserUpdated(data);
        break;
      }
      case 'user.deleted': {
        await handleUserDeleted(data);
        break;
      }
      default:
        console.log(`Unhandled Clerk event type: ${type}`);
    }

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: rateLimitHeaders });
  }
}

async function handleUserCreated(data: Record<string, unknown>) {
  const clerkId = data.id as string;
  const email = (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
  const firstName = data.first_name as string;
  const lastName = data.last_name as string;
  const phoneNumber = (data.phone_numbers as Array<{ phone_number: string }>)?.[0]?.phone_number;
  const imageUrl = data.image_url as string;
  const publicMetadata = data.public_metadata as Record<string, unknown> | undefined;

  // Role is read from publicMetadata ONLY. unsafeMetadata is writable by the end
  // user from the browser via the Clerk client SDK, so trusting it here would let
  // any user self-assign a role (including admin). 'admin' is additionally never
  // grantable through this webhook; admin promotion is an admin-only server path.
  const allowedRoles = ['landlord', 'tenant', 'agent', 'estate_manager'] as const;
  type AllowedRole = typeof allowedRoles[number];
  const rawRole = publicMetadata?.role as string | undefined;
  const role: AllowedRole = (allowedRoles.includes(rawRole as AllowedRole) ? rawRole : 'tenant') as AllowedRole;

  if (!email) {
    console.warn('User created without email:', clerkId);
    return;
  }

  await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      fullName: `${firstName || ''} ${lastName || ''}`.trim(),
      avatarUrl: imageUrl,
      phone: phoneNumber || null,
      role,
    },
    create: {
      clerkId,
      email,
      fullName: `${firstName || ''} ${lastName || ''}`.trim(),
      avatarUrl: imageUrl,
      phone: phoneNumber || null,
      role,
      password: 'clerk_managed',
      isActive: true,
    },
  });

  console.log(`Synced user created: ${clerkId} (${email})`);
}

async function handleUserUpdated(data: Record<string, unknown>) {
  const clerkId = data.id as string;
  const email = (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
  const firstName = data.first_name as string;
  const lastName = data.last_name as string;
  const phoneNumber = (data.phone_numbers as Array<{ phone_number: string }>)?.[0]?.phone_number;
  const imageUrl = data.image_url as string;

  // Role is intentionally NOT synced on update. Clerk metadata is not the source
  // of truth for authorization; the Prisma `role` column is. Writing role here
  // would (a) let a user self-assign via client-writable unsafeMetadata and
  // (b) clobber a legitimate admin promotion whenever the user edits a profile
  // field. Role changes belong to /api/onboarding/role and the admin route.
  await prisma.user.update({
    where: { clerkId },
    data: {
      email: email ?? undefined,
      fullName: `${firstName || ''} ${lastName || ''}`.trim() || undefined,
      avatarUrl: imageUrl,
      phone: phoneNumber || null,
    },
  });

  console.log(`Synced user updated: ${clerkId}`);
}

async function handleUserDeleted(data: Record<string, unknown>) {
  const clerkId = data.id as string;

  // Soft delete - mark as inactive
  await prisma.user.update({
    where: { clerkId },
    data: { isActive: false },
  });

  console.log(`Synced user deleted (soft): ${clerkId}`);
}