"use client";
import { useUserStore } from "../store/useUserStore";
import FriendsPage from "./Friends Page/FriendsPage";
import PrivateChat from "./PrivateChat";

export default function SelectedPage() {
  const page = useUserStore((state) => state.page);

  if (!page || page === "friends") {
    return <FriendsPage />;
  }

  return <PrivateChat otherUserId={page} />;
}
