// Validates critical environment variables on app startup.
// Throws an error if any required variable is missing or has an insecure default.
//
// Dipanggil di lib/auth.ts (module load) sehingga gagal cepat sebelum
// request pertama sampai ke handler. Aman untuk build time karena
// skip ketika NEXT_PHASE=phase-production-build.

const DEFAULT_SECRET_FRAGMENTS = [
  "change-this",
  "change-this-in-production",
  "rizki-motor-dev-secret",
  "your-secret",
  "your-strong-secret",
  "dev-secret-change",
  "your-production-secret",
];

export function validateEnv(): void {
  // Skip saat build production (env belum tentu tersedia)
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET environment variable wajib di-set.\n" +
        "Generate secret kuat dengan: openssl rand -base64 32"
    );
  }

  if (secret.length < 32) {
    throw new Error(
      `NEXTAUTH_SECRET minimal 32 karakter (saat ini: ${secret.length}).\n` +
        "Generate secret kuat dengan: openssl rand -base64 32"
    );
  }

  if (isProd) {
    const isDefault = DEFAULT_SECRET_FRAGMENTS.some((fragment) =>
      secret.toLowerCase().includes(fragment)
    );
    if (isDefault) {
      throw new Error(
        "NEXTAUTH_SECRET terlihat seperti nilai default/contoh.\n" +
          "Jangan gunakan secret dari .env.example di production.\n" +
          "Generate secret kuat dengan: openssl rand -base64 32"
      );
    }
  }
}
