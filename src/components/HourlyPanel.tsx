'use client';

import { useState } from 'react';
import HourlyDisplay from '@/components/HourlyDisplay';
import UsageDashboard from '@/components/UsageDashboard';
import type { MapLocation } from '@/components/Map';
import type { WeatherResponse } from '@/types';

interface HourlyPanelProps {
  selectedLocation: MapLocation | null;
}

export default function HourlyPanel({ selectedLocation }: HourlyPanelProps) {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHourly = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/weather/hourly?lat=${lat}&lon=${lon}&days=2&units=metric`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not load hourly forecast');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFromGeo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather/geo?days=2&units=metric');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-gray-500">
        Hour-by-hour conditions for planning field work, spraying, or irrigation.
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={loadFromGeo}
          disabled={loading}
          className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          Use my location
        </button>
        {selectedLocation && (
          <button
            type="button"
            onClick={() => loadHourly(selectedLocation.lat, selectedLocation.lon)}
            disabled={loading}
            className="text-sm border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 disabled:opacity-50"
          >
            Use map selection
          </button>
        )}
      </div>

      <section className="rounded-xl border bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold text-sm mb-3">Next 48 hours</h2>
        {loading && <p className="text-center py-8 text-gray-500">Loading…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {data && !loading && <HourlyDisplay data={data} />}
        {!loading && !error && !data && (
          <p className="text-center py-8 text-gray-400 text-sm">
            Choose a location above, or pick a spot on the Forecast tab first.
          </p>
        )}
      </section>

      <section className="rounded-xl border bg-white dark:bg-gray-800 p-4">
        <h2 className="font-semibold text-sm mb-3">Your plan</h2>
        <UsageDashboard />
      </section>
    </div>
  );
}
