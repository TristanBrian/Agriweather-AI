const BASE_URL = 'https://api.weather-ai.co';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** @deprecated use ApiError */
export const WeatherAIError = ApiError;

export function getApiKey(): string {
  const key = process.env.WEATHER_AI_API_KEY?.trim();
  if (!key) {
    throw new ApiError(
      'API key is not configured. Add WEATHER_AI_API_KEY to .env.local and restart the dev server.',
      503
    );
  }
  return key;
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    return `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function weatherAIGet(
  path: string,
  params: Record<string, string>
): Promise<unknown> {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not reach the weather service';
    throw new ApiError(message, 502);
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return res.json();
}
