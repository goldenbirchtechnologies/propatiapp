'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Users, Bed, Bath } from 'lucide-react';
import type { FloorPlan } from '../types';

export interface Step4Props {
  value?: Partial<FloorPlan>;
  onChange: (value: Partial<FloorPlan>) => void;
}

const DEFAULTS: FloorPlan = {
  guests_count: 4,
  bedrooms_count: 3,
  beds_count: 1,
  bathrooms_count: 2,
};

export default function Step4Capacity({ value, onChange }: Step4Props) {
  const [guests, setGuests] = useState(value?.guests_count ?? DEFAULTS.guests_count);
  const [bedrooms, setBedrooms] = useState(value?.bedrooms_count ?? DEFAULTS.bedrooms_count);
  const [beds, setBeds] = useState(value?.beds_count ?? DEFAULTS.beds_count);
  const [bathrooms, setBathrooms] = useState(value?.bathrooms_count ?? DEFAULTS.bathrooms_count);

  useEffect(() => {
    onChange({
      guests_count: guests,
      bedrooms_count: bedrooms,
      beds_count: beds,
      bathrooms_count: bathrooms,
    });
  }, [guests, bedrooms, beds, bathrooms, onChange]);

  const Stepper = ({
    label,
    value,
    onChange: setValue,
    min,
    max,
    step = 1,
    icon,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step?: number;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-9 p-0"
          onClick={() => setValue(Math.max(min, value - step))}
        >
          -
        </Button>
        <span className="w-10 text-center text-sm font-medium">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="size-9 p-0"
          onClick={() => setValue(Math.min(max, value + step))}
        >
          +
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">How many guests can your place accommodate?</h2>
      <Card className="p-4">
        <Stepper
          label="Guests"
          value={guests}
          onChange={setGuests}
          min={1}
          max={50}
          icon={<Users className="size-5" />}
        />
        <Stepper
          label="Bedrooms"
          value={bedrooms}
          onChange={setBedrooms}
          min={0}
          max={50}
          icon={<Bed className="size-5" />}
        />
        <Stepper
          label="Beds"
          value={beds}
          onChange={setBeds}
          min={1}
          max={100}
          icon={<Bed className="size-5" />}
        />
        <Stepper
          label="Bathrooms"
          value={bathrooms}
          onChange={setBathrooms}
          min={0.5}
          max={50}
          step={0.5}
          icon={<Bath className="size-5" />}
        />
      </Card>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const d = data as Partial<FloorPlan> | undefined;
  if (!d) {
    errors.push('Capacity fields are required');
    return errors;
  }
  if (typeof d.guests_count !== 'number' || d.guests_count < 1) {
    errors.push('Guests count must be at least 1');
  }
  if (typeof d.beds_count !== 'number' || d.beds_count < 1) {
    errors.push('Beds count must be at least 1');
  }
  if (typeof d.bathrooms_count !== 'number' || d.bathrooms_count < 0.5) {
    errors.push('Bathrooms count must be at least 0.5');
  }
  return errors;
}

export function getData(): Partial<FloorPlan> {
  return {};
}
