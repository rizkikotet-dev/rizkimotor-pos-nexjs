import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  name: z.string().min(1).max(100).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "KASIR"]).optional(),
  active: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, username: true, name: true, role: true, active: true, createdAt: true },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(target);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr);

  if (id === parseInt(user.id)) {
    const body = await req.json();
    if (body.role && body.role !== "ADMIN") {
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
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr);

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
}
