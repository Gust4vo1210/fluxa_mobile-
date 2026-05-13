import { api } from "./api";
import type {
  Product,
  CreateProductPayload,
  Table,
  OrderItem,
  ClosedBill,
  PaymentMethod,
} from "../types";

// ─── PRODUCTS ────────────────────────────────────────────────────
export const productsApi = {
  list: async (restaurant_id: string): Promise<Product[]> => {
    const { data } = await api.get("/products", { params: { restaurant_id } });
    return data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const { data } = await api.post("/products", payload);
    return data;
  },

  updateQty: async (id: number, delta: number): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}/qty`, { delta });
    return data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// ─── TABLES ──────────────────────────────────────────────────────
export const tablesApi = {
  list: async (restaurant_id: string): Promise<Table[]> => {
    const { data } = await api.get("/tables", { params: { restaurant_id } });
    return data;
  },

  open: async (id: number, waiter: string): Promise<Table> => {
    const { data } = await api.patch(`/tables/${id}/open`, { waiter });
    return data;
  },

  addItem: async (tableId: number, item: OrderItem): Promise<Table> => {
    const { data } = await api.post(`/tables/${tableId}/items`, item);
    return data;
  },

  removeItem: async (tableId: number, itemIndex: number): Promise<Table> => {
    const { data } = await api.delete(`/tables/${tableId}/items/${itemIndex}`);
    return data;
  },

  requestClose: async (id: number): Promise<Table> => {
    const { data } = await api.patch(`/tables/${id}/request-close`);
    return data;
  },

  cancelClose: async (id: number): Promise<Table> => {
    const { data } = await api.patch(`/tables/${id}/cancel-close`);
    return data;
  },

  close: async (id: number, pay: PaymentMethod): Promise<ClosedBill> => {
    const { data } = await api.patch(`/tables/${id}/close`, { pay });
    return data;
  },
};

// ─── REPORTS ─────────────────────────────────────────────────────
export const reportsApi = {
  today: async (restaurant_id: string): Promise<ClosedBill[]> => {
    const { data } = await api.get("/reports/today", { params: { restaurant_id } });
    return data;
  },
};
