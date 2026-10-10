# Rentals Pilot — `feat/zillow-rentals-pilot` (Nigeria)

Demoable Nigeria rentals browse scoped to `countryId='NG'`, flag-gated, MapLibre centered on Lagos, Paystack + 5-layer verification, NGN via `formatNaira`.

## Routes

- `/rentals` — split list (55%) + MapLibre map (45%) centered on Lagos (6.5244, 3.3792, zoom 11), Zillow-like pill filters, URL-synced state, `GET /api/listings?countryId=NG&listingType=rent`.
- `/rentals/[id]` — NGN detail with image, specs, amenities, MapLibre mini-map, verification tier.
- `/rentals/loading.tsx` — skeleton.

## Stack

- Map: `maplibre-gl` + `maplibre-gl/dist/maplibre-gl.css`, style `https://demotiles.maplibre.org/style.json` (override via `NEXT_PUBLIC_MAP_STYLE`). No token. Lagos bbox. Clustering via `supercluster` (installed, to be wired for >100 pins).
- Pricing: `src/lib/utils.ts` `formatNaira` (and `src/lib/format.ts` helper) — NGN via `Intl.NumberFormat('en-NG', {currency:'NGN'})`. Paystack-ready.
- Verification: existing 5-layer system surfaces `verificationTier` pill on cards/detail.
- Filters: `src/components/rentals/RentalsFilters.tsx` (beds/baths/homeType/price/petFriendly) + `RentalsList.tsx` + `RentalsMap.tsx` (Lagos default).

## Feature flag

- `.env.example`: `NEXT_PUBLIC_ZILLOW_PILOT=0` (Nigeria pilot), `NEXT_PUBLIC_MAP_STYLE=https://demotiles.maplibre.org/style.json`
- Gate: `process.env.NEXT_PUBLIC_ZILLOW_PILOT === '1'` in `src/components/navigation/public-nav.tsx` (adds "Rentals (Pilot)") and in `/rentals` pages (shows coming-soon when off).
- `next.config.js`: adds `images.unsplash.com` remote pattern.

## Data

- Schema: `Listing` adds `zipCode`, `latitude Decimal(10,7)`, `longitude Decimal(11,7)`, indexes `idx_listings_country`, `idx_listings_lat_lng`, `idx_listings_zip`.
- Country/Jurisdiction: `Country NG` (active) + `Country US` (from earlier iteration, harmless) via `prisma/seed-countries.ts`; pilot uses `jur_la` (Lagos) + `jur_fc` (FCT).
- Seed: `prisma/seed-us-rentals.ts` (now NG pilot — keep filename for branch continuity, content is NG) — 30 rentals: 6× Lekki, 6× Ikoyi, 6× VI, 6× Yaba, 6× Abuja (Wuse/Garki/Maitama/Utako/Asokoro/Jahi) with Unsplash images, geo, NGN ₦950k–₦18M per year, `amenities` (borehole/parking/security/gym/pool/generator etc), `verificationTier` basic/verified/inspected. Idempotent `upsert` on `ngp_lst_001..030` + `ListingImage` `isCover`.
- Run: `npx prisma generate && npx tsx prisma/seed-countries.ts && npx tsx prisma/seed-us-rentals.ts`.

## API

- `listingFilterSchema` extended (`src/lib/validators.ts`): `countryId`, `city`, `zipCode`, `minBathrooms/maxBathrooms`, `swLat/swLng/neLat/neLng`, `bbox`, `petFriendly`, `furnished`.
- `GET /api/listings` extended (`src/app/api/listings/route.ts`): `countryId`, `city`, `zipCode`, `bathrooms` range, `furnished`, `bbox` → `latitude {gte,lte}` + `longitude {gte,lte}`. NG pilot queries `countryId=NG`.

## Verification

1. `npx prisma generate && npm run build` — must pass per `CLAUDE.md`.
2. `tsx prisma/seed-us-rentals.ts` twice — no duplicates (`ngp_lst_*` stable).
3. `NEXT_PUBLIC_ZILLOW_PILOT=1 npm run dev` → `/rentals` split view filtered to NG, search "Lekki/Ikoyi/VI/Yaba/Abuja", map centered Lagos, marker hover sync, `/rentals/ngp_lst_001` detail NGN + map. `=0` → nav hidden, `/rentals` shows coming-soon.
4. `/listings` unchanged (NG NGN).

## Next steps (out of pilot)

- Deepen Lagos/Abuja coverage, wire Paystack checkout + 5-layer verification flows, GIS index, supercluster, save/apply tour flows. Africa expansion follows same pattern with new `Country` rows.
