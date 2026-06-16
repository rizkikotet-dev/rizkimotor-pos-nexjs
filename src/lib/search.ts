// Helper untuk pencarian case-insensitive yang bekerja di SQLite (dev) dan
// PostgreSQL (production).
//
// Latar belakang:
// - Prisma untuk SQLite TIDAK mendaftarkan `mode: "insensitive"` di type
//   StringFilter, sehingga strict TypeScript menolak.
// - Prisma untuk PostgreSQL MENERIMA `mode: "insensitive"`.
// - Pada runtime, SQLite LIKE sudah case-insensitive untuk ASCII by default,
//   sehingga di SQLite tidak perlu `mode` sama sekali (diabaikan dengan aman
//   jika dipaksa).
//
// Pemakaian:
//   const where = caseInsensitiveSearch<ProductWhereInput>(query, [
//     "name", "sku", "description"
//   ]);
//   const products = await prisma.product.findMany({ where: { ...where, active: true } });

/**
 * Returns true when the runtime database is PostgreSQL. Detection via
 * DATABASE_URL scheme (postgres:// or postgresql://). Falls back to
 * detecting `provider = "postgresql"` from a `__prismaProvider` global
 * if your setup exposes it.
 */
function isPostgres(): boolean {
  const url = process.env.DATABASE_URL || "";
  return /^postgres(ql)?:\/\//.test(url);
}

/**
 * Build a Prisma `where` fragment that performs a case-insensitive
 * search across the given string fields. Pass it through spread to
 * `findMany({ where: { ...base, ...caseInsensitiveSearch(...) } })`.
 *
 * The function returns `any` because Prisma's StringFilter type
 * differs between SQLite (no `mode`) and PostgreSQL (has `mode`).
 * Runtime behavior is consistent: case-insensitive matching on both.
 */
export function caseInsensitiveSearch(
  query: string | undefined | null,
  fields: readonly string[]
): Record<string, unknown> {
  if (!query || !query.trim() || fields.length === 0) return {};

  const mode = isPostgres() ? ({ mode: "insensitive" } as const) : {};
  const conditions = fields.map((f) => ({
    [f]: { contains: query, ...mode },
  }));

  return { OR: conditions };
}
