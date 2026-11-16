import type { ReactNode } from 'react';
import {
  Waves, Building, UtensilsCrossed, Car, Dumbbell, Trees, Shield,
  Lock, Radar, Sun, Wind, Bath, Briefcase, Sparkles, ChefHat, Sofa, Wifi,
} from 'lucide-react';

export interface AmenityItem {
  value: string;
  label: string;
  icon: ReactNode;
}

export interface AmenityCategory {
  label: string;
  items: AmenityItem[];
}

export const PROPERTY_AMENITIES: AmenityCategory[] = [
  {
    label: 'Building Features',
    items: [
      { value: 'swimming_pool', label: 'Swimming Pool', icon: <Waves className="h-4 w-4" /> },
      { value: 'elevator', label: 'Elevator', icon: <Building className="h-4 w-4" /> },
      { value: 'rooftop_lounge', label: 'Rooftop Lounge', icon: <UtensilsCrossed className="h-4 w-4" /> },
      { value: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
      { value: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
      { value: 'garden', label: 'Garden', icon: <Trees className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Security & Access',
    items: [
      { value: 'power_generator', label: '24/7 Power/Generator', icon: <Sun className="h-4 w-4" /> },
      { value: 'cctv', label: 'CCTV Surveillance', icon: <Radar className="h-4 w-4" /> },
      { value: 'gate_house', label: 'Gate House', icon: <Lock className="h-4 w-4" /> },
      { value: 'security_guard', label: 'Security Guard', icon: <Shield className="h-4 w-4" /> },
      { value: 'fire_alarm', label: 'Fire Alarm', icon: <Sparkles className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Unit Utilities',
    items: [
      { value: 'air_conditioning', label: 'Air Conditioning', icon: <Wind className="h-4 w-4" /> },
      { value: 'fiber_internet', label: 'High-Speed Fiber Internet', icon: <Wifi className="h-4 w-4" /> },
      { value: 'ensuite_bath', label: 'En-suite Bath', icon: <Bath className="h-4 w-4" /> },
      { value: 'kitchen', label: 'Kitchen', icon: <ChefHat className="h-4 w-4" /> },
      { value: 'balcony', label: 'Balcony', icon: <Trees className="h-4 w-4" /> },
      { value: 'washer', label: 'Washer', icon: <Briefcase className="h-4 w-4" /> },
    ],
  },
];

export const AMENITY_VALUE_MAP: Record<string, string> = PROPERTY_AMENITIES.flatMap(
  (cat) => cat.items.map((item) => item.value)
).reduce<Record<string, string>>((acc, val) => {
  acc[val] = val;
  return acc;
}, {});
