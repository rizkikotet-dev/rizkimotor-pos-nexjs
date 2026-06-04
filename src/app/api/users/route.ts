import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { USER_ROLES } from "@/lib/constants";
import { paginate, parsePagination } from "@/lib/pagination";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(1).max(100),
  password: z.string().min(6),
  role: z.enum(USER_ROLES as unknown as [string, ...string[]]),
  active: z.boolean().default(true),
});

export const GET = withAuth(async (req) => {
  const { page, pageSize, skip, take } = parsePagination(req.nextUrl.searchParams);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      skip,
      take,
      select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  return NextResponse.json(paginate(users, page, pageSize, total));
}, { admin: true });

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  const newUser = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    select: { id: true, username: true, name: true, role: true, active: true },
  });
  return NextResponse.json(newUser, { status: 201 });
}, { admin: true });
