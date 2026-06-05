/**
 * Per‑IP sliding window rate limiter.
 * Protects the API routes from abuse and mirrors production‑grade practices.
 */
const hits = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_HITS = 10;      // requests per window

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = hits.get(ip);

  if (!record || now > record.resetTime) {
    hits.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_HITS) return false;

  record.count++;
  return true;
}