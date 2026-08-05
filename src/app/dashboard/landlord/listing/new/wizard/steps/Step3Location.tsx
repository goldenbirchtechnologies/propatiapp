'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Navigation } from 'lucide-react';
import type { Location } from '../types';

import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: L.LatLngExpression = [6.5244, 3.3792];
const DEFAULT_ZOOM = 13;

function FixDefaultIcon() {
  useEffect(() => {
    const iconDefault = L.Marker.prototype.options.icon;
    if (iconDefault && (iconDefault as any)._retrieve) return;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);
  return null;
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ center, zoom }: { center: L.LatLngExpression; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom ?? map.getZoom(), { duration: 1.2 });
  }, [center, map, zoom]);
  return null;
}

async function geocode(query: string): Promise<{ lat: number; lng: number; display_name: string } | null> {
  if (!query.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!data[0]) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
}

export interface Step3Props {
  value?: Partial<Location>;
  onChange: (value: Partial<Location>) => void;
}

export default function Step3Location({ value, onChange }: Step3Props) {
  const [address, setAddress] = useState(value?.formatted_address ?? '');
  const [lat, setLat] = useState(value?.coordinates?.lat?.toString() ?? '');
  const [lng, setLng] = useState(value?.coordinates?.lng?.toString() ?? '');
  const [precise, setPrecise] = useState(value?.show_precise_location ?? true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const markerRef = useRef<L.Marker | null>(null);

  const latNum = useMemo(() => (lat ? parseFloat(lat) : NaN), [lat]);
  const lngNum = useMemo(() => (lng ? parseFloat(lng) : NaN), [lng]);

  const sync = (patch: Partial<Location>) => {
    onChange({ ...value, ...patch });
  };

  useEffect(() => {
    const latVal = Number.isFinite(latNum) ? latNum : DEFAULT_CENTER[0];
    const lngVal = Number.isFinite(lngNum) ? lngVal : DEFAULT_CENTER[1];
    markerRef.current?.setLatLng([latVal, lngVal]);
  }, [latNum, lngNum]);

  const handlePick = (pickedLat: number, pickedLng: number) => {
    setLat(String(pickedLat));
    setLng(String(pickedLng));
    sync({ coordinates: { lat: pickedLat, lng: pickedLng } as Location['coordinates'] });
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const result = await geocode(search);
      if (!result) return;
      setLat(String(result.lat));
      setLng(String(result.lng));
      setAddress(result.display_name);
      sync({
        formatted_address: result.display_name,
        coordinates: { lat: result.lat, lng: result.lng } as Location['coordinates'],
      });
    } finally {
      setSearching(false);
    }
  };

  const center = Number.isFinite(latNum) && Number.isFinite(lngNum)
    ? ([latNum, lngNum] as L.LatLngExpression)
    : DEFAULT_CENTER;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Where is your place located?</h2>
      <Card className="p-0 overflow-hidden">
        <div className="relative h-80">
          <MapContainer
            center={center}
            zoom={DEFAULT_ZOOM}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FixDefaultIcon />
            <MapClickHandler onPick={handlePick} />
            <FlyTo center={center} zoom={DEFAULT_ZOOM} />
            <Marker
              position={center}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = e.target.getLatLng();
                  handlePick(pos.lat, pos.lng);
                },
              }}
            />
          </MapContainer>
        </div>

        <div className="p-4 space-y-4 border-t">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search a place or address"
                className="pl-9"
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>

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
            <Button
              type="button"
              variant={precise ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setPrecise(!precise);
                sync({ show_precise_location: !precise });
              }}
            >
              <Navigation className="size-4 mr-2" />
              {precise ? 'Precise: ON' : 'Precise: OFF'}
            </Button>
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
