# Units API Reference - Phase F

## Base URL
All endpoints are relative to: `/api/orgs/{orgId}`

## Authentication
All endpoints require authentication via `withAuth` middleware. User must be an active member of the organization.

## Endpoints

### 1. List Units

**GET** `/api/orgs/{orgId}/units`

List all units for an organization with filtering and pagination.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |
| `status` | string | Filter by status: `AVAILABLE`, `RENTED`, `MAINTENANCE`, `UNAVAILABLE` |
| `occupancy` | string | Filter by occupancy: `VACANT`, `OCCUPIED`, `NOTICE_GIVEN` |
| `buildingName` | string | Filter by building name |
| `type` | string | Filter by property type |

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "unt_abc123",
      "organizationId": "org_xyz789",
      "unitNumber": "101",
      "buildingName": "Building A",
      "type": "apartment",
      "bedrooms": 2,
      "bathrooms": 2,
      "sizeSqm": 85.0,
      "rent": 150000.0,
      "cautionDeposit": 300000.0,
      "serviceCharge": 15000.0,
      "status": "AVAILABLE",
      "occupancy": "VACANT",
      "currentTenantId": null,
      "currentTenant": null,
      "listingId": null,
      "listing": null,
      "leaseStartDate": null,
      "leaseEndDate": null,
      "lastMaintenanceDate": null,
      "nextMaintenanceDate": null,
      "createdAt": "2026-06-18T10:00:00Z",
      "updatedAt": "2026-06-18T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Permissions
- All active organization members can view units

---

### 2. Get Unit Details

**GET** `/api/orgs/{orgId}/units/{unitId}`

Get detailed information about a specific unit.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "unt_abc123",
    "organizationId": "org_xyz789",
    "unitNumber": "101",
    "buildingName": "Building A",
    "type": "apartment",
    "bedrooms": 2,
    "bathrooms": 2,
    "sizeSqm": 85.0,
    "rent": 150000.0,
    "cautionDeposit": 300000.0,
    "serviceCharge": 15000.0,
    "status": "RENTED",
    "occupancy": "OCCUPIED",
    "currentTenantId": "usr_tenant123",
    "currentTenant": {
      "id": "usr_tenant123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "avatarUrl": "https://example.com/avatar.jpg",
      "employmentStatus": "employed",
      "employerName": "ABC Corp",
      "jobTitle": "Software Engineer"
    },
    "listingId": "lst_listing123",
    "listing": {
      "id": "lst_listing123",
      "title": "Modern 2BR Apartment",
      "address": "123 Main St",
      "area": "Lekki",
      "state": "Lagos",
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "isCover": true
        }
      ]
    },
    "organization": {
      "id": "org_xyz789",
      "name": "ABC Estate Management"
    },
    "leaseStartDate": "2026-01-01T00:00:00Z",
    "leaseEndDate": "2026-12-31T23:59:59Z",
    "lastMaintenanceDate": "2026-05-15T10:00:00Z",
    "nextMaintenanceDate": "2026-08-15T10:00:00Z",
    "createdAt": "2026-06-18T10:00:00Z",
    "updatedAt": "2026-06-18T15:30:00Z"
  }
}
```

#### Permissions
- All active organization members can view unit details

---

### 3. Create Unit

**POST** `/api/orgs/{orgId}/units`

Create a new unit in the organization's portfolio.

#### Request Body
```json
{
  "buildingName": "Building A",
  "unitNumber": "101",
  "type": "apartment",
  "bedrooms": 2,
  "bathrooms": 2,
  "sizeSqm": 85,
  "rent": 150000,
  "cautionDeposit": 300000,
  "serviceCharge": 15000,
  "status": "AVAILABLE",
  "occupancy": "VACANT",
  "listingId": "lst_optional123"
}
```

#### Validation Rules
- `unitNumber`: Required, must be unique within building
- `type`: Required, must be valid PropertyType
- `bedrooms`: Required, 0-20
- `bathrooms`: Required, 0-20
- `rent`: Required, positive number
- `listingId`: Optional, must belong to organization if provided

#### Response
```json
{
  "success": true,
  "data": {
    "id": "unt_new123",
    "organizationId": "org_xyz789",
    "unitNumber": "101",
    "buildingName": "Building A",
    // ... full unit object
  }
}
```

#### Permissions
- Owner or Manager role required
- Organization must not have reached unit limit

#### Errors
- `400`: Unit limit reached
- `400`: Duplicate unit number in building
- `400`: Invalid listing reference
- `403`: Insufficient permissions

---

### 4. Update Unit

**PATCH** `/api/orgs/{orgId}/units/{unitId}`

Update an existing unit's details.

#### Request Body
All fields are optional. Only include fields to update.

```json
{
  "unitNumber": "102",
  "rent": 160000,
  "status": "RENTED",
  "occupancy": "OCCUPIED",
  "currentTenantId": "usr_tenant123",
  "leaseStartDate": "2026-01-01T00:00:00Z",
  "leaseEndDate": "2026-12-31T23:59:59Z",
  "lastMaintenanceDate": "2026-06-15T10:00:00Z",
  "nextMaintenanceDate": "2026-09-15T10:00:00Z"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    // Updated unit object
  }
}
```

#### Permissions
- Owner or Manager role required

#### Errors
- `400`: Duplicate unit number
- `404`: Tenant not found
- `404`: Unit not found
- `403`: Insufficient permissions

---

### 5. Delete Unit

**DELETE** `/api/orgs/{orgId}/units/{unitId}`

Delete a unit from the organization's portfolio.

#### Response
```json
{
  "success": true,
  "message": "Unit deleted successfully"
}
```

#### Permissions
- Owner or Manager role required
- Unit must not be occupied

#### Errors
- `400`: Cannot delete occupied unit
- `404`: Unit not found
- `403`: Insufficient permissions

---

### 6. Bulk Upload Units

**POST** `/api/orgs/{orgId}/bulk-upload`

Bulk import units from CSV data.

#### Request Body
```json
{
  "csvData": "buildingName,unitNumber,type,bedrooms,bathrooms,sizeSqm,rent,cautionDeposit,serviceCharge,status,occupancy\nBuilding A,101,apartment,2,2,85,150000,300000,15000,AVAILABLE,VACANT\nBuilding A,102,apartment,3,2,110,200000,400000,20000,RENTED,OCCUPIED"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "id": "unt_abc123",
        "unitNumber": "101",
        "buildingName": "Building A"
      },
      {
        "id": "unt_abc124",
        "unitNumber": "102",
        "buildingName": "Building A"
      }
    ],
    "failed": [
      {
        "row": 3,
        "errors": ["Unit 103 already exists in Building A"],
        "data": {
          "buildingName": "Building A",
          "unitNumber": "103",
          // ...
        }
      }
    ]
  },
  "summary": {
    "total": 3,
    "created": 2,
    "failed": 1
  }
}
```

#### Processing
- Units processed in batches of 50
- Failed rows don't stop processing
- Each row validated independently

#### Permissions
- Owner or Manager role required
- Organization must not exceed unit limit

#### Errors
- `400`: CSV validation failed
- `400`: Unit limit would be exceeded
- `403`: Insufficient permissions

---

### 7. Portfolio Overview

**GET** `/api/orgs/{orgId}/portfolio`

Get organization's portfolio summary including units statistics.

#### Query Parameters
Same as List Units endpoint plus listing filters.

#### Response
```json
{
  "success": true,
  "data": {
    "listings": [ /* ... */ ],
    "summary": {
      "total": 25,
      "active": 20,
      "draft": 3,
      "suspended": 2,
      "byType": {
        "rent_active": 15,
        "sale_active": 5
      }
    },
    "units": {
      "totalUnits": 150,
      "occupiedUnits": 120,
      "vacantUnits": 25,
      "underMaintenanceUnits": 5,
      "totalMonthlyRent": 18500000,
      "occupancyRate": 80,
      "unitsByType": [
        { "type": "apartment", "count": 100 },
        { "type": "office", "count": 50 }
      ]
    }
  },
  "pagination": { /* ... */ }
}
```

#### Permissions
- Owner, Manager, Accountant, or Maintenance roles can view

---

### 8. Rent Ledger

**GET** `/api/orgs/{orgId}/ledger`

Get rent collection ledger with unit information.

#### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page |
| `month` | string | Filter by month (1-12) |
| `year` | string | Filter by year (e.g., "2026") |
| `unitId` | string | Filter by specific unit |
| `status` | string | Filter by transaction status |
| `export` | string | Set to "csv" for CSV export |

#### Response (JSON)
```json
{
  "success": true,
  "data": [ /* transactions */ ],
  "unitRentData": [
    {
      "unitId": "unt_abc123",
      "unitNumber": "101",
      "buildingName": "Building A",
      "rent": 150000,
      "status": "RENTED",
      "occupancy": "OCCUPIED",
      "tenant": {
        "id": "usr_tenant123",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "+2348012345678"
      }
    }
  ],
  "pagination": { /* ... */ },
  "summary": {
    "totalIncome": 18500000,
    "totalExpenses": 500000,
    "netAmount": 18000000,
    "byType": { /* ... */ },
    "byStatus": { /* ... */ }
  }
}
```

#### Response (CSV)
When `export=csv` is specified, returns CSV file:
```csv
Unit Number,Building,Tenant Name,Tenant Email,Rent Amount,Status,Occupancy
101,Building A,John Doe,john@example.com,150000,RENTED,OCCUPIED
102,Building A,Jane Smith,jane@example.com,200000,RENTED,OCCUPIED
```

#### Permissions
- Owner, Manager, or Accountant roles can view

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "details": { /* optional additional details */ }
}
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

No specific rate limits are currently enforced, but best practices:
- Batch operations instead of individual requests
- Use pagination for large datasets
- Cache responses when appropriate

## Webhooks

Currently not implemented. Future versions may include:
- Unit status changes
- Tenant assignments
- Rent payment notifications
- Maintenance request triggers

## Related Documentation

- [CSV Format Guide](./UNITS_CSV_FORMAT.md)
- [Migration Guide](./PHASE_F_MIGRATION.md)
- [React Hooks Reference](../src/hooks/useUnits.ts)

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer
