import { NextRequest, NextResponse } from 'next/server';
import { weatherAIGet, ApiError } from '@/lib/weather-ai';
import { getFromCache, setToCache, invalidateCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') || '7';
  const units = searchParams.get('units') || 'metric';

  const cacheKey = `weather-geo:${days}:${units}:${ip}`;
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const data = await weatherAIGet('/v1/weather-geo', { ip: 'auto', days, ai: 'false', units });
    invalidateCache('usage:global');
    setToCache(cacheKey, data, 10 * 60 * 1000);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Could not load forecast.' }, { status: 502 });
  }
}