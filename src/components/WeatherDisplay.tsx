import type { CurrentWeather, DailyWeather, HourlyWeather, WeatherResponse } from '@/types';

function conditionLabel(icon: string, code: string): string {
  const match = icon.match(/\/(\d+)_(.+)\.svg$/);
  if (match) return match[2].replace(/_/g, ' ');
  return `Condition ${code}`;
}

function enrichCurrent(
  current: CurrentWeather,
  hourly: HourlyWeather[]
): CurrentWeather {
  const match = hourly.find((h) => h.time === current.time) ?? hourly[0];
  if (!match) return current;
  return {
    ...current,
    humidity: current.humidity ?? match.humidity,
    feels_like: current.feels_like ?? match.feels_like,
  };
}

export default function WeatherDisplay({
  data,
  embedded = false,
}: {
  data: WeatherResponse;
  embedded?: boolean;
}) {
  const { location, current, daily, hourly } = data;
  const enriched = enrichCurrent(current, hourly);

  return (
    <div className={`space-y-4 ${embedded ? '' : 'mt-6'}`}>
      <div className={`p-4 rounded-xl shadow ${embedded ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'}`}>
        <h2 className="text-xl font-semibold mb-1">
          {location.timezone.replace(/_/g, ' ')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          {location.country ? ` · ${location.country}` : ''}
        </p>

        <div className="flex items-center gap-3 mb-3">
          <img src={enriched.icon} alt="" className="h-12 w-12" />
          <div>
            <p className="text-2xl font-bold">{enriched.temperature}°C</p>
            <p className="capitalize text-gray-600 dark:text-gray-300">
              {conditionLabel(enriched.icon, enriched.condition_code)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {enriched.feels_like != null && <p>Feels like: {enriched.feels_like}°C</p>}
          {enriched.humidity != null && <p>Humidity: {enriched.humidity}%</p>}
          <p>Wind: {enriched.wind_speed} m/s</p>
        </div>
      </div>

      <h3 className="font-medium text-lg">Next 7 days</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {daily.map((day) => (
          <DayCard key={day.date} day={day} />
        ))}
      </div>
    </div>
  );
}

function DayCard({ day }: { day: DailyWeather }) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow text-sm">
      <p className="font-medium">
        {new Date(day.date).toLocaleDateString('en', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <img src={day.icon} alt="" className="h-8 w-8 my-1" />
      <p className="capitalize text-gray-600 dark:text-gray-300">
        {conditionLabel(day.icon, day.condition_code)}
      </p>
      <p>
        {day.temp_min}° → {day.temp_max}°
      </p>
      <p className="text-gray-500">{day.precipitation_probability}% chance of rain</p>
    </div>
  );
}
