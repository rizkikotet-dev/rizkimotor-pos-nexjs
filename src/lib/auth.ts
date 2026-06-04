import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { validateEnv } from "./env-check";
import { UserRole } from "./constants";
import { withErrorHandler } from "./api-error";
import { rateLimiter, getClientIp, RATE_LIMITS } from "./rate-limit";

export { AuthError } from "./api-error";

// Fail-fast: tolak boot jika NEXTAUTH_SECRET tidak valid.
// Dipanggil saat module ini pertama kali di-import (biasanya oleh [...nextauth] route).
validateEnv();

// Suppress noisy [next-auth][error][JWT_SESSION_ERROR] log di development.
// Penyebab umum: cookie di browser di-sign dengan NEXTAUTH_SECRET lama
// (mis. setelah secret di-rotate, atau cookies dev sebelumnya). Solusi:
// hapus cookie next-auth.session-token di browser, lalu login ulang.
// Production tetap log normal supaya ops bisa lihat error sungguhan.
const isDevForLog = process.env.NODE_ENV !== "production";
let _jwtWarnedThisBoot = false;
const logger: NextAuthOptions["logger"] = {
  error(code, ...metadata) {
    if (isDevForLog && code === "JWT_SESSION_ERROR") {
      if (!_jwtWarnedThisBoot) {
        _jwtWarnedThisBoot = true;
        console.warn(
          "\n[auth] JWT cookie decryption gagal. Biasanya karena NEXTAUTH_SECRET berubah " +
            "atau cookie browser basi.\n       Solusi: hapus cookie 'next-auth.session-token' " +
            "di DevTools → Application → Cookies, lalu login ulang.\n" +
            "       (Warning ini hanya muncul sekali per server boot.)\n"
        );
      }
      return;
    }
    console.error(`[next-auth][error][${code}]`, ...metadata);
  },
  warn(code, ...metadata) {
    console.warn(`[next-auth][warn][${code}]`, ...metadata);
  },
  debug(code, ...metadata) {
    if (isDevForLog) console.debug(`[next-auth][debug][${code}]`, ...metadata);
  },
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Rate limit per IP: 5 attempts per 5 menit. Cegah brute force.
        // next-auth@4 passing `req` sebagai second arg — type-nya loose
        // (Pick dari Request dengan raw IncomingHttpHeaders), kita treat sebagai Request-like.
        const requestLike = req as unknown as { headers?: Record<string, string | string[] | undefined> } | undefined;
        let ip = "unknown";
        if (requestLike?.headers) {
          const h = requestLike.headers;
          const xff = h["x-forwarded-for"];
          const xri = h["x-real-ip"];
          if (typeof xff === "string" && xff) {
            ip = xff.split(",")[0].trim();
          } else if (typeof xri === "string" && xri) {
            ip = xri.trim();
          } else if (Array.isArray(xff) && xff.length > 0) {
            ip = String(xff[0]);
          }
        }
        const rl = rateLimiter.check(`login:${ip}`, RATE_LIMITS.LOGIN.limit, RATE_LIMITS.LOGIN.windowMs);
        if (!rl.allowed) {
          // Throw dengan pesan — akan di-redirect ke error page dengan ?error=
          throw new Error("Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.");
        }

        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.username = (user as { username: string }).username;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  logger,
  secret: process.env.NEXTAUTH_SECRET,
};

// Tipe user yang sudah login (untuk typing yang lebih ketat)
export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: typeof UserRole.ADMIN | typeof UserRole.KASIR;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as SessionUser | undefined) ?? null;
  } catch (e) {
    // NextAuth melempar "decryption operation failed" jika cookie di-sign dengan
    // NEXTAUTH_SECRET lama (mis. setelah rotate secret, restart Docker dengan .env
    // baru, atau cookie korup). Perlakukan user sebagai belum login, jangan crash
    // seluruh halaman publik.
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[auth] getServerSession gagal (kemungkinan NEXTAUTH_SECRET berubah / cookie basi). User dianggap logout."
      );
    }
    return null;
  }
}

// Untuk server components / server actions: redirect ke login / panel sesuai role.
// Sebelumnya melempar Error → 500. Sekarang redirect → UX lebih baik.
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== UserRole.ADMIN) redirect("/pos");
  return user;
}

// Untuk API route handlers: HOC yang inject user + enforce auth.
// Penggunaan:
//   // Route tanpa dynamic params:
//   export const POST = withAuth(async (req, { user }) => {...}, { admin: true });
//
//   // Route dengan dynamic params (HARUS specify generic):
//   export const GET = withAuth<{ id: string }>(async (req, { params, user }) => {
//     const id = parseInt(params.id);
//   });
//
// Otomatis return 401/403, tidak melempar → tidak jadi 500.
type AuthedHandler<P = Record<string, never>> = (
  req: NextRequest,
  ctx: { params: P; user: SessionUser }
) => Promise<NextResponse> | NextResponse;

interface WithAuthOptions {
  admin?: boolean;
}

export function withAuth<P = Record<string, never>>(
  handler: AuthedHandler<P>,
  options: WithAuthOptions = {}
) {
  return withErrorHandler(
    async (req: NextRequest, ctx: { params: Promise<P> }): Promise<NextResponse> => {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized: login required" },
          { status: 401 }
        );
      }
      if (options.admin && user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: "Forbidden: ADMIN only" },
          { status: 403 }
        );
      }
      const params = await ctx.params;
      return await handler(req, { params, user });
    }
  );
}
