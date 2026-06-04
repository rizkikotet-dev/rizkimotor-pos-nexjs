import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { withErrorHandler } from "@/lib/api-error";
import { z } from "zod";

const createSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(150),
  description: z.string().optional().nullable(),
  categoryId: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  priceReseller: z.number().int().nonnegative().default(0),
  cost: z.number().int().nonnegative().default(0),
  stock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(5),
  // image: string biasa (bisa URL eksternal atau path lokal /uploads/...)
  image: z.string().max(500).optional().nullable(),
  active: z.boolean().default(true),
});

// Public endpoint — dipakai POS kasir & katalog publik.
// Auth tidak wajib (produk aktif boleh dilihat siapa saja),
// tapi error tetap disanitasi untuk konsistensi.
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const categoryId = url.searchParams.get("categoryId");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
      ...(q
        ? {
            OR: [{ name: { contains: q } }, { sku: { contains: q } }],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
});

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existing) {
    return NextResponse.json({ error: `SKU "${parsed.data.sku}" sudah digunakan` }, { status: 400 });
  }

  const product = await prisma.product.create({ data: parsed.data });
  return NextResponse.json(product, { status: 201 });
}, { admin: true });
