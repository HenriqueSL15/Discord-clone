"use client";
import { Users } from "lucide-react";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
export default function FriendsButton() {
  const [clicked, setClicked] = useState(false);
  const page = useUserStore((state) => state.page);
  const updatePage = useUserStore((state) => state.setPage);

  return (
    <button
      className={`w-full flex gap-3 text-xl items-center justify-start cursor-pointer hover:text-white hover:bg-[#373a46] ${
        clicked ? "text-white bg-[#373a46]" : "text-[#6f7c8c]"
      } p-3 rounded-lg transition-all`}
      onClick={() => {
        setClicked(true);
        updatePage("friends");
      }}
    >
      <Users />
      <h1>Amigos</h1>
    </button>
  );
}
