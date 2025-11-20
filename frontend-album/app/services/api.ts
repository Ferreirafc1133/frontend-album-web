import axios from "axios";

const DEFAULT_API = "http://localhost:8000/api";
const BASE_API_URL = import.meta.env.VITE_API_URL || DEFAULT_API;
const API_HOST = BASE_API_URL.replace(/\/api\/?$/, "");

export const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use((config) => {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem("badgeup_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token: string | undefined = parsed?.token;
        if (token) {
          config.headers = config.headers || {};
          (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
      }
    }
  } catch {
    /* ignore */
  }
  return config;
});

export function setAPIBaseURL(url: string) {
  api.defaults.baseURL = url;
}

export const resolveMediaUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${API_HOST}${path.startsWith("/") ? path : `/${path}`}`;
};

type PaginatedResponse<T> = {
  results?: T[];
};

const unwrapList = <T,>(payload: PaginatedResponse<T> | T[]): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.results ?? [];
};

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string;
  points: number;
  date_joined: string;
}

export interface AlbumSummary {
  id: number;
  title: string;
  description: string;
  theme: string;
  cover_image: string | null;
  is_premium: boolean;
  price: string | null;
  stickers_count: number;
}

export interface Sticker {
  id: number;
  album: number;
  name: string;
  description: string;
  location_lat: string | null;
  location_lng: string | null;
  image_reference: string | null;
  reward_points: number;
  order: number;
}

export interface AlbumDetail extends AlbumSummary {
  stickers: Sticker[];
}

export interface UserSticker {
  id: number;
  sticker: number;
  album: number;
  status: string;
  validated: boolean;
  validation_notes: string | null;
}

type LoginResponse = {
  access: string;
  refresh: string;
  user: ApiUser;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
};

export interface SocialLoginPayload {
  email: string;
  first_name?: string;
  last_name?: string;
}

export const AuthAPI = {
  async login(username: string, password: string) {
    const { data } = await api.post<LoginResponse>("/auth/login/", {
      username,
      password,
    });
    return data;
  },
  async register(payload: RegisterPayload) {
    const { data } = await api.post<ApiUser>("/auth/register/", payload);
    return data;
  },
  async socialLogin(
    provider: "google" | "microsoft" | "facebook",
    payload: SocialLoginPayload,
  ) {
    const { data } = await api.post<LoginResponse>("/auth/social-login/", {
      provider,
      ...payload,
    });
    return data;
  },
  async me() {
    const { data } = await api.get<ApiUser>("/auth/profile/");
    return data;
  },
  async updateProfile(
    payload: Partial<
      Omit<ApiUser, "id" | "points" | "date_joined" | "username" | "email">
    >,
  ) {
    const { data } = await api.patch<ApiUser>("/auth/profile/", payload);
    return data;
  },
  async leaderboard(limit = 10) {
    const { data } = await api.get<PaginatedResponse<ApiUser> | ApiUser[]>(
      `/auth/leaderboard/?limit=${limit}`,
    );
    return unwrapList<ApiUser>(data);
  },
  async logout() {
    return true;
  },
};

export const AlbumsAPI = {
  async list() {
    const { data } = await api.get<PaginatedResponse<AlbumSummary> | AlbumSummary[]>("/albums/");
    return unwrapList<AlbumSummary>(data);
  },
  async get(id: string | number) {
    const { data } = await api.get<AlbumDetail>(`/albums/${id}/`);
    return data;
  },
  async getSticker(id: string | number) {
    const { data } = await api.get<Sticker>(`/albums/stickers/${id}/`);
    return data;
  },
  async captureSticker(stickerId: string | number, photoUrl: string) {
    const { data } = await api.post<UserSticker>(`/stickers/${stickerId}/unlock/`, { photo_url: photoUrl });
    return data;
  },
};

export const FriendsAPI = {
  async list(limit = 12) {
    return AuthAPI.leaderboard(limit);
  },
};
