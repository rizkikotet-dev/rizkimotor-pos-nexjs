// Seed awal: user default + pengaturan toko/struk. Produk & kategori kosong, diisi manual via panel.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/settings";
import { DEFAULT_CATEGORY } from "../src/lib/constants";

const prisma = new PrismaClient();

function assertSafeToSeed(): void {
  const isProd = process.env.NODE_ENV === "production";
  const dbUrl = process.env.DATABASE_URL ?? "";
  const allowSeed = process.env.ALLOW_SEED === "1" || process.env.ALLOW_SEED === "true";

  // Defense layer 1: tolak seed jika NODE_ENV=production.
  if (isProd && !allowSeed) {
    throw new Error(
      "\n⛔  REFUSING TO SEED: NODE_ENV=production terdeteksi.\n" +
        "    Seed menggunakan deleteMany({}) yang akan MENGHAPUS SEMUA DATA.\n" +
        "    Set ALLOW_SEED=1 jika Anda benar-benar yakin ingin melanjutkan.\n"
    );
  }

  // Defense layer 2: tolak seed jika DATABASE_URL tampak production (PostgreSQL,
  // atau host/path mengandung 'prod'/'production'). Berlaku bahkan di NODE_ENV=development
  // untuk mencegah kecelakaan (mis. .env pointing ke prod DB).
  if (!allowSeed) {
    const looksLikeProd =
      dbUrl.startsWith("postgres://") ||
      dbUrl.startsWith("postgresql://") ||
      /(^|[\/\-_:.])(prod|production)([\/\-_.]|$)/i.test(dbUrl);

    if (looksLikeProd) {
      throw new Error(
        "\n⛔  REFUSING TO SEED: DATABASE_URL tampak seperti production " +
          "(PostgreSQL atau host/path mengandung 'prod'/'production').\n" +
          "    Set ALLOW_SEED=1 jika Anda benar-benar yakin ingin melanjutkan.\n" +
          `    DATABASE_URL: ${dbUrl.replace(/:[^:@]+@/, ":***@")}\n`
      );
    }
  }

  if (allowSeed) {
    console.warn("⚠️  ALLOW_SEED aktif. Semua data akan di-wipe & re-seed.");
  }
}

async function main() {
  assertSafeToSeed();
  console.log("🌱 Seeding database...");

  // Hapus dalam urutan benar (foreign key constraints)
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.setting.deleteMany({});

  const adminPassword = await bcrypt.hash("admin123", 10);
  const kasirPassword = await bcrypt.hash("kasir123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Administrator",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const kasir = await prisma.user.create({
    data: {
      username: "kasir",
      name: "Kasir 1",
      password: kasirPassword,
      role: "KASIR",
    },
  });

  console.log(`✅ User ADMIN dibuat: ${admin.username} (password: admin123)`);
  console.log(`✅ User KASIR dibuat: ${kasir.username} (password: kasir123)`);
  console.log("⚠️  Silakan ganti password setelah login pertama!");

  // Seed pengaturan default
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.create({ data: { key, value } });
  }
  console.log(`✅ ${Object.keys(DEFAULT_SETTINGS).length} pengaturan default dimuat.`);

  // Pastikan selalu ada 1 kategori default (idempotent — tidak hapus kategori lain)
  const existingDefault = await prisma.category.findFirst({ where: { isDefault: true } });
  if (!existingDefault) {
    // Generate slug unik
    let slug: string = DEFAULT_CATEGORY.SLUG;
    let i = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${DEFAULT_CATEGORY.SLUG}-${i++}`;
    }
    const defaultCat = await prisma.category.create({
      data: { name: DEFAULT_CATEGORY.NAME, slug, isDefault: true },
    });
    console.log(`✅ Kategori default dibuat: "${defaultCat.name}" (untuk produk fallback)`);
  } else {
    console.log(`ℹ️  Kategori default sudah ada: "${existingDefault.name}"`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e.message ?? e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
