"use client";
import { useUserStore } from "../store/useUserStore";
import FriendsPage from "./FriendsPage";
import PrivateChat from "./PrivateChat";

export default function SelectedPage() {
  const page = useUserStore((state) => state.page);

  return page == "friends" ? (
    <FriendsPage />
  ) : (
    <PrivateChat otherUserId={page} />
  );
}
