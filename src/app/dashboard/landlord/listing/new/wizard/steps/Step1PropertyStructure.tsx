'use client';

import { Home, Hotel, Warehouse, Tent, Check } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
  { value: 'hotel', label: 'Hotel', icon: <Hotel className="size-5" /> },
  { value: 'tent', label: 'Tent', icon: <Tent className="size-5" /> },
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
              className={`relative cursor-pointer transition border-2 ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <div className="p-4 flex flex-col items-center gap-2 text-center">
                <div className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {opt.icon}
                </div>
                <span className="text-sm font-medium">{opt.label}</span>
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
