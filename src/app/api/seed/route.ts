// POST /api/seed — Seed database dengan user & pengaturan default
// Panggil setelah database terinisialisasi:
//   curl -X POST https://domain.vercel.app/api/seed
//
// Auth:
//   - Jika belum ada user: izinkan tanpa auth (initial setup)
//   - Jika sudah ada user: wajib admin auth (via session cookie)
//
// Aman: hanya mengisi data jika belum ada. Tidak menghapus data existing.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { DEFAULT_CATEGORY } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";

interface SeedBody {
  admin?: { username?: string; name?: string; password?: string };
  store?: { name?: string; tagline?: string; phone?: string; address?: string };
}

export async function POST(req: NextRequest) {
  // Cek apakah sudah ada user admin. Jika belum, izinkan seed tanpa auth (initial setup).
  // Jika sudah ada, wajib admin auth.
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, message: "Hanya admin yang bisa menjalankan seed." },
        { status: 403 }
      );
    }
  }

  // Parse body opsional dari setup wizard
  let body: SeedBody = {};
  try {
    body = await req.json();
  } catch {
    // No body = gunakan default
  }

  // Cegah eksekusi ganda
  if ((globalThis as { __seedDone?: boolean }).__seedDone) {
    return NextResponse.json(
      { ok: false, message: "Seed already completed in this session." },
      { status: 409 }
    );
  }

  const results: string[] = [];

  try {
    // === Seed User ===
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      results.push(`ℹ️  ${existingUsers} user sudah ada, skip seed user.`);
    } else {
      const adminUser = body.admin || {};
      const adminUsername = adminUser.username || "admin";
      const adminName = adminUser.name || "Administrator";
      const adminPassword = await bcrypt.hash(adminUser.password || "admin123", 10);
      const kasirPassword = await bcrypt.hash("kasir123", 10);

      await prisma.user.create({
        data: { username: adminUsername, name: adminName, password: adminPassword, role: "ADMIN" },
      });
      await prisma.user.create({
        data: { username: "kasir", name: "Kasir 1", password: kasirPassword, role: "KASIR" },
      });

      results.push(`✅ User ADMIN dibuat (${adminUsername} / ***)`);
      results.push("✅ User KASIR dibuat (kasir / kasir123)");
    }

    // === Seed Settings ===
    const existingSettings = await prisma.setting.count();
    if (existingSettings > 0) {
      results.push(`ℹ️  ${existingSettings} pengaturan sudah ada, skip seed settings.`);
    } else {
      const storeOverrides = body.store || {};
      for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        let finalValue: string = value;
        // Kunci pakai dot-notation ("store.name") sesuai DEFAULT_SETTINGS.
        // Sebelumnya bug: dibandingkan dengan "storeName" (tanpa titik) sehingga
        // override dari setup wizard tidak pernah diterapkan.
        if (key === "store.name" && storeOverrides.name) finalValue = storeOverrides.name;
        else if (key === "store.tagline" && storeOverrides.tagline) finalValue = storeOverrides.tagline;
        else if (key === "store.phone" && storeOverrides.phone) finalValue = storeOverrides.phone;
        else if (key === "store.address" && storeOverrides.address) finalValue = storeOverrides.address;
        await prisma.setting.create({ data: { key, value: finalValue } });
      }
      results.push(`✅ ${Object.keys(DEFAULT_SETTINGS).length} pengaturan default dimuat.`);
    }

    // === Seed Kategori Default ===
    const existingDefault = await prisma.category.findFirst({ where: { isDefault: true } });
    if (existingDefault) {
      results.push(`ℹ️  Kategori default sudah ada: "${existingDefault.name}"`);
    } else {
      let slug: string = DEFAULT_CATEGORY.SLUG;
      let i = 1;
      while (await prisma.category.findUnique({ where: { slug } })) {
        slug = `${DEFAULT_CATEGORY.SLUG}-${i++}`;
      }
      const cat = await prisma.category.create({
        data: { name: DEFAULT_CATEGORY.NAME, slug, isDefault: true },
      });
      results.push(`✅ Kategori default dibuat: "${cat.name}"`);
    }

    (globalThis as { __seedDone?: boolean }).__seedDone = true;

    return NextResponse.json({ ok: true, results });
  } catch (e: unknown) {
    return NextResponse.json(
      {
        ok: false,
        message: "Seed gagal",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
