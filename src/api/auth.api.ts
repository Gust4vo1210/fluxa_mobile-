import { api } from "./api";
import type { AuthTokens, LoginCredentials, RegisterPayload, User } from "../types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
