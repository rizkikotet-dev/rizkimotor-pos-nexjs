// Seed awal: user default + pengaturan toko/struk. Produk & kategori kosong, diisi manual via panel.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

const prisma = new PrismaClient();

async function main() {
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
    let slug = "lainnya";
    let i = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `lainnya-${i++}`;
    }
    const defaultCat = await prisma.category.create({
      data: { name: "Lainnya", slug, isDefault: true },
    });
    console.log(`✅ Kategori default dibuat: "${defaultCat.name}" (untuk produk fallback)`);
  } else {
    console.log(`ℹ️  Kategori default sudah ada: "${existingDefault.name}"`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
