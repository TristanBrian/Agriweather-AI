'use client';

import L from 'leaflet';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

export interface MapLocation {
  lat: number;
  lon: number;
}

interface MapProps {
  selectedLocation: MapLocation | null;
  onLocationSelect: (lat: number, lon: number) => void;
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer().parentElement;
    if (!container) return;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SelectionLayer({ location }: { location: MapLocation | null }) {
  const map = useMap();
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];
    if (!location) return;

    const ring = L.circleMarker([location.lat, location.lon], {
      radius: 18,
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      weight: 2,
    });
    const dot = L.circleMarker([location.lat, location.lon], {
      radius: 6,
      color: '#fff',
      fillColor: '#059669',
      fillOpacity: 1,
      weight: 2,
    });

    ring.addTo(map);
    dot.addTo(map);
    layersRef.current = [ring, dot];
    map.flyTo([location.lat, location.lon], Math.max(map.getZoom(), 8), { duration: 0.6 });

    return () => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
    };
  }, [location, map]);

  return null;
}

export default function Map({ selectedLocation, onLocationSelect }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative h-[400px] w-full rounded-xl shadow-md overflow-hidden z-0 cursor-crosshair">
      {!mounted ? (
        <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-800 text-sm text-gray-500">
          Loading map…
        </div>
      ) : (
        <MapContainer
          center={[-1.2921, 36.8219]}
          zoom={6}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizeFix />
          <ClickHandler onLocationSelect={onLocationSelect} />
          <SelectionLayer location={selectedLocation} />
        </MapContainer>
      )}

      {!selectedLocation && mounted && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-6 text-center">
          <p className="text-sm font-medium text-white drop-shadow">
            Click a field location — forecast appears below
          </p>
        </div>
      )}

      {selectedLocation && (
        <div className="pointer-events-none absolute top-3 left-3 rounded-lg bg-white/95 dark:bg-gray-900/95 px-3 py-2 text-xs shadow-md">
          <span className="text-gray-700 dark:text-gray-200">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
