// Shared domain types — single source of truth untuk semua modules.
// Pages dan components import dari sini, bukan define sendiri.

export interface Category {
  id: number;
  name: string;
  slug: string;
  isDefault: boolean;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  priceReseller: number;
  cost: number;
  stock: number;
  minStock: number;
  image: string | null;
  active: boolean;
  categoryId: number;
  category?: Category;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
  active: boolean;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  active: boolean;
}

export interface Transaction {
  id: number;
  invoiceNo: string;
  total: number;
  payment: number;
  change: number;
  note: string | null;
  userId: number;
  customerId: number | null;
  createdAt: Date;
}

export interface TransactionItem {
  id: number;
  transactionId: number;
  productId: number | null;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Debt {
  id: number;
  transactionId: number;
  customerId: number;
  amount: number;
  paid: number;
  status: string;
  dueDate: Date | null;
}
