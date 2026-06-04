const TTL_MS = 30 * 60 * 1000;

const store = new Map();

const set = (interviewId, ctx) => {
  store.set(String(interviewId), { ...ctx, _updatedAt: Date.now() });
};

const get = (interviewId) => {
  const ctx = store.get(String(interviewId));
  if (!ctx) return null;
  if (Date.now() - ctx._updatedAt > TTL_MS) {
    store.delete(String(interviewId));
    return null;
  }
  return ctx;
};

const touch = (interviewId) => {
  const ctx = store.get(String(interviewId));
  if (ctx) ctx._updatedAt = Date.now();
};

const remove = (interviewId) => {
  store.delete(String(interviewId));
};

const size = () => store.size;

const sweep = () => {
  const now = Date.now();
  for (const [id, ctx] of store.entries()) {
    if (now - ctx._updatedAt > TTL_MS) store.delete(id);
  }
};

module.exports = { set, get, touch, remove, size, sweep, TTL_MS };
