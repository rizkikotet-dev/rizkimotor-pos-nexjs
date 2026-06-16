// POST /api/setup — Inisialisasi database
//
// Body opsional:
//   { type: "sqlite" | "postgresql", connectionString?: string }
//
// Cara kerja:
//   1. Jika type == "postgresql" dan connectionString diberikan:
//      a. Simpan ke .env (jika lingkungan mengizinkan — skip di Vercel)
//      b. Regenerate Prisma client dengan schema PostgreSQL (skip di Vercel)
//   2. Jalankan prisma db push dengan schema yang sesuai
//   3. Return hasil

import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function isVercel(): boolean {
  return !!process.env.VERCEL;
}

function getSchemaPath(type: "sqlite" | "postgresql"): string {
  return type === "postgresql"
    ? "prisma/schema.vercel.prisma"
    : "prisma/schema.prisma";
}

function runPrisma(args: string): string {
  const prismaBin = "node_modules/.bin/prisma";
  try {
    const output = execSync(`${prismaBin} ${args}`, {
      cwd: process.cwd(),
      env: { ...process.env, HOME: "/tmp" },
      stdio: "pipe",
      timeout: 30_000,
    });
    return output.toString().trim();
  } catch (e: unknown) {
    // Fallback ke npx untuk environment tanpa node_modules langsung
    const err = e as { message?: string; stderr?: Buffer };
    if (
      (err?.message && err.message.includes("ENOENT")) ||
      (err?.stderr && err.stderr.toString().includes("not found"))
    ) {
      const fallback = execSync(`npx prisma ${args}`, {
        cwd: process.cwd(),
        env: { ...process.env, HOME: "/tmp" },
        stdio: "pipe",
        timeout: 60_000,
      });
      return fallback.toString().trim();
    }
    throw e;
  }
}

function saveEnvIfPossible(connectionString: string): string[] {
  const logs: string[] = [];
  if (isVercel()) {
    logs.push("ℹ️  Vercel: skip write .env (gunakan Vercel Dashboard untuk set DATABASE_URL)");
    return logs;
  }

  const envPath = path.resolve(process.cwd(), ".env");
  try {
    let content = "";
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf-8");
      // Replace existing DATABASE_URL
      if (content.match(/^DATABASE_URL=/m)) {
        content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${connectionString}"`);
        logs.push("✅ DATABASE_URL diperbarui di .env");
      } else {
        content += `\nDATABASE_URL="${connectionString}"\n`;
        logs.push("✅ DATABASE_URL ditambahkan ke .env");
      }
    } else {
      content = `# RIZKI MOTOR — Database\nDATABASE_URL="${connectionString}"\n`;
      logs.push("✅ File .env dibuat dengan DATABASE_URL");
    }
    fs.writeFileSync(envPath, content, "utf-8");
  } catch (e: unknown) {
    logs.push(`⚠️  Gagal menulis .env: ${e instanceof Error ? e.message : "Unknown error"}`);
  }
  return logs;
}

export async function POST(req: NextRequest) {
  // Setup hanya boleh dijalankan di development atau saat database belum terinisialisasi.
  // Di production, DATABASE_URL harus sudah di-set di environment.
  if (isVercel()) {
    return NextResponse.json(
      { ok: false, message: "Setup tidak tersedia di Vercel. Set DATABASE_URL di Vercel Dashboard." },
      { status: 403 }
    );
  }

  // Lock eksekusi ganda per cold start
  if ((globalThis as { __setupDone?: boolean }).__setupDone) {
    return NextResponse.json({ ok: false, message: "Setup already completed" }, { status: 409 });
  }

  // Parse body
  let body: { type?: string; connectionString?: string } = {};
  try {
    body = await req.json();
  } catch {
    // No body — gunakan default dari env
  }

  const dbType = body.type === "postgresql" ? "postgresql" : "sqlite";
  const schemaPath = getSchemaPath(dbType);
  const logs: string[] = [];

  // Cek apakah tabel sudah ada (pakai koneksi yang sudah jalan)
  try {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient();
    const count = await client.setting.count();
    await client.$disconnect();
    (globalThis as { __setupDone?: boolean }).__setupDone = true;
    return NextResponse.json({
      ok: true,
      message: `Database ready (${count} settings found)`,
      type: dbType,
    });
  } catch {
    // Table belum ada — lanjut setup
  }

  // === Jika PostgreSQL dan ada connection string ===
  const connectionString = body.connectionString || process.env.DATABASE_URL;
  if (dbType === "postgresql" && connectionString) {
    logs.push(`📦 Tipe database: PostgreSQL`);

    // Simpan ke .env (skip Vercel, gunakan Vercel Dashboard)
    if (body.connectionString) {
      logs.push(...saveEnvIfPossible(connectionString));
    }

    // Regenerate Prisma client jika bukan di Vercel
    // (di Vercel client sudah PostgreSQL dari build)
    if (!isVercel()) {
      try {
        logs.push("🔄 Regenerating Prisma client for PostgreSQL...");
        runPrisma(`generate --schema=${schemaPath}`);
        logs.push("✅ Prisma client regenerated for PostgreSQL");
      } catch (e: unknown) {
        logs.push(`⚠️  Gagal regenerate client: ${e instanceof Error ? e.message : "Unknown error"}`);
      }
    } else {
      logs.push("ℹ️  Vercel: skip regenerate client (sudah PostgreSQL dari build)");
    }
  } else {
    logs.push(`📦 Tipe database: SQLite`);
  }

  // === Run prisma db push ===
  try {
    logs.push("⏳ Menjalankan prisma db push...");
    const output = runPrisma(
      `db push --schema=${schemaPath} --skip-generate --accept-data-loss`
    );
    const lastLines = output.split("\n").slice(-5).join("\n");
    logs.push("✅ Database berhasil diinisialisasi");

    (globalThis as { __setupDone?: boolean }).__setupDone = true;

    return NextResponse.json({
      ok: true,
      message: "Database initialized successfully",
      type: dbType,
      log: lastLines,
      info: logs,
    });
  } catch (e: unknown) {
    const err = e as { stderr?: Buffer; stdout?: Buffer; message?: string };
    const stderr = err?.stderr?.toString().trim() || "";
    const stdout = err?.stdout?.toString().trim() || "";

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to initialize database",
        error: stderr || stdout || err?.message || "Unknown error",
        info: logs,
        tip:
          dbType === "postgresql"
            ? "Pastikan connection string PostgreSQL benar dan database online. Untuk Vercel: set DATABASE_URL di Vercel Dashboard → Settings → Environment Variables."
            : "Pastikan folder data/ dapat ditulis. Di Docker: pastikan volume ter-mount dengan benar.",
      },
      { status: 500 }
    );
  }
}
