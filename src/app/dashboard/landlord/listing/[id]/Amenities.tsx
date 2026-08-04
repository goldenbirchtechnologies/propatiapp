'use client';

import {
  Wifi,
  Car,
  Dumbbell,
  Waves,
  RefrigeratorIcon,
  Lock,
  Zap,
  Trees,
  Sun,
  Wind,
  Tv,
  ShowerHead,
  Utensils,
  Armchair,
  Bath,
} from 'lucide-react';

type Props = {
  amenities: string[];
};

const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-4 w-4" />,
  Parking: <Car className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Pool: <Waves className="h-4 w-4" />,
  Kitchen: <RefrigeratorIcon className="h-4 w-4" />,
  '24/7 Security': <Lock className="h-4 w-4" />,
  'Power Supply': <Zap className="h-4 w-4" />,
  'Garden Area': <Trees className="h-4 w-4" />,
  Balcony: <Sun className="h-4 w-4" />,
  AC: <Wind className="h-4 w-4" />,
  'Smart TV': <Tv className="h-4 w-4" />,
  Shower: <ShowerHead className="h-4 w-4" />,
  Dining: <Utensils className="h-4 w-4" />,
  Furnished: <Armchair className="h-4 w-4" />,
  Bathroom: <Bath className="h-4 w-4" />,
};

export default function Amenities({ amenities }: Props) {
  if (!amenities || amenities.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-3 text-primary">Amenities</h2>
        <p className="text-on-surface-variant text-sm">No amenities listed.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-primary">Amenities</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 text-sm text-primary shadow-sm"
          >
            <span className="text-primary">{AMENITY_ICON_MAP[amenity]}</span>
            <span className="font-medium truncate">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
