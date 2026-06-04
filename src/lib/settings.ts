// Pengaturan toko & struk. Disimpan di DB sebagai key-value,
// dengan schema didefinisikan di kode (type-safe).

import { unstable_cache } from "next/cache";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PaperSize } from "./constants";
import { prisma } from "./prisma";

export const DEFAULT_SETTINGS = {
  // === Toko ===
  "store.name": "RIZKI MOTOR",
  "store.address": "Jl. Contoh No. 123, Kota Anda",
  "store.phone": "+62 812-3456-7890",
  "store.email": "info@rizkimotor.id",
  "store.website": "",

  // === Tampilan Katalog Publik ===
  "store.tagline": "Sparepart Motor Terlengkap",
  "store.description": "",
  "store.whatsapp": "",

  // === Jam Operasional ===
  "store.openDays": "Senin - Sabtu",
  "store.openStart": "08:00",
  "store.openEnd": "17:00",

  // === Maps ===
  "store.mapsEmbedUrl": "",

  // === Reseller ===
  "store.resellerCategoryId": "",

  // === Struk / Printer Thermal ===
  "receipt.paperSize": PaperSize.P80MM,
  "receipt.headerNote": "", // catatan kecil di bawah nama toko, misal "Cabang XYZ"
  "receipt.footerLine1": "Terima kasih atas kunjungan Anda",
  "receipt.footerLine2": "Barang yang sudah dibeli tidak dapat dikembalikan",
  "receipt.showAddress": "true",
  "receipt.showPhone": "true",
  "receipt.showEmail": "false",
  "receipt.showWebsite": "false",
  "receipt.showKasir": "true",
  "receipt.showInvoiceDate": "true",

  // === Metode Pembayaran ===
  "payment.CASH": "Tunai",
  "payment.QRIS": "QRIS Scan",
  "payment.TRANSFER_BCA": "",
  "payment.TRANSFER_MANDIRI": "",
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type Settings = Record<SettingKey, string>;

// Ambil semua settings (default + override dari DB).
// Di-wrap unstable_cache dengan tag "settings" — di-invalidate via
// revalidateTag("settings") setelah write di /api/settings PUT atau server action.
// TTL 60 detik sebagai safety net jika invalidation terlewat.
export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    let stored: { key: string; value: string }[];
    try {
      stored = await prisma.setting.findMany();
    } catch (e) {
      // P2021 = table not found (database belum di-inisialisasi)
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2021") {
        return DEFAULT_SETTINGS as unknown as Settings;
      }
      throw e;
    }
    const map = {} as Settings;
    for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
      const found = stored.find((s) => s.key === key);
      map[key] = found?.value ?? DEFAULT_SETTINGS[key];
    }
    return map;
  },
  ["all-settings"],
  { revalidate: 60, tags: ["settings"] }
);
