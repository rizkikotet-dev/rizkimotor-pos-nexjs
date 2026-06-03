import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const paySchema = z.object({
  debtId: z.number().int().positive(),
  amount: z.number().int().positive(),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status"); // UNPAID, PARTIAL, PAID
  const customerId = url.searchParams.get("customerId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (customerId) where.customerId = parseInt(customerId);

  const debts = await prisma.debt.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { customer: true, transaction: { select: { invoiceNo: true, total: true, createdAt: true } } },
  });

  return NextResponse.json(debts);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}
