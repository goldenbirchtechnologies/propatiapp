'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COUNTRIES, NIGERIAN_STATES, MAJOR_CITIES, type AddressData } from '@/lib/locations';
import { Search, Navigation, MapPin } from 'lucide-react';
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
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display_name: data[0].display_name };
  } catch {
    return null;
  }
}

function MiniMap({ center, onPick }: { center: L.LatLngExpression; onPick: (lat: number, lng: number) => void }) {
  return (
    <div className="relative h-48 w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] overflow-hidden">
      <MapWrapper center={center} onPick={onPick} />
    </div>
  );
}

function MapInner({ center }: { center: L.LatLngExpression }) {
 const map = useMap();
 useEffect(() => {
 map.flyTo(center, DEFAULT_ZOOM, { duration: 0 });
 }, [center, map]);
 return null;
}

function MapWrapper({ center, onPick }: { center: L.LatLngExpression; onPick: (lat: number, lng: number) => void }) {
 return (
 <MapContainer center={center} zoom={DEFAULT_ZOOM} className="h-full w-full" scrollWheelZoom>
 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
 <FixDefaultIcon />
 <Marker position={center} />
 <MapClickHandler onPick={onPick} />
 <MapInner center={center} />
 </MapContainer>
 );
}

export interface AddressSelectorProps {
  value?: Partial<AddressData>;
  onChange: (data: AddressData) => void;
}

export default function AddressSelector({ value, onChange }: AddressSelectorProps) {
  const [country, setCountry] = useState(value?.country ?? '');
  const [state, setState] = useState(value?.state ?? '');
  const [city, setCity] = useState(value?.city ?? '');
  const [streetAddress, setStreetAddress] = useState(value?.streetAddress ?? '');
  const [lat, setLat] = useState(value?.coordinates?.lat?.toString() ?? '');
  const [lng, setLng] = useState(value?.coordinates?.lng?.toString() ?? '');
  const [searching, setSearching] = useState(false);
  const [markerPos, setMarkerPos] = useState<L.LatLngExpression>(DEFAULT_CENTER);

  const cities = useMemo(() => {
    if (!state) return [];
    if (state === 'Lagos') return MAJOR_CITIES.Lagos;
    if (MAJOR_CITIES[state]) return MAJOR_CITIES[state];
    return [];
  }, [state]);

const sync = useCallback(
    (patch: Partial<AddressData>) => {
    const data: AddressData = {
      country: "",
      state: "",
      city: "",
      streetAddress: "",
      ...(value ?? {}),
      ...patch,
    };
    onChange(data);
    },
    [onChange, value]
  );

  const handleMarkerPick = useCallback(
    (pickedLat: number, pickedLng: number) => {
      setLat(String(pickedLat));
      setLng(String(pickedLng));
      setMarkerPos([pickedLat, pickedLng]);
      sync({ coordinates: { lat: pickedLat, lng: pickedLng } });
    },
    [sync]
  );

  const handleGeocode = async () => {
    const query = [streetAddress, city, state, country].filter(Boolean).join(', ');
    if (!query.trim()) return;
    setSearching(true);
    try {
      const result = await geocode(query);
      if (result) {
        setLat(String(result.lat));
        setLng(String(result.lng));
        setMarkerPos([result.lat, result.lng]);
        sync({ coordinates: { lat: result.lat, lng: result.lng } });
      }
    } finally {
      setSearching(false);
    }
  };

  const handleCountryChange = (c: string) => {
    setCountry(c);
    setState('');
    setCity('');
    sync({ country: c, state: '', city: '' });
  };

  const handleStateChange = (s: string) => {
    setState(s);
    setCity('');
    sync({ state: s, city: '' });
  };

  const handleCityChange = (c: string) => {
    setCity(c);
    sync({ city: c });
  };

  const handleStreetChange = (v: string) => {
    setStreetAddress(v);
    sync({ streetAddress: v });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <div>
          <Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Country</Label>
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.name}>
                  {c.name} ({c.callingCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* State */}
        <div>
          <Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">State / Province</Label>
          <Select value={state} onValueChange={handleStateChange} disabled={!country}>
            <SelectTrigger>
              <SelectValue placeholder={country ? 'Select state' : 'Select country first'} />
            </SelectTrigger>
            <SelectContent>
              {(country === 'Nigeria' ? NIGERIAN_STATES : []).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div>
          <Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">City / Municipality</Label>
          <Select value={city} onValueChange={handleCityChange} disabled={!state || cities.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={state ? 'Select city' : 'Select state first'} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Street */}
        <div>
          <Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Street Address / Landmark</Label>
          <Input value={streetAddress} onChange={(e) => handleStreetChange(e.target.value)} placeholder="e.g., 12 Admiralty Way" />
        </div>
      </div>

      {/* Map + Geocode */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleGeocode} disabled={searching}>
              <Search className="h-4 w-4 mr-2" />
              {searching ? 'Geocoding...' : 'Geocode'}
            </Button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Click map or search to set coordinates</span>
          </div>
          <MiniMap center={markerPos} onPick={handleMarkerPick} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="lat" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Latitude</Label>
              <Input id="lat" value={lat} onChange={(e) => {
                setLat(e.target.value);
                const n = parseFloat(e.target.value);
                if (Number.isFinite(n)) sync({ coordinates: { lat: n, lng: parseFloat(lng) || 0 } });
              }} />
            </div>
            <div>
              <Label htmlFor="lng" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Longitude</Label>
              <Input id="lng" value={lng} onChange={(e) => {
                setLng(e.target.value);
                const n = parseFloat(e.target.value);
                if (Number.isFinite(n)) sync({ coordinates: { lat: parseFloat(lat) || 0, lng: n } });
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
