import { z } from 'zod';

export interface ParsedUnit {
  buildingName?: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqm?: number;
  rent: number;
  cautionDeposit?: number;
  serviceCharge?: number;
  status?: string;
  occupancy?: string;
  listingId?: string;
}

export interface UnitValidationResult {
  valid: boolean;
  errors: string[];
  data?: ParsedUnit;
}

export interface CSVParseResult {
  success: ParsedUnit[];
  failed: Array<{ row: number; errors: string[]; data: Record<string, unknown> }>;
}

const unitRowSchema = z.object({
  buildingName: z.string().optional(),
  unitNumber: z.string().min(1, 'Unit number is required'),
  type: z.enum(['apartment', 'house', 'duplex', 'office', 'shop', 'warehouse', 'land'], {
    errorMap: () => ({ message: 'Invalid property type' }),
  }),
  bedrooms: z.number({ coerce: true }).int().min(0).max(20),
  bathrooms: z.number({ coerce: true }).int().min(0).max(20),
  sizeSqm: z.number({ coerce: true }).positive().optional(),
  rent: z.number({ coerce: true }).positive({ message: 'Rent must be a positive number' }),
  cautionDeposit: z.number({ coerce: true }).positive().optional(),
  serviceCharge: z.number({ coerce: true }).positive().optional(),
  status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'UNAVAILABLE'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }).optional(),
  occupancy: z.enum(['VACANT', 'OCCUPIED', 'NOTICE_GIVEN'], {
    errorMap: () => ({ message: 'Invalid occupancy' }),
  }).optional(),
  listingId: z.string().min(1, 'listingId is required'),
}));

/**
 * Parse CSV content into an array of units
 * Expected CSV format:
 * buildingName,unitNumber,type,bedrooms,bathrooms,sizeSqm,rent,cautionDeposit,serviceCharge,status,occupancy
 */
export function parseUnitsCSV(csvContent: string): CSVParseResult {
  const lines = csvContent.trim().split('\n').filter(line => line.trim());

  if (lines.length === 0) {
    throw new Error('CSV is empty');
  }

  // Parse header
  const header = lines[0].split(',').map(h => h.trim());
  const requiredHeaders = ['listingId', 'unitNumber', 'type', 'bedrooms', 'bathrooms', 'rent'];
  const missingHeaders = requiredHeaders.filter(h => !header.includes(h));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  const result: CSVParseResult = {
    success: [],
    failed: [],
  };

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const rowData: Record<string, unknown> = {};

    // Map values to header keys
    header.forEach((key, idx) => {
      const value = values[idx]?.trim();
      if (value) {
        rowData[key] = value;
      }
    });

    const validation = validateUnitRow(rowData);

    if (validation.valid && validation.data) {
      result.success.push(validation.data);
    } else {
      result.failed.push({
        row: i + 1,
        errors: validation.errors,
        data: rowData,
      });
    }
  }

  return result;
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Validate a single unit row
 */
export function validateUnitRow(row: Record<string, unknown>): UnitValidationResult {
  try {
    const validated = unitRowSchema.parse(row);
    return {
      valid: true,
      errors: [],
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return {
        valid: false,
        errors,
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Generate CSV template for units
 */
export function generateUnitsCSVTemplate(): string {
  const headers = [
    'listingId',
    'buildingName',
    'unitNumber',
    'type',
    'bedrooms',
    'bathrooms',
    'sizeSqm',
    'rent',
    'cautionDeposit',
    'serviceCharge',
    'status',
    'occupancy',
  ];

  const exampleRows = [
    ['lst_123', 'Building A', '101', 'apartment', '2', '2', '85', '150000', '300000', '15000', 'AVAILABLE', 'VACANT'],
    ['lst_123', 'Building A', '102', 'apartment', '3', '2', '110', '200000', '400000', '20000', 'RENTED', 'OCCUPIED'],
    ['lst_456', 'Building B', '201', 'apartment', '1', '1', '60', '100000', '200000', '10000', 'AVAILABLE', 'VACANT'],
  ];

  return [
    headers.join(','),
    ...exampleRows.map(row => row.join(',')),
  ].join('\n');
}
