// POST /api/setup — Inisialisasi database untuk Vercel/PostgreSQL
//
// Cara kerja:
//   1. Cek apakah tabel Setting sudah ada via Prisma query
//   2. Jika sudah → return ok (existing database)
//   3. Jika belum → jalankan prisma db push via binary lokal
//      (tidak pakai npx — npx gagal di serverless Vercel)
//   4. Return hasil push
//
// Catatan:
//   - Di Vercel, prisma db push seharusnya sudah jalan saat build (via vercel.json)
//   - Endpoint ini hanya cadangan jika build-time push gagal
//   - Di environment non-Vercel (Docker, local), endpoint ini juga berfungsi

import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST() {
  // Lock sederhana untuk cegah eksekusi ganda per cold start
  if ((globalThis as any).__setupDone) {
    return NextResponse.json({ ok: false, message: "Setup already completed" }, { status: 409 });
  }

  // Cek apakah tabel sudah ada
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient();
    const count = await client.setting.count();
    await client.$disconnect();
    (globalThis as any).__setupDone = true;
    return NextResponse.json({
      ok: true,
      message: `Database ready (${count} settings found)`,
    });
  } catch {
    // Table belum ada — lanjut push
  }

  // Tentukan schema file berdasarkan database URL
  const isPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgresql");
  const schemaPath = isPostgres ? "prisma/schema.vercel.prisma" : "prisma/schema.prisma";

  try {
    // Pakai binary lokal — npx tidak bisa di serverless Vercel
    // Binary ada di node_modules/.bin/prisma (deployed sebagai dependency)
    //
    // HOME=/tmp penting karena serverless Vercel tidak bisa nulis ke ~
    const prismaBin = "node_modules/.bin/prisma";
    const output = execSync(
      `${prismaBin} db push --schema=${schemaPath} --skip-generate --accept-data-loss`,
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          HOME: "/tmp",
        },
        stdio: "pipe",
        timeout: 30_000,
      }
    );

    (globalThis as any).__setupDone = true;

    return NextResponse.json({
      ok: true,
      message: "Database initialized successfully",
      log: output.toString().trim().split("\n").slice(-5).join("\n"),
    });
  } catch (e: any) {
    const stderr = e?.stderr?.toString().trim() || "";
    const stdout = e?.stdout?.toString().trim() || "";
    const message = e?.message || "Unknown error";

    // Jika binary lokal tidak ditemukan, fallback ke npx (untuk non-Vercel)
    if (message.includes("ENOENT") || stderr.includes("not found")) {
      try {
        const fallbackOutput = execSync(
          `npx prisma db push --schema=${schemaPath} --skip-generate --accept-data-loss`,
          {
            cwd: process.cwd(),
            env: { ...process.env, HOME: "/tmp" },
            stdio: "pipe",
            timeout: 30_000,
          }
        );
        (globalThis as any).__setupDone = true;
        return NextResponse.json({
          ok: true,
          message: "Database initialized successfully (fallback)",
          log: fallbackOutput.toString().trim().split("\n").slice(-5).join("\n"),
        });
      } catch {
        // Fallback juga gagal — laporkan error asli
      }
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to initialize database",
        error: stderr || stdout || message,
        tip: "Pastikan DATABASE_URL benar dan database dapat diakses dari lingkungan ini.",
      },
      { status: 500 }
    );
  }
}
