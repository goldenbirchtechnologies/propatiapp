import { PrismaClient, UserRole, ListingType, PropertyType, ListingStatus, VerificationTier } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    await prisma.$transaction([
      prisma.emailLog.deleteMany(),
      prisma.screeningCall.deleteMany(),
      prisma.dispute.deleteMany(),
      prisma.orgSubscription.deleteMany(),
      prisma.maintenanceTicket.deleteMany(),
      prisma.orgListing.deleteMany(),
      prisma.orgMember.deleteMany(),
      prisma.organisation.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.message.deleteMany(),
      prisma.conversation.deleteMany(),
      prisma.rentSchedule.deleteMany(),
      prisma.agreementSignature.deleteMany(),
      prisma.agreement.deleteMany(),
      prisma.transaction.deleteMany(),
      prisma.verification.deleteMany(),
      prisma.listingFlag.deleteMany(),
      prisma.savedListing.deleteMany(),
      prisma.listingImage.deleteMany(),
      prisma.listing.deleteMany(),
      prisma.phoneOtp.deleteMany(),
      prisma.passwordReset.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  }

  // Hash password for test users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create test users for each role
  const users = await Promise.all([
    // Admin
    prisma.user.upsert({
      where: { email: 'admin@propati.ng' },
      update: {},
      create: {
        clerkId: 'usr_admin_001',
        email: 'admin@propati.ng',
        fullName: 'Admin User',
        role: 'admin',
        password: passwordHash,
        phoneVerified: true,
        isActive: true,
        profileCompleted: true,
      },
    }),
    // Landlord
    prisma.user.upsert({
      where: { email: 'landlord@propati.ng' },
      update: {},
      create: {
        clerkId: 'usr_landlord_001',
        email: 'landlord@propati.ng',
        fullName: 'Adebayo Adewale',
        role: 'landlord',
        password: passwordHash,
        phone: '+2348012345678',
        phoneVerified: true,
        profileCompleted: true,
        profileBio: 'Property investor with 10+ years experience in Lagos real estate.',
      },
    }),
    // Tenant
    prisma.user.upsert({
      where: { email: 'tenant@propati.ng' },
      update: {},
      create: {
        clerkId: 'usr_tenant_001',
        email: 'tenant@propati.ng',
        fullName: 'Chioma Okafor',
        role: 'tenant',
        password: passwordHash,
        phone: '+2348023456789',
        phoneVerified: true,
        profileCompleted: true,
        employmentStatus: 'employed',
        employmentType: 'full_time',
        employerName: 'TechCorp Nigeria',
        jobTitle: 'Software Engineer',
        yearlyIncome: 600000000, // ₦6M in kobo
        incomeVerified: true,
        guarantorName: 'Mr. Okafor',
        guarantorPhone: '+2348034567890',
        guarantorRelationship: 'Father',
      },
    }),
    // Agent
    prisma.user.upsert({
      where: { email: 'agent@propati.ng' },
      update: {},
      create: {
        clerkId: 'usr_agent_001',
        email: 'agent@propati.ng',
        fullName: 'Kunle Adebayo',
        role: 'agent',
        password: passwordHash,
        phone: '+2348045678901',
        phoneVerified: true,
        agentApproved: true,
        agentTier: 'senior',
        agentBio: 'Licensed real estate agent specializing in Lekki and Victoria Island luxury properties.',
        agentAreas: ['Lekki', 'Victoria Island', 'Ikoyi'],
        profileCompleted: true,
      },
    }),
    // Estate Manager
    prisma.user.upsert({
      where: { email: 'manager@propati.ng' },
      update: {},
      create: {
        clerkId: 'usr_manager_001',
        email: 'manager@propati.ng',
        fullName: 'Funke Adeyemi',
        role: 'estate_manager',
        password: passwordHash,
        phone: '+2348056789012',
        phoneVerified: true,
        profileCompleted: true,
        profileBio: 'Managing 50+ units across Lagos mainland.',
      },
    }),
  ]);

  console.log('✅ Created users');

  const [admin, landlord, tenant, agent, manager] = users;

  // Create test organisation
  const org = await prisma.organisation.upsert({
    where: { id: 'org_test_001' },
    update: {},
    create: {
      id: 'org_test_001',
      name: 'Adeyemi Property Management',
      ownerId: manager.id,
      billingEmail: 'billing@adeyemiprop.ng',
      address: '15 Adeola Odeku, Victoria Island, Lagos',
      cacNumber: 'RC1234567',
      planTier: 'growth',
      maxUnits: 100,
      maxSeats: 5,
    },
  });

  await prisma.orgMember.upsert({
    where: { id: 'mem_test_001' },
    update: {},
    create: {
      id: 'mem_test_001',
      orgId: org.id,
      userId: manager.id,
      role: 'manager',
      status: 'active',
      joinedAt: new Date(),
    },
  });

  console.log('✅ Created organisation');

  // Create test listings
  const listingsData = [
    {
      ownerId: landlord.id,
      agentId: agent.id,
      title: 'Luxury 3BR Apartment in Lekki Phase 1',
      description: 'Stunning 3-bedroom apartment with modern finishes, sea view, 24/7 security, and premium amenities. Perfect for executives and families.',
      listingType: 'rent' as ListingType,
      propertyType: 'apartment' as PropertyType,
      address: '12 Admiralty Way, Lekki Phase 1',
      area: 'Lekki Phase 1',
      state: 'Lagos',
      price: 4500000,
      pricePeriod: 'year',
      cautionDeposit: 450000,
      serviceCharge: 500000,
      bedrooms: 3,
      bathrooms: 3,
      toilets: 4,
      sizeSqm: 180,
      floorLevel: 4,
      furnished: true,
      parkingSpaces: 2,
      amenities: ['AC', 'Generator', 'Pool', 'Gym', 'Security', 'Water Treatment', 'Smart Home'],
      availableFrom: new Date('2024-02-01'),
      status: 'active' as ListingStatus,
      verificationTier: 'certified' as VerificationTier,
      isFeatured: true,
    },
    {
      ownerId: landlord.id,
      title: '2BR Apartment for Sale in Ikeja GRA',
      description: 'Well-maintained 2-bedroom apartment in prime Ikeja GRA. Close to airport, shopping malls, and major roads.',
      listingType: 'sale' as ListingType,
      propertyType: 'apartment' as PropertyType,
      address: '25 Oba Akran Avenue, Ikeja GRA',
      area: 'Ikeja GRA',
      state: 'Lagos',
      price: 85000000,
      pricePeriod: 'total',
      bedrooms: 2,
      bathrooms: 2,
      toilets: 3,
      sizeSqm: 120,
      floorLevel: 2,
      furnished: false,
      parkingSpaces: 1,
      amenities: ['AC', 'Generator', 'Security', 'Water Treatment'],
      status: 'active' as ListingStatus,
      verificationTier: 'verified' as VerificationTier,
    },
    {
      ownerId: landlord.id,
      title: 'Short-Let Studio in Victoria Island',
      description: 'Fully serviced studio apartment for short stays. Walking distance to business district and nightlife.',
      listingType: 'short_let' as ListingType,
      propertyType: 'apartment' as PropertyType,
      address: '8 Kofo Abayomi Street, Victoria Island',
      area: 'Victoria Island',
      state: 'Lagos',
      price: 85000,
      pricePeriod: 'night',
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      sizeSqm: 45,
      floorLevel: 5,
      furnished: true,
      parkingSpaces: 1,
      amenities: ['AC', 'WiFi', 'Generator', 'Pool', 'Gym', 'Security', 'Housekeeping', 'Netflix'],
      minimumStay: 3,
      availableFrom: new Date(),
      status: 'active' as ListingStatus,
      verificationTier: 'inspected' as VerificationTier,
    },
    {
      ownerId: manager.id,
      title: 'Commercial Office Space in Yaba',
      description: 'Modern open-plan office space suitable for tech startups. High-speed internet, meeting rooms, and 24/7 access.',
      listingType: 'rent' as ListingType,
      propertyType: 'office' as PropertyType,
      address: '42 Montgomery Road, Yaba',
      area: 'Yaba',
      state: 'Lagos',
      price: 12000000,
      pricePeriod: 'year',
      serviceCharge: 1200000,
      sizeSqm: 200,
      floorLevel: 3,
      parkingSpaces: 5,
      amenities: ['High-speed Internet', 'Generator', 'AC', 'Security', 'Meeting Rooms', 'Kitchen', 'Parking'],
      status: 'active' as ListingStatus,
      verificationTier: 'verified' as VerificationTier,
    },
    {
      ownerId: landlord.id,
      title: '4BR Duplex in Surulere',
      description: 'Spacious family duplex with large compound, BQ, and modern fittings. Quiet residential area.',
      listingType: 'rent' as ListingType,
      propertyType: 'duplex' as PropertyType,
      address: '15 Adeniran Ogunsanya, Surulere',
      area: 'Surulere',
      state: 'Lagos',
      price: 3200000,
      pricePeriod: 'year',
      cautionDeposit: 320000,
      serviceCharge: 200000,
      bedrooms: 4,
      bathrooms: 4,
      toilets: 5,
      sizeSqm: 280,
      floorLevel: 0,
      furnished: false,
      parkingSpaces: 3,
      amenities: ['AC', 'Generator', 'Borehole', 'Security', 'BQ', 'Large Compound'],
      availableFrom: new Date('2024-03-01'),
      status: 'active' as ListingStatus,
      verificationTier: 'basic' as VerificationTier,
    },
  ];

  const listings = await Promise.all(
    listingsData.map((data) =>
      prisma.listing.create({
        data: {
          ...data,
          id: `lst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        },
      })
    )
  );

  console.log('✅ Created listings');

  // Create verifications for listings
  for (const listing of listings) {
    await prisma.verification.upsert({
      where: { listingId: listing.id },
      update: {},
      create: {
        listingId: listing.id,
        ownerId: listing.ownerId,
        overallStatus: listing.verificationTier === 'certified' ? 'certified' : 'in_progress',
        currentLayer: listing.verificationTier === 'certified' ? 5 : 3,
        l1Status: ['verified', 'inspected', 'certified'].includes(listing.verificationTier) ? 'approved' : 'pending',
        l2Status: ['verified', 'inspected', 'certified'].includes(listing.verificationTier) ? 'approved' : 'pending',
        l3Status: ['inspected', 'certified'].includes(listing.verificationTier) ? 'approved' : 'pending',
        l4Status: ['certified'].includes(listing.verificationTier) ? 'approved' : 'pending',
        l5Status: listing.verificationTier === 'certified' ? 'approved' : 'pending',
        l1DocUrl: 'https://res.cloudinary.com/demo/propati/documents/sample.pdf',
        l2IdType: 'nin',
      },
    });
  }

  console.log('✅ Created verifications');

  // Create some saved listings
  await prisma.savedListing.createMany({
    data: [
      { userId: tenant.id, listingId: listings[0].id },
      { userId: tenant.id, listingId: listings[2].id },
    ],
    skipDuplicates: true,
  });

  // Create sample conversations
  const conversation = await prisma.conversation.create({
    data: {
      listingId: listings[0].id,
      landlordId: landlord.id,
      tenantId: tenant.id,
      subject: 'Inquiry about 3BR Apartment in Lekki',
      status: 'active',
    },
  });

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: tenant.id,
        content: 'Hi, I\'m interested in the 3BR apartment in Lekki. Is it still available?',
      },
      {
        conversationId: conversation.id,
        senderId: landlord.id,
        content: 'Yes, it\'s available! Would you like to schedule a viewing?',
      },
      {
        conversationId: conversation.id,
        senderId: tenant.id,
        content: 'That would be great. How about this Saturday at 10 AM?',
      },
    ],
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: tenant.id,
        type: 'message',
        title: 'New Message',
        body: 'Adebayo Adewale replied to your inquiry about 3BR Apartment in Lekki',
        data: { conversationId: conversation.id, listingId: listings[0].id },
      },
      {
        userId: landlord.id,
        type: 'message',
        title: 'New Inquiry',
        body: 'Chioma Okafor is interested in your property: Luxury 3BR Apartment in Lekki Phase 1',
        data: { conversationId: conversation.id, listingId: listings[0].id },
      },
    ],
  });

  console.log('✅ Created conversations and messages');

  // Create sample transactions
  await prisma.transaction.create({
    data: {
      listingId: listings[0].id,
      payerId: tenant.id,
      payeeId: landlord.id,
      agentId: agent.id,
      type: 'rent',
      status: 'in_escrow',
      amount: 450000000, // ₦4.5M in kobo
      platformFee: 45000000,
      agentCommission: 4500000,
      payeeAmount: 400500000,
      description: 'Annual rent for Luxury 3BR Apartment in Lekki Phase 1',
      reference: 'paystack_ref_' + Date.now(),
    },
  });

  console.log('✅ Created transactions');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });