import { create } from "zustand";
import { AuthAPI, type ApiUser } from "../services/api";

type StoredAuth = {
  token: string | null;
  refreshToken: string | null;
  user: ApiUser | null;
};

type State = {
  user: ApiUser | null;
  token: string | null;
  refreshToken: string | null;
  loadingProfile: boolean;
  setAuth: (payload: StoredAuth) => void;
  fetchProfile: () => Promise<void>;
  logout: () => void;
};

const hasWindow = typeof globalThis !== "undefined" && typeof globalThis.window !== "undefined";

const readPersistedAuth = (): StoredAuth => {
  if (!hasWindow) return { token: null, refreshToken: null, user: null };
  try {
    const raw = window.localStorage.getItem("badgeup_auth");
    if (!raw) return { token: null, refreshToken: null, user: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.token ?? null,
      refreshToken: parsed?.refreshToken ?? null,
      user: parsed?.user ?? null,
    };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
};

const persistAuth = (payload: StoredAuth | null) => {
  if (!hasWindow) return;
  try {
    if (payload && payload.token) {
      window.localStorage.setItem("badgeup_auth", JSON.stringify(payload));
    } else {
      window.localStorage.removeItem("badgeup_auth");
    }
  } catch {
    /* ignore */
  }
};

const initialAuth = readPersistedAuth();

export const useUserStore = create<State>((set, get) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  refreshToken: initialAuth.refreshToken,
  loadingProfile: false,
  setAuth: (payload) => {
    persistAuth(payload);
    set({
      token: payload.token ?? null,
      refreshToken: payload.refreshToken ?? null,
      user: payload.user ?? null,
    });
  },
  fetchProfile: async () => {
    const token = get().token;
    if (!token || get().loadingProfile) return;
    set({ loadingProfile: true });
    try {
      const profile = await AuthAPI.me();
      const stored = readPersistedAuth();
      persistAuth({ token, refreshToken: stored.refreshToken, user: profile });
      set({ user: profile, loadingProfile: false });
    } catch {
      get().logout();
    } finally {
      set({ loadingProfile: false });
    }
  },
  logout: () => {
    persistAuth(null);
    set({ user: null, token: null, refreshToken: null });
  },
}));
