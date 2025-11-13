import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email?: string;
} | null;

type State = {
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
};

export const useUserStore = create<State>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}));

