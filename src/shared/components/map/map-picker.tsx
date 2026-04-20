import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input } from 'src/shared/ui';

export const MAP_DEFAULT_CENTER: [number, number] = [33.5138, 36.2765]; // Damascus
const DEFAULT_ZOOM = 12;
const SEARCH_ZOOM = 16;

interface MapPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  height?: string;
  className?: string;
}

type NominatimHit = { lat: string; lon: string };

// Fix default marker icon for Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function MapPicker({ lat, lng, onChange, height = '300px', className = '' }: MapPickerProps) {
  const { t, i18n } = useTranslation('table');
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = lat ? parseFloat(lat) : MAP_DEFAULT_CENTER[0];
    const initialLng = lng ? parseFloat(lng) : MAP_DEFAULT_CENTER[1];
    const center: [number, number] = [
      Number.isNaN(initialLat) ? MAP_DEFAULT_CENTER[0] : initialLat,
      Number.isNaN(initialLng) ? MAP_DEFAULT_CENTER[1] : initialLng,
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

  const applyFoundLocation = useCallback((numLat: number, numLng: number) => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([numLat, numLng]);
    mapRef.current.setView([numLat, numLng], SEARCH_ZOOM);
    onChangeRef.current(numLat.toFixed(8), numLng.toFixed(8));
  }, []);

  const runSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q || isSearching) return;

    setSearchError(null);
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        format: 'json',
        q,
        limit: '1',
      });
      const lang = String(i18n.language || 'en').split(/[-_]/)[0] || 'en';
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': lang,
        },
      });
      if (!res.ok) {
        setSearchError(t('form.mapSearchFailed'));
        return;
      }
      const data = (await res.json()) as NominatimHit[];
      const hit = data[0];
      if (!hit) {
        setSearchError(t('form.mapSearchNoResults'));
        return;
      }
      const numLat = parseFloat(hit.lat);
      const numLng = parseFloat(hit.lon);
      if (Number.isNaN(numLat) || Number.isNaN(numLng)) {
        setSearchError(t('form.mapSearchNoResults'));
        return;
      }
      applyFoundLocation(numLat, numLng);
    } catch {
      setSearchError(t('form.mapSearchFailed'));
    } finally {
      setIsSearching(false);
    }
  }, [applyFoundLocation, i18n.language, isSearching, searchQuery, t]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
        <Input
          floatingLabel={false}
          size="sm"
          fullWidth
          className="min-w-0 flex-1"
          placeholder={t('form.mapSearchPlaceholder')}
          value={searchQuery}
          disabled={isSearching}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void runSearch();
            }
          }}
        />
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          size="small"
          loading={isSearching}
          className="shrink-0 sm:mt-0"
          disabled={!searchQuery.trim()}
          onClick={() => void runSearch()}
        >
          {t('form.mapSearchButton')}
        </Button>
      </div>
      {searchError ? <p className="text-xs text-destructive">{searchError}</p> : null}
      <div
        ref={containerRef}
        className="rounded-lg border border-border/60 overflow-hidden"
        style={{ height }}
      />
    </div>
  );
}
