import { PublicHeader } from "@/components/public/Header";
import { PublicFooter } from "@/components/public/Footer";

// ISR — Public layout jarang berubah (header/footer settings).
// Revalidate every 1 hour. Jika DB belum siap, query fallback ke default.
export const revalidate = 3600;

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
