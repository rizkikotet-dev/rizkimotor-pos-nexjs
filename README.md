# RIZKI MOTOR — Sistem POS & Manajemen Toko Sparepart Motor

Aplikasi manajemen toko sparepart motor lengkap dengan fitur **Point of Sale (POS)**, manajemen inventory, **utang piutang**, dan katalog publik.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Struktur Project](#struktur-project)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Fitur Utama

### 1. Point of Sale (POS)
- Interface kasir modern dengan **payment modal** (bukan prompt)
- Pencarian produk real-time (nama, SKU, deskripsi)
- Keranjang belanja dengan update qty otomatis
- Dukungan **harga normal & reseller**
- Pilih **metode bayar** (Tunai, QRIS, Transfer, Kartu)
- **Bayar Cepat** — tombol Uang Pas, Rp50rb, Rp100rb, dll.
- Pilih **pelanggan** saat transaksi
- Fitur **Bayar Nanti (Utang)** — transaksi kredit ke pelanggan
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
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Authentication | NextAuth.js 4 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Validation | Zod |

---

## Quick Start

### Prasyarat

- Node.js 18+ atau 20+
- npm, yarn, atau pnpm

### Instalasi

```bash
# 1. Clone repository
git clone [repository-url]
cd rizkimotor

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

## Struktur Project

```
rizkimotor/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── public/
│   └── uploads/               # Upload gambar produk
├── data/                      # Database SQLite (Docker volume)
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker orchestration
├── .dockerignore              # Docker build exclusions
├── src/
│   ├── app/
│   │   ├── (admin)/           # Halaman admin
│   │   │   └── admin/
│   │   │       ├── produk/        # Manajemen produk
│   │   │       ├── kategori/      # Manajemen kategori
│   │   │       ├── pengguna/      # Manajemen pengguna
│   │   │       ├── pelanggan/     # Manajemen pelanggan
│   │   │       ├── transaksi/     # Daftar transaksi
│   │   │       ├── utang-piutang/ # Kelola utang
│   │   │       ├── barcode/       # Cetak barcode
│   │   │       └── pengaturan/    # Pengaturan toko
│   │   ├── (auth)/            # Login
│   │   ├── (pos)/             # Point of Sale
│   │   │   └── pos/
│   │   │       ├── page.tsx       # Halaman kasir
│   │   │       ├── riwayat/       # Riwayat transaksi
│   │   │       └── struk/[id]/    # Struk transaksi
│   │   ├── (public)/          # Katalog publik
│   │   └── api/               # API routes
│   │       ├── auth/          # NextAuth
│   │       ├── products/      # Produk CRUD
│   │       ├── categories/    # Kategori CRUD
│   │       ├── transactions/  # Transaksi
│   │       ├── customers/     # Pelanggan CRUD
│   │       ├── debts/         # Utang/piutang
│   │       ├── users/         # Pengguna
│   │       └── settings/      # Pengaturan
│   ├── components/
│   │   ├── admin/             # Sidebar, header admin
│   │   ├── pos/               # PaymentModal
│   │   ├── public/            # Header, footer publik
│   │   └── ui/                # Button, Toast, dll.
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client
│   │   ├── format.ts          # formatRupiah, formatDate
│   │   └── settings.ts        # App settings
│   └── types/                 # TypeScript types
├── .env.example
├── PRODUCT.md                 # Dokumentasi produk
├── DESIGN.md                  # Design system
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
| minStock | Int | Threshold alert stok menipis |
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

### Debt (Utang/Piutang)
| Field | Type | Keterangan |
|-------|------|------------|
| id | Int | Primary key |
| transactionId | Int | Relasi ke transaksi |
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
    { "productId": 1, "price": 50000, "quantity": 2 }
  ],
  "payment": 100000,
  "customerId": 1,
  "isDebt": false,
  "note": null
}
```

- `isDebt: true` + `customerId` → transaksi kredit, otomatis buat record Debt
- `payment: 0` + `isDebt: true` → bayar nanti

### Pelanggan

```
GET    /api/customers          # List semua pelanggan
POST   /api/customers          # Buat pelanggan baru
GET    /api/customers/:id      # Detail pelanggan
PATCH  /api/customers/:id      # Update pelanggan
DELETE /api/customers/:id      # Soft delete
```

### Utang/Piutang

```
GET  /api/debts                # List utang (filter: ?status=UNPAID|PARTIAL|PAID)
POST /api/debts                # Bayar utang
```

Bayar utang:
```json
{
  "debtId": 1,
  "amount": 50000
}
```

---

## Panduan Penggunaan

### Transaksi di POS (Kasir)

1. **Cari produk** — ketik nama atau SKU di kolom pencarian
2. **Tambah ke keranjang** — klik tombol "Normal" atau "Reseller"
3. **Atur jumlah** — gunakan tombol +/-
4. **Klik "Buat Pesanan"** — payment modal muncul
5. **Pilih pelanggan** (opsional) — klik area pelanggan, cari nama
6. **Pilih metode bayar** — Tunai/QRIS/Transfer/Kartu
7. **Input nominal bayar** — atau klik tombol bayar cepat
8. **Jika utang** — nyalakan toggle "Bayar Nanti"
9. **Klik "Bayar"** atau **"Catat Utang"**

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
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run db:push      # Push schema ke database
npm run db:migrate   # Buat migration
npm run db:seed      # Seed database
npm run db:studio    # Buka Prisma Studio
```

---

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

### Production (PostgreSQL)

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-strong-secret"
```

---

## Deployment

### Docker (Recommended)

**Quick start dengan Docker Compose:**

```bash
# 1. Clone & buat direktori data
git clone [repository-url]
cd rizkimotor
mkdir -p data

# 2. Build & jalankan
docker compose up -d --build

# 3. Setup database (pertama kali)
docker compose exec app npx prisma db push

# 4. Seed data (opsional)
docker compose exec app npx tsx prisma/seed.ts
```

Aplikasi berjalan di **http://localhost:3000**

**Perintah Docker lainnya:**

```bash
docker compose up -d          # Jalankan di background
docker compose down           # Stop container
docker compose logs -f        # Lihat log
docker compose exec app sh    # Shell ke container
docker compose restart        # Restart container
```

**Build manual tanpa Compose:**

```bash
docker build -t rizki-motor .
docker run -d \
  --name rizki-motor \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e NEXTAUTH_SECRET="your-secret" \
  rizki-motor
```

**File Docker:**
| File | Keterangan |
|------|------------|
| `Dockerfile` | Multi-stage build (deps → build → production) |
| `docker-compose.yml` | Orchestration dengan volume untuk database |
| `.dockerignore` | File yang di-exclude dari build |

### Vercel

1. Push repository ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Tambahkan environment variables
4. Deploy

> **Catatan:** Untuk file upload gambar, gunakan cloud storage (S3, Cloudinary) di production.

### Manual / VPS

```bash
# Build
npm run build

# Jalankan
npm run start
```

Gunakan PM2 atau systemd untuk process management:
```bash
pm2 start npm --name "rizki-motor" -- start
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

### Build error TypeScript
```bash
npx tsc --noEmit
```

### Reset database
```bash
rm prisma/dev.db
npm run db:push
npm run db:seed
```

---

## CI/CD — Docker ke DockerHub & GHCR

### GitHub Actions

Pipeline otomatis build & push Docker image ke **DockerHub** dan **GitHub Container Registry (ghcr.io)**.

**Trigger:**
| Event | Action |
|-------|--------|
| Push ke `main` | Build & push dengan tag `main` |
| Push tag `v*` | Build & push dengan versi (v1.0.0, v1.0, v1) |
| Pull Request | Build saja (tidak push) |

### Setup

#### 1. DockerHub

1. Buat akun di https://hub.docker.com
2. Buat Access Token: Account Settings → Security → New Access Token
3. Tambah Secret di GitHub:
   - `DOCKERHUB_USERNAME` — username DockerHub
   - `DOCKERHUB_TOKEN` — access token

#### 2. GitHub Container Registry (ghcr.io)

GHCR sudah otomatis aktif — `GITHUB_TOKEN` tersedia secara default. Tidak perlu setup tambahan.

### Push ke GitHub

```bash
git add .
git commit -m "feat: add CI/CD pipeline"
git push origin main
```

### Pull Image

```bash
# Dari DockerHub
docker pull [username]/rizki-motor:main

# Dari GHCR
docker pull ghcr.io/[username]/rizki-motor:main

# Jalankan (keduanya sama)
docker run -d \
  --name rizki-motor \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e NEXTAUTH_SECRET="your-secret" \
  [username]/rizki-motor:main
```

### Tag yang Dihasilkan

| Source | DockerHub | GHCR |
|--------|-----------|------|
| Push ke main | `main`, `sha-abc1234` | `main`, `sha-abc1234` |
| Tag v1.2.3 | `1.2.3`, `1.2`, `latest` | `1.2.3`, `1.2`, `latest` |
| PR #42 | `pr-42` | `pr-42` |

### File terkait

| File | Keterangan |
|------|------------|
| `.github/workflows/docker.yml` | GitHub Actions workflow |
| `Dockerfile` | Multi-stage build |
| `docker-compose.yml` | Local development |

---

## Fitur UI/UX

- ✅ Dark mode dengan theme toggle
- ✅ Responsive design (mobile-first)
- ✅ Payment modal modern (bukan prompt)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error boundaries
- ✅ Accessibility (ARIA labels, focus management)
- ✅ Keyboard navigation (Escape untuk tutup modal)
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

Untuk pertanyaan atau dukungan, hubungi tim development.
