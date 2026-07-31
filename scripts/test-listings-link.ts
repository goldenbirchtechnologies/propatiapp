const { PrismaClient } = require('@prisma/client');

// Mock withAuth to bypass auth in test
jest.mock('@/lib/api-auth', () => ({
  withAuth: async () => ({
    user: {
      id: 'test-user-id',
      clerkId: 'clerk_test',
      email: 'test@example.com',
      role: 'landlord',
      fullName: 'Test User',
    },
  }),
}));

const { POST } = require('@/app/api/orgs/[id]/listings/route');

function makePost(id, body) {
  return new Request(`http://localhost/api/orgs/${id}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function main() {
  const prisma = new PrismaClient();
  
  // Use a real listing ID from DB
  const listing = await prisma.listing.findFirst({
    select: { id: true },
  });
  
  if (!listing) {
    console.log('No listings in DB to test with');
    await prisma.$disconnect();
    return;
  }
  
  console.log('Testing with listingId:', listing.id);
  
  const request = makePost('cms7oiyrv00031j623s531r7v', { listingId: listing.id });
  const params = Promise.resolve({ id: 'cms7oiyrv00031j623s531r7v' });
  
  const response = await POST(request, { params });
  const text = await response.text();
  
  console.log('Status:', response.status);
  console.log('Body:', text);
  
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});
