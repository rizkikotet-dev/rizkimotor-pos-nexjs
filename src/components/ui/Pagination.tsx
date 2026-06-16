import Link from "next/link";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  pageParam?: string;
  pageSizeParam?: string;
  pageSize?: number;
  total?: number;
  // Preserve existing query params (e.g. ?q=search&status=active)
  preserveParams?: Record<string, string | undefined>;
  // Optional callback untuk client-side pagination (state-based, no URL change)
  onPageChange?: (page: number) => void;
  className?: string;
}

function buildHref(
  basePath: string,
  page: number,
  pageParam: string,
  pageSizeParam: string | undefined,
  pageSize: number | undefined,
  preserve: Record<string, string | undefined> | undefined
): string {
  const params = new URLSearchParams();
  if (preserve) {
    for (const [k, v] of Object.entries(preserve)) {
      if (v != null && v !== "") params.set(k, v);
    }
  }
  if (page > 1) params.set(pageParam, String(page));
  if (pageSizeParam && pageSize) params.set(pageSizeParam, String(pageSize));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// Generate smart page list: [1, ..., cur-1, cur, cur+1, ..., last]
function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  pageParam = "page",
  pageSizeParam,
  pageSize,
  total,
  preserveParams,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageList(currentPage, totalPages);
  const hrefFor = (p: number) =>
    buildHref(basePath, p, pageParam, pageSizeParam, pageSize, preserveParams);

  // Render Link atau Button (callback mode) sesuai mode
  const renderTarget = (p: number, label: React.ReactNode, aria: string, className?: string) => {
    if (onPageChange) {
      return (
        <button
          type="button"
          onClick={() => onPageChange(p)}
          aria-label={aria}
          className={className}
        >
          {label}
        </button>
      );
    }
    return (
      <Link href={hrefFor(p)} aria-label={aria}>
        {label}
      </Link>
    );
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
    >
      <div className="text-sm text-[var(--text-muted)]">
        {total != null && (
          <span>
            {total} data • Halaman {currentPage} dari {totalPages}
          </span>
        )}
      </div>
      <ul className="flex items-center gap-1">
        <li>
          {currentPage <= 1 ? (
            <Button variant="ghost" size="sm" disabled aria-label="Halaman sebelumnya">
              ← Prev
            </Button>
          ) : (
            renderTarget(currentPage - 1, <Button variant="ghost" size="sm" type="button">← Prev</Button>, "Halaman sebelumnya")
          )}
        </li>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <li key={`e-${i}`} className="px-2 text-[var(--text-muted)]" aria-hidden>
              …
            </li>
          ) : (
            <li key={p}>
              {p === currentPage ? (
                <span
                  className="inline-flex items-center justify-center min-w-[36px] h-8 px-2 rounded-md text-sm font-medium bg-[var(--primary)] text-white"
                  aria-current="page"
                >
                  {p}
                </span>
              ) : (
                renderTarget(p, <Button variant="ghost" size="sm" type="button">{p}</Button>, `Halaman ${p}`)
              )}
            </li>
          )
        )}
        <li>
          {currentPage >= totalPages ? (
            <Button variant="ghost" size="sm" disabled aria-label="Halaman berikutnya">
              Next →
            </Button>
          ) : (
            renderTarget(currentPage + 1, <Button variant="ghost" size="sm" type="button">Next →</Button>, "Halaman berikutnya")
          )}
        </li>
      </ul>
    </nav>
  );
}
