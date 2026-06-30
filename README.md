# RIZKI MOTOR — Sistem POS & Manajemen Toko Sparepart Motor

Aplikasi manajemen toko sparepart motor lengkap dengan fitur **Point of Sale (POS)** modern, manajemen inventory, **utang piutang**, dan katalog publik. Dibangun dengan Next.js 16, TypeScript, Prisma, dan Tailwind CSS.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Quick Start (Local)](#quick-start-local)
- [Docker](#docker)
- [Vercel Deployment](#vercel-deployment)
- [Database](#database)
- [Struktur Project](#struktur-project)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Performance](#performance)
- [Scripts](#scripts)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## Fitur Utama

### 1. Point of Sale (POS)
- Interface kasir modern dengan **payment modal** (bukan prompt)
- Pencarian produk real-time (nama, SKU, deskripsi)
- **Input item manual** — jasa, barang tidak terdaftar
- Keranjang dengan update qty otomatis, **harga normal & reseller**
- Metode bayar: Tunai, QRIS, Transfer
- **Bayar Cepat** — tombol Uang Pas, Rp50rb, Rp100rb, dll.
- **Bayar Nanti (Utang)** — transaksi kredit ke pelanggan
- **Proteksi stok** — stok < 3 tidak bisa ditambahkan
- Kembalian otomatis, cetak struk (58mm & 80mm)

### 2. Utang & Piutang
- Filter status: Belum Bayar, Sebagian, Lunas
- Detail transaksi & pembayaran cicilan (atomic update)
- Statistik total utang outstanding

### 3. Manajemen Pelanggan
- CRUD, pencarian server-side, soft delete
- Badge khusus untuk pelanggan dengan utang

### 4. Admin Dashboard
- CRUD produk (dengan upload gambar), kategori, pengguna
- Stok menipis badge tiered (Habis/Menipis/Normal), sorting otomatis
- Cetak barcode, pengaturan toko (nama, kontak, struk)
- **Streaming Suspense** — statistik, aktivitas, stok, dan transaksi render progresif

### 5. Katalog Publik
- Tampilan modern, filter kategori, pencarian
- Badge stok, dark mode, responsive
- **ISR (Incremental Static Regeneration)** — cache 60 detik

### 6. Keamanan
- Authentication dengan bcrypt + NextAuth.js (JWT)
- Role-based access control (ADMIN / KASIR)
- Protected API routes dengan `withAuth` wrapper
- Input validation dengan Zod, rate limiting
- CSP headers, SQL injection prevention (Prisma)

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.6 |
| Database | Prisma ORM + SQLite / PostgreSQL |
| Authentication | NextAuth.js 4 (JWT) |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React (tree-shaken) |
| Validation | Zod |
| Testing | Vitest + Playwright |

---

## Quick Start (Local)

### Prasyarat

- Node.js 20+
- npm

### Instalasi

```bash
# 1. Clone
git clone https://github.com/rizkikotet-dev/rizkimotor-pos-nexjs.git
cd rizkimotor-pos-nexjs

# 2. Install dependencies (auto-generate Prisma client)
npm install

# 3. Setup environment
cp .env.example .env

# 4. Setup database
npm run db:push

# 5. Seed data awal
npm run db:seed

# 6. Development server
npm run dev
```

Aplikasi berjalan di **http://localhost:3000**

### Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Kasir | `kasir` | `kasir123` |

---

## Docker

### Prasyarat

- Docker & Docker Compose v2+

### Production (build lokal)

```bash
# Clone
git clone https://github.com/rizkikotet-dev/rizkimotor-pos-nexjs.git
cd rizkimotor-pos-nexjs

# Generate secret
openssl rand -base64 32

# Build & start (ganti NEXTAUTH_SECRET dengan hasil openssl)
NEXTAUTH_SECRET="..." docker compose --profile build up -d

# Atau edit docker-compose.yml, set NEXTAUTH_SECRET, lalu:
docker compose --profile build up -d
```

Akses di **http://localhost:3000**

> **Auto-seed**: Container otomatis push schema + seed data pada first boot.
> Tidak perlu langkah manual.

### Production (pull dari registry)

```bash
docker compose up -d
```

### Development (hot reload)

```bash
docker compose --profile dev up -d
```

### File Docker

| File | Keterangan |
|------|------------|
| `Dockerfile` | Multi-stage build: `deps` → `builder` → `runner` |
| `docker-compose.yml` | 3 profile: `app` (pull), `build` (lokal), `dev` (hot-reload) |
| `docker-compose.staging.yml` | Staging deployment config |
| `docker-entrypoint.sh` | Entrypoint: prepare schema, generate, db push, seed, start |
| `.dockerignore` | File yang di-exclude dari build |

### Docker Architecture

- **Multi-stage build** — image production ~200 MB
- **gosu** — entrypoint jalan sebagai root untuk inisialisasi, lalu turun privilege ke user `nextjs`
- **Volume persistensi** — database SQLite di `/app/data`, uploads di `/app/public/uploads`
- **Healthcheck** — wget ke port 3000 tiap 30 detik
- **Auto-seed** — `prisma/seed.js` (CommonJS) jalan otomatis saat database baru

---

## Vercel Deployment

### Prasyarat

1. Akun [Vercel](https://vercel.com)
2. Database PostgreSQL ([Neon](https://neon.tech) — free tier cukup)
3. Repository di GitHub

### Langkah

1. **Buat Database PostgreSQL** — Neon → Create project → Copy connection string
2. **Import Project** — Vercel Dashboard → Add New Project → Import repository
3. **Set Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Connection string PostgreSQL |
   | `NEXTAUTH_URL` | Domain Vercel (https://...) |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `SKIP_ENV_VALIDATION` | `1` |

4. **Build & Deploy** — Vercel baca `vercel.json`, build otomatis.
   - Prisma provider auto-detect: di Vercel paksa PostgreSQL
   - Build command: `node prisma/prepare.js && npx prisma generate --schema=prisma/schema.prepared.prisma && ...`

> **Catatan**: File upload tidak bisa disimpan di filesystem Vercel. Gunakan cloud storage (Uploadthing, Cloudinary, S3).

---

## Database

### Provider Auto-Detect

Cukup ganti `DATABASE_URL` di `.env` — Prisma provider otomatis terdeteksi:

```bash
# SQLite (development, Docker single-container)
DATABASE_URL="file:./dev.db"

# PostgreSQL (production, Vercel)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

Mekanisme: `prisma/prepare.js` baca URL, tentukan provider, generate `schema.prepared.prisma`.
Semua script Prisma (`db:push`, `db:migrate`, `generate`) pakai `--schema=prisma/schema.prepared.prisma`.

### Schema

| Model | Keterangan |
|-------|------------|
| `User` | ADMIN / KASIR, bcrypt password |
| `Customer` | Pelanggan dengan soft delete |
| `Category` | Kategori produk, slug otomatis |
| `Product` | SKU, harga, stok, gambar |
| `Transaction` | Invoice, total, pembayaran |
| `TransactionItem` | Item per transaksi (snapshot) |
| `Debt` | Utang/piutang dengan status cicilan |
| `Setting` | Key-value store konfigurasi toko |

---

## Struktur Project

```
rizkimotor-pos-nexjs/
├── prisma/
│   ├── schema.prisma              # Schema tunggal
│   ├── prepare.js                 # Auto-detect provider dari DATABASE_URL
│   ├── seed.js                    # Auto-seed (CommonJS, untuk Docker)
│   └── seed.ts                    # Seed manual (TypeScript)
├── public/uploads/                # Upload gambar produk
├── scripts/
│   ├── smoke-test.mjs             # Smoke test Node.js
│   └── smoke-test.sh              # Smoke test Bash
├── src/
│   ├── app/
│   │   ├── (admin)/admin/         # Dashboard, produk, kategori, pelanggan, utang, dll
│   │   ├── (auth)/                # Login
│   │   ├── (pos)/pos/             # POS — kasir
│   │   ├── (public)/              # Katalog publik (ISR 60s)
│   │   └── api/                   # API routes (NextAuth, CRUD, transaksi, utang, dll)
│   ├── components/
│   │   ├── admin/                 # Sidebar, header admin
│   │   ├── pos/                   # Komponen POS (PaymentModal dynamic import)
│   │   ├── public/                # Header, footer, ProductCard (prefetch + blur)
│   │   ├── ui/                    # Button, Toast, Pagination, Skeleton, FadeIn (CSS-only)
│   │   ├── ThemeProvider.tsx
│   │   └── ErrorBoundary.tsx
│   ├── hooks/                     # useFormSubmit, useModal
│   ├── lib/                       # Auth, Prisma, format, settings (cache), rate-limit
│   └── types/                     # Shared types
├── Dockerfile                     # Multi-stage build
├── docker-compose.yml             # 3 profile orchestration
├── docker-compose.staging.yml     # Staging config
├── docker-entrypoint.sh           # Container entrypoint
├── vercel.json                    # Vercel build config
├── next.config.mjs                # CSP, image domains, bundle analyzer
└── package.json
```

---

## API Reference

### Transaksi

```
POST /api/transactions
```
```json
{
  "items": [
    { "productId": 1, "price": 50000, "quantity": 2 },
    { "name": "Jasa Service", "sku": "", "price": 25000, "quantity": 1 }
  ],
  "payment": 100000,
  "customerId": 1,
  "isDebt": false,
  "note": null
}
```

### Produk

```
GET    /api/products?q=&categoryId=&page=1&pageSize=20
POST   /api/products
GET    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
```

### Pelanggan

```
GET    /api/customers?q=&page=1&pageSize=20
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
DELETE /api/customers/:id
```

### Utang

```
GET  /api/debts?status=UNPAID|PARTIAL|PAID&page=1&pageSize=20
POST /api/debts  { "debtId": 1, "amount": 50000 }
```

### Seed Data

```
POST /api/seed
Header: x-allow-seed: 1
```

### Health Check

```
GET /api/health
```

Response: `{ "status": "healthy", "timestamp": "...", "version": "0.1.0" }`

---

## Environment Variables

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `DATABASE_URL` | Ya | `file:./dev.db` | SQLite atau PostgreSQL — provider auto-detect |
| `NEXTAUTH_URL` | Ya | `http://localhost:3000` | URL aplikasi |
| `NEXTAUTH_SECRET` | Ya | — | Generate: `openssl rand -base64 32` (min 32 char) |
| `SKIP_ENV_VALIDATION` | Tidak | — | Set `1` untuk skip validasi env di build |

---

## Performance

### Optimization

| Teknik | Detail |
|--------|--------|
| **ISR** | Public pages revalidate 60-3600 detik. Admin/POS dynamic. |
| **Streaming** | Admin dashboard split 5 async component + Suspense |
| **Image** | `placeholder="blur"`, lazy loading native, WebP/AVIF |
| **Font** | Self-hosted (zero FOUT), subset weight minimal |
| **Animasi** | CSS-only (zero JS), tailwind keyframes |
| **Dynamic Import** | PaymentModal lazy load via `next/dynamic` + `ssr: false` |
| **Prefetch** | ProductCard prefetch untuk navigasi instan |
| **Cache** | Settings di-cache via `unstable_cache` (60s TTL) |

### Bundle Size (Production Build)

```bash
npm run analyze     # Bundle analyzer report (buka .next/analyze/)
npm run build       # Production build

Static JS/CSS: ~1.4 MB
Total standalone: ~52 MB (server + node_modules)
```

### Lighthouse Tips

- **FCP/LCP**: ISR render cached HTML, font self-hosted, image optimized
- **CLS**: next/font swap, explicit aspect-ratio, no layout shift
- **TBT**: Zero JS animations, dynamic import heavy components
- **SI**: Streaming skeleton, progressive section rendering

---

## Scripts

```bash
npm run dev             # Development server (Turbopack)
npm run build           # Production build
npm run start           # Production server
npm run analyze         # Production build + bundle analyzer
npm run lint            # ESLint check
npm test                # Unit tests (Vitest)
npm run test:watch      # Test mode watch
npm run test:ui         # Test UI mode

npm run prisma:prepare  # Auto-detect provider, generate schema.prepared.prisma
npm run prisma:generate # Generate Prisma client
npm run db:push         # Push schema ke database
npm run db:migrate      # Buat migration
npm run db:seed         # Seed data awal
npm run db:studio       # Buka Prisma Studio
```

---

## Testing

```bash
# Unit tests
npm test                  # 65 tests, 6 files

# E2E (manual via Playwright)
npx playwright test       # Setup: npx playwright install chromium
# Atau via MCP browser tools di Claude
```

---

## CI/CD

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | Push ke `main`, PR ke `main` | Lint + Test |
| `docker.yml` | Push ke `main`, Tag `v*`, PR | Build & push image ke GHCR & DockerHub |
| `cd.yml` | Docker build berhasil di `main` | Deploy ke staging + smoke test |

---

## Troubleshooting

### Database error setelah update schema
```bash
npm run db:push
```

### Reset database SQLite
```bash
rm prisma/dev.db prisma/schema.prepared.prisma
npm run db:push
npm run db:seed
```

### Docker: permission denied
```bash
chmod +x docker-entrypoint.sh
docker compose logs app
```

### Docker: entrypoint "no such file or directory"
File entrypoint harus LF (Unix), bukan CRLF (Windows). Build ulang setelah fix.

### Vercel: build error Prisma
Pastikan `DATABASE_URL` sudah diset di Vercel Dashboard dengan PostgreSQL URL yang valid.
Build command di `vercel.json` otomatis handle provider detection.

### NEXTAUTH_SECRET terlalu pendek
Minimal 32 karakter. Generate: `openssl rand -base64 32`

### Upload gambar tidak muncul di Vercel
Vercel filesystem read-only. Gunakan cloud storage (Uploadthing, Cloudinary, S3).

---

## Changelog

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk riwayat perubahan lengkap.

---

## License

Proprietary — All rights reserved
