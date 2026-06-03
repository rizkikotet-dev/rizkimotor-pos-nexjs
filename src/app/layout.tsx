import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "RIZKI MOTOR — Sparepart Motor Terlengkap",
  description:
    "Toko sparepart alat-alat sepeda motor. Katalog produk, harga, dan ketersediaan stok terkini.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className="min-h-dvh" style={{ background: "var(--surface-base)" }}>
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
