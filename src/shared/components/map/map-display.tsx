import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useRef, useEffect } from 'react';

const DEFAULT_ZOOM = 14;

interface MapDisplayProps {
  lat: string | number;
  lng: string | number;
  title?: string;
  height?: string;
  className?: string;
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function MapDisplay({ lat, lng, title, height = '300px', className = '' }: MapDisplayProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return () => {};


    const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
    const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;

    if (Number.isNaN(numLat) || Number.isNaN(numLng)) return () => {};

    const center: [number, number] = [numLat, numLng];

    const map = L.map(containerRef.current).setView(center, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    L.marker(center, { icon: defaultIcon }).addTo(map).bindPopup(title || 'Location');

    mapRef.current = map;
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, title]);

  const numLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const numLng = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (Number.isNaN(numLat) || Number.isNaN(numLng)) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-border/60 bg-muted/30 ${className}`} style={{ height }}>
        <span className="text-sm text-muted-foreground">No location coordinates</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative z-0 rounded-lg border border-border/60 overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
