# Units CSV Import Format

## Overview

This document describes the CSV format for bulk importing units into PROPATI's estate management system.

## CSV Structure

### Headers (Required)

The CSV file must include the following headers in the first row:

```csv
buildingName,unitNumber,type,bedrooms,bathrooms,sizeSqm,rent,cautionDeposit,serviceCharge,status,occupancy
```

### Column Definitions

| Column | Type | Required | Description | Valid Values |
|--------|------|----------|-------------|--------------|
| `buildingName` | String | No | Name of the building | Any string (e.g., "Building A", "Block 1") |
| `unitNumber` | String | **Yes** | Unique unit identifier within building | Any string (e.g., "101", "A-205") |
| `type` | String | **Yes** | Type of property | `apartment`, `house`, `duplex`, `office`, `shop`, `warehouse`, `land` |
| `bedrooms` | Number | **Yes** | Number of bedrooms | 0-20 |
| `bathrooms` | Number | **Yes** | Number of bathrooms | 0-20 |
| `sizeSqm` | Number | No | Size in square meters | Positive number |
| `rent` | Number | **Yes** | Monthly rent amount in Naira | Positive number |
| `cautionDeposit` | Number | No | Security deposit amount | Positive number |
| `serviceCharge` | Number | No | Monthly service charge | Positive number |
| `status` | String | No | Current status of unit | `AVAILABLE`, `RENTED`, `MAINTENANCE`, `UNAVAILABLE` (default: `AVAILABLE`) |
| `occupancy` | String | No | Occupancy status | `VACANT`, `OCCUPIED`, `NOTICE_GIVEN` (default: `VACANT`) |

## Example CSV

```csv
buildingName,unitNumber,type,bedrooms,bathrooms,sizeSqm,rent,cautionDeposit,serviceCharge,status,occupancy
Building A,101,apartment,2,2,85,150000,300000,15000,AVAILABLE,VACANT
Building A,102,apartment,3,2,110,200000,400000,20000,RENTED,OCCUPIED
Building A,103,apartment,2,2,90,160000,320000,16000,AVAILABLE,VACANT
Building B,201,apartment,1,1,60,100000,200000,10000,AVAILABLE,VACANT
Building B,202,apartment,2,1,75,130000,260000,13000,MAINTENANCE,VACANT
Building B,203,apartment,3,2,105,180000,360000,18000,RENTED,OCCUPIED
Office Block,G01,office,0,1,120,250000,500000,25000,AVAILABLE,VACANT
```

## Validation Rules

### Unit Number Uniqueness
- Unit numbers must be unique within the same building
- Combination of `buildingName` + `unitNumber` must be unique in the organization
- Duplicate units will be rejected during import

### Numeric Fields
- All numeric fields must be positive numbers
- Bedrooms and bathrooms must be integers (whole numbers)
- Rent is mandatory and must be greater than 0

### Property Type
- Must match one of the valid property types exactly (case-sensitive)
- Invalid types will cause row validation to fail

### Status Values
- Status and occupancy fields are case-sensitive
- Use UPPERCASE values as shown in valid values table
- Invalid status values will default to AVAILABLE/VACANT

## Import Process

### 1. Prepare CSV File
- Use UTF-8 encoding
- Ensure all required columns are present
- Remove any extra spaces or special characters
- Validate data against rules above

### 2. Upload via API
```bash
POST /api/orgs/{orgId}/bulk-upload
Content-Type: application/json

{
  "csvData": "<CSV_CONTENT_AS_STRING>"
}
```

### 3. Review Response
The API returns:
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "id": "unt_abc123",
        "unitNumber": "101",
        "buildingName": "Building A"
      }
    ],
    "failed": [
      {
        "row": 5,
        "errors": ["Unit 201 already exists in Building B"],
        "data": { ... }
      }
    ]
  },
  "summary": {
    "total": 10,
    "created": 9,
    "failed": 1
  }
}
```

## Batch Processing

- Units are processed in batches of 50
- Maximum units per upload: determined by organization plan limit
- Failed rows do not stop processing of other rows
- Each row is validated independently

## Error Handling

### Common Errors

1. **Unit Already Exists**
   - Error: "Unit {number} already exists in {building}"
   - Solution: Check existing units or change unit number

2. **Invalid Property Type**
   - Error: "Invalid property type"
   - Solution: Use one of: apartment, house, duplex, office, shop, warehouse, land

3. **Missing Required Field**
   - Error: "Unit number is required" or "Rent must be a positive number"
   - Solution: Ensure all required fields have valid values

4. **Organization Unit Limit Reached**
   - Error: "Unit limit reached. Current: X, Max: Y"
   - Solution: Upgrade organization plan or remove existing units

## Best Practices

1. **Start Small**: Test with 5-10 units before bulk importing
2. **Validate Data**: Check all values before upload
3. **Backup**: Keep original CSV file for reference
4. **Review Failures**: Address failed rows and re-import
5. **Consistent Naming**: Use consistent building names and unit numbering scheme

## Download Template

You can download a pre-formatted CSV template:
- Via API: Call the CSV template generation endpoint
- Via UI: Use the "Download Template" button in the bulk upload interface
- Via Hook: Use `downloadUnitsCSVTemplate()` function from `useUnits` hook

## API Endpoints

- **Bulk Upload**: `POST /api/orgs/{orgId}/bulk-upload`
- **List Units**: `GET /api/orgs/{orgId}/units`
- **Get Unit**: `GET /api/orgs/{orgId}/units/{unitId}`
- **Update Unit**: `PATCH /api/orgs/{orgId}/units/{unitId}`
- **Delete Unit**: `DELETE /api/orgs/{orgId}/units/{unitId}`

## Related Documentation

- [Estate Manager B2B Guide](./ESTATE_MANAGER_GUIDE.md)
- [Portfolio Management](./PORTFOLIO_MANAGEMENT.md)
- [API Reference](./API_REFERENCE.md)
