'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Hotel, Ship, Tent, Warehouse, Castle, TreePine } from 'lucide-react';
import type { PropertyStructure } from '../types';

export interface Step1Props {
  value?: PropertyStructure;
  onChange: (value: PropertyStructure) => void;
}

const OPTIONS: { value: PropertyStructure; label: string; icon: React.ReactNode }[] = [
  { value: 'house', label: 'House', icon: <Home className="size-5" /> },
  { value: 'apartment', label: 'Apartment', icon: <Hotel className="size-5" /> },
  { value: 'barn', label: 'Barn', icon: <Warehouse className="size-5" /> },
  { value: 'bed_and_breakfast', label: 'Bed & Breakfast', icon: <Hotel className="size-5" /> },
  { value: 'boat', label: 'Boat', icon: <Ship className="size-5" /> },
  { value: 'cabin', label: 'Cabin', icon: <Home className="size-5" /> },
  { value: 'camper_rv', label: 'Camper/RV', icon: <Warehouse className="size-5" /> },
  { value: 'casa_particular', label: 'Casa particular', icon: <Home className="size-5" /> },
  { value: 'castle', label: 'Castle', icon: <Castle className="size-5" /> },
  { value: 'cave', label: 'Cave', icon: <Warehouse className="size-5" /> },
  { value: 'container', label: 'Container', icon: <Warehouse className="size-5" /> },
  { value: 'cycladic_home', label: 'Cycladic home', icon: <Home className="size-5" /> },
  { value: 'dammuso', label: 'Dammuso', icon: <Home className="size-5" /> },
  { value: 'dome', label: 'Dome', icon: <Warehouse className="size-5" /> },
  { value: 'earth_home', label: 'Earth home', icon: <Home className="size-5" /> },
  { value: 'farm', label: 'Farm', icon: <TreePine className="size-5" /> },
  { value: 'guesthouse', label: 'Guesthouse', icon: <Hotel className="size-5" /> },
  { value: 'hotel', label: 'Hotel', icon: <Hotel className="size-5" /> },
  { value: 'houseboat', label: 'Houseboat', icon: <Ship className="size-5" /> },
  { value: 'minsu', label: 'Minsu', icon: <Home className="size-5" /> },
  { value: 'riad', label: 'Riad', icon: <Home className="size-5" /> },
  { value: 'ryokan', label: 'Ryokan', icon: <Home className="size-5" /> },
  { value: 'shepherds_hut', label: "Shepherd's hut", icon: <Home className="size-5" /> },
  { value: 'tent', label: 'Tent', icon: <Tent className="size-5" /> },
  { value: 'tiny_home', label: 'Tiny home', icon: <Home className="size-5" /> },
  { value: 'tower', label: 'Tower', icon: <Warehouse className="size-5" /> },
  { value: 'treehouse', label: 'Treehouse', icon: <TreePine className="size-5" /> },
  { value: 'trullo', label: 'Trullo', icon: <Home className="size-5" /> },
  { value: 'windmill', label: 'Windmill', icon: <Warehouse className="size-5" /> },
  { value: 'yurt', label: 'Yurt', icon: <Tent className="size-5" /> },
];

export default function Step1PropertyStructure({ value, onChange }: Step1Props) {
  const [internal, setInternal] = useState<PropertyStructure | undefined>(value);
  const selected = value ?? internal;

  const handleSelect = (v: PropertyStructure) => {
    setInternal(v);
    onChange(v);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">What type of property do you have?</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <Card
              key={opt.value}
              size="sm"
              onClick={() => handleSelect(opt.value)}
              className={`cursor-pointer transition border ${
                isActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="p-4 flex flex-col items-center gap-2 text-center">
                <div className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {opt.icon}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
                {isActive && (
                  <Badge variant="default" className="text-xs">Selected</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): { property_structure?: PropertyStructure } {
  return {};
}
