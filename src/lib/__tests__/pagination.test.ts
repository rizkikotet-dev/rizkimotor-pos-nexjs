import { describe, it, expect } from "vitest";
import {
  parsePagination,
  buildPaginationMeta,
  paginate,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../pagination";

describe("parsePagination", () => {
  describe("dengan URLSearchParams", () => {
    it("returns default page/pageSize untuk empty params", () => {
      const params = new URLSearchParams();
      const result = parsePagination(params);
      expect(result).toEqual({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        skip: 0,
        take: DEFAULT_PAGE_SIZE,
      });
    });

    it("parses page & pageSize dari query string", () => {
      const params = new URLSearchParams("page=3&pageSize=10");
      const result = parsePagination(params);
      expect(result).toEqual({ page: 3, pageSize: 10, skip: 20, take: 10 });
    });

    it("honors custom default pageSize", () => {
      const params = new URLSearchParams();
      const result = parsePagination(params, { pageSize: 50 });
      expect(result.pageSize).toBe(50);
      expect(result.take).toBe(50);
    });

    it("clamps pageSize ke MAX_PAGE_SIZE", () => {
      const params = new URLSearchParams("pageSize=9999");
      const result = parsePagination(params);
      expect(result.pageSize).toBe(MAX_PAGE_SIZE);
    });

    it("clamps pageSize minimum 1", () => {
      const params = new URLSearchParams("pageSize=0");
      const result = parsePagination(params);
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it("clamps page minimum 1 (negatif jadi 1)", () => {
      const params = new URLSearchParams("page=-5");
      const result = parsePagination(params);
      expect(result.page).toBe(1);
    });

    it("treats invalid numbers as defaults (NaN fallback)", () => {
      const params = new URLSearchParams("page=abc&pageSize=xyz");
      const result = parsePagination(params);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it("computes skip correctly untuk multiple pages", () => {
      const params = new URLSearchParams("page=5&pageSize=20");
      const result = parsePagination(params);
      expect(result.skip).toBe(80);
      expect(result.take).toBe(20);
    });
  });

  describe("dengan plain object (searchParams di Next.js)", () => {
    it("handles string values", () => {
      const result = parsePagination({ page: "2", pageSize: "25" });
      expect(result).toEqual({ page: 2, pageSize: 25, skip: 25, take: 25 });
    });

    it("handles undefined values", () => {
      const result = parsePagination({ page: undefined, pageSize: undefined });
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
    });

    it("handles string[] values (ambil index 0)", () => {
      const result = parsePagination({ page: ["3", "4"], pageSize: ["15"] });
      expect(result.page).toBe(3);
      expect(result.pageSize).toBe(15);
    });
  });
});

describe("buildPaginationMeta", () => {
  it("builds correct meta untuk full page", () => {
    const meta = buildPaginationMeta(1, 20, 100);
    expect(meta).toEqual({ page: 1, pageSize: 20, total: 100, totalPages: 5 });
  });

  it("rounds up totalPages untuk partial last page", () => {
    const meta = buildPaginationMeta(1, 20, 101);
    expect(meta.totalPages).toBe(6);
  });

  it("returns totalPages=1 untuk empty results", () => {
    const meta = buildPaginationMeta(1, 20, 0);
    expect(meta.totalPages).toBe(1);
  });

  it("preserves original page/pageSize values", () => {
    const meta = buildPaginationMeta(3, 15, 45);
    expect(meta).toEqual({ page: 3, pageSize: 15, total: 45, totalPages: 3 });
  });
});

describe("paginate helper", () => {
  it("wraps array + meta jadi complete response", () => {
    const items = [{ id: 1 }, { id: 2 }];
    const result = paginate(items, 1, 20, 2);
    expect(result).toEqual({
      data: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
    });
  });

  it("handles empty array", () => {
    const result = paginate([], 1, 20, 0);
    expect(result.data).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(1);
  });
});
