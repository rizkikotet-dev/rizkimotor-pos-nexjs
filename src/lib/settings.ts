// Pengaturan toko & struk. Disimpan di DB sebagai key-value,
// dengan schema didefinisikan di kode (type-safe).

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

  // === Struk / Printer Thermal ===
  "receipt.paperSize": "80mm", // "58mm" | "80mm"
  "receipt.headerNote": "", // catatan kecil di bawah nama toko, misal "Cabang XYZ"
  "receipt.footerLine1": "Terima kasih atas kunjungan Anda",
  "receipt.footerLine2": "Barang yang sudah dibeli tidak dapat dikembalikan",
  "receipt.showAddress": "true",
  "receipt.showPhone": "true",
  "receipt.showEmail": "false",
  "receipt.showWebsite": "false",
  "receipt.showKasir": "true",
  "receipt.showInvoiceDate": "true",
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;
export type Settings = Record<SettingKey, string>;

// Ambil semua settings (default + override dari DB).
// Per-request caching dilakukan otomatis oleh Next.js fetch cache;
// untuk kompatibilitas, dipanggil sebagai fungsi biasa.
export async function getSettings(): Promise<Settings> {
  const stored = await prisma.setting.findMany();
  const map = {} as Settings;
  for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
    const found = stored.find((s) => s.key === key);
    map[key] = found?.value ?? DEFAULT_SETTINGS[key];
  }
  return map;
}

// Ambil satu setting
export async function getSetting(key: SettingKey): Promise<string> {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value ?? DEFAULT_SETTINGS[key];
}

// Definisi UI (label, type, group, options) untuk render form pengaturan
export const SETTING_SCHEMA: Array<{
  key: SettingKey;
  label: string;
  type: "text" | "textarea" | "select" | "boolean";
  group: "store" | "receipt";
  placeholder?: string;
  hint?: string;
  options?: string[];
}> = [
  { key: "store.name", label: "Nama Toko", type: "text", group: "store", placeholder: "RIZKI MOTOR" },
  { key: "store.tagline", label: "Tagline", type: "text", group: "store", placeholder: "Sparepart Motor Terlengkap" },
  { key: "store.address", label: "Alamat", type: "textarea", group: "store", placeholder: "Jl. ..., Kota" },
  { key: "store.phone", label: "Telepon", type: "text", group: "store", placeholder: "+62 ..." },
  { key: "store.email", label: "Email", type: "text", group: "store", placeholder: "info@..." },
  { key: "store.website", label: "Website", type: "text", group: "store", placeholder: "https://...", hint: "Opsional" },

  {
    key: "receipt.paperSize",
    label: "Ukuran Kertas Struk",
    type: "select",
    group: "receipt",
    options: ["58mm", "80mm"],
    hint: "Lebar kertas printer thermal",
  },
  {
    key: "receipt.headerNote",
    label: "Catatan Header (mis. nama cabang)",
    type: "text",
    group: "receipt",
    hint: "Ditampilkan di bawah nama toko pada struk",
  },
  {
    key: "receipt.footerLine1",
    label: "Footer Baris 1",
    type: "text",
    group: "receipt",
  },
  {
    key: "receipt.footerLine2",
    label: "Footer Baris 2",
    type: "text",
    group: "receipt",
  },
  {
    key: "receipt.showAddress",
    label: "Tampilkan Alamat di Struk",
    type: "boolean",
    group: "receipt",
  },
  {
    key: "receipt.showPhone",
    label: "Tampilkan Telepon di Struk",
    type: "boolean",
    group: "receipt",
  },
  {
    key: "receipt.showEmail",
    label: "Tampilkan Email di Struk",
    type: "boolean",
    group: "receipt",
  },
  {
    key: "receipt.showWebsite",
    label: "Tampilkan Website di Struk",
    type: "boolean",
    group: "receipt",
  },
  {
    key: "receipt.showKasir",
    label: "Tampilkan Nama Kasir di Struk",
    type: "boolean",
    group: "receipt",
  },
  {
    key: "receipt.showInvoiceDate",
    label: "Tampilkan Tanggal & Jam di Struk",
    type: "boolean",
    group: "receipt",
  },
];

export function getSettingsGrouped(): Record<"store" | "receipt", typeof SETTING_SCHEMA> {
  return {
    store: SETTING_SCHEMA.filter((s) => s.group === "store"),
    receipt: SETTING_SCHEMA.filter((s) => s.group === "receipt"),
  };
}
