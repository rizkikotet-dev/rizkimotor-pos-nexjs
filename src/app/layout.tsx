import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIZKI MOTOR — Sparepart Motor Terlengkap",
  description:
    "Toko sparepart alat-alat sepeda motor. Katalog produk, harga, dan ketersediaan stok terkini.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-dvh bg-surface-base">
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
