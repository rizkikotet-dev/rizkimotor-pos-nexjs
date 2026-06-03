import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIZKI MOTOR — Sparepart Motor Terlengkap",
  description:
    "Toko sparepart alat-alat sepeda motor. Katalog produk, harga, dan ketersediaan stok terkini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
