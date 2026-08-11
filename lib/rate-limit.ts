type RateLimitOptions = {
  namespace: string;
  limit: number;
  windowSeconds: number;
};

type MemoryEntry = { count: number; resetAt: number };
const memory = new Map<string, MemoryEntry>();

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function upstashLimit(key: string, options: RateLimitOptions) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, options.windowSeconds, "NX"],
      ["TTL", key],
    ]),
  });
  if (!response.ok) return null;
  const result = (await response.json()) as {
    result?: number;
  }[];
  const count = Number(result[0]?.result ?? 0);
  const ttl = Math.max(1, Number(result[2]?.result ?? options.windowSeconds));
  return {
    allowed: count <= options.limit,
    remaining: Math.max(0, options.limit - count),
    resetAt: Date.now() + ttl * 1000,
  };
}

export async function rateLimit(request: Request, options: RateLimitOptions) {
  const windowId = Math.floor(Date.now() / (options.windowSeconds * 1000));
  const key = `dk:${options.namespace}:${clientIp(request)}:${windowId}`;
  const remote = await upstashLimit(key, options).catch(() => null);
  if (remote) return remote;

  const now = Date.now();
  const existing = memory.get(key);
  const entry =
    existing && existing.resetAt > now
      ? { ...existing, count: existing.count + 1 }
      : { count: 1, resetAt: now + options.windowSeconds * 1000 };
  memory.set(key, entry);
  if (memory.size > 5000) {
    memory.forEach((stored, storedKey) => {
      if (stored.resetAt <= now) memory.delete(storedKey);
    });
  }
  return {
    allowed: entry.count <= options.limit,
    remaining: Math.max(0, options.limit - entry.count),
    resetAt: entry.resetAt,
  };
}
