"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { slugify } from "@/lib/format";

const categorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(50),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({ name: formData.get("name") });

  // Generate unique slug
  let slug = slugify(data.name);
  let i = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${slugify(data.name)}-${i++}`;
  }

  await prisma.category.create({ data: { name: data.name, slug, isDefault: false } });
  revalidatePath("/admin/kategori");
  revalidatePath("/produk");
}

export async function updateCategory(id: number, formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({ name: formData.get("name") });

  let slug = slugify(data.name);
  let i = 1;
  while (await prisma.category.findFirst({ where: { slug, NOT: { id } } })) {
    slug = `${slugify(data.name)}-${i++}`;
  }

  await prisma.category.update({
    where: { id },
    data: { name: data.name, slug },
  });
  revalidatePath("/admin/kategori");
  revalidatePath("/produk");
}

export async function deleteCategory(id: number) {
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Kategori tidak ditemukan.");

  // Lindungi kategori default
  if (category.isDefault) {
    throw new Error(
      `Kategori default "${category.name}" tidak dapat dihapus. Hanya bisa diganti namanya di pengaturan.`
    );
  }

  // Cari kategori default untuk reassignment
  const defaultCat = await prisma.category.findFirst({ where: { isDefault: true } });
  if (!defaultCat) {
    throw new Error(
      "Kategori default tidak ditemukan di sistem. Hubungi administrator untuk修复 data."
    );
  }

  // Reassign produk ke kategori default, lalu hapus kategori
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: defaultCat.id },
    });
  }
  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk");
  revalidatePath("/produk");
  revalidatePath("/");
}
