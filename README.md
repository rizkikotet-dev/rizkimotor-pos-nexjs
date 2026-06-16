# RIZKI MOTOR — Sistem POS & Manajemen Toko Sparepart Motor

Aplikasi manajemen toko sparepart motor lengkap dengan fitur **Point of Sale (POS)** modern, manajemen inventory, **utang piutang**, dan katalog publik. Dibangun dengan Next.js 16, TypeScript, Prisma, dan Tailwind CSS.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Quick Start (Local)](#quick-start-local)
- [Docker](#docker)
- [Vercel Deployment](#vercel-deployment)
- [Struktur Project](#struktur-project)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Scripts](#scripts)
- [CI/CD](#cicd)
- [Staging Deployment](#staging-deployment)
- [Troubleshooting](#troubleshooting)
- [Fitur UI/UX](#fitur-uiux)
- [Browser Support](#browser-support)
- [License](#license)

---

## Fitur Utama

### 1. Point of Sale (POS)
- Interface kasir modern dengan **payment modal** (bukan prompt)
- Pencarian produk real-time (nama, SKU, deskripsi)
- **Input item manual** — tambah item kustom ke transaksi (jasa, barang tidak terdaftar)
- Keranjang belanja dengan update qty otomatis
- Dukungan **harga normal & reseller**
- Pilih **metode bayar** (Tunai, QRIS, Transfer)
- **Bayar Cepat** — tombol Uang Pas, Rp50rb, Rp100rb, dll.
- Pilih **pelanggan** saat transaksi
- Fitur **Bayar Nanti (Utang)** — transaksi kredit ke pelanggan
- **Proteksi stok** — stok < 3 tidak bisa ditambahkan, badge peringatan
- Kembalian otomatis
- Cetak struk transaksi

### 2. Utang & Piutang
- Daftar utang pelanggan dengan filter (Belum Bayar, Sebagian, Lunas)
- **Detail transaksi** — lihat item yang dibeli
- **Bayar utang** — catat pembayaran cicilan (atomic update, anti race condition)
- Statistik total utang outstanding

### 3. Manajemen Pelanggan
- CRUD pelanggan (nama, telepon, alamat, catatan)
- Pencarian server-side
- Pelanggan dengan utang ditandai badge khusus
- Soft delete (nonaktifkan, bukan hapus permanen)

### 4. Admin Dashboard
- Manajemen produk (CRUD + upload gambar)
- Tampilan stok menipis dengan badge tiered (Habis, Stok Menipis, Normal)
- Sorting otomatis: stok menipis tampil paling atas
- Manajemen kategori dengan slug otomatis
- Manajemen pengguna (Admin & Kasir)
- Daftar transaksi dengan badge status utang
- Detail transaksi (item, total, pembayaran)
- Cetak barcode produk
- Pengaturan toko (nama, tagline, kontak, alamat, cetak)

### 5. Katalog Publik
- Tampilan produk modern dan profesional
- Filter berdasarkan kategori
- Pencarian produk
- Badge stok menipis pada produk dengan stok rendah
- Responsive design, dark mode

### 6. Keamanan
- Authentication dengan bcrypt + NextAuth.js
- Role-based access control (ADMIN / KASIR)
- Protected API routes dengan `withAuth` wrapper
- Input validation dengan Zod
- SQL injection prevention (Prisma)
- Rate limiting pada API
- CSP headers yang ketat

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.6 |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (production) |
| Authentication | NextAuth.js 4 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Validation | Zod |
| Testing | Vitest |
| Container | Docker (multi-stage build) |
| Registry | GHCR & DockerHub |

---

## Quick Start (Local)

### Prasyarat

- Node.js 20+
- npm

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/rizkikotet-dev/rizkimotor-pos-nexjs.git
cd rizkimotor-pos-nexjs

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Setup database
npm run db:push

# 5. Seed data awal (opsional)
npm run db:seed

# 6. Jalankan development server
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

### Quick Start (Pull dari Registry)

```bash
# Clone
git clone https://github.com/rizkikotet-dev/rizkimotor-pos-nexjs.git
cd rizkimotor-pos-nexjs

# Buat .env dengan secret
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" > .env

# Jalankan
docker compose up -d

# Setup database (pertama kali)
docker compose exec app npx prisma db push

# Seed data (opsional)
docker compose exec app npx tsx prisma/seed.ts
```

Akses di **http://localhost:3000**

### Profile Lainnya

```bash
# Build lokal
docker compose --profile build up -d --build

# Development (hot reload)
docker compose --profile dev up -d
```

### File Docker

| File | Keterangan |
|------|------------|
| `Dockerfile` | Multi-stage build: `deps` → `builder` → `runner` |
| `docker-compose.yml` | 3 profile: `app` (pull), `build` (lokal), `dev` (hot-reload) |
| `docker-compose.staging.yml` | Staging deployment config |
| `docker-entrypoint.sh` | Entrypoint: prisma generate, db push, lalu start app |
| `.dockerignore` | File yang di-exclude dari build |

### Docker Architecture

- **Multi-stage build** — image production minimal (~200 MB)
- **gosu** — entrypoint jalan sebagai root untuk inisialisasi, lalu turun privilege ke user `nextjs`
- **Volume persistensi** — database SQLite di `/app/data`, uploads di `/app/public/uploads`
- **Healthcheck** — wget ke port 3000 tiap 30 detik
- **Dev mode** — mount source code, anon volume untuk node_modules & .next

---

## Vercel Deployment

### Prasyarat

1. Akun [Vercel](https://vercel.com)
2. Database PostgreSQL (rekomendasi: [Neon](https://neon.tech) — free tier sudah cukup)
3. Repository di GitHub

### Langkah Deployment

#### 1. Buat Database PostgreSQL

Buka [Neon](https://neon.tech) → Create project → Copy connection string.

#### 2. Import Project ke Vercel

Buka [Vercel Dashboard](https://vercel.com) → **Add New Project** → Import repository.

#### 3. Set Environment Variables

Buka project → **Settings** → **Environment Variables** → tambahkan:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Connection string PostgreSQL dari Neon |
| `NEXTAUTH_URL` | Domain Vercel (contoh: `https://rizki-motor.vercel.app`) |
| `NEXTAUTH_SECRET` | Hasil dari `openssl rand -base64 32` |
| `SKIP_ENV_VALIDATION` | `1` |

#### 4. Build & Deploy

Vercel akan otomatis membaca `vercel.json` dan menjalankan build command yang sudah dikonfigurasi.

#### 5. Setup Database

Jika tabel belum terbentuk, aplikasi akan menampilkan **Setup Wizard** di halaman pertama kali akses. Wizard akan memandu:

1. Pilih tipe database (PostgreSQL untuk Vercel)
2. Inisialisasi database
3. Buat akun admin
4. Konfigurasi toko
5. Selesai → redirect ke login

### Catatan Vercel

- **File upload** tidak bisa disimpan di filesystem Vercel. Gunakan cloud storage (Uploadthing, Cloudinary, S3).
- **SQLite tidak bisa digunakan di Vercel** — wajib PostgreSQL.
- **Prisma schema khusus** (`schema.vercel.prisma`) digunakan untuk PostgreSQL.

---

## Struktur Project

```
rizkimotor-pos-nexjs/
├── prisma/
│   ├── schema.prisma              # SQLite (development)
│   ├── schema.vercel.prisma       # PostgreSQL (Vercel)
│   └── seed.ts                    # Seed data
├── public/
│   └── uploads/                   # Upload gambar produk
├── scripts/
│   ├── smoke-test.mjs             # Smoke test (Node.js)
│   └── smoke-test.sh              # Smoke test (Bash)
├── src/
│   ├── app/
│   │   ├── (admin)/               # Halaman admin
│   │   │   └── admin/
│   │   │       ├── produk/        #   CRUD produk + stok warning
│   │   │       ├── kategori/      #   CRUD kategori
│   │   │       ├── pengguna/      #   CRUD pengguna
│   │   │       ├── pelanggan/     #   CRUD pelanggan
│   │   │       ├── transaksi/     #   Daftar transaksi
│   │   │       ├── utang-piutang/ #   Kelola utang
│   │   │       ├── barcode/       #   Cetak barcode
│   │   │       └── pengaturan/    #   Pengaturan toko
│   │   ├── (auth)/                # Login
│   │   ├── (pos)/                 # Point of Sale
│   │   │   └── pos/
│   │   │       ├── page.tsx       #   Halaman kasir utama
│   │   │       ├── POSClient.tsx  #   Client component POS
│   │   │       ├── CartPanel.tsx  #   Keranjang belanja
│   │   │       ├── PaymentModal.tsx #  Modal pembayaran
│   │   │       ├── useCart.ts     #   Hook state keranjang
│   │   │       ├── riwayat/      #   Riwayat transaksi
│   │   │       └── struk/[id]/   #   Cetak struk
│   │   ├── (public)/             # Katalog publik
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             #   NextAuth
│   │   │   ├── products/         #   CRUD produk
│   │   │   ├── categories/       #   CRUD kategori
│   │   │   ├── transactions/     #   Transaksi
│   │   │   ├── customers/        #   CRUD pelanggan
│   │   │   ├── debts/            #   Utang/piutang
│   │   │   ├── users/            #   CRUD pengguna
│   │   │   ├── settings/         #   Pengaturan toko
│   │   │   ├── health/           #   Health check
│   │   │   ├── setup/            #   Inisialisasi database
│   │   │   ├── seed/             #   Seed data
│   │   │   └── upload/           #   Upload gambar
│   │   └── setup/                # Setup wizard page
│   ├── components/
│   │   ├── admin/                # Sidebar, header admin
│   │   ├── pos/                  # Komponen POS
│   │   ├── public/               # Header, footer, ProductCard
│   │   ├── setup/                # Setup wizard components
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── icons.tsx
│   │   │   └── types.ts
│   │   ├── ui/                   # Button, Toast, Pagination, dll
│   │   ├── SetupWizard.tsx       # Setup wizard orchestrator
│   │   ├── ThemeProvider.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useFormSubmit.ts       # Deduplicate loading/error pattern
│   │   └── useModal.ts           # Deduplicate modal state
│   ├── lib/
│   │   ├── auth.ts               # NextAuth config
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── format.ts             # formatRupiah, formatDate, slugify
│   │   ├── settings.ts           # App settings + cache
│   │   ├── setup.ts              # checkNeedsSetup
│   │   ├── api-helpers.ts        # parseId, invalidId, zodError
│   │   ├── slug.ts               # generateUniqueSlug
│   │   ├── constants.ts          # UserRole, PaperSize, PaymentMethod
│   │   ├── search.ts             # Case-insensitive search
│   │   ├── pagination.ts         # Pagination helpers
│   │   ├── rate-limit.ts         # API rate limiting
│   │   ├── barcode-encode.ts     # Barcode encoding
│   │   └── __tests__/            # Unit tests
│   └── types/
│       ├── models.ts             # Shared domain types
│       └── next-auth.d.ts        # NextAuth type augmentation
├── Dockerfile                    # Multi-stage build
├── docker-compose.yml            # 3 profile orchestration
├── docker-compose.staging.yml    # Staging config
├── docker-entrypoint.sh          # Container entrypoint
├── vercel.json                   # Vercel config
└── package.json
```

---

## Database Schema

### User
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| username | String | Unique, login identifier |
| name | String | Nama tampilan |
| password | String | Bcrypt hash |
| role | String | `ADMIN` atau `KASIR` |
| active | Boolean | Aktif/nonaktif |

### Customer (Pelanggan)
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| name | String | Nama pelanggan |
| phone | String? | No. telepon (unique) |
| address | String? | Alamat |
| note | String? | Catatan |
| active | Boolean | Aktif/nonaktif |

### Category
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| name | String | Unique, nama kategori |
| slug | String | Unique, URL-friendly (auto-generated) |
| isDefault | Boolean | Kategori default (tidak bisa dihapus) |

### Product
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| sku | String | Kode unik produk |
| name | String | Nama produk |
| price | Int | Harga jual (Rp) |
| priceReseller | Int | Harga reseller (0 = tidak ada) |
| cost | Int | Harga modal |
| stock | Int | Stok tersedia |
| minStock | Int | Threshold alert stok menipis (default: 5) |
| image | String? | Path gambar |
| categoryId | Int | Relasi ke kategori |

### Transaction
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| invoiceNo | String | Nomor invoice unik (auto-generated) |
| userId | Int | Kasir yang melayani |
| customerId | Int? | Pelanggan (opsional) |
| total | Int | Total belanja |
| payment | Int | Jumlah bayar (0 jika utang) |
| change | Int | Kembalian |
| note | String? | Catatan |

### TransactionItem
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| transactionId | Int | Relasi ke transaksi |
| productId | Int? | Relasi ke produk (nullable untuk item manual) |
| productName | String | Nama item (snapshot) |
| productSku | String | SKU item (snapshot) |
| quantity | Int | Jumlah |
| price | Int | Harga per item |
| subtotal | Int | Total per item |

### Debt (Utang/Piutang)
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| transactionId | Int | Relasi unik ke transaksi |
| customerId | Int | Relasi ke pelanggan |
| amount | Int | Jumlah utang |
| paid | Int | Sudah dibayar |
| status | String | `UNPAID`, `PARTIAL`, `PAID` |
| dueDate | DateTime? | Jatuh tempo |

### Setting
Key-value store untuk konfigurasi toko (nama, tagline, kontak, alamat, cetak).

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

- `items[].productId` — untuk produk database (nullable untuk item manual)
- `items[].name` — nama item manual (hanya untuk item tanpa productId)
- `isDebt: true` + `customerId` → transaksi kredit, otomatis buat record Debt
- `payment: 0` + `isDebt: true` → bayar nanti

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

### Utang/Piutang

```
GET  /api/debts?status=UNPAID|PARTIAL|PAID&page=1&pageSize=20
POST /api/debts
```

Bayar utang:
```json
{
  "debtId": 1,
  "amount": 50000
}
```

### Users

```
GET    /api/users?page=1&pageSize=20
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Categories

```
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Settings

```
GET    /api/settings
PATCH  /api/settings
```

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "environment": "production"
}
```

### Setup Database

```
POST /api/setup
```

Body opsional:
```json
{
  "type": "postgresql",
  "connectionString": "postgresql://user:pass@host:5432/db"
}
```

### Seed Data

```
POST /api/seed
```

Header wajib: `x-allow-seed: 1`

---

## Environment Variables

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `DATABASE_URL` | Ya | `file:./dev.db` | SQLite (dev) atau PostgreSQL (production) |
| `NEXTAUTH_URL` | Ya | `http://localhost:3000` | URL aplikasi |
| `NEXTAUTH_SECRET` | Ya | — | Generate dengan `openssl rand -base64 32` |
| `SKIP_ENV_VALIDATION` | Tidak | — | Set `1` untuk skip validasi env di build |

---

## Panduan Penggunaan

### Transaksi di POS (Kasir)

1. **Cari produk** — ketik nama atau SKU di kolom pencarian
2. **Item manual** — klik tombol "Manual" untuk input item kustom
3. **Tambah ke keranjang** — klik "Normal" atau "Reseller"
4. **Atur jumlah** — gunakan tombol +/- di keranjang
5. **Klik "Buat Pesanan"** — payment modal muncul
6. **Pilih pelanggan** (opsional)
7. **Pilih metode bayar** — Tunai/QRIS/Transfer
8. **Input nominal bayar** — atau klik tombol bayar cepat
9. **Jika utang** — nyalakan toggle "Bayar Nanti", pastikan pelanggan dipilih
10. **Klik "Bayar"** atau **"Catat Utang"**

### Proteksi Stok

- Stok **0** → badge merah "Habis", tidak bisa ditambahkan
- Stok **1–2** → badge merah "Stok Menipis", toast warning
- Stok **3–5** → badge amber "Sisa N" sebagai pengingat
- Sorting otomatis: stok terendah muncul paling atas

### Kelola Utang (Admin)

1. Buka menu **Utang Piutang** di sidebar
2. Gunakan filter: Semua / Belum Bayar / Sebagian / Lunas
3. Klik **Bayar** untuk mencatat pembayaran cicilan
4. Klik **ikon mata** untuk melihat detail transaksi

---

## Scripts

```bash
npm run dev             # Development server
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint check
npm test                # Jalankan test (Vitest)
npm run test:watch      # Test mode watch

npm run db:push         # Push schema ke database
npm run db:migrate      # Buat migration
npm run db:seed         # Seed data awal
npm run db:studio       # Buka Prisma Studio
```

---

## CI/CD

### Pipeline

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | Push ke `main`, PR ke `main` | Lint + Test |
| `docker.yml` | Push ke `main`, Tag `v*`, PR | Build & push image ke GHCR & DockerHub |
| `cd.yml` | Docker build berhasil di `main` | Deploy ke staging + smoke test |

### Setup

#### DockerHub

1. Buat akun di [DockerHub](https://hub.docker.com)
2. Access Token: Account Settings → Security → New Access Token
3. Tambah Secret di GitHub:
   - `DOCKERHUB_USERNAME` — username DockerHub
   - `DOCKERHUB_TOKEN` — access token

#### GHCR

GHCR sudah otomatis aktif — `GITHUB_TOKEN` tersedia secara default.

### Tag yang Dihasilkan

| Source | Tag |
|--------|-----|
| Push ke main | `main`, `sha-abc1234` |
| Tag v1.2.3 | `1.2.3`, `1.2`, `latest` |

---

## Staging Deployment

### Arsitektur

- **Image**: `ghcr.io/rizkikotet-dev/rizkimotor-pos-nexjs:main`
- **Runtime**: Docker Compose (`docker-compose.staging.yml`)
- **Port**: 3001 (host) → 3000 (container)
- **Database**: SQLite (`staging.db`)
- **Healthcheck**: `/api/health` endpoint

### Setup GitHub Environment

1. Buka **Settings** → **Environments** → **New environment** → nama: `staging`
2. Tambahkan **Environment secrets** (opsional):
   - `STAGING_NEXTAUTH_URL` — URL staging custom
   - `STAGING_NEXTAUTH_SECRET` — Secret custom

> Jika secrets tidak diset, staging menggunakan default values dari `docker-compose.staging.yml`.

### Manual Deploy

```bash
docker pull ghcr.io/rizkikotet-dev/rizkimotor-pos-nexjs:main
docker compose -f docker-compose.staging.yml up -d
```

### Smoke Tests

```bash
# Node.js (cross-platform)
node scripts/smoke-test.mjs http://localhost:3001

# Bash (Linux/macOS/WSL)
./scripts/smoke-test.sh http://localhost:3001
```

---

## Troubleshooting

### Database error setelah update schema
```bash
npm run db:push
```

### Prisma client tidak ditemukan
```bash
npx prisma generate
```

### Reset database SQLite
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Docker: permission denied
```bash
chmod +x docker-entrypoint.sh
docker compose logs app
```

### Vercel: build error Prisma
Pastikan `DATABASE_URL` sudah diset di Vercel Environment Variables dan menggunakan PostgreSQL URL yang valid.

### Upload gambar tidak muncul di Vercel
Vercel memiliki filesystem read-only. Gunakan cloud storage (Uploadthing, Cloudinary, S3).

---

## Fitur UI/UX

- Dark mode dengan theme toggle (system preference + manual toggle)
- Responsive design (mobile-first)
- Payment modal modern (bukan prompt)
- Toast notifications (sukses, error, warning)
- Badge stok tiered (merah = habis/menipis, amber = waspada)
- Loading states & skeleton
- Error boundaries
- Accessibility (ARIA labels, focus management, keyboard navigation)
- Print-ready receipts (58mm & 80mm)

---

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## License

Proprietary — All rights reserved
