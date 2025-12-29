"use client";
import { useUserStore } from "../store/useUserStore";
import FriendsPage from "./FriendsPage";

export default function SelectedPage() {
  const page = useUserStore((state) => state.page);
  return page == "friends" ? <FriendsPage /> : <h1>{page}</h1>;
}
