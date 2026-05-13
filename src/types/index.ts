// ─── ENUMS ────────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "waiter";
export type TableStatus = "free" | "occupied" | "closing";
export type PaymentMethod = "pix" | "credito" | "debito" | "dinheiro";
export type ProductCategory = "bebidas" | "comidas" | "outros";
export type ProductUnit = "un" | "L" | "kg" | "cx";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  restaurant_id: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  restaurant_id: string;
}

// ─── PRODUCT ──────────────────────────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  cat: ProductCategory;
  price: number;
  qty: number;
  unit: ProductUnit;
  icon: string;
  restaurant_id: string;
}

export interface CreateProductPayload {
  name: string;
  cat: ProductCategory;
  price: number;
  qty: number;
  unit: ProductUnit;
  restaurant_id: string;
}

// ─── TABLE & ORDERS ───────────────────────────────────────────────────────────
export interface OrderItem {
  pid: number;
  name: string;
  price: number;
  qty: number;
  icon: string;
}

export interface Table {
  id: number;
  status: TableStatus;
  waiter: string | null;
  openTime: string | null;
  items: OrderItem[];
  closingRequested: boolean;
  restaurant_id: string;
}

// ─── CLOSED BILL ──────────────────────────────────────────────────────────────
export interface ClosedBill {
  tid: number;
  waiter: string | null;
  open: string | null;
  close: string;
  items: OrderItem[];
  total: number;
  pay: PaymentMethod;
  date: string;
  restaurant_id: string;
}
