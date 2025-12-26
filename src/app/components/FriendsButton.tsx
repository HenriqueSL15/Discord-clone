"use client";
import { Users } from "lucide-react";
import { useState } from "react";
export default function FriendsButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <button
      className={`w-full flex gap-3 text-xl items-center justify-start cursor-pointer hover:text-white hover:bg-[#23252d] ${
        clicked ? "text-white bg-[#23252d]" : "text-[#a5a49d]"
      } p-3 rounded-lg transition-all`}
      onClick={() => setClicked(true)}
    >
      <Users />
      <h1>Amigos</h1>
    </button>
  );
}
