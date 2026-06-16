import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";
import { parseId, invalidId, zodError } from "@/lib/api-helpers";
import { generateUniqueSlug } from "@/lib/slug";

const updateSchema = z.object({ name: z.string().min(1).max(50) });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (id === null) return invalidId();
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cat);
}

export const PUT = withAuth<{ id: string }>(async (req, { params }) => {
  const id = parseId(params.id);
  if (id === null) return invalidId();

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  const slug = await generateUniqueSlug(parsed.data.name, id);

  const cat = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, slug },
  });
  return NextResponse.json(cat);
}, { admin: true });

export const DELETE = withAuth<{ id: string }>(async (_req, { params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });

  // Lindungi kategori default — tidak bisa dihapus
  if (category.isDefault) {
    return NextResponse.json(
      {
        error: `Kategori default "${category.name}" tidak dapat dihapus. Hanya bisa diganti namanya.`,
      },
      { status: 400 }
    );
  }

  // Cari kategori default untuk reassignment produk
  const defaultCat = await prisma.category.findFirst({ where: { isDefault: true } });
  if (!defaultCat) {
    return NextResponse.json(
      { error: "Kategori default tidak ditemukan. Tidak bisa melanjutkan." },
      { status: 500 }
    );
  }

  // Hitung produk yang akan di-reassign
  const productCount = await prisma.product.count({ where: { categoryId: id } });

  // Reassign produk ke kategori default
  if (productCount > 0) {
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: defaultCat.id },
    });
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    reassigned: productCount,
    defaultCategory: defaultCat.name,
    message:
      productCount > 0
        ? `Kategori "${category.name}" dihapus. ${productCount} produk dialihkan ke "${defaultCat.name}".`
        : `Kategori "${category.name}" dihapus.`,
  });
}, { admin: true });
