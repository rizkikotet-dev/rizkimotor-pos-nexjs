import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, AuthError } from "@/lib/api-error";

describe("withErrorHandler — request ID", () => {
  beforeEach(() => {
    // Ensure consistent env
    Object.assign(process.env, { NODE_ENV: "test" });
  });

  it("auto-generates UUID for x-request-id on success", async () => {
    const handler = withErrorHandler(async () => NextResponse.json({ ok: true }));
    const req = new NextRequest("http://test/api/x");
    const res = await handler(req, {});
    const id = res.headers.get("x-request-id");
    expect(id).toBeTruthy();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("echoes client-provided x-request-id on success", async () => {
    const handler = withErrorHandler(async () => NextResponse.json({ ok: true }));
    const req = new NextRequest("http://test/api/x", {
      headers: { "x-request-id": "client-trace-12345" },
    });
    const res = await handler(req, {});
    expect(res.headers.get("x-request-id")).toBe("client-trace-12345");
  });

  it("sets x-request-id on error response", async () => {
    const handler = withErrorHandler(async () => {
      throw new AuthError(403, "forbidden");
    });
    const req = new NextRequest("http://test/api/x", {
      headers: { "x-request-id": "err-trace-99999" },
    });
    const res = await handler(req, {});
    expect(res.status).toBe(403);
    expect(res.headers.get("x-request-id")).toBe("err-trace-99999");
  });

  it("passes request id to error log context", async () => {
    // Spy on console.error
    const errors: string[] = [];
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };
    try {
      const handler = withErrorHandler(async () => {
        throw new Error("test failure");
      });
      const req = new NextRequest("http://test/api/x", {
        headers: { "x-request-id": "log-trace-abcde" },
      });
      await handler(req, {});
      expect(errors.some((e) => e.includes("log-trace-abcde"))).toBe(true);
      expect(errors.some((e) => e.includes("test failure"))).toBe(true);
    } finally {
      console.error = origError;
    }
  });
});
