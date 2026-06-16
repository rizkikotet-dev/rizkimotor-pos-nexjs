"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/slug";

const categorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(50),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({ name: formData.get("name") });

  const slug = await generateUniqueSlug(data.name);

  await prisma.category.create({ data: { name: data.name, slug, isDefault: false } });
  revalidatePath("/admin/kategori");
  revalidatePath("/produk");
}

export async function updateCategory(id: number, formData: FormData) {
  await requireAdmin();
  const data = categorySchema.parse({ name: formData.get("name") });

  const slug = await generateUniqueSlug(data.name, id);

  await prisma.category.update({
    where: { id },
    data: { name: data.name, slug },
  });
  revalidatePath("/admin/kategori");
  revalidatePath("/produk");
}
