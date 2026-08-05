'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Minus } from 'lucide-react';
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
      <Card className="p-0 overflow-hidden">
        <div className="relative h-64 bg-muted">
          <iframe
            title="Property location map"
            className="absolute inset-0 w-full h-full border-0"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng || 0) - 0.01}%2C${Number(lat || 0) - 0.01}%2C${Number(lng || 0) + 0.01}%2C${Number(lat || 0) + 0.01}&layer=mapnik&marker=${Number(lat || 0)}%2C${Number(lng || 0)}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() =>
                sync({
                  coordinates: {
                    lat: Number(lat || 0) + 0.0001,
                    lng: Number(lng || 0),
                  },
                })
              }
            >
              <Plus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() =>
                sync({
                  coordinates: {
                    lat: Number(lat || 0) - 0.0001,
                    lng: Number(lng || 0),
                  },
                })
              }
            >
              <Minus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="address">Street address</Label>
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
        </div>
      </Card>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const d = data as Partial<Location> | undefined;
  const address = d?.formatted_address?.trim();
  const lat = d?.coordinates?.lat;
  const lng = d?.coordinates?.lng;
  if (!address) return ['Address is required'];
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
    return ['Coordinates are required'];
  }
  return [];
}

export function getData(): Partial<Location> {
  return {};
}
