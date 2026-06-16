import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  note: z.string().max(200).optional().nullable(),
  active: z.boolean().optional(),
});

export const GET = withAuth<{ id: string }>(async (_req, { params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: { orderBy: { createdAt: "desc" }, take: 10, include: { items: true } },
      debts: { orderBy: { createdAt: "desc" }, include: { transaction: true } },
    },
  });

  if (!customer) return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
  return NextResponse.json(customer);
});

export const PATCH = withAuth<{ id: string }>(async (req, { params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  if (parsed.data.phone) {
    const existing = await prisma.customer.findFirst({ where: { phone: parsed.data.phone, id: { not: id } } });
    if (existing) {
      return NextResponse.json({ error: "Nomor telepon sudah digunakan" }, { status: 400 });
    }
  }

  const customer = await prisma.customer.update({ where: { id }, data: parsed.data });
  return NextResponse.json(customer);
});

export const DELETE = withAuth<{ id: string }>(async (_req, { params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const hasDebt = await prisma.debt.findFirst({ where: { customerId: id, status: { not: "PAID" } } });
  if (hasDebt) {
    return NextResponse.json({ error: "Tidak bisa hapus pelanggan yang masih memiliki utang" }, { status: 400 });
  }

  await prisma.customer.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
});
