import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export type Album = {
  id: string;
  title: string;
  cover: string;
  progress?: string;
  description?: string;
};

export type User = {
  id: string;
  name: string;
  email?: string;
};

const mockAlbums: Album[] = [
  {
    id: "1",
    title: "Autos Clásicos",
    cover: "https://cdn.buttercms.com/cc9SjR9RRZqhRb9Y8OPn",
    progress: "12/40",
    description:
      "Colecciona los modelos más icónicos de autos clásicos.",
  },
  {
    id: "2",
    title: "Playas de México",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    progress: "7/30",
    description:
      "Explora las playas más hermosas de México y colecciona recuerdos.",
  },
  {
    id: "3",
    title: "Reto Fitness",
    cover: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600",
    progress: "20/50",
    description: "Avanza en tus metas y desbloquea nuevos logros.",
  },
];

let albumsDB = [...mockAlbums];
let currentUser: User | null = {
  id: "u1",
  name: "Fernando",
  email: "fernando@example.com",
};

export type Friend = {
  id: string;
  name: string;
  avatar?: string;
  albums?: number;
  status?: string;
};

let friendsDB: Friend[] = [
  { id: "f1", name: "María López", avatar: "https://i.pravatar.cc/80?img=1", albums: 5, status: "Activo ahora" },
  { id: "f2", name: "Carlos Pérez", avatar: "https://i.pravatar.cc/80?img=3", albums: 4, status: "Último login: 2h" },
  { id: "f3", name: "Laura Gómez", avatar: "https://i.pravatar.cc/80?img=4", albums: 3, status: "Activo ahora" },
];

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const AlbumsAPI = {
  list: async (): Promise<Album[]> => delay([...albumsDB]),
  get: async (id: string): Promise<Album | undefined> =>
    delay(albumsDB.find((a) => a.id === id)),
  captureSticker: async (id: string): Promise<Album | undefined> => {
    const idx = albumsDB.findIndex((a) => a.id === id);
    if (idx === -1) return delay(undefined);
    const p = albumsDB[idx].progress || "0/0";
    const [curStr, maxStr] = p.split("/");
    const cur = parseInt(curStr || "0", 10);
    const max = parseInt(maxStr || "0", 10);
    const next = isNaN(cur) ? 0 : Math.min(cur + 1, isNaN(max) ? cur + 1 : max);
    const maxOut = isNaN(max) ? next : max;
    albumsDB[idx].progress = `${next}/${maxOut}`;
    return delay(albumsDB[idx]);
  },
  create: async (input: Omit<Album, "id">): Promise<Album> => {
    const a: Album = { ...input, id: String(Date.now()) };
    albumsDB.unshift(a);
    return delay(a);
  },
  update: async (id: string, patch: Partial<Omit<Album, "id">>): Promise<Album | undefined> => {
    const idx = albumsDB.findIndex((a) => a.id === id);
    if (idx === -1) return delay(undefined);
    albumsDB[idx] = { ...albumsDB[idx], ...patch };
    return delay(albumsDB[idx]);
  },
  remove: async (id: string): Promise<boolean> => {
    const before = albumsDB.length;
    albumsDB = albumsDB.filter((a) => a.id !== id);
    return delay(albumsDB.length < before);
  },
};

export const AuthAPI = {
  me: async (): Promise<User | null> => delay(currentUser),
  login: async (email: string, password: string): Promise<User> => {
    currentUser = { id: "u1", name: "Fernando", email };
    return delay(currentUser);
  },
  logout: async (): Promise<boolean> => {
    currentUser = null;
    return delay(true);
  },
};

export const FriendsAPI = {
  list: async (): Promise<Friend[]> => delay([...friendsDB]),
  add: async (name: string): Promise<Friend> => {
    const f: Friend = {
      id: String(Date.now()),
      name,
      avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(name)}`,
      albums: 0,
      status: "Nuevo",
    };
    friendsDB.unshift(f);
    return delay(f);
  },
  remove: async (id: string): Promise<boolean> => {
    const before = friendsDB.length;
    friendsDB = friendsDB.filter((f) => f.id !== id);
    return delay(friendsDB.length < before);
  },
};

export function setAPIBaseURL(url: string) {
  api.defaults.baseURL = url;
}
