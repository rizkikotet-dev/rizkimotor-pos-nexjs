import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { z } from "zod";

const ALLOWED_KEYS = Object.keys(DEFAULT_SETTINGS);

export const GET = withAuth(async () => {
  let stored: { key: string; value: string }[];
  try {
    stored = await prisma.setting.findMany();
  } catch (e) {
    // P2021 = table not found — database belum diinisialisasi, return defaults
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2021") {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    throw e;
  }
  const result: Record<string, string> = {};
  for (const key of ALLOWED_KEYS) {
    const found = stored.find((s) => s.key === key);
    result[key] = found?.value ?? (DEFAULT_SETTINGS as Record<string, string>)[key];
  }
  return NextResponse.json(result);
}, { admin: true });

const batchSchema = z.record(z.string(), z.string().max(500));

export const PUT = withAuth(async (req) => {
  const body = await req.json();

  const settings = body.settings ?? body;

  const parsed = batchSchema.safeParse(settings);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ops = Object.entries(parsed.data)
    .filter(([key]) => ALLOWED_KEYS.includes(key))
    .map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    );

  await Promise.all(ops);

  // Invalidate cache settings di semua server component.
  // Next.js 16: revalidateTag butuh 2nd arg (cache profile); "max" = aman (segera revalidate).
  revalidateTag("settings", "max");

  return NextResponse.json({ ok: true, saved: ops.length });
}, { admin: true });
