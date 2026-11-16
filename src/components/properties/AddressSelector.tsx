'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COUNTRIES, NIGERIAN_STATES, type AddressData } from '@/lib/locations';
import { Search, MapPin } from 'lucide-react';

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

	const cities = useMemo(() => {
		if (country === 'Nigeria' && state && NIGERIAN_STATES.includes(state as any)) {
			if (state === 'Lagos') return LAGOS_CITIES;
			return [];
		}
		return [];
	}, [country, state]);

	const handleStateChange = (val: string) => {
		setState(val);
		setCity('');
		sync({ state: val, city: '' });
	};

	const handleCityChange = (val: string) => {
		setCity(val);
		sync({ city: val });
	};

	const handleStreetChange = (val: string) => {
		setStreetAddress(val);
		sync({ streetAddress: val });
	};

	const handleGeocode = async () => {
		setSearching(true);
		try {
			const query = `${streetAddress}, ${city}, ${state}, ${country}`.trim();
			if (!query) return;
			const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
			const res = await fetch(url, { headers: { Accept: 'application/json' } });
			if (!res.ok) return;
			const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
			if (data[0]) {
				setLat(data[0].lat);
				setLng(data[0].lon);
			}
		} catch {
			// ignore geocode errors
		} finally {
			setSearching(false);
		}
	};

	const sync = useCallback(
		(patch: Partial<AddressData>) => {
			const data: AddressData = {
				country: '',
				state: '',
				city: '',
				streetAddress: '',
				...(value ?? {}),
				...patch,
			};
			onChange(data);
		},
		[onChange, value]
	);

	return (
		<div className="space-y-4">
			{/* Country */}
			<div>
				<Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Country</Label>
				<Select value={country} onValueChange={setCountry}>
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
				<Input
					value={city}
					onChange={(e) => handleCityChange(e.target.value)}
					placeholder="e.g., Lekki, Victoria Island, Ikeja"
					disabled={!state}
				/>
			</div>

			{/* Street */}
			<div>
				<Label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Street Address / Landmark</Label>
				<Input value={streetAddress} onChange={(e) => handleStreetChange(e.target.value)} placeholder="e.g., 12 Admiralty Way" />
			</div>

			{/* Coordinates */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="flex items-center gap-2">
					<Button type="button" variant="outline" size="sm" onClick={handleGeocode} disabled={searching || !streetAddress}>
						<Search className="h-4 w-4 mr-2" />
						{searching ? 'Geocoding...' : 'Geocode'}
					</Button>
					<span className="text-xs text-zinc-500 dark:text-zinc-400">Lookup coordinates from address</span>
				</div>
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
	);
}

const LAGOS_CITIES = [
	'Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba', 'Festac Town',
	'Amuwo-Odofin', 'Epe', 'Ikorodu', 'Badagry', 'Ogudu', 'Gbagada',
] as const;
