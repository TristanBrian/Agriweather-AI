import { NextRequest, NextResponse } from 'next/server';
import weatherAI, { ApiError } from '@/lib/weather-ai';
import { checkRateLimit } from '@/lib/rate-limiter';
import { invalidateCache } from '@/lib/cache';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    if (!image) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const newForm = new FormData();
    newForm.append('image', image);
    const farmerId = formData.get('farmerId');
    const county = formData.get('county');
    if (farmerId) newForm.append('farmerId', farmerId);
    if (county) newForm.append('county', county);

    // Axios sets the correct multipart boundary automatically
    const response = await weatherAI.post('/v1/trees/analyze', newForm);

    invalidateCache('usage:normalised');

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Tree analysis failed.' }, { status: 502 });
  }
}