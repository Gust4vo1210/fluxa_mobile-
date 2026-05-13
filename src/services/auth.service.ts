import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { authApi } from "../api/auth.api";
import type { AuthTokens, LoginCredentials, RegisterPayload, User } from "../types";

// ─── Zod schemas ─────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "Senha deve ter no mínimo 4 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "Senha deve ter no mínimo 4 caracteres"),
  role: z.enum(["admin", "waiter"]),
  restaurant_id: z.string().min(1, "Restaurant ID obrigatório"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Token helpers ────────────────────────────────────────────────
const KEYS = {
  access: "@fluxa:accessToken",
  refresh: "@fluxa:refreshToken",
  user: "@fluxa:user",
};

export const authService = {
  saveSession: async (tokens: AuthTokens, user: User): Promise<void> => {
    await AsyncStorage.multiSet([
      [KEYS.access, tokens.accessToken],
      [KEYS.refresh, tokens.refreshToken ?? ""],
      [KEYS.user, JSON.stringify(user)],
    ]);
  },

  clearSession: async (): Promise<void> => {
    await AsyncStorage.multiRemove([KEYS.access, KEYS.refresh, KEYS.user]);
  },

  loadSession: async (): Promise<User | null> => {
    const raw = await AsyncStorage.getItem(KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  login: async (credentials: LoginCredentials): Promise<User> => {
    const { user, tokens } = await authApi.login(credentials);
    await authService.saveSession(tokens, user);
    return user;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { user, tokens } = await authApi.register(payload);
    await authService.saveSession(tokens, user);
    return user;
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      await authService.clearSession();
    }
  },
};
