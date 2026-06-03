import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Pengaturan</h1>
        </div>
        <p className="text-sm text-zinc-500 mt-0.5">Kelola informasi toko, jam operasional, dan metode pembayaran.</p>
      </div>

      <SettingsForm initialSettings={settings} categories={categories} />
    </div>
  );
}
