import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";
import { paginate, parsePagination } from "@/lib/pagination";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  note: z.string().max(200).optional().nullable(),
});

export const GET = withAuth(async (req) => {
  const { page, pageSize, skip, take } = parsePagination(req.nextUrl.searchParams);

  const where: Record<string, unknown> = { active: true };
  // Optional search by name/phone
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        _count: { select: { transactions: true, debts: { where: { status: { not: "PAID" } } } } },
        debts: { where: { status: { not: "PAID" } }, select: { amount: true, paid: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  const data = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    note: c.note,
    totalDebt: c.debts.reduce((sum, d) => sum + (d.amount - d.paid), 0),
    transactionCount: c._count.transactions,
    unpaidDebtCount: c._count.debts,
  }));

  return NextResponse.json(paginate(data, page, pageSize, total));
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  if (parsed.data.phone) {
    const existing = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
    if (existing) {
      return NextResponse.json({ error: "Nomor telepon sudah terdaftar" }, { status: 400 });
    }
  }

  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json(customer, { status: 201 });
});
