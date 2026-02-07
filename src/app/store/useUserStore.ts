"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FriendshipWithUsers } from "../types/Friendship";
import UserInterface from "../types/User";

interface UserState {
  user: UserInterface | null;
  setUser: (user: UserInterface) => void;

  friendships: FriendshipWithUsers[] | null;
  setFriendships: (
    updater:
      | FriendshipWithUsers[]
      | null
      | ((prev: FriendshipWithUsers[] | null) => FriendshipWithUsers[] | null),
  ) => void;

  page: string | null;
  setPage: (page: string) => void;

  modal: string | null;
  setModal: (modal: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null as UserInterface | null,
      setUser: (user: UserInterface) => set({ user }),

      friendships: null as FriendshipWithUsers[] | null,
      setFriendships: (updater) =>
        set((state) => ({
          friendships:
            typeof updater === "function"
              ? updater(state.friendships)
              : updater,
        })),

      page: null as string | null,
      setPage: (page: string) => set({ page }),

      modal: null as string | null,
      setModal: (modal: string) => set({ modal }),
    }),
    {
      name: "user-storage",
    },
  ),
);
