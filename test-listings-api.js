/**
 * Test script for GET /api/listings endpoint
 *
 * Run with: node test-listings-api.js
 *
 * This script tests various query parameters supported by the listings API
 */

const BASE_URL = 'http://localhost:3001/api/listings';

async function testEndpoint(description, queryParams) {
  const url = new URL(BASE_URL);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST: ${description}`);
  console.log(`URL: ${url.toString()}`);
  console.log('='.repeat(70));

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log(`✓ Status: ${response.status} OK`);
      console.log(`✓ Total listings: ${data.pagination.total}`);
      console.log(`✓ Page: ${data.pagination.page}/${data.pagination.totalPages}`);
      console.log(`✓ Results on this page: ${data.listings.length}`);

      if (data.listings.length > 0) {
        const firstListing = data.listings[0];
        console.log('\nFirst listing:');
        console.log(`  - ID: ${firstListing.id}`);
        console.log(`  - Title: ${firstListing.title}`);
        console.log(`  - Price: ${firstListing.priceFormatted || firstListing.price}`);
        console.log(`  - Type: ${firstListing.listingType}`);
        console.log(`  - Property Type: ${firstListing.propertyType || 'N/A'}`);
        console.log(`  - Area: ${firstListing.area}`);
        console.log(`  - Bedrooms: ${firstListing.bedrooms || 'N/A'}`);
        console.log(`  - Verification: ${firstListing.verificationTier}`);
        console.log(`  - Owner: ${firstListing.owner?.fullName || 'N/A'}`);
      }
    } else {
      console.log(`✗ Status: ${response.status}`);
      console.log(`✗ Error: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`✗ Request failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('PROPATI LISTINGS API TEST SUITE');
  console.log('='.repeat(70));

  // Test 1: Basic pagination
  await testEndpoint('Basic pagination - first page', {
    page: 1,
    limit: 5
  });

  // Test 2: Text search
  await testEndpoint('Text search for "Lekki"', {
    q: 'Lekki',
    page: 1,
    limit: 5
  });

  // Test 3: Filter by listing type
  await testEndpoint('Filter by listing type (rent)', {
    listingType: 'rent',
    page: 1,
    limit: 5
  });

  // Test 4: Filter by property type
  await testEndpoint('Filter by property type (apartment)', {
    propertyType: 'apartment',
    page: 1,
    limit: 5
  });

  // Test 5: Price range filter
  await testEndpoint('Price range 500k - 2M', {
    minPrice: 500000,
    maxPrice: 2000000,
    page: 1,
    limit: 5
  });

  // Test 6: Filter by area
  await testEndpoint('Filter by area (Victoria Island)', {
    area: 'Victoria Island',
    page: 1,
    limit: 5
  });

  // Test 7: Filter by bedrooms
  await testEndpoint('Filter by bedrooms (2-3)', {
    minBedrooms: 2,
    maxBedrooms: 3,
    page: 1,
    limit: 5
  });

  // Test 8: Filter by verification tier
  await testEndpoint('Filter by verification tier (verified)', {
    verificationTier: 'verified',
    page: 1,
    limit: 5
  });

  // Test 9: Sort by price ascending
  await testEndpoint('Sort by price (lowest first)', {
    sortBy: 'price_asc',
    page: 1,
    limit: 5
  });

  // Test 10: Sort by price descending
  await testEndpoint('Sort by price (highest first)', {
    sortBy: 'price_desc',
    page: 1,
    limit: 5
  });

  // Test 11: Sort by verification tier
  await testEndpoint('Sort by verification (most verified)', {
    sortBy: 'most_verified',
    page: 1,
    limit: 5
  });

  // Test 12: Combined filters
  await testEndpoint('Combined: Lekki apartments for rent, 2-3 beds, 500k-2M', {
    q: 'Lekki',
    listingType: 'rent',
    propertyType: 'apartment',
    minBedrooms: 2,
    maxBedrooms: 3,
    minPrice: 500000,
    maxPrice: 2000000,
    sortBy: 'price_asc',
    page: 1,
    limit: 5
  });

  // Test 13: Pagination - page 2
  await testEndpoint('Pagination - second page', {
    page: 2,
    limit: 5
  });

  // Test 14: Large limit
  await testEndpoint('Large limit (max 100)', {
    page: 1,
    limit: 100
  });

  console.log('\n' + '='.repeat(70));
  console.log('TEST SUITE COMPLETE');
  console.log('='.repeat(70) + '\n');
}

// Run the tests
runTests().catch(console.error);
