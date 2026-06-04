import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimiter,
  getClientIp,
  withRateLimit,
  RATE_LIMITS,
} from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

describe("rateLimiter (sliding window)", () => {
  beforeEach(() => rateLimiter.reset());

  it("allows N requests, blocks N+1", () => {
    for (let i = 1; i <= 5; i++) {
      const r = rateLimiter.check("k", 5, 60_000);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(5 - i);
    }
    const blocked = rateLimiter.check("k", 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("isolates counters by key", () => {
    rateLimiter.check("a", 2, 60_000);
    rateLimiter.check("a", 2, 60_000);
    const aBlocked = rateLimiter.check("a", 2, 60_000);
    const bFresh = rateLimiter.check("b", 2, 60_000);
    expect(aBlocked.allowed).toBe(false);
    expect(bFresh.allowed).toBe(true);
  });

  it("reset clears all state", () => {
    rateLimiter.check("k", 1, 60_000);
    expect(rateLimiter.check("k", 1, 60_000).allowed).toBe(false);
    rateLimiter.reset();
    expect(rateLimiter.check("k", 1, 60_000).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  function makeReq(headers: Record<string, string> = {}) {
    return new NextRequest("http://test/api/x", { headers });
  }

  it("reads first IP from x-forwarded-for chain", () => {
    expect(getClientIp(makeReq({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(makeReq({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  it("returns 'unknown' when no proxy headers", () => {
    expect(getClientIp(makeReq())).toBe("unknown");
  });
});

describe("withRateLimit HOC", () => {
  beforeEach(() => rateLimiter.reset());

  it("returns 200 + rate headers when under limit", async () => {
    const handler = withRateLimit(
      async () => NextResponse.json({ ok: true }),
      { limit: 3, windowMs: 60_000 }
    );
    const req = new NextRequest("http://test/api/x");
    const res = await handler(req, {});
    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("3");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("2");
  });

  it("returns 429 + Retry-After when over limit", async () => {
    const handler = withRateLimit(
      async () => NextResponse.json({ ok: true }),
      { limit: 1, windowMs: 60_000 }
    );
    const req = new NextRequest("http://test/api/x");
    await handler(req, {}); // first ok
    const res = await handler(req, {}); // blocked
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("uses custom keyFn", async () => {
    const handler = withRateLimit(
      async () => NextResponse.json({ ok: true }),
      { limit: 1, windowMs: 60_000, keyFn: (req) => req.headers.get("x-user") || "anon" }
    );
    const req1 = new NextRequest("http://test/api/x", { headers: { "x-user": "alice" } });
    const req2 = new NextRequest("http://test/api/x", { headers: { "x-user": "bob" } });
    const req3 = new NextRequest("http://test/api/x", { headers: { "x-user": "alice" } });
    expect((await handler(req1, {})).status).toBe(200);
    expect((await handler(req2, {})).status).toBe(200); // bob is fresh
    expect((await handler(req3, {})).status).toBe(429); // alice blocked
  });
});

describe("RATE_LIMITS presets", () => {
  it("LOGIN is 5/5min", () => {
    expect(RATE_LIMITS.LOGIN).toEqual({ limit: 5, windowMs: 5 * 60_000 });
  });
  it("API_DEFAULT is 100/1min", () => {
    expect(RATE_LIMITS.API_DEFAULT).toEqual({ limit: 100, windowMs: 60_000 });
  });
  it("UPLOAD is 20/5min", () => {
    expect(RATE_LIMITS.UPLOAD).toEqual({ limit: 20, windowMs: 5 * 60_000 });
  });
});
