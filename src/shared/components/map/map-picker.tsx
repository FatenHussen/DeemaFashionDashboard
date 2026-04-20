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

type NominatimHit = { lat: string; lon: string; display_name: string };

const VOYAGER_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Fix default marker icon for Leaflet
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const SUGGEST_DEBOUNCE_MS = 480;
const MIN_QUERY_LEN = 3;

/** Nominatim: ISO 3166-1 alpha-2, comma-separated. Limits search to Syria. */
const NOMINATIM_COUNTRY_CODES = 'sy';

export function MapPicker({ lat, lng, onChange, height = '300px', className = '' }: MapPickerProps) {
  const { t, i18n } = useTranslation('table');
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<NominatimHit[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialLat = lat ? parseFloat(lat) : MAP_DEFAULT_CENTER[0];
    const initialLng = lng ? parseFloat(lng) : MAP_DEFAULT_CENTER[1];
    const center: [number, number] = [
      Number.isNaN(initialLat) ? MAP_DEFAULT_CENTER[0] : initialLat,
      Number.isNaN(initialLng) ? MAP_DEFAULT_CENTER[1] : initialLng,
    ];

    const map = L.map(containerRef.current).setView(center, DEFAULT_ZOOM);
    L.tileLayer(VOYAGER_TILES, {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 20,
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

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      const el = searchWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const nominatimLang = String(i18n.language || 'en').split(/[-_]/)[0] || 'en';

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < MIN_QUERY_LEN) {
      setSuggestions([]);
      setIsSuggesting(false);
      return;
    }

    const ac = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSuggesting(true);
      setSuggestions([]);
      setSearchError(null);
      try {
        const params = new URLSearchParams({
          format: 'json',
          q,
          limit: '5',
          addressdetails: '0',
          countrycodes: NOMINATIM_COUNTRY_CODES,
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
          signal: ac.signal,
          headers: {
            Accept: 'application/json',
            'Accept-Language': nominatimLang,
          },
        });
        if (!res.ok) {
          setSuggestions([]);
          return;
        }
        const data = (await res.json()) as NominatimHit[];
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setSuggestions([]);
      } finally {
        setIsSuggesting(false);
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [searchQuery, nominatimLang]);

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
    setSuggestions([]);
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        format: 'json',
        q,
        limit: '1',
        countrycodes: NOMINATIM_COUNTRY_CODES,
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          Accept: 'application/json',
          'Accept-Language': nominatimLang,
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
  }, [applyFoundLocation, isSearching, nominatimLang, searchQuery, t]);

  const pickSuggestion = useCallback(
    (hit: NominatimHit) => {
      const numLat = parseFloat(hit.lat);
      const numLng = parseFloat(hit.lon);
      if (Number.isNaN(numLat) || Number.isNaN(numLng)) {
        setSearchError(t('form.mapSearchNoResults'));
        return;
      }
      setSuggestions([]);
      setSearchError(null);
      const shortLabel = hit.display_name.split(',').slice(0, 2).join(',').trim();
      setSearchQuery(shortLabel || hit.display_name);
      applyFoundLocation(numLat, numLng);
    },
    [applyFoundLocation, t]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div ref={searchWrapRef} className="relative z-[2000]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2">
          <Input
            floatingLabel={false}
            size="sm"
            fullWidth
            className="min-w-0 flex-1"
            placeholder={t('form.mapSearchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestions[0]) {
                  pickSuggestion(suggestions[0]);
                } else {
                  void runSearch();
                }
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
        {isSuggesting || suggestions.length > 0 ? (
          <ul
            className="absolute left-0 right-0 top-full z-[2100] mt-1 max-h-52 overflow-auto rounded-lg border border-border/80 bg-popover text-popover-foreground shadow-md"
            role="listbox"
          >
            {isSuggesting && suggestions.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground">{t('form.mapSearchSuggesting')}</li>
            ) : null}
            {suggestions.map((hit, idx) => (
              <li key={`${hit.lat}-${hit.lon}-${idx}`}>
                <button
                  type="button"
                  role="option"
                  className="w-full px-3 py-2 text-left text-xs hover:bg-muted/80 focus:bg-muted/80 focus:outline-none"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(hit)}
                >
                  {hit.display_name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {searchError ? <p className="text-xs text-destructive">{searchError}</p> : null}
      <div
        ref={containerRef}
        className="relative z-0 rounded-lg border border-border/60 overflow-hidden"
        style={{ height }}
      />
    </div>
  );
}
