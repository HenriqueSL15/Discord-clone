"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  user: UserInterface | null;

  setUser: (user: UserInterface) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null as UserInterface | null,
      setUser: (user: UserInterface) => set({ user }),
    }),
    {
      name: "user-storage",
    }
  )
);
