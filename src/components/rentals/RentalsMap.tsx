'use client';

import { useEffect, useRef } from 'react';
import { formatNaira } from '@/lib/utils';

type RentalPoint = {
  id: string;
  latitude: number;
  longitude: number;
  price: number | string;
  title?: string;
};

type Props = {
  points: RentalPoint[];
  hoveredId?: string | null;
  onBoundsChange?: (bbox: { swLat: number; swLng: number; neLat: number; neLng: number }) => void;
  onMarkerClick?: (id: string) => void;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
};

export default function RentalsMap({ points, hoveredId, onBoundsChange, onMarkerClick, initialCenter, initialZoom }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!containerRef.current || mapRef.current) return;
      const maplibregl = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');

      const style = process.env.NEXT_PUBLIC_MAP_STYLE || 'https://demotiles.maplibre.org/style.json';
      const center: [number, number] = initialCenter ? [initialCenter.lng, initialCenter.lat] : [3.3792, 6.5244];
      const zoom = initialZoom ?? 11;

      const map = new maplibregl.Map({
        container: containerRef.current!,
        style,
        center,
        zoom,
        attributionControl: true,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current = map;

      if (onBoundsChange) {
        const emit = () => {
          const b = map.getBounds();
          if (!b) return;
          onBoundsChange({ swLat: b.getSouth(), swLng: b.getWest(), neLat: b.getNorth(), neLng: b.getEast() });
        };
        map.on('moveend', emit);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialCenter, initialZoom, onBoundsChange]);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (async () => {
      const maplibregl = await import('maplibre-gl');
      // clear old
      for (const [, m] of markersRef.current) m.remove();
      markersRef.current.clear();

      for (const p of points) {
        if (p.latitude == null || p.longitude == null) continue;
        const el = document.createElement('div');
        const isHovered = hoveredId === p.id;
        el.className = `px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg cursor-pointer border transition-all ${isHovered ? 'bg-emerald-600 text-white border-emerald-500 scale-110' : 'bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50'}`;
        el.textContent = formatNaira(Number(p.price));
        el.addEventListener('click', () => onMarkerClick?.(p.id));
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([p.longitude, p.latitude]).addTo(map);
        markersRef.current.set(p.id, marker);
      }
    })();
  }, [points, hoveredId, onMarkerClick]);

  // Fly to hovered
  useEffect(() => {
    if (!hoveredId || !mapRef.current) return;
    const p = points.find((x) => x.id === hoveredId);
    if (!p) return;
    // subtle pulse already via class; no fly needed to avoid jitter
  }, [hoveredId, points]);

  return (
    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 relative">
      <div ref={containerRef} className="absolute inset-0" />
      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-zinc-500 bg-white/90 px-3 py-1.5 rounded-full shadow">No rentals in this area</span>
        </div>
      )}
    </div>
  );
}
