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
- [CI/CD — Docker ke GHCR & DockerHub](#cicd--docker-ke-ghcr--dockerhub)
- [Troubleshooting](#troubleshooting)

---

## Fitur Utama

### 1. Point of Sale (POS)
- Interface kasir modern dengan **payment modal** (bukan prompt)
- Pencarian produk real-time (nama, SKU, deskripsi)
- **Input item manual** — tambah item kustom ke transaksi (jasa, barang tidak terdaftar)
- Keranjang belanja dengan update qty otomatis
- Dukungan **harga normal & reseller**
- Pilih **metode bayar** (Tunai, QRIS, Transfer, Kartu)
- **Bayar Cepat** — tombol Uang Pas, Rp50rb, Rp100rb, dll.
- Pilih **pelanggan** saat transaksi
- Fitur **Bayar Nanti (Utang)** — transaksi kredit ke pelanggan
- **Proteksi stok** — stok < 3 tidak bisa ditambahkan ke transaksi, badge peringatan
- Kembalian otomatis
- Cetak struk transaksi

### 2. Utang & Piutang
- Daftar semua utang pelanggan dengan filter (Belum Bayar, Sebagian, Lunas)
- **Detail transaksi** — lihat item yang dibeli
- **Bayar utang** — catat pembayaran cicilan
- Badge status pada daftar transaksi (Utang/Sebagian/Lunas)
- Statistik total utang outstanding

### 3. Manajemen Pelanggan
- CRUD pelanggan (nama, telepon, alamat, catatan)
- Pencarian pelanggan
- Pelanggan dengan utang ditandai badge khusus
- Soft delete (nonaktifkan, bukan hapus permanen)

### 4. Admin Dashboard
- Manajemen produk (CRUD + upload gambar)
- Tampilan stok menipis dengan badge tiered (Habis, Stok Menipis, Normal)
- Sorting otomatis: stok menipis tampil paling atas
- Manajemen kategori
- Manajemen pengguna (Admin & Kasir)
- Daftar transaksi dengan **badge status utang**
- Detail transaksi (item, total, pembayaran)
- Cetak barcode produk
- Pengaturan toko (nama, tagline, kontak, alamat)

### 5. Katalog Publik
- Tampilan produk modern dan profesional
- Filter berdasarkan kategori
- Pencarian produk
- Badge stok menipis pada produk dengan stok rendah
- Responsive design, dark mode

### 6. Keamanan
- Authentication dengan bcrypt
- Role-based access control (ADMIN / KASIR)
- Protected API routes
- Input validation dengan Zod
- SQL injection prevention (Prisma)

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.6 |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (production) |
| Authentication | NextAuth.js 4 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Validation | Zod |
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

Tiga profile Docker untuk kebutuhan berbeda: pull registry, build lokal, dan development hot-reload.

### Prasyarat

- Docker & Docker Compose v2+

### Profile 1: Pull dari Registry (Production)

Menarik image dari GHCR, cocok untuk production. Tidak perlu build.

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

### Profile 2: Build Lokal (Production)

Build image dari Dockerfile lokal, cocok untuk development atau kustomisasi.

```bash
docker compose --profile build up -d --build

# Setup database (pertama kali)
docker compose --profile build exec app npx prisma db push
```

### Profile 3: Development (Hot Reload)

Mount source code dengan hot reload. Perubahan kode langsung terlihat tanpa rebuild.

```bash
docker compose --profile dev up -d

# Akses di http://localhost:3000
```

### Perintah Docker Lainnya

```bash
# Logs
docker compose logs -f
docker compose --profile build logs -f

# Stop
docker compose down
docker compose --profile build down
docker compose --profile dev down
```

### File Docker

| File | Keterangan |
|------|------------|
| `Dockerfile` | Multi-stage build: `deps` → `builder` → `runner` |
| `docker-compose.yml` | 3 profile: `app` (pull), `build` (lokal), `dev` (hot-reload) |
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

Buka [Neon](https://neon.tech) → Create project → Copy connection string:

```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/rizkimotor?sslmode=require
```

#### 2. Import Project ke Vercel

```bash
# Push repository ke GitHub
git remote add origin https://github.com/rizkikotet-dev/rizkimotor-pos-nexjs.git
git push -u origin main
```

Buka [Vercel Dashboard](https://vercel.com) → **Add New Project** → Import repository.

#### 3. Set Environment Variables di Vercel

Buka project → **Settings** → **Environment Variables** → tambahkan:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Connection string PostgreSQL dari Neon |
| `NEXTAUTH_URL` | Domain Vercel (contoh: `https://rizki-motor.vercel.app`) |
| `NEXTAUTH_SECRET` | Hasil dari `openssl rand -base64 32` |
| `SKIP_ENV_VALIDATION` | `1` |

> **Catatan:** NEXTAUTH_URL harus diisi domain production Vercel. Untuk production, set juga di **Preview** dan **Development** dengan URL masing-masing.

#### 4. Build Settings

Vercel akan otomatis membaca `vercel.json`:

- **Build Command:** `npx prisma generate --schema=prisma/schema.vercel.prisma && npx prisma db push --schema=prisma/schema.vercel.prisma --skip-generate --accept-data-loss 2>/dev/null; next build`
- **Schema khusus PostgreSQL** — `prisma/schema.vercel.prisma` digunakan, bukan `schema.prisma` (SQLite)

> Build command secara otomatis menjalankan `prisma db push` untuk membuat/menyinkronkan tabel database setiap deploy. Jika database belum siap saat build, build tetap lanjut (tidak blocking).

#### 5. Deploy

Klik **Deploy**. Vercel akan build dan deploy aplikasi.

#### 6. Setup Database Production

Database akan otomatis tersinkronisasi saat build berkat `prisma db push` di build command.

**Jika tabel belum terbentuk**, jangan khawatir — aplikasi otomatis mendeteksi database kosong dan menampilkan **Setup Wizard** di halaman pertama kali akses. Wizard akan memandu Anda melalui:

1. **Inisialisasi database** — menjalankan `prisma db push` secara otomatis via `POST /api/setup`
2. **Buat akun admin** — username, nama, dan password
3. **Konfigurasi toko** — nama toko, tagline, dan kontak
4. **Selesai** — redirect ke halaman login

Tidak perlu akses terminal — semua dilakukan dari browser.

> Jika wizard tidak muncul, akses endpoint setup manual:
> ```bash
> curl -X POST https://domain-anda.vercel.app/api/setup
> ```

#### 7. Seed Data (User & Pengaturan Default)

Setelah database siap, isi data awal:

```bash
curl -X POST https://domain-anda.vercel.app/api/seed \
  -H "x-allow-seed: 1"
```

Ini akan membuat:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Kasir | `kasir` | `kasir123` |

Serta pengaturan toko default dan kategori "Umum".

> **Idempotent** — aman dipanggil berulang. Hanya mengisi data jika belum ada.

### Catatan Penting Vercel

- **File upload** tidak bisa disimpan di filesystem Vercel (ephemeral). Untuk production, gunakan cloud storage (Uploadthing, Cloudinary, S3).
- **SQLite tidak bisa digunakan di Vercel** karena serverless function read-only filesystem. Wajib PostgreSQL.
- **Prisma schema khusus** (`schema.vercel.prisma`) identik dengan schema utama tapi menggunakan `provider = "postgresql"`.
- **Database migration** dilakukan manual via `prisma db push` atau `prisma migrate`.

---

## Struktur Project

```
rizkimotor/
├── prisma/
│   ├── schema.prisma              # SQLite (development)
│   ├── schema.vercel.prisma       # PostgreSQL (Vercel)
│   └── seed.ts                    # Seed data
├── public/
│   └── uploads/                   # Upload gambar produk
├── data/                          # Database SQLite (Docker volume)
├── src/
│   ├── app/
│   │   ├── (admin)/               # Halaman admin (dashboard, produk, dll)
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
│   │   │       ├── ProductGrid.tsx#   Grid produk + stok badge
│   │   │       ├── ProductSearchBar.tsx
│   │   │       ├── CartPanel.tsx  #   Keranjang belanja
│   │   │       ├── ManualItemModal.tsx # Input item manual
│   │   │       ├── PaymentModal.tsx#   Modal pembayaran
│   │   │       ├── useCart.ts     #   Hook state keranjang
│   │   │       ├── types.ts      #   Tipe data POS
│   │   │       ├── riwayat/      #   Riwayat transaksi
│   │   │       └── struk/[id]/   #   Cetak struk
│   │   ├── (public)/             # Katalog publik
│   │   │   ├── produk/           #   Halaman produk publik
│   │   │   └── page.tsx          #   Beranda
│   │   └── api/                  # API routes
│   │       ├── auth/             #   NextAuth
│   │       ├── products/         #   CRUD produk
│   │       ├── categories/       #   CRUD kategori
│   │       ├── transactions/     #   Transaksi + item manual
│   │       ├── customers/        #   CRUD pelanggan
│   │       ├── debts/            #   Utang/piutang
│   │       ├── users/            #   CRUD pengguna
│   │       ├── settings/         #   Pengaturan toko
│   │       ├── setup/            #   Inisialisasi database (POST)
│   │       └── seed/             #   Seed data default (POST)
│   ├── components/
│   │   ├── admin/                # Sidebar, header admin
│   │   ├── pos/                  # Komponen POS
│   │   ├── public/               # Header, footer, ProductCard
│   │   ├── ui/                   # Button, Toast, Pagination, dll
│   │   └── SetupWizard.tsx       # Setup wizard (auto-redirect saat DB kosong)
│   ├── lib/
│   │   ├── auth.ts               # NextAuth config
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── format.ts             # formatRupiah, formatDate
│   │   ├── settings.ts           # App settings + getSettings cache
│   │   └── setup.ts              # checkNeedsSetup — deteksi setup awal
│   └── types/                    # TypeScript types
├── Dockerfile                    # Multi-stage build
├── docker-compose.yml            # 3 profile orchestration
├── docker-entrypoint.sh          # Container entrypoint
├── vercel.json                   # Vercel config
├── .env.example
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
| slug | String | Unique, URL-friendly |
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
| invoiceNo | String | Nomor invoice unik |
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
GET    /api/customers?q=
POST   /api/customers
GET    /api/customers/:id
PATCH  /api/customers/:id
DELETE /api/customers/:id
```

### Utang/Piutang

```
GET  /api/debts?status=UNPAID|PARTIAL|PAID
POST /api/debts
```

Bayar utang:
```json
{
  "debtId": 1,
  "amount": 50000
}
```

### Setup Database

```
POST /api/setup
```

Menjalankan `prisma db push` untuk membuat tabel database. Panggil **pertama kali** setelah deploy:

```bash
curl -X POST https://domain-anda.vercel.app/api/setup
```

Response:

```json
{
  "ok": true,
  "message": "Database initialized successfully",
  "log": "..."
}
```

> Endpoint ini memiliki lock untuk mencegah eksekusi ganda per cold start. Aman dipanggil berulang kali.

### Seed Data Default

```
POST /api/seed
```

Mengisi data awal (user admin/kasir, pengaturan toko, kategori default). Panggil **setelah** `/api/setup`:

```bash
curl -X POST https://domain-anda.vercel.app/api/seed \
  -H "x-allow-seed: 1"
```

Header `x-allow-seed: 1` wajib untuk mencegah eksekusi tidak sengaja.

Response:

```json
{
  "ok": true,
  "results": [
    "✅ User ADMIN dibuat (admin / admin123)",
    "✅ User KASIR dibuat (kasir / kasir123)",
    "✅ 18 pengaturan default dimuat.",
    "✅ Kategori default dibuat: \"Umum\""
  ]
}
```

> **Idempotent** — hanya mengisi data jika belum ada, tidak menghapus data existing. Aman dipanggil berulang.

---

## Environment Variables

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `DATABASE_URL` | Ya | `file:./dev.db` | SQLite (dev) atau PostgreSQL (production) |
| `NEXTAUTH_URL` | Ya | `http://localhost:3000` | URL aplikasi (ganti di production) |
| `NEXTAUTH_SECRET` | Ya | — | Generate dengan `openssl rand -base64 32` |
| `SKIP_ENV_VALIDATION` | Tidak | — | Set `1` untuk skip validasi env di build |

### Development (SQLite)

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### Vercel / Production (PostgreSQL)

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
NEXTAUTH_URL="https://rizki-motor.vercel.app"
NEXTAUTH_SECRET="your-strong-secret"
```

---

## Panduan Penggunaan

### Transaksi di POS (Kasir)

1. **Cari produk** — ketik nama atau SKU di kolom pencarian
2. **Item manual** — klik tombol "Manual" untuk input item kustom (jasa, barang tidak terdaftar)
3. **Tambah ke keranjang** — klik "Normal" (harga jual) atau "Reseller" (harga reseller)
4. **Atur jumlah** — gunakan tombol +/- di keranjang
5. **Klik "Buat Pesanan"** — payment modal muncul
6. **Pilih pelanggan** (opsional) — klik area pelanggan, cari nama
7. **Pilih metode bayar** — Tunai/QRIS/Transfer/Kartu
8. **Input nominal bayar** — atau klik tombol bayar cepat (Uang Pas, Rp50rb, Rp100rb, Rp200rb)
9. **Jika utang** — nyalakan toggle "Bayar Nanti", pastikan pelanggan dipilih
10. **Klik "Bayar"** atau **"Catat Utang"**

### Proteksi Stok

- Produk dengan stok **< 3** tidak bisa ditambahkan ke transaksi
- Stok **0** → badge merah "Habis" dengan pesan error
- Stok **1–2** → badge merah "Stok Menipis" dengan toast warning
- Stok **3–5** → badge amber "Sisa N" sebagai pengingat
- Sorting otomatis: stok terendah muncul paling atas di semua halaman produk

### Kelola Utang (Admin)

1. Buka menu **Utang Piutang** di sidebar
2. Gunakan filter: Semua / Belum Bayar / Sebagian / Lunas
3. Klik **Bayar** untuk mencatat pembayaran cicilan
4. Klik **ikon mata** untuk melihat detail transaksi

### Manajemen Pelanggan (Admin)

1. Buka menu **Pelanggan** di sidebar
2. Klik **Tambah Pelanggan** untuk data baru
3. Isi nama, telepon, alamat, catatan
4. Pelanggan dengan utang otomatis ditandai badge "Utang"

---

## Scripts

```bash
npm run dev             # Development server (Next.js)
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint check

npm run vercel:build    # Build untuk Vercel (Prisma PostgreSQL + Next.js)

npm run db:push         # Push schema ke database
npm run db:migrate      # Buat migration
npm run db:seed         # Seed data awal
npm run db:studio       # Buka Prisma Studio

npm test                # Jalankan test (Vitest)
npm run test:watch      # Test mode watch
npm run test:coverage   # Test dengan coverage
```

---

## CI/CD — Docker ke GHCR & DockerHub

Pipeline otomatis build & push Docker image ke **DockerHub** dan **GitHub Container Registry (ghcr.io)**.

### Trigger

| Event | Action |
|-------|--------|
| Push ke `main` | Build & push dengan tag `main` |
| Push tag `v*` | Build & push dengan versi (v1.0.0, v1.0, v1) |
| Pull Request | Build saja (tidak push) |

### Setup

#### DockerHub

1. Buat akun di [DockerHub](https://hub.docker.com)
2. Access Token: Account Settings → Security → New Access Token
3. Tambah Secret di GitHub:
   - `DOCKERHUB_USERNAME` — username DockerHub
   - `DOCKERHUB_TOKEN` — access token

#### GHCR

GHCR sudah otomatis aktif — `GITHUB_TOKEN` tersedia secara default.

### Pull Image

```bash
# Dari GHCR (default di docker-compose.yml)
docker pull ghcr.io/rizkikotet-dev/rizkimotor-pos-nexjs:main

# Dari DockerHub
docker pull rizkikotet/rizkimotor-pos-nexjs:main

# Jalankan
docker run -d \
  --name rizki-motor \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e NEXTAUTH_SECRET="your-secret" \
  ghcr.io/rizkikotet-dev/rizkimotor-pos-nexjs:main
```

### Tag yang Dihasilkan

| Source | DockerHub | GHCR |
|--------|-----------|------|
| Push ke main | `main`, `sha-abc1234` | `main`, `sha-abc1234` |
| Tag v1.2.3 | `1.2.3`, `1.2`, `latest` | `1.2.3`, `1.2`, `latest` |
| PR #42 | `pr-42` | `pr-42` |

### File Terkait

| File | Keterangan |
|------|------------|
| `.github/workflows/docker.yml` | GitHub Actions workflow |
| `Dockerfile` | Multi-stage build (3 stages) |
| `docker-compose.yml` | 3 profile orchestration |
| `docker-entrypoint.sh` | Container startup script |

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

### Build error TypeScript
```bash
npx tsc --noEmit
```

### Reset database SQLite
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Reset database PostgreSQL
```bash
npx prisma db push --force-reset --schema=prisma/schema.vercel.prisma
npx tsx prisma/seed.ts
```

### Docker: permission denied
```bash
# Pastikan entrypoint punya execute permission
chmod +x docker-entrypoint.sh

# Jika error chown di entrypoint, non-root user mungkin perlu disesuaikan
# Cek dengan:
docker compose logs app
```

### Vercel: build error Prisma
Pastikan `DATABASE_URL` sudah diset di Vercel Environment Variables dan menggunakan PostgreSQL URL yang valid. Build Vercel menggunakan `prisma/schema.vercel.prisma` secara otomatis melalui `vercel.json`.

### Upload gambar tidak muncul di Vercel
Vercel memiliki filesystem read-only untuk serverless functions. Gunakan layanan eksternal (Uploadthing, Cloudinary, S3) untuk menyimpan gambar di production.

---

## Fitur UI/UX

- ✅ Dark mode dengan theme toggle (system preference + manual toggle)
- ✅ Responsive design (mobile-first)
- ✅ Payment modal modern (bukan prompt)
- ✅ Toast notifications (sukses, error, warning)
- ✅ Badge stok tiered (merah = habis/menipis, amber = waspada)
- ✅ Loading states & skeleton
- ✅ Error boundaries
- ✅ Accessibility (ARIA labels, focus management)
- ✅ Keyboard navigation (Escape tutup modal, shortcut POS)
- ✅ Screen reader support

---

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## License

Proprietary — All rights reserved

---

## Contact

RIZKI MOTOR — POS & Management System  
Dibangun dengan Next.js 16, TypeScript, Prisma, Tailwind CSS
