"use client";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { FriendshipWithUsers } from "../types/Friendship";
import { X, Check } from "lucide-react";
import { changeFriendshipStatus } from "../actions/auth";

export default function SearchInput({
  filteredFriendships,
}: {
  filteredFriendships: FriendshipWithUsers[];
}) {
  const [search, setSearch] = useState("");
  const user = useUserStore((state) => state.user);

  const validFriendships = filteredFriendships?.filter((f) => {
    if (user?.id == f.senderId) {
      return f.receiver.username.includes(search);
    } else {
      return f.sender.username.includes(search);
    }
  });

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        className="bg-[#121317] px-3 py-2 rounded-lg text-[#5c7ca0] font-semibold outline-none"
      />
      <div className="flex flex-col">
        {validFriendships?.map((friendship: FriendshipWithUsers, index) => {
          return (
            <button
              key={index}
              className={`flex gap-3 items-center ${
                friendship.status != "PENDING" ? "hover:cursor-pointer" : ""
              }`}
            >
              <div className="relative w-15 h-15 bg-black rounded-full">
                <div className="absolute right-0 bottom-0 w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="flex justify-between items-center flex-1">
                <h1 className="text-xl text-white font-bold">
                  {friendship.sender.id == user?.id
                    ? friendship.receiver.username
                    : friendship.sender.username}
                </h1>
                {friendship.status == "PENDING" &&
                  friendship.senderId != user?.id && (
                    <div className="flex gap-3 text-white">
                      <div
                        className="bg-[#202227] hover:bg-[#2a2d33] p-2 rounded-full cursor-pointer transition-all"
                        onClick={() =>
                          changeFriendshipStatus("ACCEPTED", friendship.id)
                        }
                      >
                        {" "}
                        <Check />
                      </div>
                      <div
                        className="bg-[#202227] hover:bg-[#2a2d33] p-2 rounded-full cursor-pointer transition-all"
                        onClick={() =>
                          changeFriendshipStatus("DELETE", friendship.id)
                        }
                      >
                        <X />
                      </div>
                    </div>
                  )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
