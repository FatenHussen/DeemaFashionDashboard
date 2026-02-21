import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [33.5138, 36.2765]; // Damascus
const DEFAULT_ZOOM = 12;

interface MapPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  height?: string;
  className?: string;
}

// Fix default marker icon for Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function MapPicker({ lat, lng, onChange, height = '300px', className = '' }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = lat ? parseFloat(lat) : DEFAULT_CENTER[0];
    const initialLng = lng ? parseFloat(lng) : DEFAULT_CENTER[1];
    const center: [number, number] = [
      Number.isNaN(initialLat) ? DEFAULT_CENTER[0] : initialLat,
      Number.isNaN(initialLng) ? DEFAULT_CENTER[1] : initialLng,
    ];

    const map = L.map(containerRef.current).setView(center, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const marker = L.marker(center, { icon: defaultIcon }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat: newLat, lng: newLng } = e.latlng;
      marker.setLatLng([newLat, newLng]);
      onChangeRef.current(newLat.toFixed(8), newLng.toFixed(8));
    });

    mapRef.current = map;
    markerRef.current = marker;
  }, []);

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initMap]);

  // Update marker when lat/lng change externally (e.g. from form reset)
  useEffect(() => {
    if (markerRef.current && mapRef.current && lat && lng) {
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);
      if (!Number.isNaN(numLat) && !Number.isNaN(numLng)) {
        markerRef.current.setLatLng([numLat, numLng]);
        mapRef.current.setView([numLat, numLng], mapRef.current.getZoom());
      }
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg border border-border/60 overflow-hidden ${className}`}
      style={{ height }}
    />
  );
}
