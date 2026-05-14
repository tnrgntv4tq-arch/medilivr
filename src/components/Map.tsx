'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: { lat: number; lng: number; label: string; color?: string }[];
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
}

const ICON_COLORS: Record<string, string> = {
  blue: '#2563eb',
  green: '#20ae6b',
  red: '#ef4444',
  orange: '#f2793a',
};

function createIcon(color: string) {
  const hex = ICON_COLORS[color] || color;
  return L.divIcon({
    className: '',
    html: `<div style="background:${hex};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function Map({ center, zoom = 13, markers = [], className = 'h-64', onMapClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) mapInstance.current.remove();

    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, zoom);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    markers.forEach((m) => {
      L.marker([m.lat, m.lng], { icon: createIcon(m.color || 'blue') })
        .addTo(map)
        .bindPopup(`<div style="font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;padding:2px 0">${m.label}</div>`);
    });

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
    }

    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    mapInstance.current = map;
    return () => { map.remove(); };
  }, [center, zoom, markers, onMapClick]);

  return <div ref={mapRef} className={`${className}`} style={{ borderRadius: 'inherit' }} />;
}
