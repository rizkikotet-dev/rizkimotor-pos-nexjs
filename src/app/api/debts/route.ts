import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { paginate, parsePagination } from "@/lib/pagination";
import { z } from "zod";

const paySchema = z.object({
  debtId: z.number().int().positive(),
  amount: z.number().int().positive(),
});

export const GET = withAuth(async (req) => {
  const { page, pageSize, skip, take } = parsePagination(req.nextUrl.searchParams);
  const status = req.nextUrl.searchParams.get("status"); // UNPAID, PARTIAL, PAID
  const customerId = req.nextUrl.searchParams.get("customerId");
  const includeStats = req.nextUrl.searchParams.get("includeStats") === "true";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (customerId) where.customerId = parseInt(customerId);

  const [debts, total] = await Promise.all([
    prisma.debt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        customer: true,
        transaction: {
          select: {
            id: true,
            invoiceNo: true,
            total: true,
            createdAt: true,
            payment: true,
            change: true,
            items: { select: { productName: true, productSku: true, quantity: true, price: true, subtotal: true } },
          },
        },
      },
    }),
    prisma.debt.count({ where }),
  ]);

  if (!includeStats) {
    return NextResponse.json(paginate(debts, page, pageSize, total));
  }

  // Stats dihitung di luar pagination (global, tidak difilter status)
  const [unpaidAgg, unpaidCount, partialCount, paidCount] = await Promise.all([
    prisma.debt.aggregate({
      _sum: { amount: true, paid: true },
      where: { status: { not: "PAID" } },
    }),
    prisma.debt.count({ where: { status: "UNPAID" } }),
    prisma.debt.count({ where: { status: "PARTIAL" } }),
    prisma.debt.count({ where: { status: "PAID" } }),
  ]);
  const totalOutstanding = (unpaidAgg._sum.amount ?? 0) - (unpaidAgg._sum.paid ?? 0);

  return NextResponse.json({
    ...paginate(debts, page, pageSize, total),
    stats: {
      totalOutstanding,
      unpaidCount,
      partialCount,
      paidCount,
    },
  });
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const parsed = paySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  const debt = await prisma.debt.findUnique({ where: { id: parsed.data.debtId } });
  if (!debt) return NextResponse.json({ error: "Utang tidak ditemukan" }, { status: 404 });
  if (debt.status === "PAID") return NextResponse.json({ error: "Utang sudah lunas" }, { status: 400 });

  const remaining = debt.amount - debt.paid;
  if (parsed.data.amount > remaining) {
    return NextResponse.json({ error: `Sisa utang hanya ${remaining}` }, { status: 400 });
  }

  const newPaid = debt.paid + parsed.data.amount;
  const newStatus = newPaid >= debt.amount ? "PAID" : "PARTIAL";

  const updated = await prisma.debt.update({
    where: { id: parsed.data.debtId },
    data: { paid: newPaid, status: newStatus },
    include: { customer: true },
  });

  return NextResponse.json(updated);
});
