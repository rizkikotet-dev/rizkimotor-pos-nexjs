import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cookies } from "next/headers";

// Self-hosted fonts via next/font. No external network at runtime, no FOUT,
// no layout shift. CSS variables allow Tailwind to reference them in tailwind.config.ts.
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["600", "700", "800"],
});

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RIZKI MOTOR — Sparepart Motor Terlengkap",
    template: "%s | RIZKI MOTOR",
  },
  description:
    "Toko sparepart alat-alat sepeda motor. Katalog produk terlengkap, harga bersaing, dan ketersediaan stok terkini. Belanja mudah, bayar cepat, struk digital.",
  keywords: [
    "sparepart motor",
    "onderdil motor",
    "oli motor",
    "rem motor",
    "aki motor",
    "ban motor",
    "rizki motor",
    "toko sparepart",
    "POS kasir",
  ],
  authors: [{ name: "Rizki Motor" }],
  creator: "Rizki Motor",
  publisher: "Rizki Motor",
  applicationName: "Rizki Motor POS",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "RIZKI MOTOR",
    title: "RIZKI MOTOR — Sparepart Motor Terlengkap",
    description:
      "Katalog produk sparepart motor terlengkap dengan harga bersaing dan kualitas terjamin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RIZKI MOTOR — Sparepart Motor Terlengkap",
    description:
      "Katalog produk sparepart motor terlengkap dengan harga bersaing dan kualitas terjamin.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Opt out of static rendering
  await cookies();

  return (
    <html
      lang="id"
      className={`${geist.variable} ${geistMono.variable} ${jakarta.variable} dark`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {/*
          Inline anti-FOUC script. Membaca tema dari localStorage SEBELUM React
          hydrates, sehingga tidak ada flash dark→light (atau sebaliknya) di
          paint pertama. Memerlukan `suppressHydrationWarning` di <html> untuk
          menghindari mismatch warning saat class berubah.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("rizki-theme");var r=t==="light"?"light":t==="dark"?"dark":(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",r==="dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh" style={{ background: "var(--surface-base)" }}>
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
