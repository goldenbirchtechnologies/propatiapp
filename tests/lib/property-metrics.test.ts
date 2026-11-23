import { describe, expect, it } from 'vitest';
import { getPropertyMetrics } from '@/lib/property-metrics';

describe('property metrics', () => {
  it('keeps every unit in the total when listings are created', () => {
    const units = [
      { occupancy: 'VACANT', listings: [{ status: 'active' }] },
      { occupancy: 'VACANT', listings: [] },
      { occupancy: 'OCCUPIED', listings: [{ status: 'draft' }] },
    ];

    expect(getPropertyMetrics(units)).toMatchObject({
      totalUnits: 3,
      activeListings: 1,
      listedUnits: 2,
      unlistedUnits: 1,
      occupiedUnits: 1,
      vacantUnits: 2,
      occupancyRate: 33,
    });
  });

  it('does not treat an unlisted unit as vacant occupancy data', () => {
    expect(getPropertyMetrics([{ occupancy: 'OCCUPIED', listings: [] }])).toMatchObject({
      totalUnits: 1,
      unlistedUnits: 1,
      occupiedUnits: 1,
      vacantUnits: 0,
      occupancyRate: 100,
    });
  });

  it('ignores deleted listings when calculating listed units', () => {
    expect(getPropertyMetrics([{ occupancy: 'VACANT', listings: [{ status: 'deleted' }] }])).toMatchObject({
      totalUnits: 1,
      activeListings: 0,
      listedUnits: 0,
      unlistedUnits: 1,
    });
  });
});
