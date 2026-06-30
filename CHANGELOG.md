# Changelog

## 2026-06-30 — Setup Wizard Removal & Performance Optimization

### 🔴 BREAKING CHANGES

1. **Removed Setup Wizard**
   - Deleted: `src/app/setup/page.tsx`, `src/app/api/setup/route.ts`, `src/lib/setup.ts`
   - Deleted: `src/components/SetupWizard.tsx`, `src/components/setup/` (icons, StepIndicator, types)
   - Removed: `prisma/schema.vercel.prisma` (schema PostgreSQL terpisah)
   - Migration: Semua command prisma otomatis detek provider dari `DATABASE_URL`

2. **Prisma Provider Auto-Detect**
   - Created: `prisma/prepare.js` — baca `DATABASE_URL`, tentukan SQLite/PostgreSQL
   - Generated: `prisma/schema.prepared.prisma` dengan provider sesuai
   - Semua script (`db:push`, `db:migrate`, `generate`) otomatis pake schema.prepared
   - Untuk pindah database: cukup ganti `DATABASE_URL` di `.env`
   - Di Vercel: otomatis deteksi `process.env.VERCEL` → paksa PostgreSQL

### ✅ PERFORMANCE IMPROVEMENTS

1. **ISR untuk Public Pages**
   - `src/app/(public)/layout.tsx` — `revalidate = 3600`
   - `src/app/(public)/page.tsx` — `revalidate = 60`, query catch fallback
   - `src/app/(public)/produk/page.tsx` — `revalidate = 60`
   - `src/app/(public)/produk/[id]/page.tsx` — `revalidate = 60`
   - Admin/POS tetap `force-dynamic` untuk data real-time

2. **Suspense Streaming — Admin Dashboard**
   - Split jadi 5 async component: `StatsCards`, `TodayActivity`, `LowStock`, `TopProducts`, `RecentTransactions`
   - Masing-masing di-wrap `<Suspense>` dengan skeleton — render progresif
   - Query dioptimasi: filter stok langsung `stock: { lte: 5 }`, top products 1 query + Map lookup

3. **CSS-Only Animasi**
   - `FadeIn.tsx` — dari client component (IntersectionObserver + 2 useEffect) jadi zero-JS pure CSS animation
   - Animasi `fade-in` dari tailwind keyframes

4. **Dynamic Import — PaymentModal**
   - `POSClient.tsx` — PaymentModal pake `next/dynamic` + `ssr: false`
   - Tidak di-load sampai user klik "Buat Pesanan"

5. **Image Optimization**
   - `ProductCard.tsx` — hapus `unoptimized`, tambah `placeholder="blur"` + `blurDataURL`
   - `produk/[id]/page.tsx` — hapus `unoptimized`, tetap `priority`
   - Efek: WebP/AVIF auto, lazy loading native, placeholder halus

6. **Font Subsetting**
   - Geist: 7 weight → 4 (400, 500, 600, 700)
   - Geist Mono: 5 weight → 3 (400, 500, 600)
   - Jakarta: 5 weight → 3 (600, 700, 800)

7. **Product Prefetch**
   - `ProductCard.tsx` — tambah `prefetch` ke `<Link>` → navigasi instan

8. **Bundle Analyzer**
   - `@next/bundle-analyzer` — jalankan `npm run analyze`
   - `next.config.mjs` — wrap dengan `withBundleAnalyzer`

### 🐳 DOCKER PRODUCTION-READY

1. **Auto-Seed di Entrypoint**
   - `docker-entrypoint.sh` — setelah db push, otomatis `node prisma/seed.js`
   - `prisma/seed.js` — CommonJS seed tanpa tsx, idempotent
   - `Dockerfile` — copy bcryptjs ke runner stage, fix permission prisma/

2. **Fixed Entrypoint CRLF**
   - `docker-entrypoint.sh` — konversi CRLF → LF (Linux shell crash)
   - `Dockerfile` — chown `/app/prisma` & `/app/.next` untuk user nextjs

3. **Fixed NEXTAUTH_SECRET length**
   - `docker-compose.yml` — secret placeholder minimal 64 karakter

### 🧪 TESTING & VERIFICATION

- **Playwright browser test**: Semua halaman 200 OK, 0 console errors
- **Login flow**: admin/admin123 → redirect ke /admin ✅
- **Unit tests**: 65/65 passed, 6 test files
- **TypeScript**: `tsc --noEmit` — clean
- **Production build**: sukses, semua route terdaftar

### 📦 BUNDLE SIZE (Production)

- Static JS/CSS: **1.4 MB**
- Total standalone: **52 MB** (includes server + node_modules)
- PaymentModal chunk: **648 bytes** (lazy loaded)

### ⚠️ MIGRATION NOTES

- **Local dev**: `npm run dev` tetap sama. Jalanin `npm run db:push` sekali di awal.
- **Docker**: Container auto-init + auto-seed. `NEXTAUTH_SECRET` wajib minimal 32 karakter.
- **Vercel**: Build command di `vercel.json` otomatis. Set `DATABASE_URL` PostgreSQL di Dashboard.
- **Pindah database**: Cukup ganti `DATABASE_URL` di `.env`. Prisma auto-detect provider.

---

## 2026-06-03 — Thermal 58mm Receipt Print Fix

### 🔴 BUG FIXED

- Root cause: Font terlalu kecil (8px base), layout flex tidak stabil di thermal printer
- Fixed: `printStruk.ts` — rewrite: font 12px body, float layout, `@page` margins
- Impact: Struk thermal 58mm cetak jelas dan lengkap

---

## 2026-06-03 — Comprehensive Audit & Production-Ready Updates

### 🔴 CRITICAL BUGS FIXED

1. **POSClient.tsx - Wrong API Endpoint (BLOCKING)**
   - Fixed: `/api/orders` → `/api/transactions`
   - Added: Payment modal, redirect ke receipt page

2. **Admin Navigation - Missing Kategori Menu**
   - Added: Kategori ke sidebar & mobile nav

3. **POS Navigation - Missing Navigation System**
   - Created: POSHeader, POSMobileNav, LogoutButton

4. **Logout Functionality - Cannot Logout**
   - Fixed: Replace manual fetch dengan NextAuth signOut

5. **Admin Access to POS**
   - Added: "POS / Kasir" link di sidebar admin

6. **Category Edit - Cannot Edit Category**
   - Created: `/admin/kategori/[id]/edit/` page

7. **POS Price Selection - Per-Product**
   - Per-product "Normal" / "Reseller" buttons (bukan global toggle)

### 🟠 SECURITY IMPROVEMENTS

- Image domain whitelist di `next.config.mjs`
- Invoice generation: timestamp + 3-digit random untuk collision prevention
- Rate limiting: login brute force protection
- CSP headers ketat

### ✅ NEW FEATURES

- Toast notification system
- Error boundary component
- ESLint configuration
- Skeleton loading states
- Responsive mobile navigation

### 📚 DOCUMENTATION

- README.md lengkap
- CHANGELOG.md (file ini)
- .env.example dengan dokumentasi
- Dockerfile multi-stage + docker-compose
