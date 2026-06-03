import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/settings";
import { z } from "zod";

const ALLOWED_KEYS = Object.keys(DEFAULT_SETTINGS);

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stored = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  for (const key of ALLOWED_KEYS) {
    const found = stored.find((s) => s.key === key);
    result[key] = found?.value ?? (DEFAULT_SETTINGS as Record<string, string>)[key];
  }
  return NextResponse.json(result);
}

const batchSchema = z.record(z.string(), z.string().max(500));

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  return NextResponse.json({ ok: true, saved: ops.length });
}
