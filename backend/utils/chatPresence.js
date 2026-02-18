const presenceStore = new Map();

const getPresenceSnapshot = (userId) => {
  const key = String(userId || '');
  const entry = presenceStore.get(key);
  if (!entry) {
    return { online: false, lastSeen: null };
  }
  return {
    online: entry.count > 0,
    lastSeen: entry.lastSeen || null,
  };
};

const markUserOnline = (userId) => {
  const key = String(userId || '');
  if (!key) return { changed: false, online: false, lastSeen: null };
  const existing = presenceStore.get(key) || { count: 0, lastSeen: null };
  existing.count += 1;
  presenceStore.set(key, existing);
  return {
    changed: existing.count === 1,
    online: true,
    lastSeen: existing.lastSeen || null,
  };
};

const markUserOffline = (userId) => {
  const key = String(userId || '');
  if (!key) return { changed: false, online: false, lastSeen: null };
  const existing = presenceStore.get(key);
  if (!existing) {
    return { changed: false, online: false, lastSeen: null };
  }
  existing.count = Math.max(0, (existing.count || 1) - 1);
  if (existing.count === 0) {
    existing.lastSeen = new Date();
    presenceStore.set(key, existing);
    return { changed: true, online: false, lastSeen: existing.lastSeen };
  }
  presenceStore.set(key, existing);
  return { changed: false, online: true, lastSeen: existing.lastSeen || null };
};

module.exports = {
  getPresenceSnapshot,
  markUserOnline,
  markUserOffline,
};
