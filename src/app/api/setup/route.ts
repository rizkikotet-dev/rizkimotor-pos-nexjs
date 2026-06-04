// POST /api/setup — Inisialisasi database untuk Vercel/PostgreSQL
// Panggil setelah deploy pertama: curl -X POST https://domain.vercel.app/api/setup
// (atau via browser — endpoint ini public, hanya bisa dipanggil sekali sukses)

import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST() {
  // Cegah eksekusi ganda via lock sederhana di memori
  // (property global — reset otomatis tiap cold start, itu sudah cukup)
  if ((globalThis as any).__setupDone) {
    return NextResponse.json({ ok: false, message: "Setup already completed" }, { status: 409 });
  }

  // Cek apakah sudah terlanjur ada Setting table
  try {
    const { PrismaClient} = await import("@prisma/client");
    const client = new PrismaClient();
    const count = await client.setting.count();
    await client.$disconnect();
    if (count > 0) {
      (globalThis as any).__setupDone = true;
      return NextResponse.json({ ok: true, message: "Database already initialized" });
    }
  } catch {
    // Table belum ada — lanjut setup
  }

  try {
    const schemaPath =
      process.env.DATABASE_URL?.startsWith("postgresql")
        ? "prisma/schema.vercel.prisma"
        : "prisma/schema.prisma";

    const output = execSync(
      `npx prisma db push --schema=${schemaPath} --skip-generate --accept-data-loss`,
      {
        cwd: process.cwd(),
        env: { ...process.env },
        stdio: "pipe",
        timeout: 30_000,
      }
    );

    (globalThis as any).__setupDone = true;

    return NextResponse.json({
      ok: true,
      message: "Database initialized successfully",
      log: output.toString().trim(),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to initialize database",
        error: e?.stderr?.toString().trim() || e?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
