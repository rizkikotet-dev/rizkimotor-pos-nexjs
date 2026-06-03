import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/format";

const updateSchema = z.object({ name: z.string().min(1).max(50) });

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cat);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr);

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let slug = slugify(parsed.data.name);
  let i = 1;
  while (await prisma.category.findFirst({ where: { slug, NOT: { id } } })) {
    slug = `${slugify(parsed.data.name)}-${i++}`;
  }

  const cat = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, slug },
  });
  return NextResponse.json(cat);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  const id = parseInt(idStr);

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
}
