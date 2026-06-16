// Magic string constants — type-safe via `as const`.
// Disimpan sebagai string di DB (SQLite tidak support enum di Prisma).
// Konsolidasi di sini mencegah typo + sentralisasi perubahan nilai.

// === User Role ===
export const UserRole = {
  ADMIN: "ADMIN",
  KASIR: "KASIR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const USER_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.KASIR];

// === Receipt Paper Size ===
export const PaperSize = {
  P58MM: "58mm",
  P80MM: "80mm",
} as const;
export type PaperSize = (typeof PaperSize)[keyof typeof PaperSize];

// === Payment Method (UI-only label; bukan enum DB) ===
export const PaymentMethod = {
  TUNAI: "TUNAI",
  QRIS: "QRIS",
  TRANSFER: "TRANSFER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// === Default Category (singleton fallback) ===
export const DEFAULT_CATEGORY = {
  NAME: "Lainnya",
  SLUG: "lainnya",
} as const;
