import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/slug";

const createSchema = z.object({ name: z.string().min(1).max(50) });

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = await generateUniqueSlug(parsed.data.name);

  const cat = await prisma.category.create({
    data: { name: parsed.data.name, slug, isDefault: false },
  });
  return NextResponse.json(cat, { status: 201 });
}, { admin: true });
