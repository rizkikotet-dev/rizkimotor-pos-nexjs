// In-memory rate limiter dengan sliding window.
// Cocok untuk single VPS. Untuk multi-instance production → pakai Redis (TODO Long Term).
//
// Cara pakai:
//   // 1. Wrap handler API:
//   export const POST = withRateLimit(async (req) => { ... }, {
//     limit: 5, windowMs: 60_000, keyFn: (req) => `login:${getClientIp(req)}`,
//   });
//
//   // 2. Atau check manual:
//   const result = rateLimiter.check(key, limit, windowMs);
//   if (!result.allowed) return 429;

import { NextRequest, NextResponse } from "next/server";

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Unix ms timestamp when oldest hit expires (sliding window reset) */
  resetAt: number;
}

interface RateLimitOptions {
  /** Max requests dalam window */
  limit: number;
  /** Window duration in ms */
  windowMs: number;
  /** Function to derive rate limit key from request (default: IP) */
  keyFn?: (req: NextRequest) => string;
}

// Singleton — module-level state. Hilang saat server restart (acceptable).
class RateLimiter {
  private hits = new Map<string, number[]>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60_000; // cleanup tiap 1 menit

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    this.maybeCleanup(now);

    const windowStart = now - windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetAt: oldest + windowMs,
      };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    return {
      allowed: true,
      limit,
      remaining: limit - timestamps.length,
      resetAt: now + windowMs,
    };
  }

  /** Hapus entry yang sudah expired. Dipanggil otomatis tiap cleanupIntervalMs. */
  private maybeCleanup(now: number) {
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;
    // Hapus keys yang timestamps-nya semua sudah expired (>5 menit lalu)
    const cutoff = now - 5 * 60_000;
    for (const [key, timestamps] of this.hits.entries()) {
      const fresh = timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) {
        this.hits.delete(key);
      } else if (fresh.length !== timestamps.length) {
        this.hits.set(key, fresh);
      }
    }
  }

  /** Untuk testing — reset state. */
  reset() {
    this.hits.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Ambil IP client. Prioritas: x-forwarded-for (kalau dibalik proxy) > x-real-ip > "unknown".
// Di dev/local, biasanya tidak ada header ini → semua request dianggap dari "unknown"
// (semua user share same key — fine untuk dev karena cuma developer).
export function getClientIp(req: NextRequest | Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    // XFF bisa berisi chain "client, proxy1, proxy2". Ambil yang pertama.
    return xff.split(",")[0].trim();
  }
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

// Pasang X-RateLimit-* headers di response.
function setRateLimitHeaders(
  res: Response,
  result: RateLimitResult,
  limit: number
): void {
  res.headers.set("X-RateLimit-Limit", String(limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  res.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
}

// HOC: rate limit sebelum handler dijalankan. Tetap return success response
// dengan header X-RateLimit-* agar client bisa self-throttle.
type ApiHandler<P = unknown> = (
  req: NextRequest,
  ctx: P
) => Promise<Response> | Response;

export function withRateLimit<P = unknown>(
  handler: ApiHandler<P>,
  options: RateLimitOptions
): (req: NextRequest, ctx: P) => Promise<Response> {
  const keyFn = options.keyFn ?? ((req: NextRequest) => `ip:${getClientIp(req)}`);

  return async (req, ctx) => {
    const key = keyFn(req);
    const result = rateLimiter.check(key, options.limit, options.windowMs);

    if (!result.allowed) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
      return new NextResponse(
        JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(options.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      );
    }

    const res = await handler(req, ctx);
    setRateLimitHeaders(res, result, options.limit);
    return res;
  };
}

// Preset limits untuk konsistensi.
export const RATE_LIMITS = {
  /** Login: 5 attempts per 5 minutes per IP — prevent brute force */
  LOGIN: { limit: 5, windowMs: 5 * 60_000 },
  /** Default API: 100 req per minute per key (user/IP) */
  API_DEFAULT: { limit: 100, windowMs: 60_000 },
  /** Upload: 20 uploads per 5 minutes per user — prevent abuse */
  UPLOAD: { limit: 20, windowMs: 5 * 60_000 },
} as const;
