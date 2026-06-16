"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  sku: z.string().min(1, "SKU wajib diisi").max(50),
  name: z.string().min(1, "Nama wajib diisi").max(150),
  description: z.string().optional(),
  categoryId: z.coerce.number().int().positive("Kategori wajib dipilih"),
  price: z.coerce.number().int().nonnegative("Harga tidak valid"),
  priceReseller: z.coerce.number().int().nonnegative().default(0),
  cost: z.coerce.number().int().nonnegative().default(0),
  stock: z.coerce.number().int().nonnegative().default(0),
  minStock: z.coerce.number().int().nonnegative().default(5),
  // image: string biasa (bisa URL eksternal atau path lokal /uploads/...)
  image: z.string().max(500).optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

function parseForm(formData: FormData) {
  return productSchema.parse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    priceReseller: formData.get("priceReseller") || 0,
    cost: formData.get("cost") || 0,
    stock: formData.get("stock") || 0,
    minStock: formData.get("minStock") || 5,
    image: formData.get("image") || "",
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);

  const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) throw new Error(`SKU "${data.sku}" sudah digunakan.`);

  await prisma.product.create({
    data: {
      sku: data.sku,
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      price: data.price,
      priceReseller: data.priceReseller,
      cost: data.cost,
      stock: data.stock,
      minStock: data.minStock,
      image: data.image || null,
      active: data.active,
    },
  });

  revalidatePath("/admin/produk");
  revalidatePath("/admin");
  revalidatePath("/produk");
  redirect("/admin/produk");
}

export async function updateProduct(id: number, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);

  const existingSku = await prisma.product.findFirst({ where: { sku: data.sku, NOT: { id } } });
  if (existingSku) throw new Error(`SKU "${data.sku}" sudah digunakan produk lain.`);

  await prisma.product.update({
    where: { id },
    data: {
      sku: data.sku,
      name: data.name,
      description: data.description || null,
      categoryId: data.categoryId,
      price: data.price,
      priceReseller: data.priceReseller,
      cost: data.cost,
      stock: data.stock,
      minStock: data.minStock,
      image: data.image || null,
      active: data.active,
    },
  });

  revalidatePath("/admin/produk");
  revalidatePath(`/admin/produk/${id}/edit`);
  revalidatePath("/admin");
  revalidatePath("/produk");
  redirect("/admin/produk");
}
