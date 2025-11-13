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

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const AlbumsAPI = {
  list: async (): Promise<Album[]> => delay([...albumsDB]),
  get: async (id: string): Promise<Album | undefined> =>
    delay(albumsDB.find((a) => a.id === id)),
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

export function setAPIBaseURL(url: string) {
  api.defaults.baseURL = url;
}

