# API Reference — RIZKI MOTOR POS

Base URL: `/api` (Next.js App Router)

All endpoints return JSON. Errors follow:
```json
{ "error": "Human-readable message" }
```
or for validation:
```json
{ "error": { "fieldErrors": { "sku": ["SKU already exists"] } } }
```

---

## Authentication

Most endpoints require authentication via NextAuth session cookie.
- **Public endpoints**: `GET /api/products`, `GET /api/categories`, `GET /api/settings`
- **Admin only**: `POST/PATCH/DELETE /api/products`, `/api/categories`, `/api/users`, `/api/settings`
- **Kasir + Admin**: `POST /api/transactions`, `GET /api/transactions`, `/api/debts`

---

## Products

### List Products
```
GET /api/products?q=&categoryId=&page=1&pageSize=20
```
Query params:
- `q` — search name/SKU (case-insensitive)
- `categoryId` — filter by category
- `page` — page number (default 1)
- `pageSize` — items per page (default 20, max 100)

Response: `Product[]`

### Get Product
```
GET /api/products/:id
```
Response: `Product` with `category` included.

### Create Product (Admin)
```
POST /api/products
```
Body:
```json
{
  "sku": "SPK-001",
  "name": "Oli Mesin 1L",
  "description": "Oli sintetis full",
  "categoryId": 1,
  "price": 85000,
  "priceReseller": 75000,
  "cost": 60000,
  "stock": 50,
  "minStock": 5,
  "image": "/uploads/oli-1l.jpg",
  "active": true
}
```
Validation: `sku` unique, `categoryId` exists, prices ≥ 0.

### Update Product (Admin)
```
PATCH /api/products/:id
```
Body: partial of create schema.

### Delete Product (Admin)
```
DELETE /api/products/:id
```
Fails if product has transaction items (referential integrity).

---

## Categories

### List Categories
```
GET /api/categories
```
Response: `Category[]`

### Create Category (Admin)
```
POST /api/categories
```
Body:
```json
{ "name": "Aksesoris", "slug": "aksesoris" }
```
`slug` auto-generated from name if omitted. Unique.

### Update Category (Admin)
```
PATCH /api/categories/:id
```

### Delete Category (Admin)
```
DELETE /api/categories/:id
```
Fails if category has products or is `isDefault: true`.

---

## Customers

### List Customers
```
GET /api/customers?q=
```
Query: `q` — search name/phone.

Response: `Customer[]`

### Create Customer
```
POST /api/customers
```
Body:
```json
{
  "name": "Budi Santoso",
  "phone": "08123456789",
  "address": "Jl. Raya No. 10",
  "note": "Pelanggan langganan"
}
```
`phone` unique if provided.

### Get Customer
```
GET /api/customers/:id
```
Includes debts summary.

### Update Customer
```
PATCH /api/customers/:id
```

### Delete Customer (Soft)
```
DELETE /api/customers/:id
```
Sets `active: false`. Hard delete not supported.

---

## Transactions

### List Transactions
```
GET /api/transactions?page=1&pageSize=20
```
Admins see all; Kasir sees only own.
Response: paginated with `user` and `_count.items`.

### Create Transaction
```
POST /api/transactions
```
Body:
```json
{
  "items": [
    { "productId": 1, "price": 85000, "quantity": 2 },
    { "name": "Jasa Service", "sku": "SRV-001", "price": 50000, "quantity": 1 }
  ],
  "payment": 200000,
  "customerId": 1,
  "isDebt": false,
  "note": "Pelanggan minta struk double"
}
```
- `items[]`: union of DB items (`productId`) and manual items (`name`, `sku`)
- `price` must match product's normal or reseller price
- `isDebt: true` + `customerId` → creates Debt record
- `payment: 0` + `isDebt: true` → full credit

Response: `{ id, invoiceNo, total, payment, change, items: N }`

### Get Transaction
```
GET /api/transactions/:id
```
Returns full transaction with items, user, customer, debt.

---

## Debts (Utang/Piutang)

### List Debts
```
GET /api/debts?status=UNPAID|PARTIAL|PAID
```
Query: `status` — filter by status.

Response: `Debt[]` with `customer`, `transaction`.

### Record Payment
```
POST /api/debts
```
Body:
```json
{ "debtId": 1, "amount": 50000 }
```
Updates `paid`, recalculates `status` (UNPAID/PARTIAL/PAID).

---

## Users (Admin)

### List Users
```
GET /api/users
```
Response: `User[]` (password omitted).

### Create User
```
POST /api/users
```
Body:
```json
{ "username": "kasir2", "name": "Kasir Baru", "password": "secure123", "role": "KASIR" }
```
`username` unique. `role`: ADMIN | KASIR.

### Update User
```
PATCH /api/users/:id
```
Can update `name`, `password`, `role`, `active`.

### Delete User
```
DELETE /api/users/:id
```
Soft delete (`active: false`). Cannot delete self.

---

## Settings

### Get Settings
```
GET /api/settings
```
Public. Returns key-value object.

### Update Settings (Admin)
```
PATCH /api/settings
```
Body: `{ [key: string]: string }`
Validates against known keys.

---

## Setup & Seed

### Initialize Database
```
POST /api/setup
```
Body (optional):
```json
{ "type": "postgresql", "connectionString": "postgresql://..." }
```
Runs `prisma db push`. Idempotent (lock prevents concurrent runs).

### Seed Default Data
```
POST /api/seed
```
Header: `x-allow-seed: 1` required.
Body (optional):
```json
{
  "admin": { "username": "admin", "name": "Admin", "password": "admin123" },
  "store": { "name": "Toko Saya", "tagline": "Murah", "phone": "08123456789" }
}
```
Idempotent — only creates missing data.

---

## Health Check

```
GET /api/health
```
Response: `{ status: "healthy", timestamp: "..." }`

---

## Upload

```
POST /api/upload
```
Multipart form: `file` (image).
Validates: image/* ≤ 2MB.
Response: `{ url: "/uploads/uuid.jpg" }`