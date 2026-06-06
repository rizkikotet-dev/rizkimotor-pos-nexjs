# Component Library — RIZKI MOTOR POS

All components live in `src/components/`. This is a **private component library** — not published to npm. Import with `@/components/...` path alias.

---

## UI Primitives (`src/components/ui/`)

### Button
```tsx
import { Button } from "@/components/ui/Button";

<Button
  variant="primary" | "secondary" | "danger" | "ghost" | "success" | "soft-primary"
  size="sm" | "md" | "lg"
  loading={false}
  disabled={false}
  onClick={() => {}}
>
  Label
</Button>
```
- `loading` shows spinner, disables button
- Variants map to Tailwind classes in `globals.css` (`.btn-primary`, etc.)
- Accessible: `focus-visible` ring, `aria-disabled`

### Toast
```tsx
import { ToastProvider, useToast } from "@/components/ui/Toast";

// Wrap app once (done in layout.tsx)
<ToastProvider>{children}</ToastProvider>

// In any client component:
const { success, error, info, warning, showToast } = useToast();
success("Transaksi berhasil");
error("Stok tidak cukup");
```
- Auto-dismisses after 5s
- `role="alert"`, `aria-live="assertive"`
- Slide-in animation

### Pagination
```tsx
import { Pagination } from "@/components/ui/Pagination";

<Pagination
  page={1}
  pageSize={20}
  total={150}
  onPageChange={(page) => {}}
  onPageSizeChange={(size) => {}}
  showPageSizeSelector={true}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```
- Shows "Showing X–Y of Z"
- Page size selector optional

### Skeleton
```tsx
import { Skeleton } from "@/components/ui/Skeleton";

<Skeleton className="h-4 w-3/4" />           // Text line
<Skeleton className="h-20 w-full rounded" /> // Card image
<Skeleton className="h-12 w-24" />           // Button placeholder
```
- Pulse animation via Tailwind `animate-pulse`

### FadeIn
```tsx
import { FadeIn } from "@/components/ui/FadeIn";

<FadeIn delay={100} duration={300}>
  <Content />
</FadeIn>
```
- CSS `opacity` + `transform` transition
- Respects `prefers-reduced-motion`

### Barcode
```tsx
import { Barcode } from "@/components/ui/Barcode";

<Barcode value="INV-20240115-001" width={2} height={80} displayValue={true} />
```
- Wrapper around `jsbarcode` (CODE128)
- `displayValue` shows human-readable text below

---

## POS Components (`src/components/pos/`)

### POSHeader
```tsx
import { POSHeader } from "@/components/pos/POSHeader";

// Server component — shows user name, nav links, theme toggle, logout
<POSHeader />
```
- Links: Kasir, Riwayat, Admin (if admin), Katalog
- Includes `ThemeToggle` and `LogoutButton`

### POSMobileNav
```tsx
import { POSMobileNav } from "@/components/pos/POSMobileNav";

// Bottom tab bar on mobile
<POSMobileNav />
```
- Tabs: Kasir, Riwayat, Admin, Katalog

### PaymentModal
```tsx
import { PaymentModal } from "@/components/pos/PaymentModal";

<PaymentModal
  isOpen={true}
  onClose={() => {}}
  total={150000}
  onPay={(payment: PaymentData) => {}}
  customer={customer | null}
  onCustomerChange={(id) => {}}
  customers={customers[]}
  isDebt={false}
  onDebtToggle={(v) => {}}
/>
```
PaymentData:
```ts
{ method: "TUNAI" | "QRIS" | "TRANSFER" | "KARTU", amount: number }
```
- Quick-pay buttons: Uang Pas, 50rb, 100rb, 200rb, 500rb
- Calculates change automatically
- Validates: payment ≥ total (unless debt)

### ProductSearchBar
```tsx
import { ProductSearchBar } from "@/components/pos/ProductSearchBar";

<ProductSearchBar
  value={query}
  onChange={(q) => {}}
  placeholder="Cari nama atau SKU..."
  onManualClick={() => {}}
  loading={false}
/>
```
- Debounced search (300ms)
- "Manual" button opens ManualItemModal

### ProductGrid
```tsx
import { ProductGrid } from "@/components/pos/ProductGrid";

<ProductGrid
  products={products[]}
  onAddToCart={(product, priceType: "normal" | "reseller") => {}}
  cartItems={cartItems[]}
  searchQuery={""}
  loading={false}
/>
```
- Shows stock badges: Habis (0), Stok Menipis (1-2), Sisa N (3-5)
- Click "Normal"/"Reseller" to add at that price
- Responsive grid (1 col mobile → 4 col desktop)

### CartPanel
```tsx
import { CartPanel } from "@/components/pos/CartPanel";

<CartPanel
  items={cartItems[]}
  onUpdateQty={(itemId, qty) => {}}
  onRemove={(itemId) => {}}
  onClear={() => {}}
  onCheckout={() => {}}
  total={150000}
  isDebt={false}
  customer={customer | null}
  disabled={items.length === 0}
/>
```
- Shows subtotal, item count
- Qty controls with +/- buttons
- "Buat Pesanan" opens PaymentModal

### ManualItemModal
```tsx
import { ManualItemModal } from "@/components/pos/ManualItemModal";

<ManualItemModal
  isOpen={true}
  onClose={() => {}}
  onAdd={(item: ManualItem) => {}}
/>
```
ManualItem:
```ts
{ name: string, sku: string, price: number, quantity: number }
```
- For services, unlisted items
- SKU optional

### StrukView
```tsx
import { StrukView } from "@/components/pos/struk/StrukView";

<StrukView transaction={transaction} settings={settings} paperSize="58mm" />
```
- Renders receipt for 58mm or 80mm thermal printer
- Includes store info, items, payment breakdown, QR code placeholder

---

## Public Components (`src/components/public/`)

### Header
```tsx
import { Header } from "@/components/public/Header";

<Header />
```
- Logo, nav: Beranda, Produk, Tentang, Kontak
- Theme toggle, mobile menu

### Footer
```tsx
import { Footer } from "@/components/public/Footer";

<Footer settings={settings} />
```
- Store info, social links, copyright

### ProductCard
```tsx
import { ProductCard } from "@/components/public/ProductCard";

<ProductCard
  product={product}
  variant="grid" | "list"
  showStockBadge={true}
/>
```
- Image, name, price, stock badge
- "Lihat Detail" link

### PublicMobileNav
```tsx
import { PublicMobileNav } from "@/components/public/PublicMobileNav";

<PublicMobileNav />
```
- Bottom tabs: Beranda, Produk, Kontak

---

## Admin Components (`src/components/admin/`)

### Sidebar
```tsx
import { Sidebar } from "@/components/admin/Sidebar";

<Sidebar activePath="/admin/produk" />
```
- Navigation: Dashboard, Produk, Kategori, Pelanggan, Transaksi, Utang, Barcode, Pengguna, Pengaturan
- Collapsible on mobile

### AdminHeader
```tsx
import { AdminHeader } from "@/components/admin/AdminHeader";

<AdminHeader />
```
- Page title, breadcrumb, user menu, theme toggle, logout

### AdminMobileNav
```tsx
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

<AdminMobileNav />
```
- Drawer-style mobile navigation

---

## Shared Components

### ThemeToggle
```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

<ThemeToggle />
```
- Cycles: system → light → dark
- Persists to `localStorage`
- Applies `data-theme` on `<html>`

### LogoutButton
```tsx
import { LogoutButton } from "@/components/LogoutButton";

<LogoutButton className="btn-ghost" />
```
- Calls `POST /api/auth/signout` via NextAuth
- Redirects to `/login`

### ErrorBoundary
```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

<ErrorBoundary fallback={<CustomFallback />}>
  <UnreliableComponent />
</ErrorBoundary>
```
- Catches render errors in subtree
- Shows friendly fallback with "Coba Lagi" button

### StatusBadge
```tsx
import { StatusBadge } from "@/components/StatusBadge";

<StatusBadge status="UNPAID" | "PARTIAL" | "PAID" />
<StatusBadge stock={3} minStock={5} /> // auto: Habis/Stok Menipis/Normal
```
- Color-coded: red, amber, green
- Consistent across POS, admin, public

### StructuredData
```tsx
import { StructuredData } from "@/components/StructuredData";

<StructuredData type="Product" data={product} />
<StructuredData type="Organization" data={settings} />
```
- JSON-LD for SEO
- Types: Product, Organization, WebSite, BreadcrumbList

### SetupWizard
```tsx
import { SetupWizard } from "@/components/SetupWizard";

// Auto-rendered when DB empty (via checkNeedsSetup)
<SetupWizard />
```
- 6 steps: DB type → connection → init → admin user → store config → done
- Works for SQLite (Docker/local) and PostgreSQL (Vercel)

---

## Hooks

### useCart (`src/app/(pos)/pos/useCart.ts`)
```ts
const { items, addItem, updateQty, removeItem, clear, total, itemCount } = useCart();
```
- Zustand store (persisted to `localStorage`)
- Survives page refresh

### useKeyboardShortcuts (`src/app/(pos)/pos/useKeyboardShortcuts.ts`)
```ts
useKeyboardShortcuts({
  onNewTransaction: () => {},
  onOpenHistory: () => {},
  onFocusSearch: () => {},
  onToggleDebt: () => {},
  onQuickPay: (amount) => {},
});
```
- POS shortcuts: `N` new, `H` history, `/` search, `D` debt toggle, `1-5` quick pay

---

## Styling Conventions

- **Tailwind CSS** with custom design tokens in `tailwind.config.ts`
- **CSS variables** in `globals.css` for theming (light/dark)
- **Component classes**: `.btn-primary`, `.btn-secondary`, `.input`, `.card`, `.badge-*`
- **Responsive**: mobile-first, breakpoints `sm:`, `md:`, `lg:`, `xl:`
- **Dark mode**: `data-theme="dark"` on `<html>`, uses `[data-theme="dark"]` selectors

---

## Adding New Components

1. Create in appropriate folder: `ui/`, `pos/`, `public/`, `admin/`
2. Export from folder `index.ts` (create if needed)
3. Add to this doc
4. Include: Props interface, usage example, accessibility notes
5. Write tests if complex logic (see `src/lib/__tests__/`)