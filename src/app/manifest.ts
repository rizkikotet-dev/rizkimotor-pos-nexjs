import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rizki Motor — Sparepart Motor Terlengkap",
    short_name: "Rizki Motor",
    description:
      "Sistem POS & manajemen toko sparepart motor. Katalog produk, transaksi cepat, dan laporan.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#c2410c",
    orientation: "portrait-primary",
    categories: ["business", "shopping", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
