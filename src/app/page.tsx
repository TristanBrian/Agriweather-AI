'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import WeatherDisplay from '@/components/WeatherDisplay';
import HourlyPanel from '@/components/HourlyPanel';
import Tabs from '@/components/Tabs';
import UsageBar from '@/components/UsageBar';
import type { MapLocation } from '@/components/Map';
import type { WeatherResponse } from '@/types';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-400 animate-pulse">
      Loading map…
    </div>
  ),
});

async function fetchWeather(url: string): Promise<WeatherResponse> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load forecast');
  return data;
}

export default function Home() {
  const resultsRef = useRef<HTMLElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const loadWeather = async (url: string, location?: MapLocation) => {
    setLoadingWeather(true);
    setWeatherError(null);
    setWeatherData(null);
    if (location) setSelectedLocation(location);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      const data = await fetchWeather(url);
      setWeatherData(data);
      if (!location && data.location) {
        setSelectedLocation({ lat: data.location.lat, lon: data.location.lon });
      }
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Could not load forecast');
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        {/* Header with title and toggle */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              🌾 Farm Weather Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Precision forecasts & hourly conditions for your fields
            </p>
          </div>
        </header>

        <UsageBar />

        <Tabs
          weatherContent={
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-3 items-center">
                <button
                  type="button"
                  onClick={() => loadWeather('/api/weather/geo?days=7&units=metric')}
                  disabled={loadingWeather}
                  className="inline-flex items-center gap-2 text-sm bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use my location
                </button>
                <span className="text-sm text-gray-400 dark:text-gray-500">or click the map below</span>
              </div>

              <Map
                selectedLocation={selectedLocation}
                onLocationSelect={(lat, lon) =>
                  loadWeather(
                    `/api/weather?lat=${lat}&lon=${lon}&days=7&units=metric`,
                    { lat, lon }
                  )
                }
              />

              {/* Results panel */}
              <section
                ref={resultsRef}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden transition-all"
              >
                <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="font-semibold text-sm md:text-base">7‑day forecast</h2>
                  {selectedLocation && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded">
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {!selectedLocation && !loadingWeather && (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 0l5.447-2.276A1 1 0 0115 5.618v10.764a1 1 0 01-1.447.894L9 17m0 0V7" />
                      </svg>
                      <p className="text-sm font-medium">Select a location to view forecasts</p>
                      <p className="text-xs mt-1">Click the map or enable your location above</p>
                    </div>
                  )}
                  {loadingWeather && (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                  )}
                  {weatherError && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {weatherError}
                    </div>
                  )}
                  {weatherData && !loadingWeather && <WeatherDisplay data={weatherData} embedded />}
                </div>
              </section>
            </div>
          }
          hourlyContent={<HourlyPanel selectedLocation={selectedLocation} />}
        />
      </div>
    </main>
  );
}