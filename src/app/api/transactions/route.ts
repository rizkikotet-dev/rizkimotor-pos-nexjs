import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { generateInvoiceNo } from "@/lib/format";

// Item dari database (sudah terdaftar)
const dbItemSchema = z.object({
  productId: z.number().int().positive(),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

// Item manual (tidak ada di database)
const manualItemSchema = z.object({
  name: z.string().min(1).max(150),
  sku: z.string().max(50),
  price: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const createSchema = z.object({
  items: z.array(z.union([dbItemSchema, manualItemSchema])).min(1, "Minimal 1 item"),
  payment: z.number().int().nonnegative(),
  note: z.string().max(200).optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const where = user.role === "ADMIN" ? {} : { userId: parseInt(user.id) };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: true, _count: { select: { items: true } } },
  });
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(", ") }, { status: 400 });
  }

  // Pisahkan item DB dan item manual
  const dbItems = parsed.data.items.filter((i): i is z.infer<typeof dbItemSchema> => "productId" in i);
  const manualItems = parsed.data.items.filter((i): i is z.infer<typeof manualItemSchema> => "name" in i);

  // Ambil produk DB untuk validasi stok dan harga
  const productIds = dbItems.map((i) => i.productId);
  const products = productIds.length > 0
    ? await prisma.product.findMany({ where: { id: { in: productIds }, active: true } })
    : [];

  let total = 0;
  const lineItems: Array<{
    productId: number | null;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
    subtotal: number;
  }> = [];

  // === Proses item DB ===
  for (const item of dbItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: `Produk ID ${item.productId} tidak ditemukan atau nonaktif` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok "${product.name}" tidak cukup (tersisa ${product.stock})` }, { status: 400 });
    }
    // Validasi harga: harus salah satu dari harga normal atau reseller
    const normalPrice = product.price;
    const resellerPrice = product.priceReseller > 0 ? product.priceReseller : product.price;
    if (item.price !== normalPrice && item.price !== resellerPrice) {
      return NextResponse.json(
        { error: `Harga "${product.name}" tidak valid. Normal: ${normalPrice}, Reseller: ${resellerPrice}` },
        { status: 400 }
      );
    }

    const subtotal = item.price * item.quantity;
    total += subtotal;
    lineItems.push({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: item.quantity,
      price: item.price,
      subtotal,
    });
  }

  // === Proses item manual ===
  for (const item of manualItems) {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    lineItems.push({
      productId: null,
      productName: item.name,
      productSku: item.sku,
      quantity: item.quantity,
      price: item.price,
      subtotal,
    });
  }

  // Validasi pembayaran
  if (parsed.data.payment < total) {
    return NextResponse.json(
      { error: `Bayar kurang. Total: ${total}, Bayar: ${parsed.data.payment}` },
      { status: 400 }
    );
  }

  const change = parsed.data.payment - total;
  const invoiceNo = generateInvoiceNo();

  // DB transaction
  const transaction = await prisma.$transaction(async (tx) => {
    const t = await tx.transaction.create({
      data: {
        invoiceNo,
        userId: parseInt(user.id),
        total,
        payment: parsed.data.payment,
        change,
        note: parsed.data.note || null,
        items: {
          create: lineItems.map((li) => ({
            productId: li.productId ?? undefined,
            productName: li.productName,
            productSku: li.productSku,
            quantity: li.quantity,
            price: li.price,
            subtotal: li.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stok hanya untuk item DB
    for (const item of dbItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return t;
  });

  return NextResponse.json(
    {
      id: transaction.id,
      invoiceNo: transaction.invoiceNo,
      total: transaction.total,
      payment: transaction.payment,
      change: transaction.change,
      items: transaction.items.length,
    },
    { status: 201 }
  );
}
