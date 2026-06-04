import { PublicHeader } from "@/components/public/Header";
import { PublicFooter } from "@/components/public/Footer";

// Force dynamic rendering: layout calls getSettings() + getCurrentUser() (via
// Header/Footer) yang query DB. Tanpa flag ini Next.js coba pre-render sebagai
// static page di build time → prisma error karena DATABASE_URL tidak ada.
// Pada runtime dengan real DB, pages di-render per-request (cocok untuk public
// marketing site yang kontennya jarang berubah & di-cache di CDN).
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
