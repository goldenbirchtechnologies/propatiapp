// ===========================================================================
// PROPATI — Prisma Seed Script
// Generates comprehensive test data for all 5 user roles
// ===========================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function generateClerkId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 15)}`;
}

// ===========================================================================
// MAIN SEED FUNCTION
// ===========================================================================

async function main() {
  console.log('🌱 Starting PROPATI database seed...\n');

  // Clean up existing data (development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Cleaning up existing data...');
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
    console.log('✅ Cleanup complete\n');
  }

  // ---------------------------------------------------------------------------
  // 1. CREATE 5 TEST USERS (one per role)
  // ---------------------------------------------------------------------------
  console.log('👥 Creating test users...');

  const hashedPassword = await hashPassword('Test123!@#');

  const landlordUser = await prisma.user.create({
    data: {
      clerkId: generateClerkId('user'),
      email: 'landlord@propati.ng',
      phone: '+2348012345671',
      password: hashedPassword,
      role: 'landlord',
      fullName: 'Chukwudi Okonkwo',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chukwudi',
      phoneVerified: true,
      idVerified: true,
      idType: 'nin',
      profileCompleted: true,
      isActive: true,
    },
  });

  const tenantUser = await prisma.user.create({
    data: {
      clerkId: generateClerkId('user'),
      email: 'tenant@propati.ng',
      phone: '+2348012345672',
      password: hashedPassword,
      role: 'tenant',
      fullName: 'Amina Bello',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amina',
      phoneVerified: true,
      idVerified: true,
      idType: 'bvn',
      employmentStatus: 'employed',
      employmentType: 'full_time',
      employerName: 'Zenith Bank PLC',
      jobTitle: 'Senior Banking Officer',
      yearlyIncome: BigInt(7200000), // ₦7.2M per year
      incomeVerified: true,
      profileBio: 'Banking professional looking for modern apartment in secure area.',
      profileCompleted: true,
      guarantorName: 'Ibrahim Bello',
      guarantorPhone: '+2348098765432',
      guarantorRelationship: 'Brother',
      isActive: true,
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      clerkId: generateClerkId('user'),
      email: 'agent@propati.ng',
      phone: '+2348012345673',
      password: hashedPassword,
      role: 'agent',
      fullName: 'Tunde Adeyemi',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tunde',
      phoneVerified: true,
      idVerified: true,
      idType: 'drivers_licence',
      agentTier: 'senior',
      agentApproved: true,
      agentBio: 'Licensed property agent with 5+ years experience in Lagos real estate market.',
      agentAreas: ['Lekki', 'Victoria Island', 'Ikoyi', 'Ikeja'],
      profileCompleted: true,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      clerkId: generateClerkId('user'),
      email: 'admin@propati.ng',
      phone: '+2348012345674',
      password: hashedPassword,
      role: 'admin',
      fullName: 'Ngozi Eze',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ngozi',
      phoneVerified: true,
      idVerified: true,
      profileCompleted: true,
      isActive: true,
    },
  });

  const estateManagerUser = await prisma.user.create({
    data: {
      clerkId: generateClerkId('user'),
      email: 'manager@propati.ng',
      phone: '+2348012345675',
      password: hashedPassword,
      role: 'estate_manager',
      fullName: 'Oluwaseun Adeleke',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seun',
      phoneVerified: true,
      idVerified: true,
      profileCompleted: true,
      isActive: true,
    },
  });

  console.log('✅ Created 5 test users\n');

  // ---------------------------------------------------------------------------
  // 2. CREATE 3 ESTATE MANAGEMENT ORGANIZATIONS
  // ---------------------------------------------------------------------------
  console.log('🏢 Creating estate management organizations...');

  const organization1 = await prisma.organisation.create({
    data: {
      name: 'Lagos Prime Estates Limited',
      ownerId: estateManagerUser.id,
      billingEmail: 'billing@lagosprime.ng',
      address: '45 Admiralty Way, Lekki Phase 1, Lagos',
      cacNumber: 'RC1234567',
      planTier: 'growth',
      maxUnits: 50,
      maxSeats: 5,
    },
  });

  const organization2 = await prisma.organisation.create({
    data: {
      name: 'Victoria Gardens Management',
      ownerId: landlordUser.id,
      billingEmail: 'accounts@vicgardens.ng',
      address: '12 Adeola Odeku Street, Victoria Island, Lagos',
      cacNumber: 'RC2345678',
      planTier: 'starter',
      maxUnits: 20,
      maxSeats: 1,
    },
  });

  const organization3 = await prisma.organisation.create({
    data: {
      name: 'Mainland Property Solutions',
      ownerId: estateManagerUser.id,
      billingEmail: 'info@mainlandps.ng',
      address: '89 Allen Avenue, Ikeja, Lagos',
      cacNumber: 'RC3456789',
      planTier: 'enterprise',
      maxUnits: 200,
      maxSeats: 15,
    },
  });

  // Add organization members
  await prisma.orgMember.create({
    data: {
      orgId: organization1.id,
      userId: agentUser.id,
      role: 'manager',
      status: 'active',
      joinedAt: new Date(),
    },
  });

  console.log('✅ Created 3 organizations with members\n');

  // ---------------------------------------------------------------------------
  // 3. CREATE 10 DIVERSE LISTINGS
  // ---------------------------------------------------------------------------
  console.log('🏠 Creating test listings...');

  // Listing 1: Basic Tier - Rent Apartment (Ikeja)
  const listing1 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      title: 'Modern 2-Bedroom Apartment in Ikeja',
      description: 'Spacious 2-bedroom apartment with modern amenities. Located in secure estate with 24/7 power supply.',
      listingType: 'rent',
      propertyType: 'apartment',
      address: '23 Mobolaji Johnson Avenue, Ikeja GRA',
      area: 'Ikeja',
      state: 'Lagos',
      price: 1200000, // ₦1.2M/year
      pricePeriod: 'year',
      cautionDeposit: 600000,
      serviceCharge: 150000,
      bedrooms: 2,
      bathrooms: 2,
      toilets: 3,
      sizeSqm: 85,
      floorLevel: 3,
      furnished: false,
      parkingSpaces: 1,
      amenities: ['Security', 'Generator', 'Water', 'Parking'],
      availableFrom: new Date('2025-07-01'),
      status: 'active',
      verificationTier: 'basic',
      viewsCount: 45,
    },
  });

  await prisma.listingImage.createMany({
    data: [
      {
        listingId: listing1.id,
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        isCover: true,
        sortOrder: 1,
      },
      {
        listingId: listing1.id,
        url: 'https://images.unsplash.com/photo-1502672260066-6bc35f0aaef8?w=800',
        isCover: false,
        sortOrder: 2,
      },
    ],
  });

  // Listing 2: Verified Tier - Sale House (Lekki)
  const listing2 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      agentId: agentUser.id,
      title: 'Luxury 4-Bedroom Detached Duplex',
      description: 'Beautifully finished 4-bedroom detached duplex in premium Lekki estate. All rooms ensuite, BQ, swimming pool.',
      listingType: 'sale',
      propertyType: 'duplex',
      address: '15 Admiralty Road, Lekki Phase 1',
      area: 'Lekki',
      state: 'Lagos',
      price: 85000000, // ₦85M
      pricePeriod: 'total',
      bedrooms: 4,
      bathrooms: 5,
      toilets: 6,
      sizeSqm: 350,
      furnished: true,
      parkingSpaces: 3,
      amenities: ['Swimming Pool', 'BQ', 'Security', 'Gym', 'Garden', '24hr Power'],
      status: 'active',
      verificationTier: 'verified',
      isFeatured: true,
      viewsCount: 234,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing2.id,
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  await prisma.verification.create({
    data: {
      listingId: listing2.id,
      ownerId: landlordUser.id,
      l1Status: 'approved',
      l1DocUrl: 'https://storage.propati.ng/docs/cert_123.pdf',
      l1SubmittedAt: new Date('2025-06-01'),
      l2Status: 'approved',
      l2IdType: 'nin',
      l2VerifiedAt: new Date('2025-06-02'),
      l3Status: 'pending',
      currentLayer: 3,
      overallStatus: 'in_progress',
    },
  });

  // Listing 3: Inspected Tier - Rent Apartment (Victoria Island)
  const listing3 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      agentId: agentUser.id,
      title: 'Premium 3-Bedroom Serviced Apartment',
      description: 'Fully serviced 3-bedroom apartment in the heart of Victoria Island. Ocean view, 5-star amenities.',
      listingType: 'rent',
      propertyType: 'apartment',
      address: '8 Ligali Ayorinde Street, Victoria Island',
      area: 'Victoria Island',
      state: 'Lagos',
      price: 4500000, // ₦4.5M/year
      pricePeriod: 'year',
      cautionDeposit: 2250000,
      serviceCharge: 800000,
      bedrooms: 3,
      bathrooms: 4,
      toilets: 4,
      sizeSqm: 180,
      floorLevel: 12,
      furnished: true,
      parkingSpaces: 2,
      amenities: ['Concierge', 'Gym', 'Pool', 'Security', 'Generator', 'Elevator', 'Ocean View'],
      availableFrom: new Date('2025-08-01'),
      status: 'active',
      verificationTier: 'inspected',
      isFeatured: true,
      viewsCount: 567,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing3.id,
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  await prisma.verification.create({
    data: {
      listingId: listing3.id,
      ownerId: landlordUser.id,
      l1Status: 'approved',
      l1DocUrl: 'https://storage.propati.ng/docs/cert_124.pdf',
      l1SubmittedAt: new Date('2025-05-10'),
      l2Status: 'approved',
      l2IdType: 'nin',
      l2VerifiedAt: new Date('2025-05-11'),
      l3Status: 'approved',
      l3VideoUrl: 'https://storage.propati.ng/videos/tour_124.mp4',
      l4Status: 'approved',
      l4AgentId: agentUser.id,
      l4ScheduledAt: new Date('2025-05-15'),
      l4CompletedAt: new Date('2025-05-15'),
      l4ReportUrl: 'https://storage.propati.ng/reports/inspection_124.pdf',
      l5Status: 'pending',
      currentLayer: 5,
      overallStatus: 'in_progress',
    },
  });

  // Listing 4: Certified Tier - Sale Land (Ibeju-Lekki)
  const listing4 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      agentId: agentUser.id,
      title: 'Prime Beachfront Land - 2000sqm',
      description: 'Certified beachfront land with C of O. Perfect for residential or commercial development. Direct beach access.',
      listingType: 'sale',
      propertyType: 'land',
      address: 'Lekki-Epe Expressway, Ibeju-Lekki',
      area: 'Ibeju-Lekki',
      state: 'Lagos',
      price: 120000000, // ₦120M
      pricePeriod: 'total',
      sizeSqm: 2000,
      amenities: ['Beach Access', 'C of O', 'Perimeter Fence', 'Gated Estate'],
      status: 'active',
      verificationTier: 'certified',
      isFeatured: true,
      viewsCount: 892,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing4.id,
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  await prisma.verification.create({
    data: {
      listingId: listing4.id,
      ownerId: landlordUser.id,
      l1Status: 'approved',
      l1DocUrl: 'https://storage.propati.ng/docs/cert_125.pdf',
      l1SubmittedAt: new Date('2025-04-01'),
      l2Status: 'approved',
      l2IdType: 'nin',
      l2VerifiedAt: new Date('2025-04-02'),
      l3Status: 'approved',
      l3VideoUrl: 'https://storage.propati.ng/videos/tour_125.mp4',
      l4Status: 'approved',
      l4AgentId: agentUser.id,
      l4ScheduledAt: new Date('2025-04-10'),
      l4CompletedAt: new Date('2025-04-10'),
      l4ReportUrl: 'https://storage.propati.ng/reports/inspection_125.pdf',
      l5Status: 'approved',
      currentLayer: 5,
      overallStatus: 'certified',
      reviewedBy: adminUser.id,
      reviewedAt: new Date('2025-04-15'),
      adminNotes: 'All documentation verified. Title documents authentic. Property inspected and certified.',
    },
  });

  // Listing 5: Short-let Apartment (Lekki)
  const listing5 = await prisma.listing.create({
    data: {
      ownerId: estateManagerUser.id,
      title: 'Cozy 1-Bedroom Shortlet Apartment',
      description: 'Fully furnished shortlet apartment perfect for business travelers. Fast WiFi, Netflix, kitchen.',
      listingType: 'short_let',
      propertyType: 'apartment',
      address: '34 Orchid Hotel Road, Lekki',
      area: 'Lekki',
      state: 'Lagos',
      price: 35000, // ₦35k/night
      pricePeriod: 'night',
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      sizeSqm: 45,
      floorLevel: 2,
      furnished: true,
      parkingSpaces: 1,
      amenities: ['WiFi', 'Netflix', 'Generator', 'Security', 'Kitchen'],
      availableFrom: new Date('2025-06-20'),
      minimumStay: 2,
      status: 'active',
      verificationTier: 'verified',
      viewsCount: 178,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing5.id,
      url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  // Listing 6: Room Share (Yaba)
  const listing6 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      title: 'Single Room in Shared 3-Bedroom Flat',
      description: 'Single room available in shared flat. Ideal for young professionals. Shared kitchen and living room.',
      listingType: 'share',
      propertyType: 'apartment',
      address: '67 Herbert Macaulay Way, Yaba',
      area: 'Yaba',
      state: 'Lagos',
      price: 300000, // ₦300k/year
      pricePeriod: 'year',
      cautionDeposit: 150000,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      sizeSqm: 12,
      furnished: false,
      parkingSpaces: 0,
      amenities: ['Shared Kitchen', 'WiFi', 'Security'],
      availableFrom: new Date('2025-07-01'),
      status: 'active',
      verificationTier: 'basic',
      viewsCount: 89,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing6.id,
      url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  // Listing 7: Commercial Office Space (Ikeja)
  const listing7 = await prisma.listing.create({
    data: {
      ownerId: estateManagerUser.id,
      title: 'Grade A Office Space - 500sqm',
      description: 'Premium office space in commercial district. Ideal for corporate headquarters or regional office.',
      listingType: 'commercial',
      propertyType: 'office',
      address: '21 Oba Akran Avenue, Ikeja',
      area: 'Ikeja',
      state: 'Lagos',
      price: 12000000, // ₦12M/year
      pricePeriod: 'year',
      serviceCharge: 2000000,
      sizeSqm: 500,
      floorLevel: 5,
      furnished: false,
      parkingSpaces: 10,
      amenities: ['Elevator', 'Central AC', 'Generator', 'Security', 'Conference Rooms', 'Cafeteria'],
      availableFrom: new Date('2025-09-01'),
      status: 'active',
      verificationTier: 'inspected',
      viewsCount: 312,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing7.id,
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  // Listing 8: Commercial Shop (Surulere)
  const listing8 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      title: 'Spacious Shop Space in Busy Plaza',
      description: 'Ground floor shop in high-traffic plaza. Perfect for retail business, restaurant, or pharmacy.',
      listingType: 'commercial',
      propertyType: 'shop',
      address: '45 Adeniran Ogunsanya Street, Surulere',
      area: 'Surulere',
      state: 'Lagos',
      price: 1500000, // ₦1.5M/year
      pricePeriod: 'year',
      cautionDeposit: 750000,
      sizeSqm: 65,
      floorLevel: 0,
      furnished: false,
      parkingSpaces: 2,
      amenities: ['High Foot Traffic', 'Security', 'Parking', 'Generator'],
      availableFrom: new Date('2025-07-15'),
      status: 'active',
      verificationTier: 'verified',
      viewsCount: 156,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing8.id,
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  // Listing 9: Warehouse (Apapa)
  const listing9 = await prisma.listing.create({
    data: {
      ownerId: estateManagerUser.id,
      title: 'Industrial Warehouse - 2000sqm',
      description: 'Large warehouse facility near port. High ceiling, loading dock, office space included.',
      listingType: 'commercial',
      propertyType: 'warehouse',
      address: 'Creek Road, Apapa',
      area: 'Apapa',
      state: 'Lagos',
      price: 18000000, // ₦18M/year
      pricePeriod: 'year',
      serviceCharge: 1500000,
      sizeSqm: 2000,
      parkingSpaces: 20,
      amenities: ['Loading Dock', 'Office Space', 'High Ceiling', 'Security', 'Generator'],
      availableFrom: new Date('2025-08-01'),
      status: 'active',
      verificationTier: 'basic',
      viewsCount: 67,
    },
  });

  await prisma.listingImage.create({
    data: {
      listingId: listing9.id,
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      isCover: true,
      sortOrder: 1,
    },
  });

  // Listing 10: Draft Listing (not yet published)
  const listing10 = await prisma.listing.create({
    data: {
      ownerId: landlordUser.id,
      title: '5-Bedroom Mansion in Ikoyi',
      description: 'Luxurious 5-bedroom mansion with cinema room, wine cellar, and elevator. Work in progress.',
      listingType: 'sale',
      propertyType: 'house',
      address: 'Alexander Avenue, Ikoyi',
      area: 'Ikoyi',
      state: 'Lagos',
      price: 250000000, // ₦250M
      pricePeriod: 'total',
      bedrooms: 5,
      bathrooms: 6,
      toilets: 7,
      sizeSqm: 600,
      furnished: true,
      parkingSpaces: 5,
      amenities: ['Cinema', 'Wine Cellar', 'Elevator', 'Pool', 'Gym', 'BQ', 'Generator'],
      status: 'draft',
      verificationTier: 'basic',
      viewsCount: 0,
    },
  });

  // Link some listings to organizations
  await prisma.orgListing.createMany({
    data: [
      { orgId: organization1.id, listingId: listing5.id },
      { orgId: organization1.id, listingId: listing7.id },
      { orgId: organization3.id, listingId: listing9.id },
    ],
  });

  console.log('✅ Created 10 diverse listings with images\n');

  // ---------------------------------------------------------------------------
  // 4. CREATE SAMPLE AGREEMENTS
  // ---------------------------------------------------------------------------
  console.log('📝 Creating sample agreements...');

  const agreement1 = await prisma.agreement.create({
    data: {
      listingId: listing3.id,
      landlordId: landlordUser.id,
      tenantId: tenantUser.id,
      agentId: agentUser.id,
      type: 'rental',
      status: 'fully_signed',
      startDate: new Date('2025-08-01'),
      endDate: new Date('2026-07-31'),
      rentAmount: 4500000,
      rentPeriod: 'yearly',
      cautionDeposit: 2250000,
      serviceCharge: 800000,
      noticePeriodDays: 60,
      specialClauses: 'Tenant responsible for minor repairs. No subletting allowed.',
      landlordSignedAt: new Date('2025-06-10'),
      tenantSignedAt: new Date('2025-06-11'),
    },
  });

  await prisma.agreementSignature.createMany({
    data: [
      {
        agreementId: agreement1.id,
        signerId: landlordUser.id,
        role: 'landlord',
        ipAddress: '102.89.23.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        consentText: 'I agree to the terms and conditions of this rental agreement',
        signedAt: new Date('2025-06-10'),
      },
      {
        agreementId: agreement1.id,
        signerId: tenantUser.id,
        role: 'tenant',
        ipAddress: '102.89.23.67',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        consentText: 'I agree to the terms and conditions of this rental agreement',
        signedAt: new Date('2025-06-11'),
      },
    ],
  });

  const agreement2 = await prisma.agreement.create({
    data: {
      listingId: listing1.id,
      landlordId: landlordUser.id,
      tenantId: tenantUser.id,
      type: 'rental',
      status: 'pending_tenant',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2026-06-30'),
      rentAmount: 1200000,
      rentPeriod: 'yearly',
      cautionDeposit: 600000,
      serviceCharge: 150000,
      noticePeriodDays: 30,
      landlordSignedAt: new Date('2025-06-15'),
    },
  });

  await prisma.agreementSignature.create({
    data: {
      agreementId: agreement2.id,
      signerId: landlordUser.id,
      role: 'landlord',
      ipAddress: '102.89.23.45',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      consentText: 'I agree to the terms and conditions of this rental agreement',
      signedAt: new Date('2025-06-15'),
    },
  });

  console.log('✅ Created 2 agreements with signatures\n');

  // ---------------------------------------------------------------------------
  // 5. CREATE SAMPLE TRANSACTIONS
  // ---------------------------------------------------------------------------
  console.log('💰 Creating sample transactions...');

  await prisma.transaction.create({
    data: {
      reference: 'PSTK_txn_12345678',
      listingId: listing3.id,
      payerId: tenantUser.id,
      payeeId: landlordUser.id,
      agentId: agentUser.id,
      type: 'rent',
      status: 'released',
      amount: BigInt(4500000 * 100), // ₦4.5M in kobo
      platformFee: BigInt(225000 * 100), // 5%
      agentCommission: BigInt(450000 * 100), // 10%
      payeeAmount: BigInt(3825000 * 100),
      description: 'Annual rent payment for 3-bedroom apartment',
      paystackData: {
        authorization: { authorization_code: 'AUTH_abcd1234' },
        customer: { email: 'tenant@propati.ng' },
      },
    },
  });

  await prisma.transaction.create({
    data: {
      reference: 'PSTK_txn_23456789',
      listingId: listing3.id,
      payerId: tenantUser.id,
      payeeId: landlordUser.id,
      type: 'caution',
      status: 'in_escrow',
      amount: BigInt(2250000 * 100), // ₦2.25M in kobo
      platformFee: BigInt(0),
      agentCommission: BigInt(0),
      description: 'Caution deposit - held in escrow',
    },
  });

  console.log('✅ Created 2 transactions\n');

  // ---------------------------------------------------------------------------
  // 6. CREATE SAMPLE CONVERSATIONS & MESSAGES
  // ---------------------------------------------------------------------------
  console.log('💬 Creating sample conversations...');

  const conversation1 = await prisma.conversation.create({
    data: {
      listingId: listing3.id,
      landlordId: landlordUser.id,
      tenantId: tenantUser.id,
      subject: 'Inquiry about 3-bedroom apartment',
      lastMessage: 'Yes, the apartment is still available. Would you like to schedule a viewing?',
      lastMessageAt: new Date('2025-06-05T14:30:00Z'),
      unreadTenant: 1,
      unreadLandlord: 0,
      status: 'active',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderId: tenantUser.id,
        content: 'Hello! I am interested in the 3-bedroom apartment on Victoria Island. Is it still available?',
        isRead: true,
        readAt: new Date('2025-06-05T10:15:00Z'),
        createdAt: new Date('2025-06-05T10:00:00Z'),
      },
      {
        conversationId: conversation1.id,
        senderId: landlordUser.id,
        content: 'Good morning! Yes, the apartment is still available. It comes fully furnished with all amenities mentioned in the listing.',
        isRead: true,
        readAt: new Date('2025-06-05T11:00:00Z'),
        createdAt: new Date('2025-06-05T10:30:00Z'),
      },
      {
        conversationId: conversation1.id,
        senderId: tenantUser.id,
        content: 'Great! Can I schedule a viewing this weekend?',
        isRead: true,
        readAt: new Date('2025-06-05T14:00:00Z'),
        createdAt: new Date('2025-06-05T13:45:00Z'),
      },
      {
        conversationId: conversation1.id,
        senderId: landlordUser.id,
        content: 'Yes, the apartment is still available. Would you like to schedule a viewing?',
        isRead: false,
        createdAt: new Date('2025-06-05T14:30:00Z'),
      },
    ],
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      listingId: listing2.id,
      landlordId: landlordUser.id,
      tenantId: tenantUser.id,
      subject: 'Questions about duplex for sale',
      lastMessage: 'I need to discuss with my family first. Can I get back to you next week?',
      lastMessageAt: new Date('2025-06-08T16:20:00Z'),
      unreadTenant: 0,
      unreadLandlord: 1,
      status: 'active',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation2.id,
        senderId: tenantUser.id,
        content: 'Hi, I saw the duplex listing in Lekki. Is the price negotiable?',
        isRead: true,
        readAt: new Date('2025-06-08T11:00:00Z'),
        createdAt: new Date('2025-06-08T10:30:00Z'),
      },
      {
        conversationId: conversation2.id,
        senderId: landlordUser.id,
        content: 'Hello! The property is priced fairly based on the current market. However, we can discuss further after viewing.',
        isRead: true,
        readAt: new Date('2025-06-08T16:00:00Z'),
        createdAt: new Date('2025-06-08T14:15:00Z'),
      },
      {
        conversationId: conversation2.id,
        senderId: tenantUser.id,
        content: 'I need to discuss with my family first. Can I get back to you next week?',
        isRead: false,
        createdAt: new Date('2025-06-08T16:20:00Z'),
      },
    ],
  });

  console.log('✅ Created 2 conversations with 7 messages\n');

  // ---------------------------------------------------------------------------
  // 7. CREATE SAMPLE NOTIFICATIONS
  // ---------------------------------------------------------------------------
  console.log('🔔 Creating sample notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: tenantUser.id,
        type: 'message',
        title: 'New Message',
        body: 'Chukwudi Okonkwo replied to your inquiry about 3-bedroom apartment',
        data: { conversationId: conversation1.id },
        read: false,
      },
      {
        userId: landlordUser.id,
        type: 'message',
        title: 'New Message',
        body: 'Amina Bello sent you a message about your property',
        data: { conversationId: conversation2.id },
        read: false,
      },
      {
        userId: tenantUser.id,
        type: 'agreement',
        title: 'Agreement Ready for Signature',
        body: 'Your rental agreement for 3-bedroom apartment is ready to sign',
        data: { agreementId: agreement2.id },
        read: false,
      },
      {
        userId: landlordUser.id,
        type: 'verification',
        title: 'Verification Approved',
        body: 'Your property listing has been verified and approved',
        data: { listingId: listing2.id },
        read: true,
      },
    ],
  });

  console.log('✅ Created 4 notifications\n');

  // ---------------------------------------------------------------------------
  // 8. CREATE SAMPLE SAVED LISTINGS
  // ---------------------------------------------------------------------------
  console.log('⭐ Creating sample saved listings...');

  await prisma.savedListing.createMany({
    data: [
      { userId: tenantUser.id, listingId: listing2.id },
      { userId: tenantUser.id, listingId: listing3.id },
      { userId: tenantUser.id, listingId: listing5.id },
    ],
  });

  console.log('✅ Created 3 saved listings\n');

  // ---------------------------------------------------------------------------
  // 9. CREATE SAMPLE SCREENING CALL
  // ---------------------------------------------------------------------------
  console.log('📞 Creating sample screening call...');

  await prisma.screeningCall.create({
    data: {
      listingId: listing3.id,
      landlordId: landlordUser.id,
      tenantId: tenantUser.id,
      scheduledAt: new Date('2025-06-20T10:00:00Z'),
      status: 'scheduled',
      notes: 'Tenant profile looks good. Income verified. Screening call to discuss move-in date.',
    },
  });

  console.log('✅ Created screening call\n');

  // ---------------------------------------------------------------------------
  // 10. CREATE SAMPLE MAINTENANCE TICKET
  // ---------------------------------------------------------------------------
  console.log('🔧 Creating sample maintenance ticket...');

  await prisma.maintenanceTicket.create({
    data: {
      orgId: organization1.id,
      listingId: listing5.id,
      tenantId: tenantUser.id,
      raisedBy: tenantUser.id,
      title: 'Air conditioning not cooling properly',
      description: 'The AC unit in the bedroom has not been cooling properly for the past 2 days.',
      category: 'electrical',
      priority: 'medium',
      status: 'open',
      photoUrls: [],
    },
  });

  console.log('✅ Created maintenance ticket\n');

  console.log('🎉 Database seeding completed successfully!\n');

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SEED SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('👥 Users: 5 (landlord, tenant, agent, admin, estate_manager)');
  console.log('🏢 Organizations: 3');
  console.log('🏠 Listings: 10 (various types and verification tiers)');
  console.log('   - Basic: 3');
  console.log('   - Verified: 4');
  console.log('   - Inspected: 2');
  console.log('   - Certified: 1');
  console.log('📝 Agreements: 2 (1 fully signed, 1 pending)');
  console.log('💰 Transactions: 2');
  console.log('💬 Conversations: 2 with 7 messages');
  console.log('🔔 Notifications: 4');
  console.log('⭐ Saved Listings: 3');
  console.log('📞 Screening Calls: 1');
  console.log('🔧 Maintenance Tickets: 1');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n✨ Test credentials:');
  console.log('   Email: [role]@propati.ng (e.g., tenant@propati.ng)');
  console.log('   Password: Test123!@#');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// ===========================================================================
// EXECUTE SEED
// ===========================================================================

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
