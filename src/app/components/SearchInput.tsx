"use client";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { FriendshipWithUsers } from "../types/FriendshipInterface";

export default function SearchInput({
  filteredFriendships,
}: {
  filteredFriendships: FriendshipWithUsers[];
}) {
  const [search, setSearch] = useState("");
  const user = useUserStore((state) => state.user);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <div className="flex flex-col">
        {filteredFriendships?.map((friendship: FriendshipWithUsers, index) => {
          return (
            <div key={index} className="flex gap-3 items-center">
              <div className="relative w-15 h-15 bg-black rounded-full">
                <div className="absolute right-0 bottom-0 w-3 h-3 bg-white rounded-full"></div>
              </div>
              <h1 className="text-xl text-white font-bold">
                {friendship.sender.id == user?.id
                  ? friendship.receiver.username
                  : friendship.sender.username}
              </h1>
            </div>
          );
        })}
      </div>
    </div>
  );
}
