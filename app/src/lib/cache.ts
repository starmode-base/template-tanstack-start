interface TtlCacheOptions {
  ttlMs: number;
  maxSize?: number;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

/**
 * TTL cache
 */
export class TtlCache<K, V> {
  private store = new Map<K, CacheEntry<V>>();
  private readonly ttlMs: number;
  private readonly maxSize?: number;

  constructor(options: TtlCacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxSize = options.maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    // Simple size cap eviction (FIFO)
    if (this.maxSize && this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  delete(key: K): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
