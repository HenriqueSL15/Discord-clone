"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: UserInterface | null;
  page: string | null;
  setUser: (user: UserInterface) => void;
  setPage: (page: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null as UserInterface | null,
      page: null as string | null,
      setUser: (user: UserInterface) => set({ user }),
      setPage: (page: string) => set({ page }),
    }),
    {
      name: "user-storage",
    }
  )
);
