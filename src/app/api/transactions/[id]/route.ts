import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { UserRole } from "@/lib/constants";

export const GET = withAuth<{ id: string }>(async (_req, { params, user }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true, items: true },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // KASIR hanya boleh lihat transaksinya sendiri
  if (user.role !== UserRole.ADMIN && transaction.userId !== parseInt(user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(transaction);
});

export const DELETE = withAuth<{ id: string }>(async (_req, { params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  // Rollback: kembalikan stok & hapus transaksi
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    // Rollback stok hanya untuk item DB (bukan item manual)
    for (const item of transaction.items.filter((i) => i.productId !== null)) {
      await tx.product.update({
        where: { id: item.productId! },
        data: { stock: { increment: item.quantity } },
      });
    }
    await tx.transaction.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}, { admin: true });
