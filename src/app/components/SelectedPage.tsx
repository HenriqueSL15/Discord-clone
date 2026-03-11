"use client";
import { useUserStore } from "../store/useUserStore";
import FriendsPage from "./Friends Page/FriendsPage";
import PrivateChat from "./PrivateChat";
import SettingsPage from "./SettingsPage";

export default function SelectedPage() {
  const page = useUserStore((state) => state.page);

  if (!page || page === "friends") {
    return <FriendsPage />;
  }

  if (page == "settings") {
    return <SettingsPage />;
  }

  return <PrivateChat otherUserId={page} />;
}
