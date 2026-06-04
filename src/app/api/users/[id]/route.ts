import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { UserRole, USER_ROLES } from "@/lib/constants";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(USER_ROLES as unknown as [string, ...string[]]).optional(),
  active: z.boolean().optional(),
});

export const GET = withAuth<{ id: string }>(async (_req, { params }) => {
  const id = parseInt(params.id);
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(target);
}, { admin: true });

export const PUT = withAuth<{ id: string }>(async (req, { params, user }) => {
  const id = parseInt(params.id);

  if (id === parseInt(user.id)) {
    const body = await req.json();
    if (body.role && body.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Tidak dapat mengubah role sendiri" }, { status: 400 });
    }
    if (body.active === false) {
      return NextResponse.json({ error: "Tidak dapat menonaktifkan akun sendiri" }, { status: 400 });
    }
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.username) {
    const existing = await prisma.user.findFirst({ where: { username: parsed.data.username, NOT: { id } } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }
  }

  const data: any = { ...parsed.data };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const target = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true, name: true, role: true, active: true },
  });
  return NextResponse.json(target);
}, { admin: true });

export const DELETE = withAuth<{ id: string }>(async (_req, { params, user }) => {
  const id = parseInt(params.id);

  if (id === parseInt(user.id)) {
    return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
  }

  const txCount = await prisma.transaction.count({ where: { userId: id } });
  if (txCount > 0) {
    await prisma.user.update({ where: { id }, data: { active: false } });
    return NextResponse.json({
      success: true,
      message: "Pengguna dinonaktifkan (pernah ada di transaksi)",
    });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}, { admin: true });
