import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nigeria pilot — Lekki / Ikoyi / VI / Yaba / Abuja
const NG_LISTINGS = [
  // Lekki (6)
  { title: '3BR Duplex in Lekki Phase 1', address: '12 Admiralty Way', area: 'Lekki', city: 'Lekki', state: 'Lagos', zipCode: '105102', lat: 6.4474, lng: 3.4728, price: 6500000, beds: 3, baths: 3, sqm: 220, type: 'duplex', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
  { title: '2BR Flat in Lekki Gardens', address: '8 Freedom Way', area: 'Lekki', city: 'Lekki', state: 'Lagos', zipCode: '105102', lat: 6.4412, lng: 3.4841, price: 3800000, beds: 2, baths: 2, sqm: 110, type: 'apartment', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
  { title: '4BR Terrace in Ikate Lekki', address: '15 Ikate Close', area: 'Ikate', city: 'Lekki', state: 'Lagos', zipCode: '105102', lat: 6.433, lng: 3.451, price: 8200000, beds: 4, baths: 4, sqm: 310, type: 'house', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
  { title: 'Cozy 1BR in Lekki — Furnished', address: '22B Olubunmi Owa St', area: 'Lekki', city: 'Lekki', state: 'Lagos', zipCode: '105102', lat: 6.435, lng: 3.468, price: 2800000, beds: 1, baths: 1, sqm: 55, type: 'apartment', img: 'https://images.unsplash.com/photo-1493809842364-78817add58d1?w=800' },
  { title: '5BR Detached in Pinnock Beach', address: '7 Pinnock Beach Estate', area: 'Lekki', city: 'Lekki', state: 'Lagos', zipCode: '105102', lat: 6.421, lng: 3.515, price: 15000000, beds: 5, baths: 5, sqm: 450, type: 'house', img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
  { title: 'Mini-flat in Osapa London Lekki', address: '4 Osapa London Rd', area: 'Lekki', city: 'Lekki', state: 'Lagos', zipCode: '105102', lat: 6.468, lng: 3.501, price: 1800000, beds: 1, baths: 1, sqm: 42, type: 'apartment', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' },
  // Ikoyi (6)
  { title: 'Luxury 3BR in Old Ikoyi', address: '10 Gerard Rd', area: 'Ikoyi', city: 'Ikoyi', state: 'Lagos', zipCode: '101233', lat: 6.452, lng: 3.443, price: 12000000, beds: 3, baths: 3, sqm: 200, type: 'apartment', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
  { title: '2BR in Banana Island', address: '3 Banana Island Rd', area: 'Ikoyi', city: 'Ikoyi', state: 'Lagos', zipCode: '101233', lat: 6.463, lng: 3.447, price: 9500000, beds: 2, baths: 2, sqm: 140, type: 'apartment', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800' },
  { title: 'Ikoyi 4BR Detached with Pool', address: '18 Bourdillon Rd', area: 'Ikoyi', city: 'Ikoyi', state: 'Lagos', zipCode: '101233', lat: 6.449, lng: 3.435, price: 18000000, beds: 4, baths: 4, sqm: 380, type: 'house', img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
  { title: 'Studio in Ikoyi — Short-let Ready', address: '5 Awolowo Rd', area: 'Ikoyi', city: 'Ikoyi', state: 'Lagos', zipCode: '101233', lat: 6.448, lng: 3.432, price: 3200000, beds: 0, baths: 1, sqm: 35, type: 'apartment', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
  { title: '3BR Penthouse Ikoyi View', address: '22 Kingsway Rd', area: 'Ikoyi', city: 'Ikoyi', state: 'Lagos', zipCode: '101233', lat: 6.455, lng: 3.429, price: 11000000, beds: 3, baths: 3, sqm: 210, type: 'apartment', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
  { title: '2BR Flat Dolphin Estate Ikoyi', address: '9 Dolphin Estate', area: 'Ikoyi', city: 'Ikoyi', state: 'Lagos', zipCode: '101233', lat: 6.46, lng: 3.425, price: 5500000, beds: 2, baths: 2, sqm: 120, type: 'apartment', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800' },
  // Victoria Island (6)
  { title: '2BR in Oniru VI', address: '14 Ligali Ayorinde St', area: 'Victoria Island', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', lat: 6.431, lng: 3.421, price: 4800000, beds: 2, baths: 2, sqm: 115, type: 'apartment', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
  { title: '3BR Terrace in VI — Sea View', address: '7 Ahmadu Bello Way', area: 'Victoria Island', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', lat: 6.428, lng: 3.409, price: 9000000, beds: 3, baths: 3, sqm: 195, type: 'duplex', img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800' },
  { title: '1BR Mini-flat VI', address: '3 Sanusi Fafunwa St', area: 'Victoria Island', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', lat: 6.435, lng: 3.415, price: 2500000, beds: 1, baths: 1, sqm: 50, type: 'apartment', img: 'https://images.unsplash.com/photo-1493809842364-78817add58d1?w=800' },
  { title: '4BR Duplex VI — Furnished', address: '12 Adeola Odeku St', area: 'Victoria Island', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', lat: 6.433, lng: 3.425, price: 14000000, beds: 4, baths: 4, sqm: 320, type: 'duplex', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
  { title: 'Co-working Friendly 2BR VI', address: '20 Bishop Oluwole St', area: 'Victoria Island', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', lat: 6.429, lng: 3.428, price: 5200000, beds: 2, baths: 2, sqm: 125, type: 'apartment', img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
  { title: 'VI Studio Near Eko Atlantic', address: '5 Eko Atlantic Blvd', area: 'Victoria Island', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', lat: 6.423, lng: 3.408, price: 3000000, beds: 0, baths: 1, sqm: 38, type: 'apartment', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800' },
  // Yaba (6)
  { title: '2BR in Yaba — Near UNILAG', address: '18 Herbert Macaulay Way', area: 'Yaba', city: 'Yaba', state: 'Lagos', zipCode: '101212', lat: 6.51, lng: 3.371, price: 2200000, beds: 2, baths: 1, sqm: 85, type: 'apartment', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800' },
  { title: '3BR Family Flat Yaba', address: '7 Commercial Ave', area: 'Yaba', city: 'Yaba', state: 'Lagos', zipCode: '101212', lat: 6.505, lng: 3.379, price: 3500000, beds: 3, baths: 2, sqm: 130, type: 'apartment', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
  { title: '1BR Self-contain Yaba', address: '12 Montgomery Rd', area: 'Yaba', city: 'Yaba', state: 'Lagos', zipCode: '101212', lat: 6.517, lng: 3.365, price: 1200000, beds: 1, baths: 1, sqm: 40, type: 'apartment', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' },
  { title: '2BR Terrace Yaba — New Build', address: '3 Queens St', area: 'Yaba', city: 'Yaba', state: 'Lagos', zipCode: '101212', lat: 6.503, lng: 3.384, price: 3200000, beds: 2, baths: 2, sqm: 105, type: 'duplex', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800' },
  { title: '4BR Duplex Sabo Yaba', address: '25 Sabo Rd', area: 'Yaba', city: 'Yaba', state: 'Lagos', zipCode: '101212', lat: 6.512, lng: 3.379, price: 6500000, beds: 4, baths: 3, sqm: 210, type: 'house', img: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800' },
  { title: 'Studio Yaba — Student Friendly', address: '9 Jibowu St', area: 'Yaba', city: 'Yaba', state: 'Lagos', zipCode: '101212', lat: 6.515, lng: 3.368, price: 950000, beds: 0, baths: 1, sqm: 28, type: 'apartment', img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800' },
  // Abuja (6)
  { title: '3BR Flat in Wuse', address: '12 Aminu Kano Cres', area: 'Wuse', city: 'Abuja', state: 'FCT', zipCode: '900281', lat: 9.068, lng: 7.483, price: 4200000, beds: 3, baths: 3, sqm: 150, type: 'apartment', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
  { title: '2BR in Garki', address: '7 Garki Area 11', area: 'Garki', city: 'Abuja', state: 'FCT', zipCode: '900242', lat: 9.045, lng: 7.491, price: 3000000, beds: 2, baths: 2, sqm: 110, type: 'apartment', img: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800' },
  { title: '4BR Duplex Maitama', address: '5 Maitama Sule St', area: 'Maitama', city: 'Abuja', state: 'FCT', zipCode: '900271', lat: 9.082, lng: 7.491, price: 11000000, beds: 4, baths: 4, sqm: 340, type: 'house', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
  { title: '1BR in Utako', address: '10 Utako District', area: 'Utako', city: 'Abuja', state: 'FCT', zipCode: '900108', lat: 9.072, lng: 7.428, price: 1800000, beds: 1, baths: 1, sqm: 48, type: 'apartment', img: 'https://images.unsplash.com/photo-1493809842364-78817add58d1?w=800' },
  { title: '5BR Detached Asokoro', address: '18 Asokoro Villa', area: 'Asokoro', city: 'Abuja', state: 'FCT', zipCode: '900231', lat: 9.057, lng: 7.525, price: 16000000, beds: 5, baths: 5, sqm: 480, type: 'house', img: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800' },
  { title: 'Cozy 2BR Jahi', address: '3 Jahi District', area: 'Jahi', city: 'Abuja', state: 'FCT', zipCode: '900108', lat: 9.089, lng: 7.44, price: 2600000, beds: 2, baths: 2, sqm: 95, type: 'apartment', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' },
];

const STATE_TO_JURISDICTION: Record<string, string> = {
  Lagos: 'jur_la',
  FCT: 'jur_fc',
};

async function main() {
  await prisma.country.upsert({
    where: { code: 'NG' },
    update: { active: true },
    create: { code: 'NG', name: 'Nigeria', currency: 'NGN', locale: 'en-NG', timezone: 'Africa/Lagos', active: true },
  });

  let owner = await prisma.user.findFirst({ where: { email: 'ng-pilot-landlord@propati.test' } });
  if (!owner) {
    owner = await prisma.user.create({
      data: {
        clerkId: 'ng_pilot_landlord_clerk',
        email: 'ng-pilot-landlord@propati.test',
        fullName: 'NG Pilot Landlord',
        role: 'landlord',
        phoneVerified: true,
        countryId: 'NG',
      },
    });
    console.log('Created pilot landlord', owner.id);
  }

  for (let i = 0; i < NG_LISTINGS.length; i++) {
    const l = NG_LISTINGS[i];
    const id = `ngp_lst_${String(i + 1).padStart(3, '0')}`;
    const jurisdictionId = STATE_TO_JURISDICTION[l.state] ?? null;
    const amenities = i % 3 === 0 ? ['borehole', 'parking', 'security'] : i % 3 === 1 ? ['gym', 'pool', 'generator'] : ['parking', 'furnished', 'cctv'];
    const data = {
      id,
      countryId: 'NG',
      jurisdictionId,
      ownerId: owner.id,
      title: l.title,
      description: `Pilot NG rental — ${l.title} in ${l.area}, ${l.city}. Paystack-ready, 5-layer verification showcase.`,
      listingType: 'rent' as const,
      propertyType: (l.type === 'house' ? 'house' : l.type === 'duplex' ? 'duplex' : 'apartment') as const,
      address: l.address,
      area: l.area,
      state: l.state,
      city: l.city,
      postalCode: l.zipCode,
      zipCode: l.zipCode,
      latitude: l.lat,
      longitude: l.lng,
      price: l.price,
      pricePeriod: 'year',
      bedrooms: l.beds,
      bathrooms: l.baths,
      sizeSqm: l.sqm,
      furnished: i % 4 === 0,
      parkingSpaces: i % 2,
      amenities,
      status: 'active' as const,
      verificationTier: (i % 5 === 0 ? 'verified' : i % 7 === 0 ? 'inspected' : 'basic') as const,
    };

    await prisma.listing.upsert({
      where: { id },
      update: { ...data },
      create: data,
    });

    await prisma.listingImage.upsert({
      where: { id: `${id}_img` },
      update: { url: l.img },
      create: { id: `${id}_img`, listingId: id, url: l.img, isCover: true, sortOrder: 0 },
    });
  }
  console.log(`Seeded ${NG_LISTINGS.length} NG pilot listings (Lekki/Ikoyi/VI/Yaba/Abuja)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
