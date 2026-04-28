import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Iconify } from '@/shared/components/iconify';

import { Box, Typography } from 'src/shared/ui';

// ----------------------------------------------------------------------

interface OrderTrackingMapProps {
  /** Delivery destination coordinates */
  destinationLat: number;
  destinationLng: number;
  destinationLabel?: string;
  /** Live driver location from socket */
  driverLocation: { lat: number; lng: number } | null;
  /** Driver name for popup */
  driverName?: string;
  height?: string;
}

// Custom SVG icons
const createDriverIcon = () =>
  L.divIcon({
    html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="#eab308" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>`,
    className: 'driver-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });

const createDestinationIcon = () =>
  L.divIcon({
    html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    className: 'destination-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

// ----------------------------------------------------------------------

export default function OrderTrackingMap({
  destinationLat,
  destinationLng,
  destinationLabel,
  driverLocation,
  driverName,
  height = '400px',
}: OrderTrackingMapProps) {
  const { t } = useTranslation('table');
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const center: [number, number] = driverLocation
      ? [driverLocation.lat, driverLocation.lng]
      : [destinationLat, destinationLng];

    const map = L.map(containerRef.current, {
      center,
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Destination marker (always shown)
    const destMarker = L.marker([destinationLat, destinationLng], {
      icon: createDestinationIcon(),
    })
      .addTo(map)
      .bindPopup(
        `<div style="padding:4px 8px">
          <strong>${destinationLabel || t('orders.deliveryAddress')}</strong><br/>
          <small>${destinationLat.toFixed(5)}, ${destinationLng.toFixed(5)}</small>
        </div>`
      );

    destinationMarkerRef.current = destMarker;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      driverMarkerRef.current = null;
      destinationMarkerRef.current = null;
      polylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update driver marker and polyline when driverLocation changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !driverLocation) return;

    const { lat, lng } = driverLocation;

    // Create or update driver marker
    if (!driverMarkerRef.current) {
      const marker = L.marker([lat, lng], { icon: createDriverIcon() })
        .addTo(map)
        .bindPopup(
          `<div style="padding:4px 8px">
            <strong>${driverName || t('orders.driver')}</strong>
          </div>`
        );
      driverMarkerRef.current = marker;
    } else {
      driverMarkerRef.current.setLatLng([lat, lng]);
    }

    // Create or update polyline
    const points: [number, number][] = [
      [lat, lng],
      [destinationLat, destinationLng],
    ];

    if (!polylineRef.current) {
      polylineRef.current = L.polyline(points, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);
    } else {
      polylineRef.current.setLatLngs(points);
    }

    // Fit bounds to show both markers
    const group = new L.FeatureGroup([driverMarkerRef.current, destinationMarkerRef.current!]);
    map.fitBounds(group.getBounds().pad(0.15), { animate: true });
  }, [driverLocation, destinationLat, destinationLng, driverName, t]);

  // If no driver location yet, show waiting state
  const showWaiting = !driverLocation;

  return (
    <Box className="relative rounded-xl border border-border/50 overflow-hidden" style={{ height }}>
      {showWaiting && (
        <Box className="absolute inset-0 flex flex-col items-center justify-center bg-muted/60 backdrop-blur-sm z-10 gap-3">
          <Iconify
            icon="solar:map-arrow-right-bold-duotone"
            width={40}
            className="text-primary animate-pulse"
          />
          <Typography variant="body2" className="text-muted-foreground">
            {t('orders.waitingForDriverLocation')}
          </Typography>
        </Box>
      )}

      <div ref={containerRef} className="w-full h-full" />

      {driverLocation && (
        <Box className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg shadow-md border border-border/50 px-3 py-2 z-[1000]">
          <Box className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <Typography variant="caption" className="text-muted-foreground">
              {t('orders.liveTracking')}
            </Typography>
          </Box>
        </Box>
      )}

      <style>{`
        .driver-marker, .destination-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </Box>
  );
}
