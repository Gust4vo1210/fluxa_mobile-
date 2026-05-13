import { create } from "zustand";
import { productsApi, tablesApi, reportsApi } from "../api/restaurant.api";
import { CAT_ICONS } from "../constants/theme";
import type {
  Product,
  Table,
  ClosedBill,
  CreateProductPayload,
  OrderItem,
  PaymentMethod,
} from "../types";

interface RestaurantState {
  products: Product[];
  tables: Table[];
  closed: ClosedBill[];
  isLoading: boolean;
  error: string | null;

  // Products
  fetchProducts: (restaurant_id: string) => Promise<void>;
  addProduct: (payload: CreateProductPayload) => Promise<void>;
  updateQty: (id: number, delta: number) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;

  // Tables
  fetchTables: (restaurant_id: string) => Promise<void>;
  openTable: (id: number, waiter: string) => Promise<void>;
  addItem: (tableId: number, item: OrderItem) => Promise<void>;
  removeItem: (tableId: number, itemIndex: number) => Promise<void>;
  requestClose: (id: number) => Promise<void>;
  cancelClose: (id: number) => Promise<void>;
  closeTable: (id: number, pay: PaymentMethod) => Promise<void>;

  // Reports
  fetchReports: (restaurant_id: string) => Promise<void>;

  clearError: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  products: [],
  tables: [],
  closed: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // ─── PRODUCTS ──────────────────────────────────────────────────
  fetchProducts: async (restaurant_id) => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsApi.list(restaurant_id);
      set({ products });
    } catch (e: any) {
      set({ error: e?.message ?? "Erro ao carregar produtos" });
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (payload) => {
    const product = await productsApi.create({
      ...payload,
      icon: CAT_ICONS[payload.cat] ?? "📦",
    } as any);
    set((s) => ({ products: [...s.products, product] }));
  },

  updateQty: async (id, delta) => {
    const product = await productsApi.updateQty(id, delta);
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? product : p)),
    }));
  },

  removeProduct: async (id) => {
    await productsApi.remove(id);
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  // ─── TABLES ────────────────────────────────────────────────────
  fetchTables: async (restaurant_id) => {
    set({ isLoading: true, error: null });
    try {
      const tables = await tablesApi.list(restaurant_id);
      set({ tables });
    } catch (e: any) {
      set({ error: e?.message ?? "Erro ao carregar mesas" });
    } finally {
      set({ isLoading: false });
    }
  },

  openTable: async (id, waiter) => {
    const table = await tablesApi.open(id, waiter);
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? table : t)),
    }));
  },

  addItem: async (tableId, item) => {
    const table = await tablesApi.addItem(tableId, item);
    set((s) => ({
      tables: s.tables.map((t) => (t.id === tableId ? table : t)),
      // Optimistically decrement local product stock
      products: s.products.map((p) =>
        p.id === item.pid ? { ...p, qty: Math.max(0, p.qty - item.qty) } : p
      ),
    }));
  },

  removeItem: async (tableId, itemIndex) => {
    const removedItem = get().tables.find((t) => t.id === tableId)?.items[itemIndex];
    const table = await tablesApi.removeItem(tableId, itemIndex);
    set((s) => ({
      tables: s.tables.map((t) => (t.id === tableId ? table : t)),
      products: removedItem
        ? s.products.map((p) =>
            p.id === removedItem.pid ? { ...p, qty: p.qty + removedItem.qty } : p
          )
        : s.products,
    }));
  },

  requestClose: async (id) => {
    const table = await tablesApi.requestClose(id);
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? table : t)),
    }));
  },

  cancelClose: async (id) => {
    const table = await tablesApi.cancelClose(id);
    set((s) => ({
      tables: s.tables.map((t) => (t.id === id ? table : t)),
    }));
  },

  closeTable: async (id, pay) => {
    const bill = await tablesApi.close(id, pay);
    set((s) => ({
      tables: s.tables.map((t) =>
        t.id === id
          ? { ...t, status: "free", waiter: null, openTime: null, items: [], closingRequested: false }
          : t
      ),
      closed: [...s.closed, bill],
    }));
  },

  // ─── REPORTS ───────────────────────────────────────────────────
  fetchReports: async (restaurant_id) => {
    set({ isLoading: true, error: null });
    try {
      const closed = await reportsApi.today(restaurant_id);
      set({ closed });
    } catch (e: any) {
      set({ error: e?.message ?? "Erro ao carregar relatório" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
