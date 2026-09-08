import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { log } from "./logger";

// Only initialize if URLs are present to not crash the app entirely
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
if (redisUrl && redisToken) {
  redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

/**
 * Reusable rate limiting helper.
 * @param key - unique identifier for the request (e.g. IP or user ID)
 * @param maxRequests - number of requests allowed in the window
 * @param window - time window (e.g. "10 s", "1 m", "1 h")
 */
export async function checkRateLimit(key: string, maxRequests: number = 5, window: string = "1 m") {
  if (!redis) {
    // If redis isn't configured, we just bypass the rate limit
    log.warn("Upstash Redis is not configured. Rate limiting is disabled.");
    return { success: true, remaining: maxRequests };
  }

  const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(maxRequests, window as any),
    analytics: true,
  });

  const { success, remaining } = await ratelimit.limit(key);
  return { success, remaining };
}
