import { ScanResponse } from "@/types/token";

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

function getTtlMs(): number {
  const envTtl = process.env.CACHE_TTL_SECONDS;
  const parsed = envTtl ? parseInt(envTtl, 10) : NaN;
  const ttlSec = !isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_SECONDS;
  return ttlSec * 1000;
}

class MemoryCache {
  private scanCache: CacheEntry<ScanResponse> | null = null;
  private tokenCache = new Map<string, CacheEntry<unknown>>();
  private inFlightScan: Promise<ScanResponse> | null = null;

  getScanResult(): ScanResponse | null {
    if (!this.scanCache) return null;
    if (Date.now() > this.scanCache.expiresAt) {
      return null;
    }
    return this.scanCache.data;
  }

  // Returns data even if stale, useful for fast response while revalidating
  getStaleScanResult(): ScanResponse | null {
    return this.scanCache ? this.scanCache.data : null;
  }

  setScanResult(data: ScanResponse): void {
    const ttlMs = getTtlMs();
    this.scanCache = {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
  }

  getInFlightScan(): Promise<ScanResponse> | null {
    return this.inFlightScan;
  }

  setInFlightScan(promise: Promise<ScanResponse> | null): void {
    this.inFlightScan = promise;
  }

  getToken<T>(mint: string): T | null {
    const entry = this.tokenCache.get(mint);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.tokenCache.delete(mint);
      return null;
    }
    return entry.data as T;
  }

  setToken<T>(mint: string, data: T, ttlSeconds = 300): void {
    this.tokenCache.set(mint, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  clearScan(): void {
    this.scanCache = null;
  }
}

// Global singleton across server invocations
declare global {
  // eslint-disable-next-line no-var
  var __solRugWatchCache: MemoryCache | undefined;
}

export const cache = globalThis.__solRugWatchCache || new MemoryCache();
if (process.env.NODE_ENV !== "production") {
  globalThis.__solRugWatchCache = cache;
}
