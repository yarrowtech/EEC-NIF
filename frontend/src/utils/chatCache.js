const CACHE_PREFIX = 'eec_chat_cache_v1';

const storageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const makeKey = (kind, userId, threadId = '') => {
  const uid = String(userId || 'anon');
  const tid = threadId ? `:${String(threadId)}` : '';
  return `${CACHE_PREFIX}:${kind}:${uid}${tid}`;
};

export const chatCacheKeys = {
  threads: (userId) => makeKey('threads', userId),
  contacts: (userId) => makeKey('contacts', userId),
  messages: (userId, threadId) => makeKey('messages', userId, threadId),
};

export const readChatCache = (key, maxAgeMs) => {
  if (!storageAvailable() || !key) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  const parsed = safeParse(raw);
  if (!parsed || typeof parsed !== 'object') return null;
  const ts = Number(parsed.ts || 0);
  if (!ts || Date.now() - ts > maxAgeMs) return null;
  return parsed.data ?? null;
};

export const writeChatCache = (key, data) => {
  if (!storageAvailable() || !key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore quota/storage errors
  }
};

