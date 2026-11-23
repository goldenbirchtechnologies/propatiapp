export type PropertyMetricUnit = {
  occupancy: string;
  listings: { status: string }[];
};

export function getPropertyMetrics(units: PropertyMetricUnit[]) {
  const occupiedUnits = units.filter((unit) => unit.occupancy === 'OCCUPIED').length;
  const activeListings = units.reduce(
    (count, unit) => count + unit.listings.filter((listing) => listing.status === 'active').length,
    0,
  );
  const listedUnits = units.filter((unit) => unit.listings.some((listing) => listing.status !== 'deleted')).length;

  return {
    totalUnits: units.length,
    activeListings,
    listedUnits,
    unlistedUnits: units.length - listedUnits,
    occupiedUnits,
    vacantUnits: units.length - occupiedUnits,
    occupancyRate: units.length ? Math.round((occupiedUnits / units.length) * 100) : 0,
  };
}
