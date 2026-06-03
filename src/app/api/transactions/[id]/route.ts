import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idStr } = await params;
  const id = parseInt(idStr);

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true, items: true },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // KASIR hanya boleh lihat transaksinya sendiri
  if (user.role !== "ADMIN" && transaction.userId !== parseInt(user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(transaction);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr);

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
}
