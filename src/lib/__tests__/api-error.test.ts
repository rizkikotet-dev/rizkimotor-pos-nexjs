import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient, Prisma } from "@prisma/client";
import { handleApiError, AuthError } from "@/lib/api-error";

const prisma = new PrismaClient();

const ctx = { path: "/api/test", method: "POST", requestId: "test-req-id" };

describe("handleApiError", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

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
    let caught: unknown;
    try {
      await prisma.user.create({
        data: { username: "admin", name: "x", password: "x", role: "ADMIN" },
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    const res = handleApiError(caught, ctx);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toContain("sudah digunakan");
  });

  it("maps P2025 (not found) → 404", async () => {
    let caught: unknown;
    try {
      await prisma.user.update({ where: { id: 999999 }, data: { name: "x" } });
    } catch (e) {
      caught = e;
    }
    const res = handleApiError(caught, ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Data tidak ditemukan" });
  });

  it("maps P2003 (FK constraint) → 400", async () => {
    // Setup: buat customer + transaction + debt untuk admin user, lalu coba hapus user.
    // Tests P2003 mapping tanpa bergantung pada data existing.
    const customer = await prisma.customer.create({
      data: { name: "FK Test Customer" },
    });
    const admin = await prisma.user.findUnique({ where: { username: "admin" } });
    if (!admin) throw new Error("Seed should create admin user");

    await prisma.transaction.create({
      data: {
        invoiceNo: `FK-TEST-${Date.now()}`,
        userId: admin.id,
        customerId: customer.id,
        total: 1000,
        payment: 1000,
        change: 0,
        items: { create: [] },
      },
    });

    let caught: unknown;
    try {
      // Sekarang admin punya transaction → delete harus throw P2003
      await prisma.user.delete({ where: { id: admin.id } });
    } catch (e) {
      caught = e;
    }

    // Cleanup (best effort — mungkin sudah ke-cascade atau error)
    await prisma.transactionItem.deleteMany({ where: { transaction: { customerId: customer.id } } });
    await prisma.transaction.deleteMany({ where: { customerId: customer.id } });
    await prisma.customer.delete({ where: { id: customer.id } }).catch(() => {});

    if (caught instanceof Prisma.PrismaClientKnownRequestError) {
      const res = handleApiError(caught, ctx);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Data terkait tidak ditemukan" });
    } else {
      throw caught;
    }
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
