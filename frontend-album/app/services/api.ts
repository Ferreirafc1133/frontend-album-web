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
  is_staff: boolean;
}

export type RelationshipStatus = "none" | "request_sent" | "request_received" | "friends";

export interface MemberUser extends ApiUser {
  relationship_status?: RelationshipStatus;
  friend_request_id?: number | null;
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
  location_lat: number | null;
  location_lng: number | null;
  image_reference: string | null;
  image?: string | null;
  reward_points: number;
  order: number;
  rarity?: string | null;
  is_unlocked?: boolean;
  status?: string | null;
  unlocked_photo_url?: string | null;
  user_message?: string | null;
  fun_fact?: string | null;
  unlocked_at?: string | null;
  location_label?: string | null;
  album_title?: string | null;
  album_id?: number | null;
}

export interface StickerLocation {
  sticker_id?: number;
  sticker_name: string;
  album_id?: number;
  album_title: string;
  username: string;
  unlocked_at?: string | null;
  location_lat: number | string | null;
  location_lng: number | string | null;
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

export interface FriendRequest {
  id: number;
  from_user: MemberUser;
  to_user: MemberUser;
  status: string;
  created_at: string;
  responded_at: string | null;
}

export interface UserCaptureSummary {
  id: number;
  sticker_id: number;
  sticker_name: string;
  album_title: string;
  unlocked_at: string;
  reward_points: number;
}

export interface UserProfile extends MemberUser {
  stickers_captured: number;
  last_captures: UserCaptureSummary[];
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  recipient_id: number;
  text: string;
  file?: string | null;
  file_url?: string | null;
  created_at: string;
}

export interface CreateAlbumPayload {
  title: string;
  description?: string;
  theme?: string;
  is_premium?: boolean;
  price?: string | null;
  cover_image?: File | null;
}

export interface CreateStickerPayload {
  album: number;
  name: string;
  description?: string;
  points?: number;
  order?: number;
  rarity?: string;
  image: File;
}

export interface UnlockStickerPayload {
  photo: File;
  comment?: string;
}

export type UpdateProfilePayload = Partial<
  Omit<ApiUser, "id" | "points" | "date_joined" | "username" | "email">
> & { avatar?: File | null };

export type MatchPhotoResult = {
  unlocked: boolean;
  already_unlocked?: boolean;
  sticker?: Sticker;
  match_score?: number;
  car?: {
    make?: string;
    model?: string;
    generation?: string | null;
    year_range?: string | null;
  };
  reason?: string;
  message?: string;
};

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
    payload: UpdateProfilePayload,
  ) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined) return;
      if (key === "avatar") {
        if (value) form.append("avatar", value as File);
        return;
      }
      form.append(key, typeof value === "boolean" ? String(value) : (value as string));
    });

    const { data } = await api.patch<ApiUser>("/auth/profile/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
  async create(payload: CreateAlbumPayload) {
    const formData = new FormData();
    formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    if (payload.theme) formData.append("theme", payload.theme);
    if (typeof payload.is_premium === "boolean") formData.append("is_premium", String(payload.is_premium));
    if (payload.price) formData.append("price", payload.price);
    if (payload.cover_image) formData.append("cover_image", payload.cover_image);

    const { data } = await api.post<AlbumSummary | AlbumDetail>("/albums/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async update(id: string | number, payload: Partial<CreateAlbumPayload>) {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append("title", payload.title);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.theme !== undefined) formData.append("theme", payload.theme);
    if (payload.is_premium !== undefined) formData.append("is_premium", String(payload.is_premium));
    if (payload.price !== undefined) {
      if (payload.price === null) {
        formData.append("price", "");
      } else {
        formData.append("price", payload.price);
      }
    }
    if (payload.cover_image) formData.append("cover_image", payload.cover_image);

    const { data } = await api.patch<AlbumDetail>(`/albums/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async get(id: string | number) {
    const { data } = await api.get<AlbumDetail>(`/albums/${id}/`);
    return data;
  },
  async getSticker(id: string | number) {
    const { data } = await api.get<Sticker>(`/stickers/${id}/`);
    return data;
  },
  async captureSticker(stickerId: string | number, photoUrl: string) {
    const { data } = await api.post<UserSticker>(`/stickers/${stickerId}/unlock/`, { photo_url: photoUrl });
    return data;
  },
  async matchPhoto(
    albumId: number | string,
    photo: File,
    coords?: { lat: number; lng: number },
  ): Promise<MatchPhotoResult> {
    const formData = new FormData();
    formData.append("photo", photo);
    if (coords?.lat != null && coords?.lng != null) {
      formData.append("lat", String(coords.lat));
      formData.append("lng", String(coords.lng));
    }

    const resp = await api.post<MatchPhotoResult>(`/albums/${albumId}/match-photo/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resp.data;
  },
};

export const StickersAPI = {
  async listByAlbum(albumId: number) {
    const { data } = await api.get<PaginatedResponse<Sticker> | Sticker[]>("/stickers/", {
      params: { album: albumId },
    });
    return unwrapList<Sticker>(data);
  },
  async locations() {
    const { data } = await api.get<PaginatedResponse<StickerLocation> | StickerLocation[]>("/stickers/locations/");
    return unwrapList<StickerLocation>(data);
  },
  async create(payload: CreateStickerPayload) {
    const form = new FormData();
    form.append("album", String(payload.album));
    form.append("name", payload.name);
    if (payload.description) form.append("description", payload.description);
    if (payload.points != null) form.append("reward_points", String(payload.points));
    if (payload.order != null) form.append("order", String(payload.order));
    if (payload.rarity) form.append("rarity", payload.rarity);
    form.append("image_reference", payload.image);

    const { data } = await api.post<Sticker>("/stickers/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async update(id: number, payload: Partial<CreateStickerPayload>) {
    const form = new FormData();
    if (payload.name !== undefined) form.append("name", payload.name);
    if (payload.description !== undefined) form.append("description", payload.description);
    if (payload.points !== undefined) form.append("reward_points", String(payload.points));
    if (payload.order !== undefined) form.append("order", String(payload.order));
    if (payload.rarity !== undefined) form.append("rarity", payload.rarity);
    if (payload.image) form.append("image_reference", payload.image);

    const { data } = await api.patch<Sticker>(`/stickers/${id}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async saveMessage(id: number, message: string) {
    const { data } = await api.post<Sticker>(`/stickers/${id}/message/`, { message });
    return data;
  },
  async unlock(stickerId: number, payload: UnlockStickerPayload) {
    const form = new FormData();
    form.append("photo", payload.photo);
    if (payload.comment) form.append("comment", payload.comment);
    const { data } = await api.post<UserSticker>(`/stickers/${stickerId}/unlock/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export const FriendsAPI = {
  async members() {
    const { data } = await api.get<PaginatedResponse<MemberUser> | MemberUser[]>("/friends/members/");
    return unwrapList<MemberUser>(data);
  },
  async friends() {
    const { data } = await api.get<PaginatedResponse<MemberUser> | MemberUser[]>("/friends/");
    return unwrapList<MemberUser>(data);
  },
  async requests(scope: "all" | "received" | "sent" = "all", status?: string) {
    const { data } = await api.get<PaginatedResponse<FriendRequest> | FriendRequest[]>(
      "/friends/requests/",
      {
        params: { scope, status },
      },
    );
    return unwrapList<FriendRequest>(data);
  },
  async sendRequest(toUserId: number) {
    const { data } = await api.post<FriendRequest>("/friends/requests/", { to_user: toUserId });
    return data;
  },
  async acceptRequest(requestId: number) {
    const { data } = await api.post<FriendRequest>(`/friends/requests/${requestId}/accept/`);
    return data;
  },
  async rejectRequest(requestId: number) {
    const { data } = await api.post<FriendRequest>(`/friends/requests/${requestId}/reject/`);
    return data;
  },
  async cancelRequest(requestId: number) {
    await api.post(`/friends/requests/${requestId}/cancel/`);
  },
  async removeFriend(requestId: number) {
    await api.post(`/friends/${requestId}/remove/`);
  },
};

export const UsersAPI = {
  async profile(userId: number | string) {
    const { data } = await api.get<UserProfile>(`/auth/users/${userId}/`);
    return data;
  },
  async adminUpdate(userId: number | string, payload: Partial<UserProfile> & { reset_avatar?: boolean }) {
    const { data } = await api.patch<UserProfile>(`/auth/users/${userId}/admin/`, payload);
    return data;
  },
  async adminDelete(userId: number | string) {
    await api.delete(`/auth/users/${userId}/admin/delete/`);
  },
};

export const ChatAPI = {
  async list(otherId: number | string, limit = 50) {
    const { data } = await api.get<PaginatedResponse<ChatMessage> | ChatMessage[]>(
      `/chat/${otherId}/`,
      {
        params: { limit },
      },
    );
    return unwrapList<ChatMessage>(data).reverse();
  },
  async send(otherId: number | string, payload: { text?: string; file?: File | null }) {
    const form = new FormData();
    if (payload.text) form.append("text", payload.text);
    if (payload.file) form.append("file", payload.file);
    const { data } = await api.post<ChatMessage>(`/chat/${otherId}/`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
