/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy.
// - Production: ketat, no unsafe-eval, no ws (HMR tidak perlu).
// - Development: longgarkan 'unsafe-eval' + ws: untuk HMR & fast refresh.
// Catatan: 'unsafe-inline' di script-src diizinkan untuk kompatibilitas dengan
// script hydration Next.js. Tightening dengan nonce direncanakan di TODO Long Term.
const scriptSrc = ["'self'", "'unsafe-inline'"];
if (isDev) scriptSrc.push("'unsafe-eval'");

const connectSrc = ["'self'"];
if (isDev) connectSrc.push("ws://localhost:*", "ws://127.0.0.1:*");

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc.join(" ")}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  // Cegah clickjacking: tidak boleh di-embed dalam <iframe>.
  { key: "X-Frame-Options", value: "DENY" },
  // Cegah MIME-sniffing browser.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Batasi info yang bocor via header Referer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Matikan fitur browser yang tidak dipakai POS.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // CSP utama.
  { key: "Content-Security-Policy", value: csp },
];

// HSTS hanya di production (butuh HTTPS, dan akan di-cache browser 1 tahun).
if (!isDev) {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  });
}

const nextConfig = {
  output: "standalone",
  // Image optimization:
  // - Local images (/uploads/...) otomatis di-optimize (WebP, AVIF, responsive).
  // - External URLs (https://...) TIDAK di-optimize via `unoptimized` prop di
  //   komponen <Image>, karena admin bisa input URL eksternal apa pun dan
  //   kita tidak mau whitelist arbitrary hosts. Trade-off: tidak dapat WebP
  //   otomatis untuk external, tapi tetap dapat lazy loading + responsive sizes.
  // - remotePatterns di bawah adalah fallback untuk development seed data.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    domains: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
