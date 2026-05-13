import { create } from "zustand";
import { authService } from "../services/auth.service";
import type { User, LoginCredentials, RegisterPayload } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  loadSession: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.loadSession();
      set({ user, isAuthenticated: !!user });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    const user = await authService.login(credentials);
    set({ user, isAuthenticated: true });
  },

  register: async (payload) => {
    const user = await authService.register(payload);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
