"use client";

import { useUserStore } from "../store/useUserStore";
import FriendsButton from "./Sidebar/FriendsButton";
import FriendsList from "./Sidebar/FriendsList";
import UserInfo from "./UserInfo";
import SelectedPage from "./SelectedPage";
import { FriendshipWithUsers } from "../types/Friendship";
import { useEffect } from "react";

export default function MainContainer({
  friendships,
}: {
  friendships: FriendshipWithUsers[] | null;
}) {
  const setModal = useUserStore((state) => state.setModal);
  const page = useUserStore((state) => state.page);
  const isSidebarOpen = useUserStore((state) => state.isSidebarOpen);
  const setSidebarOpen = useUserStore((state) => state.setSidebarOpen);
  const activeRoom = useUserStore((state) => state.activeRoom);
  const setFriendships = useUserStore((state) => state.setFriendships);

  useEffect(() => {
    if (friendships) {
      setFriendships(friendships);
    }
  }, [friendships, setFriendships]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [page, activeRoom, setSidebarOpen]);

  const shouldShowSidebarMobile = isSidebarOpen && !activeRoom;

  return (
    <div
      className="flex h-screen w-full relative overflow-hidden bg-[#1b1c22]"
      onClick={() => setModal("")}
    >
      <div
        className={`bg-[#16181d]/95 w-[280px] md:w-1/5 flex flex-col p-3 transition-all duration-300 z-40 h-screen fixed md:relative ${
          shouldShowSidebarMobile
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <FriendsButton />
        <FriendsList />
        <UserInfo />
      </div>

      <div className={`w-full md:w-4/5 h-screen flex flex-col`}>
        <SelectedPage />
      </div>

      {isSidebarOpen && !activeRoom && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
