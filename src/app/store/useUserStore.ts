"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FriendshipWithUsers } from "../types/FriendshipInterface";

interface UserState {
  user: UserInterface | null;
  setUser: (user: UserInterface) => void;

  friendships: FriendshipWithUsers[] | null;
  setFriendships: (friendships: FriendshipWithUsers[] | null) => void;

  page: string | null;
  setPage: (page: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null as UserInterface | null,
      setUser: (user: UserInterface) => set({ user }),

      friendships: null as FriendshipWithUsers[] | null,
      setFriendships: (friendships: FriendshipWithUsers[] | null) =>
        set({ friendships }),

      page: null as string | null,
      setPage: (page: string) => set({ page }),
    }),
    {
      name: "user-storage",
    }
  )
);
