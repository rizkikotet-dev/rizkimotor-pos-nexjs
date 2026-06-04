// Centralized error handling + request ID untuk API routes.
// Tujuannya:
// 1. Production: user hanya lihat pesan generic, full error di server log.
// 2. Development: user lihat full error untuk debugging.
// 3. Prisma errors: dipetakan ke pesan user-friendly.
// 4. Request ID: setiap request punya ID unik yang dikirim via header
//    x-request-id (auto-generate UUID jika client tidak sediakan).
//    Response selalu membawa header ini. Error log include ID
//    supaya mudah di-trace end-to-end.
//
// Cara pakai:
//   export const POST = withErrorHandler(async (req) => { ... });
//   atau dikombinasikan dengan withAuth:
//   export const POST = withAuth(handler, { admin: true }); // otomatis di-wrap

import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Baca env per-call supaya perubahan NODE_ENV di test (vi.stubEnv) terdeteksi.
function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

const REQUEST_ID_HEADER = "x-request-id";

// Error class untuk API routes (bukan server actions).
// Status code 401 (belum login) atau 403 (login tapi role tidak cukup).
// Bisa dilempar dari dalam handler jika perlu custom auth check.
export class AuthError extends Error {
  constructor(public statusCode: 401 | 403, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

interface ErrorContext {
  path: string;
  method: string;
  requestId: string;
}

function logError(e: unknown, ctx: ErrorContext) {
  const timestamp = new Date().toISOString();
  console.error(
    `[req ${ctx.requestId}] [api ${ctx.method} ${ctx.path}] ${timestamp}`,
    e
  );
}

type ApiResponse = NextResponse | Response;

type Handler<P = unknown> = (
  req: NextRequest,
  ctx: P
) => Promise<ApiResponse> | ApiResponse;

// Ambil request ID dari header atau generate baru.
// Dipakai di awal request supaya ID tersedia di semua log.
function getOrCreateRequestId(req: NextRequest): string {
  return req.headers.get(REQUEST_ID_HEADER) || randomUUID();
}

// Pasang header x-request-id di response (baik success maupun error).
function setRequestIdHeader(res: Response, requestId: string): void {
  res.headers.set(REQUEST_ID_HEADER, requestId);
}

// HOC: bungkus handler dengan try/catch + request ID.
export function withErrorHandler<P = unknown>(
  handler: Handler<P>
): (req: NextRequest, ctx: P) => Promise<ApiResponse> {
  return async (req, ctx) => {
    const requestId = getOrCreateRequestId(req);
    try {
      const res = await handler(req, ctx);
      setRequestIdHeader(res, requestId);
      return res;
    } catch (e) {
      const res = handleApiError(e, {
        path: req.nextUrl.pathname,
        method: req.method,
        requestId,
      });
      setRequestIdHeader(res, requestId);
      return res;
    }
  };
}

// Map error → user-facing response.
// Dipakai oleh withErrorHandler, tapi bisa juga dipanggil manual jika perlu.
export function handleApiError(e: unknown, ctx: ErrorContext): NextResponse {
  logError(e, ctx);

  // AuthError: 401/403 dengan custom message
  if (e instanceof AuthError) {
    return NextResponse.json({ error: e.message }, { status: e.statusCode });
  }

  // Prisma known errors
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaKnownError(e);
    if (mapped) {
      return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    }
  }

  // Prisma validation (schema mismatch — biasanya bug di code kita)
  if (e instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: isProd()
          ? "Data yang dikirim tidak valid"
          : `Prisma validation: ${e.message.split("\n").pop()?.trim() ?? e.message}`,
      },
      { status: 400 }
    );
  }

  // Fallback
  const message =
    isProd() || !(e instanceof Error)
      ? "Terjadi kesalahan pada server"
      : e.message || "Terjadi kesalahan pada server";

  return NextResponse.json({ error: message }, { status: 500 });
}

// Map Prisma error code → { message, status }.
// Reference: https://www.prisma.io/docs/orm/reference/error-reference
function mapPrismaKnownError(
  e: Prisma.PrismaClientKnownRequestError
): { message: string; status: number } | null {
  switch (e.code) {
    case "P2002": {
      // Unique constraint failed. e.meta.target biasanya array of field names.
      const target = (e.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return { message: `${target} sudah digunakan`, status: 409 };
    }
    case "P2003": {
      // Foreign key constraint failed
      return { message: "Data terkait tidak ditemukan", status: 400 };
    }
    case "P2025": {
      // Record not found
      return { message: "Data tidak ditemukan", status: 404 };
    }
    case "P2010": {
      // Raw query failed
      return { message: "Query database gagal", status: 500 };
    }
    case "P2009": {
      // Query validation failed
      return { message: "Query tidak valid", status: 400 };
    }
    case "P2011": {
      // Null constraint violation
      return { message: "Field wajib tidak boleh kosong", status: 400 };
    }
    case "P2012": {
      // Missing required value
      return { message: "Field wajib tidak ditemukan", status: 400 };
    }
    case "P2013": {
      // Missing required argument
      return { message: "Argumen wajib tidak ditemukan", status: 400 };
    }
    case "P2014": {
      // Relation violation
      return { message: "Tidak bisa menghapus data yang masih direferensikan", status: 400 };
    }
    case "P2017": {
      // Records not connected
      return { message: "Data tidak terkait", status: 400 };
    }
    default:
      return null;
  }
}
