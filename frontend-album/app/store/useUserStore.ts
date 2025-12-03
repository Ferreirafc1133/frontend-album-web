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
    const raw = window.localStorage.getItem("auth");
    if (!raw) return { token: null, refreshToken: null, user: null };
    const parsed = JSON.parse(raw);
    const user = parsed?.user as ApiUser | null;
    const normalizedUser = user
      ? { ...user, computed_points: user.computed_points ?? user.points ?? 0 }
      : null;
    return {
      token: parsed?.token ?? null,
      refreshToken: parsed?.refreshToken ?? null,
      user: normalizedUser,
    };
  } catch {
    return { token: null, refreshToken: null, user: null };
  }
};

const persistAuth = (payload: StoredAuth | null) => {
  if (!hasWindow) return;
  try {
    if (payload && payload.token) {
      const normalizedUser = payload.user
        ? { ...payload.user, computed_points: payload.user.computed_points ?? payload.user.points ?? 0 }
        : null;
      window.localStorage.setItem("auth", JSON.stringify({ ...payload, user: normalizedUser }));
    } else {
      window.localStorage.removeItem("auth");
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
    const normalizedUser = payload.user
      ? { ...payload.user, computed_points: payload.user.computed_points ?? payload.user.points ?? 0 }
      : null;
    persistAuth({ ...payload, user: normalizedUser });
    set({
      token: payload.token ?? null,
      refreshToken: payload.refreshToken ?? null,
      user: normalizedUser,
    });
  },
  fetchProfile: async () => {
    const token = get().token;
    if (!token || get().loadingProfile) return;
    set({ loadingProfile: true });
    try {
      const profile = await AuthAPI.me();
      const stored = readPersistedAuth();
      const normalized = profile
        ? { ...profile, computed_points: profile.computed_points ?? profile.points ?? 0 }
        : null;
      persistAuth({ token, refreshToken: stored.refreshToken, user: normalized });
      set({ user: normalized, loadingProfile: false });
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
