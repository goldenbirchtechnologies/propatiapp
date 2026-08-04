'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin } from 'lucide-react';
import type { Location } from '../types';

export interface Step3Props {
  value?: Partial<Location>;
  onChange: (value: Partial<Location>) => void;
}

export default function Step3Location({ value, onChange }: Step3Props) {
  const [address, setAddress] = useState(value?.formatted_address ?? '');
  const [lat, setLat] = useState(value?.coordinates?.lat?.toString() ?? '');
  const [lng, setLng] = useState(value?.coordinates?.lng?.toString() ?? '');
  const [precise, setPrecise] = useState(value?.show_precise_location ?? true);

  const sync = (patch: Partial<Location>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Where is your place located?</h2>
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="address"
              placeholder="Enter your street address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                sync({ formatted_address: e.target.value });
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              placeholder="e.g. 6.5244"
              value={lat}
              onChange={(e) => {
                setLat(e.target.value);
                const coordinates = {
                  lat: parseFloat(e.target.value) || 0,
                  lng: parseFloat(lng) || 0,
                };
                sync({ coordinates: coordinates as Location['coordinates'] });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              placeholder="e.g. 3.3792"
              value={lng}
              onChange={(e) => {
                setLng(e.target.value);
                const coordinates = {
                  lat: parseFloat(lat) || 0,
                  lng: parseFloat(e.target.value) || 0,
                };
                sync({ coordinates: coordinates as Location['coordinates'] });
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="precise">Show precise location on map</Label>
          <Switch
            id="precise"
            checked={precise}
            onCheckedChange={(checked) => {
              setPrecise(checked);
              sync({ show_precise_location: checked });
            }}
          />
        </div>
      </Card>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): Partial<Location> {
  return {};
}
