export function memoizeAsync<T, V>(
  fn: (arg: T) => Promise<V>,
  ttlMs: number,
  keyFn: (arg: T) => string,
) {
  const cache = new Map<string, { value: V; expiresAt: number }>();
  const inflight = new Map<string, Promise<V>>();

  return async (arg: T): Promise<V> => {
    const key = keyFn(arg);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) return cached.value;

    const existing = inflight.get(key);
    if (existing) return existing;

    const p = fn(arg)
      .then((value) => {
        cache.set(key, { value, expiresAt: now + ttlMs });
        return value;
      })
      .finally(() => inflight.delete(key));

    inflight.set(key, p);
    return p;
  };
}
