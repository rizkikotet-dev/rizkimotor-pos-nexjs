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
export const PAPER_SIZES: PaperSize[] = [PaperSize.P58MM, PaperSize.P80MM];

// === Debt Status ===
export const DebtStatus = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
} as const;
export type DebtStatus = (typeof DebtStatus)[keyof typeof DebtStatus];
export const DEBT_STATUSES: DebtStatus[] = [
  DebtStatus.UNPAID,
  DebtStatus.PARTIAL,
  DebtStatus.PAID,
];

// === Payment Method (UI-only label; bukan enum DB) ===
export const PaymentMethod = {
  TUNAI: "TUNAI",
  QRIS: "QRIS",
  TRANSFER: "TRANSFER",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.TUNAI,
  PaymentMethod.QRIS,
  PaymentMethod.TRANSFER,
];

// === Default Category (singleton fallback) ===
export const DEFAULT_CATEGORY = {
  NAME: "Lainnya",
  SLUG: "lainnya",
} as const;
