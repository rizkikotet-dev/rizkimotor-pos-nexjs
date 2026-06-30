/**
 * prisma/seed.js — Seed data awal (CommonJS, jalan tanpa tsx/tsnode).
 * Dipanggil otomatis dari docker-entrypoint.sh saat database baru.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  "store.name": "RIZKI MOTOR",
  "store.tagline": "Sparepart Motor Terlengkap",
  "store.phone": "",
  "store.address": "",
  "store.city": "",
  "print.header": "RIZKI MOTOR",
  "print.footer": "Terima kasih — Barang yang sudah dibeli tidak dapat dikembalikan.",
  "print.width": "58mm",
  "print.showLogo": "true",
  "print.showAddress": "true",
  "print.showPhone": "true",
  "print.showDate": "true",
  "print.showCashier": "true",
  "print.showCustomer": "true",
  "print.showNote": "true",
  "print.showPrice": "true",
  "print.showQty": "true",
  "print.showTotal": "true",
  "print.showPayment": "true",
  "print.showChange": "true",
  "print.showDebt": "true",
  "print.showBarcode": "false",
  "print.copyCount": "1",
  "receipt.autoPrint": "false",
  "theme.mode": "dark",
  "pos.defaultPayment": "cash",
  "pos.showReseller": "true",
  "currency.symbol": "Rp",
  "currency.locale": "id-ID",
};

const DEFAULT_CATEGORY_NAME = "Lainnya";
const DEFAULT_CATEGORY_SLUG = "lainnya";

async function main() {
  console.log("🌱 Seeding database...");

  // --- Users ---
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`ℹ️  ${existingUsers} user sudah ada, skip seed user.`);
  } else {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const kasirPassword = await bcrypt.hash("kasir123", 10);

    await prisma.user.create({
      data: { username: "admin", name: "Administrator", password: adminPassword, role: "ADMIN" },
    });
    await prisma.user.create({
      data: { username: "kasir", name: "Kasir 1", password: kasirPassword, role: "KASIR" },
    });

    console.log('✅ User ADMIN dibuat (admin / admin123)');
    console.log('✅ User KASIR dibuat (kasir / kasir123)');
    console.log('⚠️  Ganti password setelah login pertama!');
  }

  // --- Settings ---
  const existingSettings = await prisma.setting.count();
  if (existingSettings > 0) {
    console.log(`ℹ️  ${existingSettings} pengaturan sudah ada, skip seed settings.`);
  } else {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await prisma.setting.create({ data: { key, value } });
    }
    console.log(`✅ ${Object.keys(DEFAULT_SETTINGS).length} pengaturan default dimuat.`);
  }

  // --- Default Category ---
  const existingDefault = await prisma.category.findFirst({ where: { isDefault: true } });
  if (existingDefault) {
    console.log(`ℹ️  Kategori default sudah ada: "${existingDefault.name}"`);
  } else {
    let slug = DEFAULT_CATEGORY_SLUG;
    let i = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${DEFAULT_CATEGORY_SLUG}-${i++}`;
    }
    const cat = await prisma.category.create({
      data: { name: DEFAULT_CATEGORY_NAME, slug, isDefault: true },
    });
    console.log(`✅ Kategori default dibuat: "${cat.name}"`);
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
