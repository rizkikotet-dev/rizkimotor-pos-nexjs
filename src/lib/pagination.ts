// Pagination helpers — shared antara server components & API routes.
// Format konsisten: { data: T[], pagination: { page, pageSize, total, totalPages } }

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Parse pagination dari URLSearchParams atau object.
// Tolerant terhadap input invalid (fallback ke default).
export function parsePagination(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
  defaults: { pageSize?: number } = {}
): PaginationParams {
  const get = (key: string): string | undefined => {
    if (source instanceof URLSearchParams) return source.get(key) ?? undefined;
    const v = source[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const page = Math.max(1, parseInt(get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(get("pageSize") ?? String(defaults.pageSize ?? DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

// Build pagination metadata dari total count.
export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

// Helper: wrap array + total jadi PaginatedResponse.
export function paginate<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  return { data, pagination: buildPaginationMeta(page, pageSize, total) };
}
