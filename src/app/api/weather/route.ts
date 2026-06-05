import { NextRequest, NextResponse } from 'next/server';
import { weatherAIGet, ApiError } from '@/lib/weather-ai';
import { getFromCache, setToCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const days = searchParams.get('days') || '7';
  const units = searchParams.get('units') || 'metric';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required.' }, { status: 400 });
  }

  const cacheKey = `weather:${lat},${lon}:${days}:${units}`;
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await weatherAIGet('/v1/forecast', { lat, lon, days, ai: 'false', units });
    setToCache(cacheKey, data, 10 * 60 * 1000);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Could not load forecast.' }, { status: 502 });
  }
}
