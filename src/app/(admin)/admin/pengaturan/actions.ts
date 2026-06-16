"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/settings";

const ALLOWED_KEYS = Object.keys(DEFAULT_SETTINGS) as SettingKey[];

const updateSchema = z.object({
  key: z.enum(ALLOWED_KEYS as [string, ...string[]]),
  value: z.string().max(500),
});

export async function updateSetting(key: string, value: string) {
  await requireAdmin();
  const parsed = updateSchema.parse({ key, value });
  await prisma.setting.upsert({
    where: { key: parsed.key },
    create: { key: parsed.key, value: parsed.value },
    update: { value: parsed.value },
  });
  // Revalidate semua path yang mungkin menampilkan setting
  revalidatePath("/", "layout");
  // Next.js 16: di server action, pakai updateTag (read-your-own-writes semantics).
  updateTag("settings");
}

export async function updateSettingsBulk(formData: FormData) {
  await requireAdmin();

  const ops: Array<Promise<{ key: string; value: string }>> = [];
  for (const key of ALLOWED_KEYS) {
    // Ambil value: text/textarea/select dari FormData, boolean dari checkbox "on" atau ""
    let value: string;
    if (formData.has(`__bool_${key}`)) {
      // boolean field: hidden input "__bool_KEY" = "true" + checkbox = "on" or absent
      value = formData.get(key) === "on" ? "true" : "false";
    } else {
      value = String(formData.get(key) ?? "").trim();
    }
    ops.push(
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    );
  }
  await Promise.all(ops);
  revalidatePath("/", "layout");
  updateTag("settings");
}

export async function resetSettings() {
  await requireAdmin();
  // Hapus semua, biarkan DEFAULT_SETTINGS yang di-handle oleh getSettings()
  await prisma.setting.deleteMany({});
  revalidatePath("/", "layout");
  updateTag("settings");
}
