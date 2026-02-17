const buildPayload = (data, ttlMs) => {
  const now = Date.now();
  return JSON.stringify({
    data,
    timestamp: now,
    expiresAt: typeof ttlMs === 'number' && ttlMs > 0 ? now + ttlMs : null,
  });
};

const getStorage = () => {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const readCacheEntry = (key) => {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
      storage.removeItem(key);
      return null;
    }
    if (!('data' in parsed) || typeof parsed.timestamp !== 'number') {
      storage.removeItem(key);
      return null;
    }
    return { data: parsed.data, timestamp: parsed.timestamp };
  } catch {
    return null;
  }
};

export const writeCacheEntry = (key, data, ttlMs) => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, buildPayload(data, ttlMs));
  } catch {
    // Ignore storage quota errors so that network fetch stays the source of truth.
  }
};

export const clearCacheEntry = (key) => {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // Ignore failure; cache simply stays stale until it expires.
  }
};
