// Shared types untuk POS module. Dipakai oleh POSClient, ProductGrid, CartPanel,
// useCart hook, dan PaymentModal. Single source of truth.

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  priceReseller: number;
  stock: number;
  image: string | null;
  description: string | null;
  active: boolean;
  categoryId: number;
  category: { name: string };
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

export interface POSClientProps {
  products: Product[];
}
