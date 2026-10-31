import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const memory = new Map<string, { count: number; reset: number }>();
const limiters = new Map<string, Ratelimit>();
let redis: Redis | null = null;

function getLimiter(limit: number, windowSeconds: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") throw new Error("Distributed rate limiter is not configured.");
    return null;
  }
  if (!redis) redis = new Redis({ url, token });
  const configKey = `${limit}:${windowSeconds}`;
  let limiter = limiters.get(configKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
      prefix: `atelier-noir:${configKey}`
    });
    limiters.set(configKey, limiter);
  }
  return limiter;
}

export async function enforceRateLimit(key: string, limit = 10, windowSeconds = 60) {
  const distributed = getLimiter(limit, windowSeconds);
  if (distributed) {
    const result = await distributed.limit(key);
    return result.success;
  }
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.reset < now) {
    memory.set(key, { count: 1, reset: now + windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
