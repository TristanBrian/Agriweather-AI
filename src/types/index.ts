/** API response types — https://weather-ai.co/docs */

export interface WeatherLocation {
  lat: number;
  lon: number;
  timezone: string;
  requested_lat?: number;
  requested_lon?: number;
  country?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  wind_speed: number;
  wind_direction?: number;
  condition_code: string;
  icon: string;
  icon_path?: string;
  humidity?: number;
  feels_like?: number;
  ai_summary?: string;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  precipitation_probability: number;
  wind_speed: number;
  condition_code: string;
  icon: string;
  humidity: number;
  feels_like: number;
  wind_gust?: number;
  uv_index?: number;
  icon_path?: string;
}

export interface DailyWeather {
  date: string;
  temp_min: number;
  temp_max: number;
  precipitation_sum: number;
  precipitation_probability: number;
  sunrise: string;
  sunset: string;
  condition_code: string;
  icon: string;
  wind_max: number;
  icon_path?: string;
  ai_summary?: string;
}

export interface WeatherResponse {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  ai_summary?: string;
  client_geo?: Record<string, unknown>;
}

/** GET /v1/usage */
export interface UsageResponse {
  plan?: string;
  requests_used?: number;
  requests_limit?: number;
  ai_requests_used?: number;
  ai_requests_limit?: number;
  period_start?: string;
  period_end?: string;
  [key: string]: unknown;
}
