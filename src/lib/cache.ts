/**
 * In‑memory cache with TTL.
 * Designed to be swapped with Redis/Upstash for multi‑instance deployments.
 */
interface CacheEntry {
  data: unknown;
  expiry: number;
}

const store = new Map<string, CacheEntry>();

export function getFromCache(key: string): unknown | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setToCache(
  key: string,
  data: unknown,
  ttlMs: number = 10 * 60 * 1000 // 10 minutes default
): void {
  store.set(key, { data, expiry: Date.now() + ttlMs });
}

/** Manually delete a cached entry. Used for cache invalidation. */
export function invalidateCache(key: string): void {
  store.delete(key);
}