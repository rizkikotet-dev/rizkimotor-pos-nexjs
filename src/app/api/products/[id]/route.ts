import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  sku: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.number().int().positive().optional(),
  price: z.number().int().nonnegative().optional(),
  priceReseller: z.number().int().nonnegative().optional(),
  cost: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative().optional(),
  image: z.string().max(500).optional().nullable(),
  active: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export const PUT = withAuth<{ id: string }>(async (req, { params }) => {
  const id = parseInt(params.id);

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.sku) {
    const existing = await prisma.product.findFirst({
      where: { sku: parsed.data.sku, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json({ error: `SKU "${parsed.data.sku}" sudah digunakan` }, { status: 400 });
    }
  }

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json(product);
}, { admin: true });

export const DELETE = withAuth<{ id: string }>(async (_req, { params }) => {
  const id = parseInt(params.id);

  const itemCount = await prisma.transactionItem.count({ where: { productId: id } });
  if (itemCount > 0) {
    // Tidak bisa hapus, nonaktifkan
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({
      success: true,
      message: "Produk dinonaktifkan (pernah ada di transaksi)",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}, { admin: true });
