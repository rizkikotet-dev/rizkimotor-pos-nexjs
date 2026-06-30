/**
 * prisma/prepare.js — Auto-detect Prisma provider dari DATABASE_URL.
 *
 * Cara kerja:
 *   1. Baca DATABASE_URL dari process.env atau .env
 *   2. Jika URL dimulai dengan "postgresql://" → provider = "postgresql"
 *   3. Selain itu → provider = "sqlite"
 *   4. Tulis prisma/schema.prepared.prisma (salin schema.prisma dgn provider yg sesuai)
 *
 * Semua command prisma (generate, db push, migrate) HARUS pakai flag:
 *   --schema=prisma/schema.prepared.prisma
 *
 * Gunakan di:
 *   - postinstall (otomatis)
 *   - vercel:build
 *   - db:push, db:migrate
 *   - docker-entrypoint.sh
 */

const fs = require("fs");
const path = require("path");

function getDbUrl() {
  // Prioritaskan process.env (sama kyk prisma)
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Fallback: baca .env file
  try {
    const envPath = path.resolve(__dirname, "..", ".env");
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        // Hapus kutipan wrapping kalo ada
        return trimmed.slice("DATABASE_URL=".length).replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // .env gak ada — fallback ke sqlite
  }

  return "file:./dev.db";
}

function determineProvider(url) {
  // Di Vercel, selalu PostgreSQL (SQLite gak didukung)
  if (process.env.VERCEL) return "postgresql";
  return url.startsWith("postgresql://") ? "postgresql" : "sqlite";
}

function prepare() {
  const schemaPath = path.resolve(__dirname, "schema.prisma");
  const preparedPath = path.resolve(__dirname, "schema.prepared.prisma");

  let schema = fs.readFileSync(schemaPath, "utf-8");

  // Ganti provider line — support semua format: "sqlite", 'sqlite', sqlite
  const provider = determineProvider(getDbUrl());
  schema = schema.replace(
    /provider\s*=\s*["']?(sqlite|postgresql)["']?/,
    `provider = "${provider}"`
  );

  fs.writeFileSync(preparedPath, schema, "utf-8");
  console.log(`✓ prisma/prepare.js — provider: ${provider}`);
}

prepare();
