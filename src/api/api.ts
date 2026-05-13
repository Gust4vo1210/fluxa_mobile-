import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3333";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor — attach JWT ────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@fluxa:accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle 401 ───────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(["@fluxa:accessToken", "@fluxa:refreshToken"]);
      // Zustand store will handle redirect via auth state
    }
    return Promise.reject(error);
  }
);
