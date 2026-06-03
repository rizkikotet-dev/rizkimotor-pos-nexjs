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

const updateSchema = z.object({
  key: z.enum(ALLOWED_KEYS as [string, ...string[]]),
  value: z.string().max(500),
});

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
    where: { key: parsed.data.key },
    create: { key: parsed.data.key, value: parsed.data.value },
    update: { value: parsed.data.value },
  });
  return NextResponse.json(setting);
}
