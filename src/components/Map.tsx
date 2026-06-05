'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ---------- fix default icon path issue (common with bundlers) ----------
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// ---------- types ----------
export interface MapLocation {
  lat: number;
  lon: number;
}

// ---------- inner components ----------
function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Pans the map to the selected location whenever it changes */
function FlyToSelected({ loc }: { loc: MapLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (loc) {
      map.flyTo([loc.lat, loc.lon], map.getZoom(), { duration: 0.8 });
    }
  }, [loc, map]);
  return null;
}

// ---------- main component ----------
export default function Map({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation: MapLocation | null;
  onLocationSelect: (lat: number, lon: number) => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="h-[400px] rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-400 animate-pulse">
        Loading map…
      </div>
    );
  }

  return (
    <MapContainer
      center={[-1.2921, 36.8219]}
      zoom={6}
      scrollWheelZoom={true}
      className="h-[400px] w-full rounded-xl shadow-md z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
      {selectedLocation && <Marker position={[selectedLocation.lat, selectedLocation.lon]} />}
      <FlyToSelected loc={selectedLocation} />
    </MapContainer>
  );
}