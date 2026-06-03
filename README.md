# RIZKI MOTOR - Sistem POS & E-Commerce Sparepart Motor

Aplikasi manajemen toko sparepart motor modern dengan fitur Point of Sale (POS), manajemen inventory, dan katalog publik.

## Tech Stack

- **Framework**: Next.js 16.2.7 (App Router)
- **Language**: TypeScript 5.6.3
- **Database**: Prisma ORM + SQLite (development) / PostgreSQL (production ready)
- **Authentication**: NextAuth.js 4.24.10
- **Styling**: Tailwind CSS 3.4.15
- **UI**: Custom component library dengan dark mode support
- **Icons**: Lucide React

## Fitur Utama

### 1. Point of Sale (POS)
- Interface kasir yang cepat dan responsif
- Pencarian produk real-time
- Keranjang belanja dengan update otomatis
- Dukungan harga reseller
- Notifikasi toast modern
- Cetak struk transaksi

### 2. Admin Dashboard
- Manajemen produk (CRUD)
- Manajemen kategori
- Manajemen pengguna (Admin & Kasir)
- Laporan transaksi
- Pengaturan toko
- Upload gambar produk

### 3. Katalog Publik
- Tampilan produk modern dan profesional
- Filter berdasarkan kategori
- Pencarian produk
- Responsive design
- Dark mode support

### 4. Keamanan
- Authentication dengan bcrypt
- Role-based access control (ADMIN / KASIR)
- Protected API routes
- Input validation dengan Zod
- SQL injection prevention (Prisma)

## Quick Start

### Prasyarat
- Node.js 18+ atau 20+
- npm atau yarn

### Instalasi

```bash
# Clone repository
git clone [repository-url]
cd rizkimotor

# Install dependencies
npm install

# Setup database
cp .env.example .env
npm run db:push

# Seed initial data (optional)
npm run db:seed

# Development
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

### Default Login

**Admin:**
- Username: admin
- Password: admin123

**Kasir:**
- Username: kasir
- Password: kasir123

## Struktur Project

```
rizkimotor/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── public/
│   └── uploads/           # Upload gambar produk
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (admin)/       # Admin routes
│   │   ├── (auth)/        # Login page
│   │   ├── (pos)/         # POS routes
│   │   ├── (public)/      # Public pages
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── admin/         # Admin components
│   │   ├── public/        # Public components
│   │   └── ui/            # UI components
│   ├── lib/               # Utilities
│   │   ├── auth.ts        # NextAuth config
│   │   ├── prisma.ts      # Prisma client
│   │   ├── format.ts      # Formatting helpers
│   │   └── settings.ts    # App settings
│   └── types/             # TypeScript types
└── package.json
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Database Schema

### User
- Admin dan Kasir dengan role-based access
- Password hashing dengan bcrypt
- Active/inactive status

### Product
- SKU unik
- Multi-pricing (normal + reseller)
- Stock tracking
- Image support
- Category relationship

### Category
- Protected default category
- Produk reassignment otomatis saat delete

### Transaction
- Invoice number generation
- User tracking
- Payment & change calculation
- Item snapshots (harga & nama saat transaksi)

### Setting
- Key-value store untuk konfigurasi toko
- Store name, tagline, contact info, dll.

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

Untuk production, gunakan PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

## Deployment

### Vercel (Recommended)
1. Push ke GitHub
2. Import project di Vercel
3. Tambahkan environment variables
4. Deploy

### Manual
```bash
npm run build
npm run start
```

## Fitur Keamanan

- ✅ Password hashing dengan bcrypt (10 rounds)
- ✅ JWT-based sessions (NextAuth)
- ✅ Protected API routes
- ✅ Input validation dengan Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React auto-escaping)
- ✅ CSRF protection (NextAuth)
- ✅ Rate limiting ready (tinggal implementasi)

## UI/UX Features

- ✅ Dark mode dengan theme toggle
- ✅ Responsive design (mobile-first)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error boundaries
- ✅ Accessibility (ARIA labels, focus management)
- ✅ Keyboard navigation
- ✅ Screen reader support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - All rights reserved

## Contact

Untuk pertanyaan atau dukungan, hubungi tim development.
