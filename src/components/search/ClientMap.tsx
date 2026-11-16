'use client';

import * as React from 'react';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { MapPin, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ListingData } from '@/components/listings/listing-card';

export interface ClientMapProps {
  properties: ListingData[];
  loading?: boolean;
  error?: boolean;
  onPropertySelect?: (property: ListingData) => void;
  onViewDetails?: (property: ListingData) => void;
  onPropertyHover?: (property: ListingData | null) => void;
  selectedId?: string | null;
  hoveredId?: string | null;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
}

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria
const DEFAULT_ZOOM = 12;

const getCategoryColor = (listingType: string): string => {
  const colors: Record<string, string> = {
    rent: '#087A59',
    sale: '#087A59',
    short_let: '#f59e0b',
    commercial: '#3b82f6',
    share: '#087A59',
  };
  return colors[listingType] ?? '#087A59';
};

// Deterministic pseudo-spread around the centre so markers are stable across renders.
const markerPosition = (index: number, center: { lat: number; lng: number }) => {
  const latOffset = (((index * 37) % 41) / 41) * 0.14 - 0.07;
  const lngOffset = (((index * 73) % 41) / 41) * 0.14 - 0.07;
  return { lat: center.lat + latOffset, lng: center.lng + lngOffset };
};

const pinIcon = (color: string, active: boolean) => {
  const d = active ? 34 : 28;
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; left:50%; top:100%; transform: translate(-50%, -100%);">
        <div style="position:relative; width:${d}px; height:${d}px; background:${color}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); ${active ? `box-shadow: 0 0 0 4px ${color}80, 0 2px 6px rgba(0,0,0,0.3);` : ''}"></div>
        <div style="position:absolute; left:50%; top:100%; transform: translateX(-50%); width:0; height:0; border-left:${Math.max(d / 5, 2)}px solid transparent; border-right:${Math.max(d / 5, 2)}px solid transparent; border-top:${Math.max(d / 3, 4)}px solid ${color};"></div>
      </div>
    `,
    iconSize: [d, d + 12],
    iconAnchor: [d / 2, d + 12],
    popupAnchor: [0, -d - 2],
  });
};

const clusterIcon = (count: number) => {
  const d = Math.min(32 + count * 4, 64);
  return L.divIcon({
    className: '',
    html: `<div style="width:${d}px;height:${d}px;background:#087A59;border-radius:50%;border:4px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${Math.max(12, d / 3.5)}px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${count}</div>`,
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
  });
};

const formatMapPrice = (price: number) => `₦${price.toLocaleString()}`;

export default function ClientMap({
  properties,
  loading = false,
  error = false,
  onPropertySelect,
  onViewDetails,
  onPropertyHover,
  selectedId = null,
  hoveredId = null,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  className,
}: ClientMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);

  const markers = useMemo(
    () =>
      properties.map((property, index) => ({
        ...property,
        position: markerPosition(index, initialCenter),
      })),
    [properties, initialCenter],
  );

  const createClusters = useCallback((items: any[], z: number): any[] => {
    const clusterDistance = 70 / Math.pow(2, z - 11);
    const clusters: any[] = [];
    const processed = new Set<string>();
    items.forEach((marker) => {
      if (processed.has(marker.id)) return;
      const group: any[] = [marker];
      processed.add(marker.id);
      items.forEach((other) => {
        if (processed.has(other.id)) return;
        const dist = Math.sqrt(
          Math.pow(marker.position.lat - other.position.lat, 2) + Math.pow(marker.position.lng - other.position.lng, 2),
        );
        if (dist < clusterDistance) {
          group.push(other);
          processed.add(other.id);
        }
      });
      clusters.push({
        ...group[0],
        position: {
          lat: group.reduce((s: number, p: any) => s + p.position.lat, 0) / group.length,
          lng: group.reduce((s: number, p: any) => s + p.position.lng, 0) / group.length,
        },
        __cluster: true,
        __count: group.length,
        __members: group,
      });
    });
    return clusters;
  }, []);

  const clusters = useMemo(() => createClusters(markers, initialZoom), [markers, initialZoom, createClusters]);

  const clearMarkers = useCallback(() => {
    if (!map.current) return;
    map.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) map.current.removeLayer(layer);
    });
  }, []);

  const renderMarkers = useCallback(() => {
    if (!map.current) return;
    clearMarkers();
    clusters.forEach((cluster: any) => {
      const isSingle = cluster.__count === 1;
      const member = isSingle ? cluster : cluster.__members[0];
      const active = member.id === selectedId || member.id === hoveredId;
      const icon = isSingle ? pinIcon(getCategoryColor(member.listingType), active) : clusterIcon(cluster.__count);
      const marker = L.marker([cluster.position.lat, cluster.position.lng], { icon });
      if (isSingle) {
        marker.on('click', () => onPropertySelect?.(member));
        marker.on('mouseover', () => onPropertyHover?.(member));
        marker.on('mouseout', () => onPropertyHover?.(null));
        const content = `
          <div class="p-2 leading-tight min-w-[180px]">
            <div class="font-bold text-[#111827] text-sm">${member.title}</div>
            <div class="text-[#087A59] font-bold text-sm">${formatMapPrice(member.price)}</div>
            <div class="text-xs text-[#6b7280] mt-0.5">${member.address}, ${member.area}</div>
            <button id="view-details-${member.id}" class="mt-2 w-full rounded text-[10px] font-bold text-[#087A59] underline underline-offset-1 hover:text-[#065B43]">View details</button>
          </div>`;
        marker.bindPopup(content);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-details-${member.id}`);
          btn?.addEventListener('click', (e: Event) => {
            e.stopPropagation();
            onViewDetails?.(member);
          });
        });
      } else {
        marker.on('click', () => onPropertySelect?.(member));
      }
      marker.addTo(map.current);
    });
  }, [clusters, selectedId, hoveredId, onPropertySelect, onViewDetails, onPropertyHover, clearMarkers]);

  useEffect(() => {
    if (loading || error) return;
    if (!mapRef.current) return;
    if (!map.current) {
      map.current = L.map(mapRef.current, {
        center: [initialCenter.lat, initialCenter.lng],
        zoom: initialZoom,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map.current);
    }
    renderMarkers();
    return () => {
      clearMarkers();
    };
  }, [initialCenter, initialZoom, renderMarkers, loading, error]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className={cn('relative w-full bg-[#F7F9F8]', className)}>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-48 rounded-full bg-[#E5E9E7] animate-pulse" />
        </div>
      ) : error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <MapPin className="mb-3 size-10 text-[#6b7280]" />
          <h3 className="text-sm font-bold text-[#111827]">Map unavailable</h3>
          <p className="text-xs text-[#6b7280]">Unable to load map tiles.</p>
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-full" />
      )}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <Button size="icon" variant="outline" className="bg-white shadow-lg" onClick={() => map.current?.zoomIn()}>
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" className="bg-white shadow-lg" onClick={() => map.current?.zoomOut()}>
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button size="icon" variant="outline" className="bg-white shadow-lg" aria-label="Map layers">
          <Layers className="h-5 w-5" />
        </Button>
      </div>
      <div className="absolute top-4 left-4 z-20">
        <Card className="shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#087A59]" />
              <span className="font-semibold text-sm text-[#111827]">
                {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
