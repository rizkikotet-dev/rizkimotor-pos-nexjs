import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSettings, getSettingsGrouped } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";
import { Settings as SettingsIcon, ExternalLink, Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const user = (await getCurrentUser())!;
  const settings = await getSettings();
  const grouped = getSettingsGrouped();

  return (
    <>
      <AdminHeader
        user={user}
        title="Pengaturan"
        subtitle="Konfigurasi toko dan struk"
      />

      <div className="page-container pb-24 lg:pb-8 max-w-4xl">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 flex items-start gap-3 mb-4">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Perubahan langsung berlaku</p>
            <p className="text-xs mt-1 leading-relaxed">
              Semua perubahan pada halaman ini akan langsung terlihat di katalog publik,
              POS, dan struk. Untuk preview struk, lihat{" "}
              <Link href="/pos" className="underline inline-flex items-center gap-0.5 font-medium">
                halaman kasir <ExternalLink className="h-3 w-3" />
              </Link>
              .
            </p>
          </div>
        </div>

        <SettingsForm settings={settings} grouped={grouped} />
      </div>
    </>
  );
}
