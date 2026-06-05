import type { HourlyWeather, WeatherResponse } from '@/types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HourlyDisplay({ data }: { data: WeatherResponse }) {
  const hours = data.hourly?.slice(0, 48) ?? [];

  if (hours.length === 0) {
    return <p className="text-sm text-gray-500">No hourly data available.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {data.location.timezone.replace(/_/g, ' ')} · next {hours.length} hours
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Temp</th>
              <th className="py-2 pr-4">Rain %</th>
              <th className="py-2 pr-4">Wind</th>
              <th className="py-2">Humidity</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h: HourlyWeather) => (
              <tr key={h.time} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-4 whitespace-nowrap">{formatTime(h.time)}</td>
                <td className="py-2 pr-4">{h.temperature}°C</td>
                <td className="py-2 pr-4">{h.precipitation_probability}%</td>
                <td className="py-2 pr-4">{h.wind_speed} m/s</td>
                <td className="py-2">{h.humidity}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
