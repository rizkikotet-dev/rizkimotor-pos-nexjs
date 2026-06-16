import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { handleApiError, AuthError } from "@/lib/api-error";

const ctx = { path: "/api/test", method: "POST", requestId: "test-req-id" };

function makeKnownError(code: string, meta?: Record<string, unknown>): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("test error", { code, clientVersion: "5.0.0", meta });
}

describe("handleApiError", () => {
  it("returns 401 for AuthError", async () => {
    const res = handleApiError(new AuthError(401, "Login required"), ctx);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Login required" });
  });

  it("returns 403 for AuthError(403)", async () => {
    const res = handleApiError(new AuthError(403, "Forbidden"), ctx);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Forbidden" });
  });

  it("maps P2002 (unique constraint) → 409 with field name", async () => {
    const error = makeKnownError("P2002", { target: ["username"] });
    const res = handleApiError(error, ctx);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("username");
    expect(body.error).toContain("sudah digunakan");
  });

  it("maps P2025 (not found) → 404", async () => {
    const error = makeKnownError("P2025");
    const res = handleApiError(error, ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Data tidak ditemukan" });
  });

  it("maps P2003 (FK constraint) → 400", async () => {
    const error = makeKnownError("P2003");
    const res = handleApiError(error, ctx);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Data terkait tidak ditemukan" });
  });

  it("returns 500 with generic message for unknown errors in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as unknown as Record<string, string | undefined>).NODE_ENV = "production";
    try {
      const res = handleApiError(new Error("Internal DB password leaked"), ctx);
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Terjadi kesalahan pada server" });
    } finally {
      (process.env as unknown as Record<string, string | undefined>).NODE_ENV = originalEnv ?? "test";
    }
  });

  it("returns 500 with raw message in development", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as unknown as Record<string, string | undefined>).NODE_ENV = "development";
    try {
      const res = handleApiError(new Error("Detailed debug info"), ctx);
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Detailed debug info" });
    } finally {
      (process.env as unknown as Record<string, string | undefined>).NODE_ENV = originalEnv ?? "test";
    }
  });

  it("handles non-Error throwables", async () => {
    const res = handleApiError("string error", ctx);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Terjadi kesalahan pada server" });
  });
});
