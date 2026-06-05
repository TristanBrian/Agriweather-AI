'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapLocation {
  lat: number;
  lon: number;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

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
      center={[selectedLocation?.lat ?? -1.2921, selectedLocation?.lon ?? 36.8219]}
      zoom={6}
      scrollWheelZoom={true}
      className="h-[400px] w-full rounded-xl shadow-md z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}