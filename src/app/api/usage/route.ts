import { NextRequest, NextResponse } from 'next/server';
import { weatherAIGet, ApiError } from '@/lib/weather-ai';
import { getFromCache, setToCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

// Shape of the raw response from Weather AI’s /v1/usage
interface RawUsageResponse {
  plan?: string;
  period?: {
    start?: string;
    end?: string;
    requestCount?: number;
    aiRequestCount?: number;
  };
  limits?: {
    requests?: number;
    aiRequests?: number;
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  // 15‑second cache to prevent hammering the rate limiter
  const cacheKey = 'usage:normalised';
  const cached = getFromCache(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const raw = (await weatherAIGet('/v1/usage', {})) as RawUsageResponse;

    const normalised = {
      plan: raw.plan ?? 'free',
      requests_used: raw.period?.requestCount ?? 0,
      requests_limit: raw.limits?.requests ?? 0,
      ai_requests_used: raw.period?.aiRequestCount ?? 0,
      ai_requests_limit: raw.limits?.aiRequests ?? 0,
      billing_period_start: raw.period?.start ?? null,
      billing_period_end: raw.period?.end ?? null,
    };

    setToCache(cacheKey, normalised, 15_000); // 15 seconds
    return NextResponse.json(normalised);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Could not load usage.' }, { status: 502 });
  }
}