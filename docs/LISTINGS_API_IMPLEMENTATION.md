# GET /api/listings API Implementation

## Overview

The GET /api/listings endpoint has been successfully implemented with comprehensive search, filtering, pagination, and sorting capabilities for the PROPATI property marketplace.

## Implementation Details

### Files Modified

1. **src/app/api/listings/route.ts** - Main API endpoint handler
2. **src/lib/validators.ts** - Added `q` parameter to listingFilterSchema
3. **src/middleware.ts** - Added `/api/listings(.*)` to public routes

## Supported Query Parameters

### Search

- **`q`** (string, optional) - Text search across:
  - Title
  - Description
  - Area
  - Address
  - Uses case-insensitive matching

### Filtering

- **`type`** / **`listingType`** (enum, optional) - Filter by listing type:
  - `rent`, `sale`, `short_let`, `share`, `commercial`

- **`propertyType`** (enum, optional) - Filter by property type:
  - `apartment`, `house`, `duplex`, `land`, `office`, `shop`, `warehouse`

- **`area`** (string, optional) - Filter by location/area (case-insensitive contains)

- **`state`** (string, optional) - Filter by state (exact match)

- **`minPrice`** (number, optional) - Minimum price filter

- **`maxPrice`** (number, optional) - Maximum price filter

- **`minBedrooms`** (number, optional) - Minimum bedrooms

- **`maxBedrooms`** (number, optional) - Maximum bedrooms

- **`verificationTier`** (enum, optional) - Filter by verification tier:
  - `basic`, `verified`, `inspected`, `certified`

### Pagination

- **`page`** (number, default: 1) - Page number (1-indexed)

- **`limit`** (number, default: 20, max: 100) - Items per page

### Sorting

- **`sortBy`** (enum, default: 'newest') - Sort field:
  - `newest` - Most recently created (default)
  - `price_asc` - Price ascending (lowest first)
  - `price_desc` - Price descending (highest first)
  - `most_verified` - Verification tier descending

- **`order`** (enum, default: 'desc') - Sort order:
  - `asc` - Ascending
  - `desc` - Descending

## Response Format

```typescript
{
  listings: Array<{
    // Core listing fields
    id: string;
    title: string;
    description?: string;
    listingType: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
    propertyType?: 'apartment' | 'house' | 'duplex' | 'land' | 'office' | 'shop' | 'warehouse';
    address: string;
    area: string;
    state: string;
    price: Decimal;
    priceFormatted: string; // Formatted currency (e.g., "₦1,500,000")
    pricePeriod?: string;
    cautionDeposit?: Decimal;
    serviceCharge?: Decimal;
    bedrooms?: number;
    bathrooms?: number;
    toilets?: number;
    sizeSqm?: Decimal;
    floorLevel?: number;
    furnished: boolean;
    parkingSpaces: number;
    amenities?: any;
    availableFrom?: DateTime;
    minimumStay?: number;
    status: 'draft' | 'active' | 'suspended' | 'deleted';
    verificationTier: 'basic' | 'verified' | 'inspected' | 'certified';
    isFeatured: boolean;
    viewsCount: number;
    createdAt: DateTime;
    updatedAt: DateTime;

    // Relations
    coverImage: string | null; // First cover image URL
    owner: {
      id: string;
      fullName: string;
      avatarUrl?: string;
      phoneVerified: boolean;
    };
    agent?: {
      id: string;
      fullName: string;
      avatarUrl?: string;
      agentTier: 'standard' | 'senior' | 'probation';
    };
    verification?: {
      overallStatus: 'not_started' | 'in_progress' | 'certified' | 'rejected';
      currentLayer: number;
    };
  }>;
  
  pagination: {
    page: number;        // Current page
    limit: number;       // Items per page
    total: number;       // Total matching listings
    totalPages: number;  // Total pages
  };
}
```

## Example Requests

### 1. Basic Pagination

```bash
GET /api/listings?page=1&limit=20
```

### 2. Text Search

```bash
GET /api/listings?q=Lekki&page=1&limit=20
```

Searches for "Lekki" in title, description, area, and address.

### 3. Filter by Type

```bash
GET /api/listings?listingType=rent&propertyType=apartment
```

### 4. Price Range

```bash
GET /api/listings?minPrice=500000&maxPrice=2000000
```

### 5. Bedroom Range

```bash
GET /api/listings?minBedrooms=2&maxBedrooms=3
```

### 6. Area Filter

```bash
GET /api/listings?area=Victoria%20Island
```

### 7. Verification Filter

```bash
GET /api/listings?verificationTier=verified
```

### 8. Sorting

```bash
# Newest first (default)
GET /api/listings?sortBy=newest

# Cheapest first
GET /api/listings?sortBy=price_asc

# Most expensive first
GET /api/listings?sortBy=price_desc

# Most verified first
GET /api/listings?sortBy=most_verified
```

### 9. Combined Filters

```bash
GET /api/listings?q=Lekki&listingType=rent&propertyType=apartment&minBedrooms=2&maxBedrooms=3&minPrice=500000&maxPrice=2000000&sortBy=price_asc&page=1&limit=20
```

## Implementation Features

### 1. Query Validation

- Uses Zod schema validation (`listingFilterSchema`)
- Automatic type coercion for numbers
- Default values for page, limit, and sortBy
- Max limit of 100 items per page

### 2. Text Search

- Case-insensitive search using Prisma's `contains` with `mode: 'insensitive'`
- OR condition across multiple fields:
  - title
  - description
  - area
  - address

### 3. Price Filtering

- Supports both min and max independently
- Uses Prisma's `gte` (greater than or equal) and `lte` (less than or equal)

### 4. Bedroom Filtering

- Improved implementation handles min and max independently
- Avoids object spread issues with Prisma types

### 5. Relations Included

- **images**: Only cover image (first with `isCover: true`)
- **owner**: Basic user info (id, fullName, avatarUrl, phoneVerified)
- **agent**: Agent details if listing has an agent
- **verification**: Current verification status

### 6. Response Formatting

- Adds `priceFormatted` field with Nigerian Naira formatting
- Adds `coverImage` field for easy frontend access
- Includes full owner, agent, and verification objects

### 7. Error Handling

- Zod validation errors return 400 with details
- Database errors return 500
- Proper error logging with `console.error`

### 8. Performance Optimization

- Parallel execution of count and findMany queries using `Promise.all`
- Only fetches cover image (not all images)
- Selective field inclusion for relations
- Indexed fields used for filtering (ownerId, status, listingType, area)

## Security & Access Control

### Public Access

The endpoint is **public** (no authentication required) to allow:
- Property browsing by all visitors
- SEO-friendly public listing pages
- Third-party integrations

### Data Protection

- Only returns listings with `status: 'active'`
- Owner sensitive data excluded (NIN, BVN, phone numbers, etc.)
- Email addresses not included in owner object

### Rate Limiting (Recommended)

Consider adding rate limiting middleware to prevent abuse:
```typescript
// Suggested implementation
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Testing

### Test Script

A comprehensive test script has been created: `test-listings-api.js`

Run with:
```bash
node test-listings-api.js
```

This tests:
- Basic pagination
- Text search
- All filter types
- All sort options
- Combined filters
- Edge cases

### Manual Testing with curl

```bash
# Basic test
curl "http://localhost:3001/api/listings?page=1&limit=5"

# Search test
curl "http://localhost:3001/api/listings?q=Lekki"

# Filter test
curl "http://localhost:3001/api/listings?listingType=rent&propertyType=apartment&minPrice=500000&maxPrice=2000000"
```

## Database Schema

The endpoint queries the `listings` table with these key fields:

```prisma
model Listing {
  id                   String            @id @default(cuid())
  ownerId              String
  agentId              String?
  title                String
  description          String?
  listingType          ListingType
  propertyType         PropertyType?
  address              String
  area                 String
  state                String            @default("Lagos")
  price                Decimal           @db.Decimal(15, 2)
  bedrooms             Int?
  bathrooms            Int?
  verificationTier     VerificationTier  @default(basic)
  status               ListingStatus     @default(draft)
  // ... more fields
}
```

## Limitations & Future Enhancements

### Current Limitations

1. No full-text search (using basic `contains`)
2. No geo-spatial filtering (lat/lng)
3. No fuzzy matching
4. No search result highlighting

### Recommended Enhancements

1. **Full-Text Search**
   - Implement PostgreSQL full-text search
   - Add search ranking/relevance scoring
   - Support for search suggestions

2. **Geo-Spatial**
   - Add latitude/longitude fields
   - Implement radius-based search
   - Distance sorting

3. **Advanced Filtering**
   - Price per square meter
   - Available date range
   - Amenities multi-select
   - Multiple areas filter

4. **Performance**
   - Add Redis caching for popular queries
   - Implement cursor-based pagination for large datasets
   - Add database query optimization

5. **Analytics**
   - Track popular searches
   - Log query performance
   - A/B test search algorithms

## Related Files

- **src/app/api/listings/route.ts** - Main implementation
- **src/lib/validators.ts** - Zod validation schemas
- **src/middleware.ts** - Route protection
- **prisma/schema.prisma** - Database schema
- **src/lib/prisma.ts** - Prisma client
- **src/lib/utils.ts** - Utility functions (formatCurrencyKobo)

## Deployment Checklist

- [x] Endpoint implemented
- [x] Validation schemas configured
- [x] Error handling added
- [x] Public access configured in middleware
- [x] Test script created
- [ ] Rate limiting configured (recommended)
- [ ] API documentation published
- [ ] Frontend integration tested
- [ ] Performance tested with production data volume
- [ ] Monitoring/logging configured

## Support

For issues or questions:
1. Check server logs for errors
2. Verify database seeding completed
3. Ensure Prisma migrations applied
4. Test with the provided test script
